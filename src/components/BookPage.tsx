"use client";

import { useEffect, useState, useCallback } from "react";
import { getBookById, Book } from "@/lib/googleBooks";
import Image from "next/image";
import { Review, Vote } from "@/types";

interface BookPageProps {
  bookId: string;
}

export default function BookPage({ bookId }: BookPageProps) {
  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [error, setError] = useState<string | null>(null);

  const fetchBook = useCallback(async () => {
    if (!bookId) {
      setError("No se recibió un ID de libro válido.");
      return;
    }
    try {
      const data = await getBookById(bookId);
      if (!data) {
        setError("No se pudo cargar el libro.");
        return;
      }
      setBook(data);
    } catch (err) {
      console.error(err);
      setError("Error al cargar el libro.");
    }
  }, [bookId]);

  const fetchReviews = useCallback(async () => {
    if (!bookId) return;
    try {
      const res = await fetch(`/api/reviews?bookId=${bookId}`);
      if (!res.ok) throw new Error("Error al obtener reseñas");
      const data: Review[] = await res.json();
      setReviews(data);
    } catch (err) {
      console.error(err);
      setReviews([]);
    }
  }, [bookId]);

  const addReview = useCallback(async () => {
    if (!name || !content) {
      alert("Debes ingresar tu nombre y la reseña.");
      return;
    }
    const newReview: Omit<Review, "votes"> = {
      bookId,
      userName: name,
      rating,
      content,
      createdAt: new Date().toISOString(),
      id: Date.now().toString(),
    };

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReview),
      });
      if (!res.ok) throw new Error("No se pudo enviar la reseña");

      setName("");
      setContent("");
      setRating(5);

      await fetchReviews();
    } catch (err) {
      console.error(err);
      alert("No se pudo enviar la reseña");
    }
  }, [name, content, rating, bookId, fetchReviews]);

  const voteReview = useCallback(
    async (reviewId: string, value: 1 | -1) => {
      try {
        const res = await fetch(`/api/reviews/${reviewId}/vote`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: "anon", value }),
        });
        if (!res.ok) throw new Error("No se pudo votar la reseña");
        await fetchReviews();
      } catch (err) {
        console.error(err);
        alert("No se pudo votar la reseña");
      }
    },
    [fetchReviews]
  );

  useEffect(() => {
    fetchBook();
    fetchReviews();
  }, [fetchBook, fetchReviews]);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!book) return <p>Cargando libro...</p>;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">{book.volumeInfo.title}</h1>

      {book.volumeInfo.imageLinks?.thumbnail && (
        <Image
          src={book.volumeInfo.imageLinks.thumbnail}
          alt={book.volumeInfo.title}
          width={200}
          height={300}
          className="mb-4"
        />
      )}

      <div
        className="mb-2"
        dangerouslySetInnerHTML={{
          __html: book.volumeInfo.description || "<p>Sin descripción disponible</p>",
        }}
      />

      <p className="mt-2 font-semibold">
        Autor: {book.volumeInfo.authors?.join(", ")}
      </p>

      {/* --- Formulario de reseña --- */}
      <div className="mt-6 border-t pt-4">
        <h2 className="text-xl font-semibold mb-2">Agregar reseña</h2>
        <input
          type="text"
          placeholder="Tu nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 mb-2 w-full"
        />
        <textarea
          placeholder="Escribe tu reseña..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="border p-2 mb-2 w-full"
        />
        <div className="flex items-center mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`cursor-pointer text-2xl ${star <= rating ? "text-yellow-500" : "text-gray-300"}`}
              onClick={() => setRating(star)}
            >
              ★
            </span>
          ))}
          <span className="ml-2">{rating} de 5</span>
        </div>
        <button
          onClick={addReview}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Enviar
        </button>
      </div>

      {/* --- Lista de reseñas --- */}
      <div className="mt-6 border-t pt-4">
        <h2 className="text-xl font-semibold mb-2">Reseñas</h2>
        {reviews.length === 0 ? (
          <p>No hay reseñas todavía.</p>
        ) : (
          reviews.map((r) => {
            const upVotes = r.votes.filter((v) => v.value === 1).length;
            const downVotes = r.votes.filter((v) => v.value === -1).length;

            return (
              <div key={r.id} className="border p-2 mb-2 rounded">
                <p className="font-semibold">{r.userName}</p>
                <p>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={star <= r.rating ? "text-yellow-500" : "text-gray-300"}
                    >
                      ★
                    </span>
                  ))}
                </p>
                <p>{r.content}</p>
                <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleString()}</p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => voteReview(r.id, 1)}
                    className="text-sm px-2 py-1 bg-green-200 rounded hover:bg-green-300"
                  >
                    👍 {upVotes}
                  </button>
                  <button
                    onClick={() => voteReview(r.id, -1)}
                    className="text-sm px-2 py-1 bg-red-200 rounded hover:bg-red-300"
                  >
                    👎 {downVotes}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
