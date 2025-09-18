import BookPage from "@/components/BookPage";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params; 
  if (!id) {
    return <p className="text-red-500">No se recibió un ID de libro.</p>;
  }
  return <BookPage bookId={id} />;
}
