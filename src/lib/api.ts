/**
 * API client: todas las peticiones a /api/route/* para que Vercel las atienda con api/route/[...path].ts
 * (api/[[...path]].ts en la raíz suele dar 404 en proyectos Vite).
 */
const API_BASE = "";
const API_PREFIX = "/api/route";

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
    const res = await fetch(`${API_BASE}${API_PREFIX}${path}`, init);
    if (res.status === 401) {
      try {
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      } catch {
        // no-op
      }
    }
    const text = await res.text();
    const trimmed = text.trim();
    const looksLikeHtml = trimmed.startsWith("<") || trimmed.startsWith("The page") || trimmed.startsWith("<!");

    let data: T | undefined;
    if (trimmed) {
      if (looksLikeHtml) {
        if (res.status === 401 || res.status === 403) {
          return {
            ok: false,
            error: "401/403 y el servidor devolvió HTML. En Vercel: Settings → Deployment Protection → desactiva la protección o añade una excepción para que las rutas /api/* no pidan contraseña.",
          };
        }
        return {
          ok: false,
          error: "El servidor devolvió una página en lugar de datos. Revisa en Vercel que Root Directory esté vacío y que la carpeta api/ se despliegue.",
        };
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
    list: () => request<unknown[]>("/news"),
    create: (body: unknown) => request<unknown>("/news", { method: "POST", body }),
    get: (id: string) => request<unknown>(`/news/${encodeURIComponent(id)}`),
    update: (id: string, body: unknown) => request<unknown>(`/news/${encodeURIComponent(id)}`, { method: "PATCH", body }),
    delete: (id: string) => request<void>(`/news/${encodeURIComponent(id)}`, { method: "DELETE" }),
  },
  events: {
    list: () => request<unknown[]>("/events"),
    create: (body: unknown) => request<unknown>("/events", { method: "POST", body }),
    get: (id: string) => request<unknown>(`/events/${encodeURIComponent(id)}`),
    update: (id: string, body: unknown) => request<unknown>(`/events/${encodeURIComponent(id)}`, { method: "PATCH", body }),
    delete: (id: string) => request<void>(`/events/${encodeURIComponent(id)}`, { method: "DELETE" }),
  },
  cifras: {
    list: () => request<Record<number, { gruposTrabajo: number; comitesEjecutivos: number; revistaDigital: number; paises: number }>>("/cifras"),
    setForYear: (year: number, data: { gruposTrabajo: number; comitesEjecutivos: number; revistaDigital: number; paises: number }) =>
      request<unknown>("/cifras", { method: "PUT", body: { year, ...data } }),
    clearYear: (year: number) => request<void>(`/cifras/${year}`, { method: "DELETE" }),
  },
  documents: {
    list: () => request<unknown[]>("/documents"),
    create: (body: unknown) => request<unknown>("/documents", { method: "POST", body }),
    get: (id: string) => request<unknown>(`/documents/${encodeURIComponent(id)}`),
    update: (id: string, body: unknown) => request<unknown>(`/documents/${encodeURIComponent(id)}`, { method: "PATCH", body }),
    delete: (id: string) => request<void>(`/documents/${encodeURIComponent(id)}`, { method: "DELETE" }),
  },
  uploads: {
    upload: (body: unknown) => request<unknown>("/uploads", { method: "POST", body }),
    delete: (body: unknown) => request<void>("/uploads", { method: "DELETE", body }),
  },
  documentAccess: {
    login: (body: { email: string; password: string }) =>
      request<{ ok: boolean }>("/document-access", { method: "POST", body }),
    session: () => request<{ ok: boolean }>("/document-access"),
  },
  settings: {
    getAll: () => request<Record<string, unknown>>("/settings"),
    get: (key: string) => request<{ key: string; value: unknown; updated_at?: string }>(`/settings?key=${encodeURIComponent(key)}`),
    set: (key: string, value: unknown) => request<{ key: string; value: unknown; updated_at: string }>("/settings", { method: "PUT", body: { key, value } }),
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
      }>("/admin/session"),
    login: (body: unknown) =>
      request<{ authenticated: boolean }>("/admin/session", { method: "POST", body }),
    logout: () => request<void>("/admin/session", { method: "DELETE" }),
    users: {
      list: () => request<Array<{ id: string; name: string; email: string; username: string | null; role: string; is_active: boolean; last_login_at: string | null; created_at: string }>>("/admin/users"),
      create: (body: { email: string; password: string; name?: string; role?: string }) =>
        request<{ id: string; email: string; name: string; role: string }>("/admin/users", { method: "POST", body }),
    },
    documentAccessUsers: {
      list: () =>
        request<Array<{ id: string; email: string; name: string | null; institution: string | null; position: string | null; country: string | null; is_active: boolean; created_at: string }>>("/admin/document-access-users"),
      create: (body: { email: string; password: string; name?: string; institution?: string; position?: string; country?: string }) =>
        request<{ id: string; email: string; name: string | null; institution: string | null; position: string | null; country: string | null }>("/admin/document-access-users", { method: "POST", body }),
      update: (id: string, body: { name?: string; institution?: string; position?: string; country?: string; password?: string }) =>
        request<{ id: string; email: string; name: string | null; institution: string | null; position: string | null; country: string | null }>(`/admin/document-access-users/${encodeURIComponent(id)}`, { method: "PATCH", body }),
      delete: (id: string) =>
        request<void>(`/admin/document-access-users/${encodeURIComponent(id)}`, { method: "DELETE" }),
    },
    audit: {
      list: (params?: { limit?: number; offset?: number; resource_type?: string; resource_id?: string }) => {
        const sp = new URLSearchParams();
        if (params?.limit != null) sp.set("limit", String(params.limit));
        if (params?.offset != null) sp.set("offset", String(params.offset));
        if (params?.resource_type) sp.set("resource_type", params.resource_type);
        if (params?.resource_id) sp.set("resource_id", params.resource_id);
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
        }> }>(`/admin/audit${q ? `?${q}` : ""}`);
      },
    },
    media: {
      list: (params?: { prefix?: "news" | "events" | "gallery" | "all"; limit?: number }) => {
        const sp = new URLSearchParams();
        if (params?.prefix) sp.set("prefix", params.prefix);
        if (params?.limit != null) sp.set("limit", String(params.limit));
        const q = sp.toString();
        return request<{ items: Array<{ url: string; pathname: string; size?: number; uploadedAt?: string }> }>(`/admin/media${q ? `?${q}` : ""}`);
      },
    },
  },
};
