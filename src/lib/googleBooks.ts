/* eslint-disable @typescript-eslint/no-explicit-any */
export interface BookVolumeInfo {
  title: string;
  authors?: string[];
  description?: string;
  imageLinks?: { thumbnail?: string };
}

export interface Book {
  id: string;
  volumeInfo: BookVolumeInfo;
}

export interface SearchResult {
  kind: string;
  totalItems: number;
  items: Book[];
}

function normalizeBook(item: any): Book {
  return {
    id: item.id ?? "sin-id",
    volumeInfo: {
      title: item.volumeInfo?.title ?? "Sin título",
      authors: item.volumeInfo?.authors ?? [],
      description: item.volumeInfo?.description ?? "Sin descripción",
      imageLinks: item.volumeInfo?.imageLinks ?? {},
    },
  };
}

export async function searchBooks(query: string): Promise<SearchResult> {
  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`
  );
  if (!res.ok) throw new Error("Error buscando libros");
  const data = await res.json();
  return {
    kind: data.kind,
    totalItems: data.totalItems,
    items: data.items?.map(normalizeBook) ?? [],
  };
}

export async function getBookById(id: string): Promise<Book | null> {
  if (!id || id === "sin-id") return null;
  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes/${id}`);
    if (!res.ok) return null;
    const data = await res.json();
    return normalizeBook(data);
  } catch {
    return null;
  }
}
