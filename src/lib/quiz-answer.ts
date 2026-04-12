import type { QuizQuestion } from "@/types/session";

const normalizeText = (value?: string | null): string =>
  String(value ?? "").trim();

const normalizeBooleanLike = (value?: string | null): string => {
  const normalized = normalizeText(value).toLowerCase();
  if (["true", "t", "yes", "y", "1"].includes(normalized)) {
    return "true";
  }
  if (["false", "f", "no", "n", "0"].includes(normalized)) {
    return "false";
  }
  return normalized;
};

export const answersMatch = (
  type: QuizQuestion["type"],
  given?: string | null,
  correct?: string | null,
): boolean => {
  if (!correct) return false;

  if (type === "true_false") {
    return normalizeBooleanLike(given) === normalizeBooleanLike(correct);
  }

  return normalizeText(given) === normalizeText(correct);
};
