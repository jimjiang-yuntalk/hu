import SearchClient from "@/components/SearchClient"

export default function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const query = searchParams?.q || ""
  return <SearchClient initialQuery={query} />
}
