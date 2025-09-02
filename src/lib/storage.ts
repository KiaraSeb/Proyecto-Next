import { Review } from "@/types";

function readReviews(): Review[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem("reviews");
  return data ? JSON.parse(data) : [];
}

function writeReviews(reviews: Review[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("reviews", JSON.stringify(reviews));
}

export function getReviewsByBook(bookId: string): Review[] {
  return readReviews().filter((r) => r.bookId === bookId);
}

export function addReview(review: Review) {
  const reviews = readReviews();
  reviews.push(review);
  writeReviews(reviews);
}

export function addVote(reviewId: string, userId: string, value: number) {
  if (!reviewId || !userId) {
    throw new Error("Faltan datos para votar");
  }
  const reviews = readReviews();
  const review = reviews.find((r) => r.id === reviewId);
  if (!review) throw new Error("Review no encontrada");
  review.votes = review.votes.filter((v: { userId: string; }) => v.userId !== userId);
  review.votes.push({ userId, value });
  writeReviews(reviews);
}

export { readReviews };
