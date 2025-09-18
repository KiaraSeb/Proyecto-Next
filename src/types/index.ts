export interface Vote {
  userId: string;   
  value: number;    
}

export interface Review {
  id: string;
  _id: string;      
  bookId: string;
  user: {
    name: string;          
    _id: string;
    email: string;
  };
  rating: number;
  text: string;    
  createdAt: string; 
  votes: Vote[];   
}
