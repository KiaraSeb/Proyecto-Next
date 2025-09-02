export interface Vote {
  userId: string;    
  value: number;     
}

export interface Review {
  id: string;        
  bookId: string;
  userName: string;
  rating: number;
  content: string;
  createdAt: string; 
  votes: Vote[];    
}
