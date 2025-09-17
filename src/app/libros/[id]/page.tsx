import BookPage from "@/components/BookPage";

interface PageProps {
  params: Promise<{ id: string }>; // 👈 en App Router los params son async
}

export default async function Page({ params }: PageProps) {
  const { id } = await params; // ✅ hay que await
  if (!id) {
    return <p className="text-red-500">No se recibió un ID de libro.</p>;
  }
  return <BookPage bookId={id} />;
}
