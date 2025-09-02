import { PATCH } from "@/app/api/reviews/[id]/vote/route";
import { NextRequest } from "next/server";
import { vi } from "vitest";
import { readReviews, addVote } from "@/lib/storage";

vi.mock("@/lib/storage", () => ({
  readReviews: vi.fn(() => [
    {
      id: "r1",
      bookId: "b1",
      userName: "Test",
      rating: 4,
      content: "Good",
      createdAt: new Date().toISOString(),
      votes: [],
    },
  ]),
  addVote: vi.fn(),
}));

describe("Vote API", () => {
  it("registra un voto válido", async () => {
    const req = new NextRequest("http://localhost/api/review/r1/vote", {
      method: "PATCH",
      body: JSON.stringify({ userId: "user1", value: 1 }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await PATCH(req, { params: Promise.resolve({ id: "r1" }) });

    expect(response.status).toBe(200);
    expect(addVote).toHaveBeenCalledWith("r1", "user1", 1);
  });

  it("retorna error con datos inválidos", async () => {
    const req = new NextRequest("http://localhost/api/review/r1/vote", {
      method: "PATCH",
      body: JSON.stringify({ userId: "user1", value: 0 }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await PATCH(req, { params: Promise.resolve({ id: "r1" }) });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toMatchObject({ error: "Datos inválidos" });
  });

  it("retorna error si la reseña no existe", async () => {
    vi.mocked(readReviews).mockReturnValue([]);
    const req = new NextRequest("http://localhost/api/review/r2/vote", {
      method: "PATCH",
      body: JSON.stringify({ userId: "user1", value: 1 }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await PATCH(req, { params: Promise.resolve({ id: "r2" }) });

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data).toMatchObject({ error: "Reseña no encontrada" });
  });
});
