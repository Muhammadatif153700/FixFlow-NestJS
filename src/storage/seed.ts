import * as bcrypt from 'bcrypt';
import { FixFlowStore } from './storage.interface';

export async function buildSeedStore(): Promise<FixFlowStore> {
  const hash = await bcrypt.hash('Pass1234', 10);
  const now = new Date().toISOString();

  return {
    users: [
      { id: 1, fullName: 'Ali Requester', email: 'req1@test.com', passwordHash: hash, role: 'REQUESTER', categoryIds: [] },
      { id: 2, fullName: 'Sara Requester', email: 'req2@test.com', passwordHash: hash, role: 'REQUESTER', categoryIds: [] },
      { id: 3, fullName: 'Tariq Technician', email: 'tech1@test.com', passwordHash: hash, role: 'TECHNICIAN', categoryIds: [1] },
      { id: 4, fullName: 'Nina Technician', email: 'tech2@test.com', passwordHash: hash, role: 'TECHNICIAN', categoryIds: [2, 3] },
      { id: 5, fullName: 'Faisal Technician', email: 'tech3@test.com', passwordHash: hash, role: 'TECHNICIAN', categoryIds: [4] },
      { id: 6, fullName: 'Dana Dispatcher', email: 'dispatch@test.com', passwordHash: hash, role: 'DISPATCHER', categoryIds: [] },
    ],
    categories: [
      { id: 1, name: 'Electrical', description: 'Electrical faults and wiring issues', active: true },
      { id: 2, name: 'Plumbing', description: 'Pipes, taps, and water leaks', active: true },
      { id: 3, name: 'IT Support', description: 'Network, computers, and projectors', active: true },
      { id: 4, name: 'Furniture', description: 'Desks, chairs, and fixtures', active: true },
    ],
    requests: [
      {
        id: 1, title: 'Projector not working', description: 'The classroom projector does not turn on at all.',
        categoryId: 3, building: 'Block A', room: 'A-101', priority: 'HIGH',
        requesterId: 1, assignedTechnicianId: null, status: 'OPEN',
        createdAt: now, updatedAt: now,
      },
      {
        id: 2, title: 'Leaking tap in lab', description: 'Water is dripping continuously from the lab tap.',
        categoryId: 2, building: 'Block B', room: 'B-204', priority: 'MEDIUM',
        requesterId: 2, assignedTechnicianId: null, status: 'OPEN',
        createdAt: now, updatedAt: now,
      },
    ],
    history: [
      { id: 1, requestId: 1, oldStatus: null, newStatus: 'OPEN', actorId: 1, note: 'Request created', timestamp: now },
      { id: 2, requestId: 2, oldStatus: null, newStatus: 'OPEN', actorId: 2, note: 'Request created', timestamp: now },
    ],
    feedback: [],
    nextId: { user: 7, category: 5, request: 3, history: 3, feedback: 1 },
  };
}