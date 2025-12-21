/**
 * @file api-client.ts
 * @description Centralized HTTP client for communicating with the ASP.NET backend.
 * Handles authentication, error handling, logging, and environment-based configuration.
 * @path /lib/api-client.ts
 */

/**
 * Internal API configuration state derived from environment variables.
 * @private
 */
const API_CONFIG = {
  /** Root URL for all API requests. Defaults to localhost for development. */
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  /** Global request timeout in milliseconds. */
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000'),
  /** Flag to bypass network calls and use local mock data instead. */
  useMockData: process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true',
  /** Enables verbose console logging for requests and responses in development. */
  enableLogging: process.env.NEXT_PUBLIC_ENABLE_API_LOGGING === 'true',
};

/**
 * Storage key for the JWT access token.
 */
const TOKEN_KEY = 'access_token';

/**
 * Custom Error class for structured API failure handling.
 * Captures status codes and machine-readable error codes.
 */
export class ApiError extends Error {
  /**
   * @param message - Human readable error message.
   * @param statusCode - HTTP status code return by the server.
   * @param code - Application-specific error code (e.g., "INVALID_PAYLOAD").
   * @param details - Optional object containing field-level errors or stack info.
   */
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
 * // TODO: (Refactor) Consolidate duplicate response interfaces with lib/types/common.ts
 * API Response wrapper type for successful data fetching.
 */
export interface ApiResponse<T> {
  data: T;
  error?: never;
}

/**
 * Standardized error response body returned by the API.
 */
export interface ApiErrorResponse {
  data?: never;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Metadata for paginated list results.
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Standardized wrapper for paginated entity lists.
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Extended options for the internal request helper.
 */
interface RequestOptions extends RequestInit {
  /** Query parameters to be appended to the URL. */
  params?: Record<string, string | number | boolean | undefined>;
  /** Per-request timeout override. */
  timeout?: number;
}

/**
 * Logs outgoing request details to the console if logging is enabled.
 * 
 * @param method - HTTP Verb.
 * @param url - Relative endpoint path.
 * @param options - Request configuration including params.
 */
function logRequest(method: string, url: string, options?: RequestOptions) {
  if (API_CONFIG.enableLogging && process.env.NODE_ENV === 'development') {
    console.log(`[API] ${method} ${url}`, options?.params || '');
  }
}

/**
 * Logs incoming response details to the console if logging is enabled.
 * 
 * @param method - HTTP Verb of the original request.
 * @param url - Relative endpoint path.
 * @param response - Fetch Response object.
 * @param data - Parsed JSON body or text.
 */
function logResponse(method: string, url: string, response: Response, data: unknown) {
  if (API_CONFIG.enableLogging && process.env.NODE_ENV === 'development') {
    console.log(`[API] ${method} ${url} - ${response.status}`, data);
  }
}

/**
 * Construct a full URI by combining the base URL with the endpoint and query parameters.
 * Automatically filters out null or undefined parameter values.
 * 
 * @param endpoint - The API path (e.g., "/assets").
 * @param params - Optional query parameter map.
 * @returns Fully qualified URL string.
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
 * Centralized response handler that manages content negotiation and error parsing.
 * Supports both JSON and plain-text responses.
 * 
 * @param response - The raw fetch response.
 * @throws {ApiError} If the response status is not successful (2xx).
 * @returns The parsed result of type T.
 */
async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');
  
  if (!response.ok) {
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(TOKEN_KEY);
        // Optional: Redirect to login or dispatch a global auth event
        window.location.href = '/login';
      }
      throw new ApiError('Unauthorized', 401, 'UNAUTHORIZED');
    }

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
 * Wrapper around the native fetch API providing timeout support, 
 * automated JSON parsing, and unified error handling.
 * 
 * @param method - HTTP Method string.
 * @param endpoint - API relative path.
 * @param options - Standard fetch options + custom params/timeout.
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

  // Inject Authorization header if token exists
  let token: string | null = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem(TOKEN_KEY);
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      method,
      signal: controller.signal,
      headers,
    });
    
    const data = await handleResponse<T>(response);
    logResponse(method, endpoint, response, data);
    
    return data;
  } catch (error) {
    // Re-throw existing API errors to avoid double-wrapping
    if (error instanceof ApiError) {
      throw error;
    }
    
    if (error instanceof Error) {
      // Handle timeout specifically as a 408 Request Timeout
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
 * Public API exposing semantic methods for all supported HTTP verbs.
 */
export const apiClient = {
  /** Performs a GET request. */
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>('GET', endpoint, options),
  
  /** Performs a POST request with JSON body. */
  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>('POST', endpoint, {
      ...options,
      body: body ? JSON.stringify(body) : undefined,
    }),
  
  /** Performs a PUT request for full entity updates. */
  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PUT', endpoint, {
      ...options,
      body: body ? JSON.stringify(body) : undefined,
    }),
  
  /** Performs a DELETE request. */
  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>('DELETE', endpoint, options),
  
  /** Performs a PATCH request for partial updates. */
  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PATCH', endpoint, {
      ...options,
      body: body ? JSON.stringify(body) : undefined,
    }),
    
  /** Sets the access token in local storage. */
  setAccessToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },
  
  /** Gets the access token from local storage. */
  getAccessToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },
  
  /** Removes the access token from local storage. */
  clearAccessToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
  }
};

/**
 * Determines if the application is currently running in mock mode.
 * Useful for branching logic in services to use local storage vs network calls.
 * 
 * @returns {boolean} True if NEXT_PUBLIC_USE_MOCK_DATA is enabled.
 */
export function isMockDataEnabled(): boolean {
  return API_CONFIG.useMockData;
}

/** Legacy alias for isMockDataEnabled. */
export const useMockData = isMockDataEnabled;

/**
 * Utility to retrieve the active API configuration.
 * Useful for debugging or displaying environmental status in the UI.
 * 
 * @returns A read-only copy of the current API_CONFIG.
 */
export function getApiConfig() {
  return { ...API_CONFIG };
}
