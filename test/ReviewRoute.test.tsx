import { GET, POST } from "@/app/api/reviews/route";
import { reviews } from "@/app/api/reviews/data";
import { NextRequest, NextResponse } from "next/server";
import { vi } from "vitest";

vi.mock("@/app/api/reviews/data", () => ({
  reviews: [],
}));

describe("Reviews API", () => {
  beforeEach(() => {
    reviews.length = 0; 
  });

  it("obtiene reseñas por bookId", async () => {
    // Add a sample review
    reviews.push({
      id: "r1",
      bookId: "b1",
      userName: "Test",
      rating: 4,
      content: "Good",
      createdAt: new Date().toISOString(),
      votes: [],
    });

    const url = new URL("http://localhost/api/reviews?bookId=b1");
    const req = new NextRequest(url);

    const response = await GET(req);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveLength(1);
    expect(data[0].bookId).toBe("b1");
  });

  it("retorna error si no hay bookId", async () => {
    const url = new URL("http://localhost/api/reviews");
    const req = new NextRequest(url);

    const response = await GET(req);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toMatchObject({ error: "bookId requerido" });
  });

  it("crea una nueva reseña", async () => {
    const req = new NextRequest("http://localhost/api/reviews", {
      method: "POST",
      body: JSON.stringify({ bookId: "b1", userName: "Test", rating: 4, content: "Great" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(req);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(reviews).toHaveLength(1);
    expect(data).toMatchObject({ bookId: "b1", userName: "Test", rating: 4 });
  });

  it("retorna error si faltan datos", async () => {
    const req = new NextRequest("http://localhost/api/reviews", {
      method: "POST",
      body: JSON.stringify({ bookId: "b1", content: "No name" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(req);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toMatchObject({ error: "Datos incompletos" });
  });
});