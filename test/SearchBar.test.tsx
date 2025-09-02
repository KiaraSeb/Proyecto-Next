/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SearchBar from "@/components/SearchBar";
import { vi } from "vitest";
import * as NextNavigation from "next/navigation";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

global.fetch = vi.fn(() =>
  Promise.resolve({ ok: true, json: async () => ({ items: [{ id: "b1" }] }) })
) as any;

describe("SearchBar component", () => {
  it("renderiza el input y el botón", () => {
    render(<SearchBar />);
    expect(screen.getByPlaceholderText("Buscar libro ...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /buscar/i })).toBeInTheDocument();
  });

  it("permite escribir en el input", () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText("Buscar libro ...") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "harry potter" } });
    expect(input.value).toBe("harry potter");
  });

  it("envía una consulta válida a la API al hacer submit", async () => {
    const push = vi.fn();
    vi.spyOn(NextNavigation, "useRouter").mockReturnValue({ push } as any);

    render(<SearchBar />);
    const input = screen.getByPlaceholderText("Buscar libro ...");
    fireEvent.change(input, { target: { value: "harry potter" } });
    fireEvent.click(screen.getByRole("button", { name: /buscar/i }));

    await waitFor(() =>
      expect(push).toHaveBeenCalledWith("/?q=harry potter")
    );
  });

  it("no hace push si el input está vacío", () => {
    const push = vi.fn();
    vi.spyOn(NextNavigation, "useRouter").mockReturnValue({ push } as any);

    render(<SearchBar />);
    fireEvent.click(screen.getByRole("button", { name: /buscar/i }));
    expect(push).not.toHaveBeenCalled();
  });

  it("maneja entrada vacía como edge case", () => {
    const push = vi.fn();
    vi.spyOn(NextNavigation, "useRouter").mockReturnValue({ push } as any);

    render(<SearchBar />);
    const input = screen.getByPlaceholderText("Buscar libro ...");
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: /buscar/i }));
    expect(push).not.toHaveBeenCalled();
  });
});