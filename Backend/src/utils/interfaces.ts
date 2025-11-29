export interface CustomError extends Error {
  statusCode?: number;
  code?: string;
  details?: string;
}

export interface CommonError{
  message: string;
  code?: string;
} 