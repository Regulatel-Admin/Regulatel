import { Search } from "lucide-react";

interface MejoresPracticasSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function MejoresPracticasSearch({
  value,
  onChange,
  placeholder = "Buscar por país, categoría o recurso…",
  className = "",
}: MejoresPracticasSearchProps) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border bg-white transition focus-within:border-[var(--regu-blue)] focus-within:ring-2 focus-within:ring-[var(--regu-blue)]/20 ${className}`}
      style={{ borderColor: "rgba(22,61,89,0.12)" }}
    >
      <Search className="h-5 w-5 shrink-0" style={{ color: "var(--regu-gray-400)" }} aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 border-0 bg-transparent py-3 pl-0 pr-4 text-base outline-none placeholder:text-[var(--regu-gray-400)]"
        style={{ color: "var(--regu-gray-900)" }}
        aria-label="Buscar prácticas regulatorias"
      />
    </div>
  );
}
