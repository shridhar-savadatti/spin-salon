export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-100 via-zinc-50 to-slate-100 pt-14 md:pt-0">
      {children}
    </div>
  );
}
