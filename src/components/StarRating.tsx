"use client";

import { useState } from "react";

type StarRatingProps = {
  rating: number;
  setRating: (rating: number) => void;
};

export default function StarRating({ rating, setRating }: StarRatingProps) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex mb-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`cursor-pointer text-2xl ${
            star <= (hover || rating) ? "text-yellow-500" : "text-gray-300"
          }`}
          onClick={() => setRating(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
        >
          ★
        </span>
      ))}
    </div>
  );
}