export interface Vote {
  userId: string;    // id del usuario que votó
  value: number;     // 1 o -1
}

export interface Review {
  id: string;
  _id: string;       // id de la reseña en la base de datos
  bookId: string;
  user: {
    name: string;            // usuario que escribió la reseña
    _id: string;
    email: string;
  };
  rating: number;
  text: string;      // contenido de la reseña
  createdAt: string; 
  votes: Vote[];     // array de votos
}
