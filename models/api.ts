// API-layer generic wrappers and error types
export interface ApiResponse<T> {
  status: number;
  ok: boolean;
  data: T | null;
  error?: ValidationError | ErrorMessage | null;
}

export interface ErrorMessage {
  message?: string;
}

export interface ValidationError extends ErrorMessage {
  fields?: Record<string, string>;
}
