export interface IPaginationParams {
  page?: number;
  limit?: number;
}

export interface IPaginationResponse {
  page: number;
  limit: number;
  total: number;
  pages: number;
  totalPages: number; // Add alias for consistency
}

export interface IPaginatedData<T> {
  data: T[];
  pagination: IPaginationResponse;
}
