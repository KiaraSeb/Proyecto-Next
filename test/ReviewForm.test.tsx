import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ReviewForm from "@/components/ReviewForm";
import { vi } from "vitest";

const fetchMock = vi.fn((url: string, options?: RequestInit) => {
  if (options?.method === "POST" && url.includes("/api/reviews")) {
    const body = JSON.parse(options.body as string);
    return Promise.resolve({
      ok: true,
      status: 200,
      json: async () => ({
        id: "r2",
        bookId: body.bookId,
        userName: body.userName,
        content: body.content,
        rating: body.rating,
        createdAt: new Date().toISOString(),
        votes: [],
      }),
    });
  }
  return Promise.resolve({ ok: true, status: 200, json: async () => ({}) });
}) as unknown as typeof fetch;

global.fetch = fetchMock;

describe("ReviewForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("permite enviar una reseña", async () => {
    const onNewReview = vi.fn();
    render(<ReviewForm bookId="b1" onNewReview={onNewReview} />);

    fireEvent.change(screen.getByPlaceholderText("Tu nombre"), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByPlaceholderText("Escribe tu reseña..."), {
      target: { value: "Reseña de prueba" },
    });
    fireEvent.click(screen.getByText("★", { selector: ":nth-child(5)" })); 

    fireEvent.click(screen.getByText("Publicar"));

    await waitFor(
      () => {
        expect(fetchMock).toHaveBeenCalledWith(
          "/api/reviews",
          expect.objectContaining({
            method: "POST",
            body: JSON.stringify({
              bookId: "b1",
              userName: "Test User",
              rating: 5,
              content: "Reseña de prueba",
            }),
          })
        );
        expect(onNewReview).toHaveBeenCalled();
      },
      { timeout: 5000 }
    );
  });
});