export type Role =
  | 'SUPER_ADMIN'
  | 'SCHOLAR'
  | 'SUPERVISOR'
  | 'INSTITUTIONAL_RESEARCH_COORDINATOR'
  | 'HEAD_OF_INSTITUTE'
  | 'DEAN_RESEARCH';

export type MomStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'GUIDE_RECOMMENDED'
  | 'GUIDE_RETURNED'
  | 'COORDINATOR_RECOMMENDED'
  | 'COORDINATOR_RETURNED'
  | 'HOI_RECOMMENDED'
  | 'HOI_RETURNED'
  | 'DEAN_APPROVED'
  | 'DEAN_REJECTED';

export type MomStage =
  | 'SCHOLAR'
  | 'GUIDE'
  | 'COORDINATOR'
  | 'HEAD_OF_INSTITUTE'
  | 'DEAN_RESEARCH'
  | 'COMPLETED';

export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: Role;
  department?: string;
  active: boolean;
}

export interface LoginRequest { username: string; password: string; }
export interface LoginResponse { token: string; user: User; }