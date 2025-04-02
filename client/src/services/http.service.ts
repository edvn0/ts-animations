import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosResponse,
} from "axios";
import tokenService from "./token.service";

const BASE_URL = "";

class HttpError extends Error {
  public readonly isHttpError = true;
  public readonly statusCode?: number;
  public readonly responseData?: unknown;
  public readonly originalError: unknown;

  constructor(
    message: string,
    statusCode?: number,
    responseData?: unknown,
    originalError?: unknown,
  ) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.responseData = responseData;
    this.originalError = originalError;
  }
}

class HttpService {
  private readonly axiosInstance: AxiosInstance;
  private readonly maxRetries = 3;
  private readonly baseDelayMillis = 300;

  constructor(base_url: string) {
    this.axiosInstance = axios.create({
      baseURL: `${base_url}/api`,
      timeout: 10000,
      headers: { "Content-Type": "application/json" },
    });

    this.axiosInstance.interceptors.request.use((config) => {
      const token = tokenService.get();
      if (!token) return config;
      config.headers["Authorization"] = `Bearer ${token}`;
      return config;
    });
  }

  public async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    return this.requestWithRetry<T>(() =>
      this.axiosInstance.get<T>(url, { params })
    );
  }

  public async post<T>(url: string, data?: Record<string, any>): Promise<T> {
    return this.requestWithRetry<T>(() =>
      this.axiosInstance.post<T>(url, data)
    );
  }

  public async put<T>(url: string, data?: Record<string, any>): Promise<T> {
    return this.requestWithRetry<T>(() => this.axiosInstance.put<T>(url, data));
  }

  public async delete<T>(url: string): Promise<T> {
    return this.requestWithRetry<T>(() => this.axiosInstance.delete<T>(url));
  }

  private async requestWithRetry<T>(
    fn: () => Promise<AxiosResponse<T>>,
  ): Promise<T> {
    let attempt = 0;
    while (true) {
      try {
        const response = await fn();
        return response.data;
      } catch (error) {
        const axiosError = error as AxiosError;
        const shouldRetry = this.shouldRetry(axiosError);
        if (!shouldRetry || attempt >= this.maxRetries) {
          throw this.normalizeError(error);
        }
        const delay = this.baseDelayMillis * (2 ** attempt);
        await this.sleep(delay);
        attempt++;
      }
    }
  }

  private shouldRetry(error: AxiosError): boolean {
    if (!error.response) return true;
    const status = error.response.status;
    if (status >= 500 || status === 429) return true;
    return false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private normalizeError(error: unknown): HttpError {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const status_code = axiosError.response?.status;
      const response_data = axiosError.response?.data;
      const message = axiosError.message ?? "Unexpected HTTP error";
      return new HttpError(message, status_code, response_data, error);
    }
    return new HttpError("Unknown error occurred", undefined, undefined, error);
  }
}

export type { HttpService };

const httpService: HttpService = new HttpService(BASE_URL);
export default httpService;
