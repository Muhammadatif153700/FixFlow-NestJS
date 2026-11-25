import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { FIXFLOW_STORE } from '../storage/storage.token';
import type { FixFlowStore, ServiceRequest, User } from '../storage/storage.interface';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { QueryRequestsDto } from './dto/query-requests.dto';
import { AssignDto } from './dto/assign.dto';
import { ResolveDto } from './dto/resolve.dto';
import { ReopenDto } from './dto/reopen.dto';
import { FeedbackDto } from './dto/feedback.dto';

@Injectable()
export class RequestsService {
  constructor(@Inject(FIXFLOW_STORE) private store: FixFlowStore) {}

  private isActive(status: string) {
    return status !== 'CLOSED' && status !== 'CANCELLED';
  }

  private addHistory(requestId: number, oldStatus: any, newStatus: any, actorId: number, note: string | null) {
    this.store.history.push({
      id: this.store.nextId.history++,
      requestId,
      oldStatus,
      newStatus,
      actorId,
      note,
      timestamp: new Date().toISOString(),
    });
  }

  create(dto: CreateRequestDto, user: User) {
    const category = this.store.categories.find(c => c.id === dto.categoryId);
    if (!category) throw new NotFoundException('Category not found');
    if (!category.active) throw new BadRequestException('Category is inactive');

    const activeCount = this.store.requests.filter(r => r.requesterId === user.id && this.isActive(r.status)).length;
    if (activeCount >= 5) throw new ConflictException('You already have 5 active requests');

    const newReq: ServiceRequest = {
      id: this.store.nextId.request++,
      title: dto.title,
      description: dto.description,
      categoryId: dto.categoryId,
      building: dto.building,
      room: dto.room,
      priority: dto.priority,
      requesterId: user.id,
      assignedTechnicianId: null,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.store.requests.push(newReq);
    this.addHistory(newReq.id, null, 'OPEN', user.id, 'Request created');

    return newReq;
  }

  findAll(query: QueryRequestsDto, user: User) {
    let list = this.store.requests;

    if (user.role === 'REQUESTER') {
      list = list.filter(r => r.requesterId === user.id);
    } else if (user.role === 'TECHNICIAN') {
      list = list.filter(r => r.assignedTechnicianId === user.id);
    }

    if (query.search) {
      list = list.filter(r => r.title.toLowerCase().includes(query.search!.toLowerCase()));
    }
    if (query.categoryId) {
      list = list.filter(r => r.categoryId === query.categoryId);
    }
    if (query.status) {
      list = list.filter(r => r.status === query.status);
    }
    if (query.priority) {
      list = list.filter(r => r.priority === query.priority);
    }

    list.sort((a, b) => {
      const dateDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (dateDiff !== 0) return dateDiff;
      return b.id - a.id;
    });

    const total = list.length;
    const page = query.page || 1;
    const limit = query.limit || 10;
    const startIndex = (page - 1) * limit;
    
    return {
      data: list.slice(startIndex, startIndex + limit),
      total,
      page,
      limit,
    };
  }

  findOne(id: number, user: User) {
    const request = this.store.requests.find(r => r.id === id);
    if (!request) throw new NotFoundException('Request not found');

    if (user.role === 'REQUESTER' && request.requesterId !== user.id) {
      throw new ForbiddenException('You cannot view this request');
    }
    if (user.role === 'TECHNICIAN' && request.assignedTechnicianId !== user.id) {
      throw new ForbiddenException('You cannot view this request');
    }

    const history = this.store.history.filter(h => h.requestId === id);
    return { ...request, history };
  }

  update(id: number, dto: UpdateRequestDto, user: User) {
    const request = this.store.requests.find(r => r.id === id);
    if (!request) throw new NotFoundException('Request not found');
    
    if (request.requesterId !== user.id) throw new ForbiddenException('Not your request');
    if (request.status !== 'OPEN') throw new ConflictException('Can only edit OPEN requests');

    if (Object.keys(dto).length === 0) throw new BadRequestException('Empty update body');

    if (dto.categoryId) {
      const category = this.store.categories.find(c => c.id === dto.categoryId);
      if (!category || !category.active) throw new BadRequestException('Invalid or inactive category');
    }

    Object.assign(request, dto);
    request.updatedAt = new Date().toISOString();
    return request;
  }

  cancel(id: number, user: User) {
    const request = this.store.requests.find(r => r.id === id);
    if (!request) throw new NotFoundException('Request not found');
    
    if (request.requesterId !== user.id) throw new ForbiddenException('Not your request');
    if (request.status !== 'OPEN') throw new ConflictException('Can only cancel OPEN requests');

    const oldStatus = request.status;
    request.status = 'CANCELLED';
    request.updatedAt = new Date().toISOString();

    this.addHistory(id, oldStatus, 'CANCELLED', user.id, 'Request cancelled by owner');
    return request;
  }

  assign(id: number, dto: AssignDto, user: User) {
    const request = this.store.requests.find(r => r.id === id);
    if (!request) throw new NotFoundException('Request not found');
    if (request.status !== 'OPEN') throw new ConflictException('Request is not OPEN');

    const tech = this.store.users.find(u => u.id === dto.technicianId);
    if (!tech || tech.role !== 'TECHNICIAN') throw new BadRequestException('User is not a technician');

    if (!tech.categoryIds.includes(request.categoryId)) {
      throw new BadRequestException('Technician does not support this category');
    }

    const activeJobs = this.store.requests.filter(r => 
      r.assignedTechnicianId === tech.id && 
      (r.status === 'ASSIGNED' || r.status === 'IN_PROGRESS')
    ).length;
    if (activeJobs >= 3) throw new ConflictException('Technician has reached maximum capacity (3)');

    const oldStatus = request.status;
    request.status = 'ASSIGNED';
    request.assignedTechnicianId = tech.id;
    request.updatedAt = new Date().toISOString();

    this.addHistory(id, oldStatus, 'ASSIGNED', user.id, `Assigned to technician ${tech.id}`);
    return request;
  }

  start(id: number, user: User) {
    const request = this.store.requests.find(r => r.id === id);
    if (!request) throw new NotFoundException('Request not found');
    
    if (request.assignedTechnicianId !== user.id) throw new ForbiddenException('Not assigned to you');
    if (request.status !== 'ASSIGNED') throw new ConflictException('Request is not ASSIGNED');

    const oldStatus = request.status;
    request.status = 'IN_PROGRESS';
    request.updatedAt = new Date().toISOString();

    this.addHistory(id, oldStatus, 'IN_PROGRESS', user.id, 'Work started');
    return request;
  }

  resolve(id: number, dto: ResolveDto, user: User) {
    const request = this.store.requests.find(r => r.id === id);
    if (!request) throw new NotFoundException('Request not found');
    
    if (request.assignedTechnicianId !== user.id) throw new ForbiddenException('Not assigned to you');
    if (request.status !== 'IN_PROGRESS') throw new ConflictException('Request is not IN_PROGRESS');

    const oldStatus = request.status;
    request.status = 'RESOLVED';
    request.updatedAt = new Date().toISOString();

    this.addHistory(id, oldStatus, 'RESOLVED', user.id, dto.resolutionNote);
    return request;
  }

  close(id: number, user: User) {
    const request = this.store.requests.find(r => r.id === id);
    if (!request) throw new NotFoundException('Request not found');
    
    if (request.requesterId !== user.id) throw new ForbiddenException('Not your request');
    if (request.status !== 'RESOLVED') throw new ConflictException('Request is not RESOLVED');

    const oldStatus = request.status;
    request.status = 'CLOSED';
    request.updatedAt = new Date().toISOString();

    this.addHistory(id, oldStatus, 'CLOSED', user.id, 'Work confirmed by requester');
    return request;
  }

  reopen(id: number, dto: ReopenDto, user: User) {
    const request = this.store.requests.find(r => r.id === id);
    if (!request) throw new NotFoundException('Request not found');
    
    if (request.requesterId !== user.id) throw new ForbiddenException('Not your request');
    if (request.status !== 'RESOLVED') throw new ConflictException('Request is not RESOLVED');

    const activeCount = this.store.requests.filter(r => r.requesterId === user.id && this.isActive(r.status)).length;
    if (activeCount >= 5) throw new ConflictException('You already have 5 active requests, cannot reopen.');

    const oldStatus = request.status;
    request.status = 'OPEN';
    request.assignedTechnicianId = null;
    request.updatedAt = new Date().toISOString();

    this.addHistory(id, oldStatus, 'OPEN', user.id, `Reopened: ${dto.reason}`);
    return request;
  }

  addFeedback(id: number, dto: FeedbackDto, user: User) {
    const request = this.store.requests.find(r => r.id === id);
    if (!request) throw new NotFoundException('Request not found');
    
    if (request.requesterId !== user.id) throw new ForbiddenException('Not your request');
    if (request.status !== 'CLOSED') throw new ConflictException('Can only leave feedback for CLOSED requests');

    const exists = this.store.feedback.find(f => f.requestId === id);
    if (exists) throw new ConflictException('Feedback already submitted for this request');

    const resolveEvent = this.store.history.find(h => h.requestId === id && h.newStatus === 'RESOLVED');
    const techId = resolveEvent ? resolveEvent.actorId : null;

    const newFeedback = {
      id: this.store.nextId.feedback++,
      requestId: id,
      requesterId: user.id,
      technicianId: techId!,
      rating: dto.rating,
      comment: dto.comment || null,
      createdAt: new Date().toISOString(),
    };

    this.store.feedback.push(newFeedback);
    return newFeedback;
  }
}