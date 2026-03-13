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
    if (res.status === 401) {
      try {
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      } catch {
        // no-op
      }
    }
    const text = await res.text();
    let data: T | undefined;
    if (text.trim()) {
      const trimmed = text.trim();
      if (trimmed.startsWith("<") || trimmed.startsWith("The page") || trimmed.startsWith("<!")) {
        return { ok: false, error: "El servidor devolvió una página en lugar de datos. ¿La API está en marcha? (En desarrollo usa el backend o despliega en Vercel)." };
      }
      try {
        data = JSON.parse(trimmed) as T;
      } catch {
        return { ok: false, error: "La respuesta del servidor no es JSON válido." };
      }
    } else if (res.status === 204 || res.ok) {
      data = undefined as T;
    }
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
  cifras: {
    list: () => request<Record<number, { gruposTrabajo: number; comitesEjecutivos: number; revistaDigital: number; paises: number }>>("/api/cifras"),
    setForYear: (year: number, data: { gruposTrabajo: number; comitesEjecutivos: number; revistaDigital: number; paises: number }) =>
      request<unknown>("/api/cifras", { method: "PUT", body: { year, ...data } }),
    clearYear: (year: number) => request<void>(`/api/cifras/${year}`, { method: "DELETE" }),
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
  documentAccess: {
    login: (body: { email: string; password: string }) =>
      request<{ ok: boolean }>("/api/document-access", { method: "POST", body }),
    session: () => request<{ ok: boolean }>("/api/document-access"),
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
    users: {
      list: () => request<Array<{ id: string; name: string; email: string; username: string | null; role: string; is_active: boolean; last_login_at: string | null; created_at: string }>>("/api/admin/users"),
      create: (body: { email: string; password: string; name?: string; role?: string }) =>
        request<{ id: string; email: string; name: string; role: string }>("/api/admin/users", { method: "POST", body }),
    },
    documentAccessUsers: {
      list: () =>
        request<Array<{ id: string; email: string; name: string | null; institution: string | null; position: string | null; country: string | null; is_active: boolean; created_at: string }>>("/api/admin/document-access-users"),
      create: (body: { email: string; password: string; name?: string; institution?: string; position?: string; country?: string }) =>
        request<{ id: string; email: string; name: string | null; institution: string | null; position: string | null; country: string | null }>("/api/admin/document-access-users", { method: "POST", body }),
      update: (id: string, body: { name?: string; institution?: string; position?: string; country?: string; password?: string }) =>
        request<{ id: string; email: string; name: string | null; institution: string | null; position: string | null; country: string | null }>(`/api/admin/document-access-users/${encodeURIComponent(id)}`, { method: "PATCH", body }),
      delete: (id: string) =>
        request<void>(`/api/admin/document-access-users/${encodeURIComponent(id)}`, { method: "DELETE" }),
    },
    audit: {
      list: (params?: { limit?: number; offset?: number }) => {
        const sp = new URLSearchParams();
        if (params?.limit != null) sp.set("limit", String(params.limit));
        if (params?.offset != null) sp.set("offset", String(params.offset));
        const q = sp.toString();
        return request<{ items: Array<{
          id: string;
          user_id: string;
          user_email: string;
          user_name: string | null;
          action: string;
          resource_type: string;
          resource_id: string | null;
          details: Record<string, unknown>;
          created_at: string;
        }> }>(`/api/admin/audit${q ? `?${q}` : ""}`);
      },
    },
  },
};
