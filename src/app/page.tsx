/* eslint-disable @typescript-eslint/no-explicit-any */
import SearchBar from "@/components/SearchBar";
import BookCard from "@/components/BookCard";
import { searchBooks } from "@/lib/googleBooks";

interface HomeProps {
  searchParams?: Promise<{ q?: string }> | { q?: string };
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await Promise.resolve(searchParams);
  let books: any = null;

  try {
    if (params?.q) {
      books = await searchBooks(params.q);
    }
  } catch (error) {
    console.error("Error buscando libros:", error);
  }

  return (
    <main className="p-6">
      <h1 className="text-4xl font-bold mb-4 text-center">
        📚 Reseñas de Libros
      </h1>
      <SearchBar />
      {books?.items && books.items.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {books.items.map((book: any) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        params?.q && (
          <p className="mt-4 text-center">No se encontraron resultados.</p>
        )
      )}
    </main>
  );
}
