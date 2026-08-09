export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-layout">
      <div className="bg-mesh" aria-hidden />
      {children}
    </div>
  );
}
