"use client";

import { useState, useEffect } from "react";
import StarRating from "./StarRating";

export default function ReviewForm({
  bookId,
  onNewReview,
}: {
  bookId: string;
  onNewReview?: () => void;
}) {
  const [user, setUser] = useState<{ _id: string; email: string } | null>(null);
  const [rating, setRating] = useState(3);
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Debes iniciar sesión para dejar una reseña");
      return;
    }

    const newReview = { bookId, rating, content };

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newReview),
    });

    if (res.ok) {
      setContent("");
      setRating(3);
      onNewReview?.();
    } else {
      const error = await res.json();
      alert(error.error || "No se pudo guardar la reseña");
    }
  };

  if (!user) return <p className="text-red-500">Inicia sesión para escribir una reseña.</p>;

  return (
    <form onSubmit={handleSubmit} className="border p-4 rounded mt-4">
      <p className="mb-2">Escribiendo como: {user.email}</p>
      <StarRating rating={rating} setRating={setRating} />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Escribe tu reseña..."
        className="border p-2 w-full mb-2"
      />
      <button className="bg-green-500 text-white px-4 py-2 rounded">Publicar</button>
    </form>
  );
}
