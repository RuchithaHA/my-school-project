import axios from "axios";

export function messageFromAxiosError(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return "Something went wrong. Please try again.";
  }
  const data = error.response?.data as { detail?: unknown } | undefined;
  const detail = data?.detail;
  if (typeof detail === "string") {
    return detail;
  }
  if (Array.isArray(detail)) {
    const parts = detail
      .map((item) => (typeof item === "object" && item && "msg" in item ? String((item as { msg: string }).msg) : ""))
      .filter(Boolean);
    if (parts.length) {
      return parts.join(" ");
    }
  }
  if (error.message) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
}
