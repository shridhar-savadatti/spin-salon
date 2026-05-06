export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    // pt-14 on mobile offsets the fixed top nav bar (56px tall)
    <div className="min-h-screen bg-zinc-50 pt-14 md:pt-0">
      {children}
    </div>
  );
}
