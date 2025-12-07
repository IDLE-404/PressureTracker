export type ErrorCode = "NETWORK_ERROR" | "AUTH_ERROR" | "VALIDATION_ERROR" | "UNKNOWN_ERROR";

export interface ValidationErrorDetails {
  message: string;
  field?: string;
}

export type ErrorDetailsMap = {
  NETWORK_ERROR: undefined;
  AUTH_ERROR: undefined;
  VALIDATION_ERROR: ValidationErrorDetails;
  UNKNOWN_ERROR: undefined;
};

export interface AppError<K extends ErrorCode = ErrorCode> {
  code: K;
  message?: string;
  details?: ErrorDetailsMap[K];
}

export class ErrorManager {
  static getMessage(error: AppError | Error): string {
    if ((error as AppError).code) {
      const appError = error as AppError;
      switch (appError.code) {
        case "NETWORK_ERROR":
          return "Ошибка сети. Проверьте подключение.";
        case "AUTH_ERROR":
          return "Ошибка авторизации.";
        case "VALIDATION_ERROR":
          return appError.details?.message || "Ошибка валидации.";
        case "UNKNOWN_ERROR":
        default:
          return appError.message || "Произошла неизвестная ошибка.";
      }
    }

    return (error as Error).message || "Произошла неизвестная ошибка.";
  }

  static log(error: AppError | Error) {
    console.error(error);
  }
}