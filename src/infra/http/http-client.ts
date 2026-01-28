export interface HttpClient {
  get<T>(url: string, config?: any): Promise<{ data: T }>;
  post<T>(url: string, data?: any, config?: any): Promise<{ data: T }>;
  put<T>(url: string, data?: any, config?: any): Promise<{ data: T }>;
  delete<T>(url: string, config?: any): Promise<{ data: T }>;
}
