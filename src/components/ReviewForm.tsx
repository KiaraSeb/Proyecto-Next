"use client";

import { useState } from "react";
import StarRating from "./StarRating";
import { Review } from "@/types";

export default function ReviewForm({ bookId, onNewReview }: { bookId: string; onNewReview?: () => void }) {
  const [userName, setUserName] = useState("");
  const [rating, setRating] = useState(3);
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newReview: Omit<Review, "id" | "createdAt" | "votes"> = {
      bookId,
      userName,
      rating,
      content,
    };
    await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newReview),
    });
    setUserName("");
    setContent("");
    setRating(3);
    if (onNewReview) onNewReview();
  };

  return (
    <form onSubmit={handleSubmit} className="border p-4 rounded mt-4">
      <input
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        placeholder="Tu nombre"
        className="border p-2 w-full mb-2"
      />
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