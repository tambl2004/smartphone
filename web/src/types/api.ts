export type ApiErrorItem = {
  field?: string;
  message: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T | null;
  errors: ApiErrorItem[] | null;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedResponse<T> = ApiResponse<{
  items: T[];
  meta: PaginationMeta;
}>;
