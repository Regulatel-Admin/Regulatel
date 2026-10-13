import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, RefreshCw } from "lucide-react";
import { api, type FormSecurityAction } from "@/lib/api";
import { formSecurityMessages } from "@/lib/formSecurityMessages";

type TurnstileOptions = {
  sitekey: string;
  action: FormSecurityAction;
  theme: "light";
  size: "flexible";
  language: string;
  "response-field": false;
  "refresh-expired": "manual";
  callback: (token: string) => void;
  "expired-callback": () => void;
  "error-callback": () => void;
  "timeout-callback": () => void;
};

type TurnstileApi = {
  render: (container: HTMLElement, options: TurnstileOptions) => string;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let turnstilePromise: Promise<TurnstileApi> | null = null;

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (turnstilePromise) return turnstilePromise;

  turnstilePromise = new Promise<TurnstileApi>((resolve, reject) => {
    const scriptId = "regulatel-turnstile";
    document.getElementById(scriptId)?.remove();
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    const timeout = window.setTimeout(() => fail(), 20_000);
    const fail = () => {
      window.clearTimeout(timeout);
      script.onload = null;
      script.onerror = null;
      script.remove();
      reject(new Error("Turnstile unavailable"));
    };
    script.onload = () => {
      window.clearTimeout(timeout);
      script.onload = null;
      script.onerror = null;
      if (window.turnstile) resolve(window.turnstile);
      else fail();
    };
    script.onerror = fail;
    document.head.appendChild(script);
  }).catch((error: unknown) => {
    turnstilePromise = null;
    throw error;
  });
  return turnstilePromise;
}

export type FormSecurityState = {
  formToken: string;
  turnstileToken: string;
  ready: boolean;
};

export const emptyFormSecurity: FormSecurityState = {
  formToken: "",
  turnstileToken: "",
  ready: false,
};

/** A single-use challenge shared by the public contact and subscription forms. */
export default function FormSecurity({
  action,
  onChange,
}: {
  action: FormSecurityAction;
  onChange: (state: FormSecurityState) => void;
}) {
  const { i18n } = useTranslation();
  const copy = formSecurityMessages(i18n.language);
  const containerRef = useRef<HTMLDivElement>(null);
  const [revision, setRevision] = useState(0);
  const [status, setStatus] = useState<"loading" | "verifying" | "ready" | "error" | "expired">("loading");

  useEffect(() => {
    let active = true;
    let widgetId: string | undefined;
    let turnstile: TurnstileApi | undefined;
    let expiryTimer: number | undefined;
    onChange(emptyFormSecurity);
    setStatus("loading");

    const initialize = async () => {
      try {
        const response = await api.formSecurity.config(action);
        if (!active) return;
        if (!response.ok) throw new Error(response.error);
        const { siteKey, formToken, expiresAt } = response.data;
        // Accommodate either epoch seconds or milliseconds without relying on the host clock zone.
        const expiresAtMs = expiresAt < 1_000_000_000_000 ? expiresAt * 1000 : expiresAt;
        if (!siteKey || !formToken || !Number.isFinite(expiresAtMs) || expiresAtMs <= Date.now()) {
          throw new Error("Invalid form security configuration");
        }
        const runtime = await loadTurnstile();
        if (!active || !containerRef.current) return;
        turnstile = runtime;
        const invalidate = (nextStatus: "error" | "expired") => {
          if (!active) return;
          onChange(emptyFormSecurity);
          setStatus(nextStatus);
        };
        setStatus("verifying");
        widgetId = runtime.render(containerRef.current, {
          sitekey: siteKey,
          action,
          theme: "light",
          size: "flexible",
          language: i18n.language.split("-")[0],
          "response-field": false,
          "refresh-expired": "manual",
          callback: (token) => {
            if (!active) return;
            if (Date.now() >= expiresAtMs || !token) {
              invalidate("expired");
              return;
            }
            onChange({ formToken, turnstileToken: token, ready: true });
            setStatus("ready");
          },
          "expired-callback": () => invalidate("expired"),
          "error-callback": () => invalidate("error"),
          "timeout-callback": () => invalidate("expired"),
        });
        expiryTimer = window.setTimeout(() => invalidate("expired"), Math.max(0, expiresAtMs - Date.now()));
      } catch {
        if (!active) return;
        onChange(emptyFormSecurity);
        setStatus("error");
      }
    };
    void initialize();
    return () => {
      active = false;
      if (expiryTimer !== undefined) window.clearTimeout(expiryTimer);
      if (widgetId !== undefined && turnstile) turnstile.remove(widgetId);
      onChange(emptyFormSecurity);
    };
  }, [action, revision, onChange, i18n.language]);

  return (
    <div className="space-y-2">
      <div
        aria-hidden="true"
        style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}
      >
        <label htmlFor={`${action}-website`}>Website</label>
        <input id={`${action}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <div ref={containerRef} className="w-full" />
      <p className="flex items-center gap-2 text-xs" style={{ color: "var(--regu-gray-500)" }} role="status" aria-live="polite">
        {status === "loading" && <Loader2 size={14} className="animate-spin" aria-hidden />}
        {status === "loading" ? copy.loading : status === "ready" ? copy.ready : status === "expired" ? copy.expired : status === "error" ? copy.loadError : copy.verifying}
      </p>
      {(status === "error" || status === "expired") && (
        <button
          type="button"
          onClick={() => setRevision((value) => value + 1)}
          className="inline-flex items-center gap-2 text-xs font-semibold underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)]"
          style={{ color: "var(--regu-blue)" }}
        >
          <RefreshCw size={13} aria-hidden />
          {copy.retry}
        </button>
      )}
    </div>
  );
}
