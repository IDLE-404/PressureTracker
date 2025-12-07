import { ErrorManager, type AppError, type ErrorCode } from "@/core/utils/error/ErrorManager";
import { useCallback } from "react";

export const useErrorHandler = () => {
  const handleError = useCallback((error: unknown) => {
    if (error instanceof Error) {
      ErrorManager.log(error);
    } else if (typeof error === "object" && error !== null && "code" in error) {
      ErrorManager.log(error as AppError<ErrorCode>);
    } else {
      ErrorManager.log({
        code: "UNKNOWN_ERROR",
        message: String(error),
      } as AppError<"UNKNOWN_ERROR">);
    }
  }, []);

  return { handleError };
};
