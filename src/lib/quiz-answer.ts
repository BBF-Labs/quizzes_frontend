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
  options?: string[],
): boolean => {
  if (!correct) return false;

  if (type === "true_false") {
    return normalizeBooleanLike(given) === normalizeBooleanLike(correct);
  }

  const normGiven = normalizeText(given).toLowerCase();
  const normCorrect = normalizeText(correct).toLowerCase();

  if (normGiven === normCorrect) {
    return true;
  }

  const cleanGiven = normGiven.replace(/[^a-z0-9]/g, "");
  const cleanCorrect = normCorrect.replace(/[^a-z0-9]/g, "");

  if (cleanGiven && cleanGiven === cleanCorrect) {
    return true;
  }

  // Single letter vs option matching (e.g. given is option text and correct is "B")
  if (cleanCorrect.length === 1 && cleanCorrect >= "a" && cleanCorrect <= "z") {
    if (cleanGiven.startsWith(cleanCorrect)) {
      return true;
    }
    if (options && options.length > 0) {
      const idx = cleanCorrect.charCodeAt(0) - 97;
      if (idx >= 0 && idx < options.length) {
        const optText = normalizeText(options[idx]).toLowerCase();
        if (normGiven === optText || cleanGiven === optText.replace(/[^a-z0-9]/g, "")) {
          return true;
        }
      }
    }
  }

  // Vice versa: given is "b" and correct is option text
  if (cleanGiven.length === 1 && cleanGiven >= "a" && cleanGiven <= "z") {
    if (cleanCorrect.startsWith(cleanGiven)) {
      return true;
    }
    if (options && options.length > 0) {
      const idx = cleanGiven.charCodeAt(0) - 97;
      if (idx >= 0 && idx < options.length) {
        const optText = normalizeText(options[idx]).toLowerCase();
        if (normCorrect === optText || cleanCorrect === optText.replace(/[^a-z0-9]/g, "")) {
          return true;
        }
      }
    }
  }

  // Strip prefix like "A. ", "B) "
  const strippedGiven = normGiven.replace(/^[a-z][\s\).:-]+/i, "").trim();
  const strippedCorrect = normCorrect.replace(/^[a-z][\s\).:-]+/i, "").trim();
  if (strippedGiven && strippedCorrect && strippedGiven === strippedCorrect) {
    return true;
  }

  // Meaningful full text match (only for strings >= 10 chars)
  if (normGiven.length >= 10 && normCorrect.length >= 10) {
    if (normGiven.includes(normCorrect) || normCorrect.includes(normGiven)) {
      return true;
    }
  }

  return false;
};
