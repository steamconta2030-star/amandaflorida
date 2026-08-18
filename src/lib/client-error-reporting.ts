type ClientErrorReporter = {
  captureException?: (error: unknown, context?: Record<string, unknown>) => void;
};

declare global {
  interface Window {
    __amandaFloridaErrors?: ClientErrorReporter;
  }
}

export function reportClientError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;

  window.__amandaFloridaErrors?.captureException?.(error, {
    source: "react_error_boundary",
    route: window.location.pathname,
    ...context,
  });
}
