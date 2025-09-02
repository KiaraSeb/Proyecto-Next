import { describe, it, expect, beforeEach, vi } from "vitest";
import { saveItem, getItem, removeItem, clearStorage } from "@/utils/storage";

beforeEach(() => {
  vi.spyOn(Storage.prototype, "setItem");
  vi.spyOn(Storage.prototype, "getItem");
  vi.spyOn(Storage.prototype, "removeItem");
  vi.spyOn(Storage.prototype, "clear");

  localStorage.clear();
  vi.clearAllMocks();
});

describe("utils/storage", () => {
  it("guarda un valor en localStorage", () => {
    saveItem("user", { id: 1, name: "Kiki" });
    expect(localStorage.setItem).toHaveBeenCalledWith("user", JSON.stringify({ id: 1, name: "Kiki" }));
  });

  it("obtiene un valor existente desde localStorage", () => {
    localStorage.setItem("theme", JSON.stringify("dark"));
    const value = getItem<string>("theme");
    expect(value).toBe("dark");
    expect(localStorage.getItem).toHaveBeenCalledWith("theme");
  });

  it("devuelve null si la key no existe", () => {
    const value = getItem<string>("missing");
    expect(value).toBeNull();
  });

  it("elimina un item de localStorage", () => {
    localStorage.setItem("session", JSON.stringify("token123"));
    removeItem("session");
    expect(localStorage.removeItem).toHaveBeenCalledWith("session");
  });

  it("limpia todo el localStorage", () => {
    localStorage.setItem("a", "1");
    localStorage.setItem("b", "2");
    clearStorage();
    expect(localStorage.clear).toHaveBeenCalled();
  });
});
