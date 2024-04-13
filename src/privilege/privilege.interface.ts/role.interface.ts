export interface RolesGetAPI {
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
  RolePermission?: RolePermissionIncluded[];
  permissions?: Permission[];
}[]

export interface RolePermissionIncluded {
  role_id: string;
  permission_id: string;
  created_at: Date;
  updated_at: Date;
  Permission: {
    id: string;
    name: string;
    description?: string;
    page: string;
    created_at: Date;
    updated_at: Date;
  }
}

export interface Permission {
  role_id: string;
  permission_id: string;
  created_at: Date;
  updated_at: Date;
  name: string;
  description?: string;
  page: string;
}