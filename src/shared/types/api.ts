// ================================================================
// API Response envelope types
// Matches the backend standard: { success, data, message, errors? }
// ================================================================

/**
 * Standard API response wrapper (single entity or raw data).
 */
export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message: string;
  errors?: string;
};

/**
 * Spring-style paginated response.
 */
export type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  pageable?: {
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
    sort?: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
  };
};

/**
 * API response that is guaranteed to be paginated (or not).
 */
export type PagedApiResponse<T> = ApiResponse<Page<T>>;

/**
 * Pagination request params (sent as query params).
 */
export type Pagination = {
  page: number;
  limit: number;
  sortDir?: 'asc' | 'desc';
};

/**
 * Base DTO fields shared by most entities.
 */
export type BaseDTO = {
  id: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
};
