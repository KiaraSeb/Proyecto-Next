"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getBookById, Book } from "@/lib/googleBooks";
import Image from "next/image";
import { Review } from "@/types";

interface BookPageProps {
  bookId: string;
}

export default function BookPage({ bookId }: BookPageProps) {
  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" }) 
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

  const fetchBook = useCallback(async () => {
    if (!bookId) return setError("ID de libro inválido");
    try {
      const data = await getBookById(bookId);
      if (!data) setError("No se pudo cargar el libro");
      setBook(data);
    } catch (err) {
      console.error(err);
      setError("Error al cargar el libro");
    }
  }, [bookId]);

  const fetchReviews = useCallback(async () => {
    if (!bookId) return;
    try {
      const res = await fetch(`/api/reviews?bookId=${bookId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al obtener reseñas");
      const data: Review[] = await res.json();
      setReviews(data);
    } catch (err) {
      console.error(err);
      setReviews([]);
    }
  }, [bookId]);

  const addReview = useCallback(async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (!text || !rating) {
      alert("Debes ingresar la reseña y la calificación");
      return;
    }

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // <-- necesario
        body: JSON.stringify({ bookId, rating, text }),
      });
      if (!res.ok) throw new Error("No se pudo enviar la reseña");

      setText("");
      setRating(5);
      await fetchReviews();
    } catch (err) {
      console.error(err);
      alert("No se pudo enviar la reseña");
    }
  }, [user, text, rating, bookId, fetchReviews]);

  const voteReview = useCallback(
    async (reviewId: string, value: 1 | -1) => {
      if (!user) {
        setShowAuthModal(true);
        return;
      }

      try {
        const res = await fetch(`/api/reviews/${reviewId}/vote`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ value }),
        });
        if (!res.ok) throw new Error("No se pudo votar la reseña");
        await fetchReviews();
      } catch (err) {
        console.error(err);
        alert("No se pudo votar la reseña");
      }
    },
    [user, fetchReviews]
  );

  const handleLoginSuccess = (loggedUser: any) => {
    setUser(loggedUser);
    setShowAuthModal(false);
    fetchReviews();
  };

  useEffect(() => {
    fetchBook();
    fetchReviews();
  }, [fetchBook, fetchReviews]);

  if (error) return <p className="text-red-400">{error}</p>;
  if (!book) return <p className="text-white">Cargando libro...</p>;

  return (
    <main className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-4">{book.volumeInfo.title}</h1>

      {book.volumeInfo.imageLinks?.thumbnail && (
        <Image
          src={book.volumeInfo.imageLinks.thumbnail}
          alt={book.volumeInfo.title}
          width={200}
          height={300}
          className="mb-4 rounded shadow"
        />
      )}

      <div
        className="mb-2"
        dangerouslySetInnerHTML={{
          __html:
            book.volumeInfo.description || "<p>Sin descripción disponible</p>",
        }}
      />

      <p className="mt-2 font-semibold">
        Autor: {book.volumeInfo.authors?.join(", ")}
      </p>

      {/* --- Formulario de reseña --- */}
      <div className="mt-6 border-t border-gray-700 pt-4">
        <h2 className="text-xl font-semibold mb-2">Agregar reseña</h2>
        {user ? (
          <>
            <textarea
              placeholder="Escribe tu reseña..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="bg-gray-800 border border-gray-700 p-2 mb-2 w-full rounded text-white placeholder-gray-400"
            />
            <div className="flex items-center mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`cursor-pointer text-2xl ${
                    star <= rating ? "text-yellow-400" : "text-gray-600"
                  }`}
                  onClick={() => setRating(star)}
                >
                  ★
                </span>
              ))}
              <span className="ml-2">{rating} de 5</span>
            </div>
            <button
              onClick={addReview}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Enviar
            </button>
          </>
        ) : (
          <button
            onClick={() => setShowAuthModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Iniciar sesión / Registrarse
          </button>
        )}
      </div>

      {/* --- Lista de reseñas --- */}
      <div className="mt-6 border-t border-gray-700 pt-4">
        <h2 className="text-xl font-semibold mb-2">Reseñas</h2>
        {reviews.length === 0 ? (
          <p>No hay reseñas todavía.</p>
        ) : (
          reviews.map((r) => {
            const upVotes = r.votes.filter((v) => v.value === 1).length;
            const downVotes = r.votes.filter((v) => v.value === -1).length;

            return (
              <div
                key={r._id}
                className="border border-gray-700 p-2 mb-2 rounded bg-gray-800"
              >
                <p className="font-semibold">{r.user.name || r.user.email}</p>
                <p>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={
                        star <= r.rating ? "text-yellow-400" : "text-gray-600"
                      }
                    >
                      ★
                    </span>
                  ))}
                </p>
                <p>{r.text}</p>
                <p className="text-xs text-gray-400">
                  {new Date(r.createdAt).toLocaleString()}
                </p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => voteReview(r._id, 1)}
                    className="text-sm px-2 py-1 bg-green-700 rounded hover:bg-green-600"
                  >
                    👍 {upVotes}
                  </button>
                  <button
                    onClick={() => voteReview(r._id, -1)}
                    className="text-sm px-2 py-1 bg-red-700 rounded hover:bg-red-600"
                  >
                    👎 {downVotes}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* --- Modal de autenticación --- */}
      {showAuthModal && (
        <AuthModal
          onSuccess={handleLoginSuccess}
          onClose={() => setShowAuthModal(false)}
          bookId={bookId}
        />
      )}
    </main>
  );
}

function AuthModal({
  onSuccess,
  onClose,
  bookId,
}: {
  onSuccess: (user: any) => void;
  onClose: () => void;
  bookId: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";

    try {
      const body = isRegister
        ? { name, email, password }
        : { email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", 
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok) {
        alert(
          isRegister
            ? "Cuenta creada con éxito 🎉"
            : "Inicio de sesión exitoso ✅"
        );
        onSuccess(data.user);
        router.push(`/libros/${bookId}`);
      } else {
        setError(data.message || "Error al autenticarse");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <div className="bg-gray-900 text-white p-6 rounded w-96 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">
          {isRegister ? "Registrarse" : "Iniciar sesión"}
        </h2>

        {error && <p className="text-red-400 mb-2">{error}</p>}

        {isRegister && (
          <input
            type="text"
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-2 mb-2 w-full rounded bg-gray-800 border border-gray-700 text-white placeholder-gray-400"
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 mb-2 w-full rounded bg-gray-800 border border-gray-700 text-white placeholder-gray-400"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 mb-2 w-full rounded bg-gray-800 border border-gray-700 text-white placeholder-gray-400"
        />

        <div className="flex justify-between items-center mb-2">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded disabled:opacity-50"
          >
            {loading
              ? "Procesando..."
              : isRegister
              ? "Registrarse"
              : "Iniciar sesión"}
          </button>
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="underline text-blue-400 text-sm"
          >
            {isRegister ? "Ya tengo cuenta" : "Crear cuenta"}
          </button>
        </div>

        <button onClick={onClose} className="text-red-500 underline">
          Cancelar
        </button>
      </div>
    </div>
  );
}
