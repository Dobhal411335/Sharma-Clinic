export type ApiResponse<T> = {
  data: T;
  message?: string;
};

export type PaginatedMeta = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: PaginatedMeta;
};

export type ApiErrorBody = {
  message?: string;
  code?: string;
  errors?: unknown;
};
