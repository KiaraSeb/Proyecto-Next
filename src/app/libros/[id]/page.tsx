import BookPage from "@/components/BookPage";

interface PageProps {
  params: { id: string };
}

export default function Page({ params }: PageProps) {
  const { id } = params;

  if (!id) {
    return <p className="text-red-500">No se recibió un ID de libro.</p>;
  }

  return <BookPage bookId={id} />;
}
