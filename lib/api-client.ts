/**
 * API Client Configuration and Utilities
 * 
 * Centralized HTTP client for communicating with the ASP.NET backend.
 * Handles authentication, error handling, and request/response transformation.
 */

// Environment configuration with defaults
const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000'),
  useMockData: process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true',
  enableLogging: process.env.NEXT_PUBLIC_ENABLE_API_LOGGING === 'true',
};

/**
 * API Error class for structured error handling
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * API Response wrapper type
 */
export interface ApiResponse<T> {
  data: T;
  error?: never;
}

export interface ApiErrorResponse {
  data?: never;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Request options
 */
interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  timeout?: number;
}

/**
 * Log API requests in development
 */
function logRequest(method: string, url: string, options?: RequestOptions) {
  if (API_CONFIG.enableLogging && process.env.NODE_ENV === 'development') {
    console.log(`[API] ${method} ${url}`, options?.params || '');
  }
}

/**
 * Log API responses in development
 */
function logResponse(method: string, url: string, response: Response, data: unknown) {
  if (API_CONFIG.enableLogging && process.env.NODE_ENV === 'development') {
    console.log(`[API] ${method} ${url} - ${response.status}`, data);
  }
}

/**
 * Build URL with query parameters
 */
function buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(`${API_CONFIG.baseUrl}/api${endpoint}`);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  
  return url.toString();
}

/**
 * Handle API response and errors
 */
async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');
  
  if (!response.ok) {
    if (isJson) {
      const errorData = await response.json();
      throw new ApiError(
        errorData.error?.message || 'An error occurred',
        response.status,
        errorData.error?.code,
        errorData.error?.details
      );
    } else {
      throw new ApiError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status
      );
    }
  }
  
  if (isJson) {
    return response.json();
  }
  
  return response.text() as T;
}

/**
 * Make an HTTP request with timeout and error handling
 */
async function request<T>(
  method: string,
  endpoint: string,
  options?: RequestOptions
): Promise<T> {
  const url = buildUrl(endpoint, options?.params);
  const timeout = options?.timeout || API_CONFIG.timeout;
  
  logRequest(method, endpoint, options);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      method,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    const data = await handleResponse<T>(response);
    logResponse(method, endpoint, response, data);
    
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408, 'TIMEOUT');
      }
      throw new ApiError(error.message, undefined, 'NETWORK_ERROR');
    }
    
    throw new ApiError('Unknown error occurred', undefined, 'UNKNOWN_ERROR');
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * API Client methods
 */
export const apiClient = {
  /**
   * GET request
   */
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>('GET', endpoint, options),
  
  /**
   * POST request
   */
  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>('POST', endpoint, {
      ...options,
      body: body ? JSON.stringify(body) : undefined,
    }),
  
  /**
   * PUT request
   */
  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PUT', endpoint, {
      ...options,
      body: body ? JSON.stringify(body) : undefined,
    }),
  
  /**
   * DELETE request
   */
  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>('DELETE', endpoint, options),
  
  /**
   * PATCH request
   */
  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PATCH', endpoint, {
      ...options,
      body: body ? JSON.stringify(body) : undefined,
    }),
};

/**
 * Check if mock data mode is enabled
 */
/**
 * Check if mock data mode is enabled
 */
export function isMockDataEnabled(): boolean {
  return API_CONFIG.useMockData;
}

export const useMockData = isMockDataEnabled;

/**
 * Get API configuration
 */
export function getApiConfig() {
  return { ...API_CONFIG };
}
