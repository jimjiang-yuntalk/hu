import QaLoadingClient from "@/components/QaLoadingClient"

export default function QaLoadingPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  return <QaLoadingClient initialQuery={searchParams?.q || ""} />
}
