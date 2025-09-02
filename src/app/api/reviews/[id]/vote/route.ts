import { NextRequest, NextResponse } from "next/server";
import type { Vote } from "@/types";
import { reviews } from "@/app/api/reviews/data";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const { userId, value } = await req.json();

  if (!userId || ![1, -1].includes(value)) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const review = reviews.find((r) => r.id === id);
  if (!review) {
    return NextResponse.json(
      { error: "Reseña no encontrada" },
      { status: 404 }
    );
  }

  const existingVote = review.votes.find((v: Vote) => v.userId === userId);

  if (existingVote) {
    if (existingVote.value === value) {
      review.votes = review.votes.filter((v: Vote) => v.userId !== userId);
    } else {
      existingVote.value = value;
    }
  } else {
    review.votes.push({ userId, value });
  }

  return NextResponse.json(review);
}
