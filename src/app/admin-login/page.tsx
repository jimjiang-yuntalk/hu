import AdminLoginForm from "./AdminLoginForm"

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams?: { next?: string }
}) {
  const next = searchParams?.next || "/admin"
  return <AdminLoginForm next={next} />
}
