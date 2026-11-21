export type Role = 'REQUESTER' | 'TECHNICIAN' | 'DISPATCHER';
export type RequestStatus =
  | 'OPEN'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED'
  | 'CANCELLED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface User {
  id: number;
  fullName: string;
  email: string;
  passwordHash: string;
  role: Role;
  categoryIds: number[];
}

export interface Category {
  id: number;
  name: string;
  description: string;
  active: boolean;
}

export interface ServiceRequest {
  id: number;
  title: string;
  description: string;
  categoryId: number;
  building: string;
  room: string;
  priority: Priority;
  requesterId: number;
  assignedTechnicianId: number | null;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface StatusHistory {
  id: number;
  requestId: number;
  oldStatus: RequestStatus | null;
  newStatus: RequestStatus;
  actorId: number;
  note: string | null;
  timestamp: string;
}

export interface Feedback {
  id: number;
  requestId: number;
  requesterId: number;
  technicianId: number;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface FixFlowStore {
  users: User[];
  categories: Category[];
  requests: ServiceRequest[];
  history: StatusHistory[];
  feedback: Feedback[];
  nextId: {
    user: number;
    category: number;
    request: number;
    history: number;
    feedback: number;
  };
}