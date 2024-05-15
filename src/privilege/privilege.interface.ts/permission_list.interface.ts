import { $Enums } from '@prisma/client';
export interface PermissionData {
  Role?: Role;
}

export interface Role {
  RolePermission?: RolePermission[];
}

export interface RolePermission {
  Permission?: Permission;
}

export interface Permission {
  id: string;
  created_at: Date;
  updated_at: Date;
  name: string;
  description: string;
  page: $Enums.Permission_page;
}