import { SetMetadata } from '@nestjs/common';

export type StaffRole = 'admin' | 'sales' | 'technician';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: StaffRole[]) => SetMetadata(ROLES_KEY, roles);
