import axios, { AxiosError, type AxiosInstance, type AxiosResponse } from 'axios'
import tokenService from './token.service'

const BASE_URL = ''

class HttpError extends Error {
	public readonly isHttpError = true
	public readonly statusCode?: number
	public readonly responseData?: unknown
	public readonly originalError: unknown

	constructor(
		message: string,
		statusCode?: number,
		responseData?: unknown,
		originalError?: unknown
	) {
		super(message)
		this.name = 'HttpError'
		this.statusCode = statusCode
		this.responseData = responseData
		this.originalError = originalError
	}
}

class HttpService {
	private readonly axiosInstance: AxiosInstance

	constructor(baseUrl: string) {
		this.axiosInstance = axios.create({
			baseURL: `${baseUrl}/api`,
			timeout: 10000,
			headers: { 'Content-Type': 'application/json' },
		})

		this.axiosInstance.interceptors.request.use((config) => {
			const token = tokenService.get()
			if (!token) return config

			config.headers['Authorization'] = `Bearer ${token}`
			return config
		})
	}

	public async get<T>(url: string, params?: Record<string, any>): Promise<T> {
		try {
			const response: AxiosResponse<T> = await this.axiosInstance.get<T>(url, { params })
			return response.data
		} catch (error) {
			throw this.normalizeError(error)
		}
	}

	public async post<T>(url: string, data?: Record<string, any>): Promise<T> {
		try {
			const response: AxiosResponse<T> = await this.axiosInstance.post<T>(url, data)
			return response.data
		} catch (error) {
			throw this.normalizeError(error)
		}
	}

	public async put<T>(url: string, data?: Record<string, any>): Promise<T> {
		try {
			const response: AxiosResponse<T> = await this.axiosInstance.put<T>(url, data)
			return response.data
		} catch (error) {
			throw this.normalizeError(error)
		}
	}

	public async delete<T>(url: string): Promise<T> {
		try {
			const response: AxiosResponse<T> = await this.axiosInstance.delete<T>(url)
			return response.data
		} catch (error) {
			throw this.normalizeError(error)
		}
	}

	private normalizeError(error: unknown): HttpError {
		if (axios.isAxiosError(error)) {
			const axiosErr = error as AxiosError
			const statusCode = axiosErr.response?.status
			const responseData = axiosErr.response?.data
			const message = axiosErr.message ?? 'Unexpected HTTP error'
			return new HttpError(message, statusCode, responseData, error)
		}
		return new HttpError('Unknown error occurred', undefined, undefined, error)
	}
}

export type { HttpService }

const httpService: HttpService = new HttpService(BASE_URL)
export default httpService
