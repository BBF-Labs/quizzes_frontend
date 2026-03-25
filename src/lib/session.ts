type SessionState = {
  accessToken: string | null;
  refreshToken: string | null;
};

type PersistMode = "memory" | "session" | "local";

const ACCESS_TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "auth_refresh_token";
const REMEMBER_ME_KEY = "auth_remember_me";

const LEGACY_ACCESS_TOKEN_KEY = "admin_token";
const LEGACY_REFRESH_TOKEN_KEY = "admin_refresh_token";
const LEGACY_REMEMBER_ME_KEY = "admin_remember_me";

let sessionState: SessionState = {
  accessToken: null,
  refreshToken: null,
};

let persistMode: PersistMode = "memory";
let hydrated = false;

function canUseStorage() {
  return typeof window !== "undefined";
}

function clearLegacyStorage() {
  localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY);
  localStorage.removeItem(LEGACY_REFRESH_TOKEN_KEY);
  localStorage.removeItem(LEGACY_REMEMBER_ME_KEY);
  sessionStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(LEGACY_REFRESH_TOKEN_KEY);
}

function hydrateSessionFromStorage() {
  if (hydrated || !canUseStorage()) return;
  hydrated = true;

  const remembered = localStorage.getItem(REMEMBER_ME_KEY) === "true";
  const legacyRemembered = localStorage.getItem(LEGACY_REMEMBER_ME_KEY) === "true";

  let accessToken = remembered
    ? localStorage.getItem(ACCESS_TOKEN_KEY)
    : sessionStorage.getItem(ACCESS_TOKEN_KEY);
  let refreshToken = remembered
    ? localStorage.getItem(REFRESH_TOKEN_KEY)
    : sessionStorage.getItem(REFRESH_TOKEN_KEY);

  if (!accessToken && !refreshToken) {
    accessToken = legacyRemembered
      ? localStorage.getItem(LEGACY_ACCESS_TOKEN_KEY)
      : sessionStorage.getItem(LEGACY_ACCESS_TOKEN_KEY);
    refreshToken = legacyRemembered
      ? localStorage.getItem(LEGACY_REFRESH_TOKEN_KEY)
      : sessionStorage.getItem(LEGACY_REFRESH_TOKEN_KEY);

    if (accessToken || refreshToken) {
      persistMode = legacyRemembered ? "local" : "session";
      sessionState = { accessToken, refreshToken };
      persistToStorage();
      clearLegacyStorage();
      return;
    }
  }

  if (accessToken || refreshToken) {
    persistMode = remembered ? "local" : "session";
    sessionState = {
      accessToken,
      refreshToken,
    };
  }
}

function persistToStorage() {
  if (!canUseStorage()) return;

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);

  if (!sessionState.accessToken && !sessionState.refreshToken) {
    localStorage.removeItem(REMEMBER_ME_KEY);
    clearLegacyStorage();
    return;
  }

  if (persistMode === "local") {
    localStorage.setItem(REMEMBER_ME_KEY, "true");
    if (sessionState.accessToken) {
      localStorage.setItem(ACCESS_TOKEN_KEY, sessionState.accessToken);
    }
    if (sessionState.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, sessionState.refreshToken);
    }
    clearLegacyStorage();
    return;
  }

  if (persistMode === "session") {
    localStorage.setItem(REMEMBER_ME_KEY, "false");
    if (sessionState.accessToken) {
      sessionStorage.setItem(ACCESS_TOKEN_KEY, sessionState.accessToken);
    }
    if (sessionState.refreshToken) {
      sessionStorage.setItem(REFRESH_TOKEN_KEY, sessionState.refreshToken);
    }
    clearLegacyStorage();
    return;
  }

  localStorage.removeItem(REMEMBER_ME_KEY);
}

export function setSession(
  session: Partial<SessionState>,
  options?: { persist?: PersistMode | boolean },
) {
  hydrateSessionFromStorage();

  if (typeof options?.persist === "boolean") {
    persistMode = options.persist ? "local" : "session";
  } else if (options?.persist) {
    persistMode = options.persist;
  }

  sessionState = {
    accessToken: session.accessToken ?? sessionState.accessToken,
    refreshToken: session.refreshToken ?? sessionState.refreshToken,
  };

  persistToStorage();
}

export function clearSession() {
  hydrateSessionFromStorage();

  sessionState = {
    accessToken: null,
    refreshToken: null,
  };

  persistMode = "memory";
  persistToStorage();
}

export function getAccessToken() {
  hydrateSessionFromStorage();
  return sessionState.accessToken;
}

export function getRefreshToken() {
  hydrateSessionFromStorage();
  return sessionState.refreshToken;
}
