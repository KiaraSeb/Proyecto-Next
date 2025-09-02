"use client";

import { useRef } from "react";
import ReviewForm from "./ReviewForm";
import ReviewList from "./ReviewList";

export default function ReviewsSection({ bookId }: { bookId: string }) {
  const listRef = useRef<{ reload: () => void }>(null);

  return (
    <>
      <ReviewForm bookId={bookId} onNewReview={() => listRef.current?.reload()} />
      <ReviewList ref={listRef} bookId={bookId} />
    </>
  );
}
