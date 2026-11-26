import { Inject, Injectable } from '@nestjs/common';
import { FIXFLOW_STORE } from '../storage/storage.token';
import type { FixFlowStore, User } from '../storage/storage.interface';

@Injectable()
export class DashboardService {
  constructor(@Inject(FIXFLOW_STORE) private store: FixFlowStore) {}

  getSummary(user: User) {
    if (user.role === 'REQUESTER') {
      return this.getRequesterSummary(user.id);
    } else if (user.role === 'TECHNICIAN') {
      return this.getTechnicianSummary(user.id);
    } else {
      return this.getDispatcherSummary();
    }
  }

  private countByStatus(list: any[]) {
    const counts: Record<string, number> = { OPEN: 0, ASSIGNED: 0, IN_PROGRESS: 0, RESOLVED: 0, CLOSED: 0, CANCELLED: 0 };
    list.forEach(r => counts[r.status]++);
    return counts;
  }

  private getRequesterSummary(userId: number) {
    const myReqs = this.store.requests.filter(r => r.requesterId === userId);
    return { role: 'REQUESTER', myRequests: this.countByStatus(myReqs) };
  }

  private getTechnicianSummary(userId: number) {
    const myJobs = this.store.requests.filter(r => r.assignedTechnicianId === userId);
    const activeJobs = myJobs.filter(r => r.status === 'ASSIGNED' || r.status === 'IN_PROGRESS').length;
    return { role: 'TECHNICIAN', assignedJobs: this.countByStatus(myJobs), currentWorkload: activeJobs };
  }

  private getDispatcherSummary() {
    const systemCounts = this.countByStatus(this.store.requests);
    
    const categoryCounts: Record<string, number> = {};
    this.store.categories.forEach(c => {
      categoryCounts[c.name] = this.store.requests.filter(r => r.categoryId === c.id).length;
    });

    const technicians = this.store.users.filter(u => u.role === 'TECHNICIAN').map(tech => {
      const activeJobs = this.store.requests.filter(r => r.assignedTechnicianId === tech.id && (r.status === 'ASSIGNED' || r.status === 'IN_PROGRESS')).length;
      const techFeedback = this.store.feedback.filter(f => f.technicianId === tech.id);
      
      let avgRating = null;
      if (techFeedback.length > 0) {
        const sum = techFeedback.reduce((acc, f) => acc + f.rating, 0);
        avgRating = Number((sum / techFeedback.length).toFixed(2));
      }

      return {
        id: tech.id,
        fullName: tech.fullName,
        activeJobs,
        feedbackCount: techFeedback.length,
        averageRating: avgRating,
      };
    });

    return { role: 'DISPATCHER', systemCounts, categoryCounts, technicians };
  }
}