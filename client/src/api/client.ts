export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Array<{ path: string; message: string }>;
  devResetToken?: string;
}

const getBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return '/api';
  const clean = envUrl.replace(/\/+$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
};

const BASE_URL = getBaseUrl();

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('roleforge_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle file downloads
    const contentType = response.headers.get('content-type');
    if (
      contentType &&
      (contentType.includes('application/pdf') ||
        contentType.includes('application/vnd.openxmlformats') ||
        contentType.includes('text/plain'))
    ) {
      const blob = await response.blob();
      return { success: true, data: blob as any };
    }

    let data: any;
    try {
      data = await response.json();
    } catch {
      throw new Error(`Server returned status ${response.status} with unparseable response.`);
    }

    if (!response.ok) {
      if (response.status === 401) {
        // Dispatch custom logout event
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
      const errorMessage =
        data.message ||
        (data.errors && data.errors[0]?.message) ||
        'An unexpected server error occurred.';
      throw new Error(errorMessage);
    }

    return data;
  }

  public get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  public post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  public put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  public delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient();

