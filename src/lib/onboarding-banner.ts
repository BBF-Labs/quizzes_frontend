export const ONBOARDING_BANNER_HIDE_UNTIL_KEY =
  "qz_onboarding_banner_hide_until";

export const ONBOARDING_BANNER_VISIBILITY_EVENT =
  "qz:onboarding-banner-visibility-changed";

export function getOnboardingBannerHideUntil(): number {
  if (typeof window === "undefined") return 0;

  const raw = localStorage.getItem(ONBOARDING_BANNER_HIDE_UNTIL_KEY);
  const parsed = raw ? Number(raw) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}

export function isOnboardingBannerTemporarilyHidden(nowMs: number = Date.now()): boolean {
  return getOnboardingBannerHideUntil() > nowMs;
}

export function setOnboardingBannerHideUntil(timestamp: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ONBOARDING_BANNER_HIDE_UNTIL_KEY, String(timestamp));
  window.dispatchEvent(new Event(ONBOARDING_BANNER_VISIBILITY_EVENT));
}

export function getEndOfTodayTimestamp(): number {
  const now = new Date();
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999,
  ).getTime();
}
