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

// 🌍 Variable de entorno obligatoria
const GOOGLE_BOOKS_API_URL = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_URL;

if (!GOOGLE_BOOKS_API_URL) {
  throw new Error("Falta definir NEXT_PUBLIC_GOOGLE_BOOKS_API_URL en el .env");
}

export async function searchBooks(query: string): Promise<SearchResult> {
  const url = `${GOOGLE_BOOKS_API_URL}/volumes?q=${encodeURIComponent(query)}`;

  const res = await fetch(url);
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

  const url = `${GOOGLE_BOOKS_API_URL}/volumes/${id}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return normalizeBook(data);
  } catch {
    return null;
  }
}
