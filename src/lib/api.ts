/**
 * API client for backend (Neon Postgres). Uses relative /api/* URLs.
 * No secrets; all requests go to same origin.
 */

const API_BASE = "";

async function request<T>(
  path: string,
  options?: { method?: string; headers?: HeadersInit; body?: unknown }
): Promise<{ data: T; ok: true } | { error: string; ok: false }> {
  try {
    const bodySerialized =
      options?.body !== undefined ? JSON.stringify(options.body) : undefined;
    const init: RequestInit = {
      method: options?.method ?? "GET",
      headers: { "Content-Type": "application/json", ...options?.headers },
      body: bodySerialized,
      credentials: "include",
    };
    const res = await fetch(`${API_BASE}${path}`, init);
    const text = await res.text();
    const data = text.trim() ? (JSON.parse(text) as T) : (undefined as T);
    if (!res.ok) {
      const errMsg = data && typeof data === "object" && "error" in data ? String((data as { error: string }).error) : res.statusText;
      return { ok: false, error: errMsg };
    }
    return { ok: true, data: data as T };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error" };
  }
}

export const api = {
  news: {
    list: () => request<unknown[]>("/api/news"),
    create: (body: unknown) => request<unknown>("/api/news", { method: "POST", body }),
    get: (id: string) => request<unknown>(`/api/news/${encodeURIComponent(id)}`),
    update: (id: string, body: unknown) => request<unknown>(`/api/news/${encodeURIComponent(id)}`, { method: "PATCH", body }),
    delete: (id: string) => request<void>(`/api/news/${encodeURIComponent(id)}`, { method: "DELETE" }),
  },
  events: {
    list: () => request<unknown[]>("/api/events"),
    create: (body: unknown) => request<unknown>("/api/events", { method: "POST", body }),
    get: (id: string) => request<unknown>(`/api/events/${encodeURIComponent(id)}`),
    update: (id: string, body: unknown) => request<unknown>(`/api/events/${encodeURIComponent(id)}`, { method: "PATCH", body }),
    delete: (id: string) => request<void>(`/api/events/${encodeURIComponent(id)}`, { method: "DELETE" }),
  },
  documents: {
    list: () => request<unknown[]>("/api/documents"),
    create: (body: unknown) => request<unknown>("/api/documents", { method: "POST", body }),
    get: (id: string) => request<unknown>(`/api/documents/${encodeURIComponent(id)}`),
    update: (id: string, body: unknown) => request<unknown>(`/api/documents/${encodeURIComponent(id)}`, { method: "PATCH", body }),
    delete: (id: string) => request<void>(`/api/documents/${encodeURIComponent(id)}`, { method: "DELETE" }),
  },
  uploads: {
    upload: (body: unknown) => request<unknown>("/api/uploads", { method: "POST", body }),
    delete: (body: unknown) => request<void>("/api/uploads", { method: "DELETE", body }),
  },
  admin: {
    session: () =>
      request<{
        authenticated: boolean;
        configured: boolean;
        bootstrapRequired: boolean;
        user: {
          id: string;
          name: string;
          email: string;
          username: string | null;
          role: "admin" | "editor";
        } | null;
      }>("/api/admin/session"),
    login: (body: unknown) =>
      request<{ authenticated: boolean }>("/api/admin/session", { method: "POST", body }),
    logout: () => request<void>("/api/admin/session", { method: "DELETE" }),
  },
};
