export interface blogCreate {
  _id?: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  thumbnail?: string;
  img1?: string;
  img2?: string;
  img3?: string;
  tags: [];
  createdAt?: Date;
  updatedAt?: Date;
}




export interface blogResponse {

  _id: string;
  title: string;
  thumbnail: string;
  content: string;
  author: string;
  authorId: string;
  img1: string;
  img2: string;
  img3: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  
};