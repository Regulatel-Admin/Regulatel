import { Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function AdminLockedScreen({ title }: { title: string }) {
  return (
    <div
      className="mx-auto max-w-md rounded-2xl border bg-white px-6 py-12 text-center shadow-sm"
      style={{ borderColor: "rgba(22,61,89,0.10)" }}
    >
      <span
        className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
        style={{ backgroundColor: "rgba(22,61,89,0.08)", color: "var(--regu-navy)" }}
      >
        <Lock className="h-5 w-5" aria-hidden />
      </span>
      <h1 className="text-xl font-bold" style={{ color: "var(--regu-navy)" }}>
        {title}
      </h1>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--regu-gray-500)" }}>
        Esta parte está reservada a los administradores. Puedes seguir editando el resto del sitio con normalidad.
      </p>
    </div>
  );
}

/** Si no es admin, muestra la pantalla con candado. Si aún carga la sesión, no pinta nada. */
export function useAdminOnlySection() {
  const { isChecking, isAdmin, canManageUsers } = useAuth();
  const allowed = Boolean(isAdmin && canManageUsers);
  return {
    isChecking,
    allowed,
    locked: !isChecking && isAdmin && !canManageUsers,
  };
}
