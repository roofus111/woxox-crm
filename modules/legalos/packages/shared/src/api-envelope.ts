/** Standard WOXOX API response metadata for paginated list endpoints. */
export interface ResponseMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  hasMore?: boolean;
  cursor?: string | null;
  requestId?: string;
  correlationId?: string;
}

/** Structured API error payload aligned with WOXOX error handler conventions. */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  fieldErrors?: Array<{
    field: string;
    message: string;
    code?: string;
  }>;
}

/** Successful WOXOX API envelope. */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: ResponseMeta;
}

/** Failed WOXOX API envelope. */
export interface ApiErrorResponse {
  success: false;
  data: null;
  error: ApiError;
  meta?: ResponseMeta;
}

/** Discriminated union for all LegalOS API responses. */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/** Construct a successful response envelope. */
export function ok<T>(data: T, meta?: ResponseMeta): ApiSuccessResponse<T> {
  return meta ? { success: true, data, meta } : { success: true, data };
}

/** Construct a failed response envelope. */
export function fail(
  error: ApiError,
  meta?: ResponseMeta,
): ApiErrorResponse {
  return meta
    ? { success: false, data: null, error, meta }
    : { success: false, data: null, error };
}

/** Type guard for successful API responses. */
export function isApiSuccess<T>(
  response: ApiResponse<T>,
): response is ApiSuccessResponse<T> {
  return response.success === true;
}

/** Type guard for failed API responses. */
export function isApiError<T>(
  response: ApiResponse<T>,
): response is ApiErrorResponse {
  return response.success === false;
}

/** Paginated list payload wrapper used inside `data`. */
export interface PaginatedData<T> {
  items: T[];
  meta: Required<Pick<ResponseMeta, 'page' | 'limit' | 'total' | 'totalPages' | 'hasMore'>>;
}

/** Helper to build paginated list metadata. */
export function paginatedMeta(
  page: number,
  limit: number,
  total: number,
): PaginatedData<never>['meta'] {
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;
  return {
    page,
    limit,
    total,
    totalPages,
    hasMore: page < totalPages,
  };
}
