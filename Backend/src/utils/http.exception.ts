export class HttpException extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message);
    this.name = 'HttpException';
  }
}