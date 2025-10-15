export interface CustomError extends Error {
  statusCode?: number;
  code?: string;
  details?: string;
}