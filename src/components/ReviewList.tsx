"use client";

import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { Review } from "@/types";

type Props = { bookId: string };
export type ReviewListRef = { reload: () => void };

function ReviewListComponent({ bookId }: Props, ref: React.Ref<ReviewListRef>) {
  const [reviews, setReviews] = useState<Review[]>([]);

  const fetchReviews = async () => {
    const res = await fetch(`/api/reviews?bookId=${bookId}`);
    const data: Review[] = await res.json();
    setReviews(data);
  };

  useEffect(() => {
    fetchReviews();
  }, [bookId]);

  useImperativeHandle(ref, () => ({ reload: fetchReviews }));

  const vote = async (id: string, value: number) => {
    await fetch(`/api/reviews/${id}/vote`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    });
    fetchReviews();
  };

  return (
    <div className="mt-4">
      {reviews.map((r) => (
        <div key={r._id} className="border p-3 mb-2 rounded">
          <p className="font-bold">
            {r.user.email} ({r.rating}★)
          </p>
          <p>{r.text}</p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => vote(r._id, 1)}
              className="px-2 bg-blue-500 text-white rounded"
            >
              👍 {r.votes.filter((v) => v.value === 1).length}
            </button>
            <button
              onClick={() => vote(r._id, -1)}
              className="px-2 bg-red-500 text-white rounded"
            >
              👎 {r.votes.filter((v) => v.value === -1).length}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

const ReviewList = forwardRef(ReviewListComponent);
export default ReviewList;
