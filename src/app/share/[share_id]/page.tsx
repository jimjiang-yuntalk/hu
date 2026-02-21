import ShareViewer from "@/components/ShareViewer"

export default function SharePage({ params }: { params: { share_id: string } }) {
  return (
    <div className="max-w-6xl mx-auto">
      <ShareViewer shareId={params.share_id} />
    </div>
  )
}
