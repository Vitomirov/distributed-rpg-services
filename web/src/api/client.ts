import { clearToken } from "../session";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
};

function createApi(baseUrl: string) {
  return {
    async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
      const headers: Record<string, string> = {};
      if (options.body !== undefined) headers["Content-Type"] = "application/json";
      if (options.token) headers.Authorization = `Bearer ${options.token}`;

      const response = await fetch(`${baseUrl}${path}`, {
        method: options.method ?? (options.body !== undefined ? "POST" : "GET"),
        headers,
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      });

      const data = await response.json().catch(() => ({} as { message?: string }));
      if (!response.ok) {
        if (response.status === 401 && options.token) clearToken();
        const message = typeof data.message === "string" ? data.message : response.statusText;
        throw new ApiError(message, response.status);
      }
      return data as T;
    },
  };
}

export const accountApi = createApi(import.meta.env.VITE_ACCOUNT_URL || "http://localhost:3001");
export const characterApi = createApi(import.meta.env.VITE_CHARACTER_URL || "http://localhost:3002");
export const combatApi = createApi(import.meta.env.VITE_COMBAT_URL || "http://localhost:3003");
