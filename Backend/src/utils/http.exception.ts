export class HttpException extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message);
    this.name = 'HttpException';
  }
};



export class ValidationException extends HttpException {
  constructor(public errors: Record<string, string>) {
    super(400, "Validation failed");
    this.name = "ValidationException";
  }
}