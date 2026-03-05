export default function AdminDocumentos() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold" style={{ color: "var(--regu-gray-900)" }}>
        Documentos
      </h1>
      <p className="rounded-xl border border-dashed p-6 text-center text-sm" style={{ borderColor: "var(--regu-gray-100)", color: "var(--regu-gray-500)" }}>
        Aquí podrás subir documentos y asignarlos a las subcategorías del menú Recursos (Planes de trabajo, Actas, Declaraciones, etc.). Próximamente: carga de archivos y asignación a secciones.
      </p>
    </div>
  );
}
