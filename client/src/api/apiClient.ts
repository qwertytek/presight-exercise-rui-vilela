const SERVER_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL || 'http://localhost:3000';

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | string[] | number[]>;
}

export const apiClient = async <T>(endpoint: string, options: FetchOptions = {}): Promise<T> => {
  const { params, headers, ...customConfig } = options;

  let url = `${SERVER_BASE_URL}/api/${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      if (Array.isArray(value)) {
        value.forEach((val) => searchParams.append(key, String(val)));
      } else {
        searchParams.set(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    ...customConfig,
    credentials: 'include',
    headers: {
      ...defaultHeaders,
      ...headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP Error ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
};
