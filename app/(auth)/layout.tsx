export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="-mx-4 sm:-mx-6 lg:-mx-8 -my-8 min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "var(--bg)" }}
    >
      {children}
    </div>
  );
}
