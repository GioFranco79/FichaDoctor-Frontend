import { api } from "@/lib/api";

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  rut: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
}

export async function fetchUsers(
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<User>> {
  return api.get<PaginatedResponse<User>>(
    `/api/admin/users?page=${page}&limit=${limit}`
  );
}

export async function fetchUserById(id: string): Promise<User> {
  return api.get<User>(`/api/admin/users/${id}`);
}

export async function updateUser(
  id: string,
  updates: Partial<Omit<User, "id" | "created_at">>
): Promise<User> {
  return api.put<User>(`/api/admin/users/${id}`, updates);
}

export async function disableUser(id: string): Promise<User> {
  return api.patch<User>(`/api/admin/users/${id}/disable`);
}

export async function enableUser(id: string): Promise<User> {
  return api.patch<User>(`/api/admin/users/${id}/enable`);
}
