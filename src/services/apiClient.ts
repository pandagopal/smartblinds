/**
 * API Client Service
 *
 * This is the main service for making API calls to the backend
 * It handles authentication, error handling, and provides fallbacks to mock data
 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { authService } from './authService';

// API base URL from environment variable or default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Default timeout in milliseconds
const DEFAULT_TIMEOUT = 20000; // 20 seconds

// Configuration flag to determine if we use mock data or real API
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || false;

/**
 * Custom API error class
 */
export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

/**
 * API Client class that handles all API requests
 */
export class ApiClient {
  private axiosInstance: AxiosInstance;
  private useMockData: boolean;

  constructor(
    baseURL: string = API_BASE_URL,
    timeout: number = DEFAULT_TIMEOUT,
    useMockData: boolean = USE_MOCK_DATA
  ) {
    this.useMockData = useMockData;

    // Create axios instance with default configuration
    this.axiosInstance = axios.create({
      baseURL,
      timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Setup request interceptor for authentication
    this.setupRequestInterceptor();

    // Setup response interceptor for error handling
    this.setupResponseInterceptor();
  }

  /**
   * Setup request interceptor to add authentication token
   */
  private setupRequestInterceptor(): void {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = authService.getToken();

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  /**
   * Setup response interceptor for handling API errors
   */
  private setupResponseInterceptor(): void {
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response) {
          // Handle different error status codes
          const status = error.response.status;

          // Handle expired token or unauthorized
          if (status === 401) {
            // Log the user out if unauthorized
            authService.logout();
            return Promise.reject(new ApiError('Your session has expired. Please log in again.', status, error.response.data));
          }

          // Handle forbidden access
          if (status === 403) {
            return Promise.reject(new ApiError('You do not have permission to access this resource.', status, error.response.data));
          }

          // Handle other errors
          const message = error.response.data?.message || 'An error occurred';
          return Promise.reject(new ApiError(message, status, error.response.data));
        }

        // Network errors or other issues
        return Promise.reject(new ApiError('Network error or server is unreachable', 0));
      }
    );
  }

  /**
   * Execute an API request with a fallback option for mock data
   */
  public async request<T>(
    config: AxiosRequestConfig,
    mockFallback?: () => Promise<T>
  ): Promise<T> {
    try {
      // If using mock data and we have a fallback, use it immediately
      if (this.useMockData && mockFallback) {
        console.log(`Using mock data for ${config.url}`);
        return await mockFallback();
      }

      // Otherwise make the real API call
      const response: AxiosResponse<T> = await this.axiosInstance.request(config);
      return response.data;
    } catch (error) {
      // If API call fails and we have a fallback, use it
      if (mockFallback) {
        console.warn(`API call to ${config.url} failed, using mock data fallback`);

        try {
          return await mockFallback();
        } catch (fallbackError) {
          console.error('Even the mock fallback failed:', fallbackError);
          throw error; // Re-throw the original error
        }
      }

      // No fallback, so just throw the error
      throw error;
    }
  }

  /**
   * GET request wrapper
   */
  public async get<T>(
    url: string,
    params?: any,
    mockFallback?: () => Promise<T>
  ): Promise<T> {
    return this.request<T>(
      {
        method: 'GET',
        url,
        params,
      },
      mockFallback
    );
  }

  /**
   * POST request wrapper
   */
  public async post<T>(
    url: string,
    data?: any,
    mockFallback?: () => Promise<T>
  ): Promise<T> {
    return this.request<T>(
      {
        method: 'POST',
        url,
        data,
      },
      mockFallback
    );
  }

  /**
   * PUT request wrapper
   */
  public async put<T>(
    url: string,
    data?: any,
    mockFallback?: () => Promise<T>
  ): Promise<T> {
    return this.request<T>(
      {
        method: 'PUT',
        url,
        data,
      },
      mockFallback
    );
  }

  /**
   * PATCH request wrapper
   */
  public async patch<T>(
    url: string,
    data?: any,
    mockFallback?: () => Promise<T>
  ): Promise<T> {
    return this.request<T>(
      {
        method: 'PATCH',
        url,
        data,
      },
      mockFallback
    );
  }

  /**
   * DELETE request wrapper
   */
  public async delete<T>(
    url: string,
    mockFallback?: () => Promise<T>
  ): Promise<T> {
    return this.request<T>(
      {
        method: 'DELETE',
        url,
      },
      mockFallback
    );
  }

  /**
   * Upload file(s) via multipart form
   */
  public async uploadFile<T>(
    url: string,
    files: File | File[],
    additionalData?: Record<string, any>,
    mockFallback?: () => Promise<T>
  ): Promise<T> {
    const formData = new FormData();

    // Handle single file or array of files
    if (Array.isArray(files)) {
      files.forEach((file, index) => {
        formData.append(`file${index}`, file);
      });
    } else {
      formData.append('file', files);
    }

    // Add any additional data
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
      });
    }

    return this.request<T>(
      {
        method: 'POST',
        url,
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
      mockFallback
    );
  }
}

// Create a singleton instance of the API client
export const apiClient = new ApiClient();

// Export default instance
export default apiClient;
