import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import BookPage from "@/components/BookPage";
import * as googleBooks from "@/lib/googleBooks";

const mockBook = {
  id: "1",
  volumeInfo: {
    title: "El señor de los anillos",
    authors: ["J.R.R. Tolkien"],
    description: "Un libro de fantasía épica",
    imageLinks: { thumbnail: "https://example.com/lotr.jpg" },
  },
};

vi.stubGlobal("fetch", vi.fn((url) => {
  if (url.toString().includes("/api/reviews")) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([]),
    });
  }
  return Promise.reject("URL desconocida");
}));

vi.spyOn(googleBooks, "getBookById").mockImplementation(async (id) => {
  return mockBook;
});

describe("BookPage", () => {
  it("permite agregar una nueva reseña", async () => {
    render(<BookPage params={{ id: "1" }} />);

    await waitFor(async () => {
      expect(await screen.findByText("El señor de los anillos")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText("Tu nombre"), {
      target: { value: "Pepe" },
    });
    fireEvent.change(screen.getByPlaceholderText("Escribe tu reseña..."), {
      target: { value: "No me gustó el final" },
    });

    fireEvent.click(screen.getByText("Enviar"));

    expect(global.fetch).toHaveBeenCalledWith("/api/reviews", expect.any(Object));
  });
});
