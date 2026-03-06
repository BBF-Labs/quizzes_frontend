// No guard — accessible before authentication
export default function AdminPublicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
