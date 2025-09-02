/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ReviewList, { ReviewListRef } from "@/components/ReviewList";
import { vi } from "vitest";
import { Review } from "@/types";

const mockReview: Review = {
  id: "r1",
  bookId: "b1",
  userName: "Usuario Test",
  rating: 4,
  content: "Muy bueno",
  createdAt: new Date().toISOString(),
  votes: [],
};

let mockReviews: Review[] = [mockReview]; 

const createMockResponse = (data: any): Response => {
  return {
    ok: true,
    status: 200,
    statusText: "OK",
    headers: new Headers({ "Content-Type": "application/json" }),
    redirected: false,
    type: "basic" as const,
    url: "",
    clone: () => createMockResponse(data),
    body: null as any,
    bodyUsed: false,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    blob: () => Promise.resolve(new Blob()),
    formData: () => Promise.resolve(new FormData()),
    text: () => Promise.resolve(JSON.stringify(data)),
    json: async () => data,
  } as Response;
};

const fetchMock = vi.fn((url: string, options?: RequestInit) => {
  console.log("Fetch URL:", url, "Method:", options?.method);
  if (!options || options.method === "GET") {
    return Promise.resolve(createMockResponse(mockReviews));
  }
  if (options?.method === "PATCH" && url.includes("/api/reviews/")) {
    const body = JSON.parse(options.body as string);
    const reviewId = url.split("/").pop();
    mockReviews = mockReviews.map((review) =>
      review.id === reviewId
        ? { ...review, votes: [...review.votes, { userId: body.userId, value: body.value }] }
        : review
    );
    return Promise.resolve(createMockResponse(mockReviews.find((r) => r.id === reviewId)));
  }
  return Promise.resolve(createMockResponse([]));
}) as unknown as typeof fetch;

global.fetch = fetchMock;

describe("ReviewList component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReviews = [mockReview];
  });

  it("renderiza la lista de reseñas", async () => {
    render(<ReviewList bookId="b1" />);
    await waitFor(
      () => {
        expect(screen.getByText(/Usuario Test/)).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it("permite votar a favor", async () => {
    const ref = { current: null as unknown as ReviewListRef };
    render(<ReviewList bookId="b1" ref={ref} />);

    const upVoteButton = await screen.findByRole("button", { name: /👍\s*0/ });
    fireEvent.click(upVoteButton);

    ref.current?.reload();

    await waitFor(
      () => {
        const updatedButton = screen.getByRole("button", { name: /👍\s*1/ });
        expect(updatedButton).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it("maneja recarga manual", async () => {
    const ref = { current: null as unknown as ReviewListRef };
    render(<ReviewList bookId="b1" ref={ref} />);
    await waitFor(
      () => {
        expect(screen.getByText(/Usuario Test/)).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    ref.current?.reload();
    await waitFor(
      () => {
        expect(screen.getByText(/Usuario Test/)).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });
});