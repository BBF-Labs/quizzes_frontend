type AdminSession = {
  accessToken: string | null;
  refreshToken: string | null;
};

type PersistMode = "memory" | "session" | "local";

const ACCESS_TOKEN_KEY = "admin_token";
const REFRESH_TOKEN_KEY = "admin_refresh_token";
const REMEMBER_ME_KEY = "admin_remember_me";

let adminSession: AdminSession = {
  accessToken: null,
  refreshToken: null,
};

let persistMode: PersistMode = "memory";
let hydrated = false;

function canUseStorage() {
  return typeof window !== "undefined";
}

function hydrateSessionFromStorage() {
  if (hydrated || !canUseStorage()) return;
  hydrated = true;

  const remembered = localStorage.getItem(REMEMBER_ME_KEY) === "true";
  const accessToken = remembered
    ? localStorage.getItem(ACCESS_TOKEN_KEY)
    : sessionStorage.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = remembered
    ? localStorage.getItem(REFRESH_TOKEN_KEY)
    : sessionStorage.getItem(REFRESH_TOKEN_KEY);

  if (accessToken || refreshToken) {
    persistMode = remembered ? "local" : "session";
    adminSession = {
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

  if (!adminSession.accessToken && !adminSession.refreshToken) {
    localStorage.removeItem(REMEMBER_ME_KEY);
    return;
  }

  if (persistMode === "local") {
    localStorage.setItem(REMEMBER_ME_KEY, "true");
    if (adminSession.accessToken) {
      localStorage.setItem(ACCESS_TOKEN_KEY, adminSession.accessToken);
    }
    if (adminSession.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, adminSession.refreshToken);
    }
    return;
  }

  if (persistMode === "session") {
    localStorage.setItem(REMEMBER_ME_KEY, "false");
    if (adminSession.accessToken) {
      sessionStorage.setItem(ACCESS_TOKEN_KEY, adminSession.accessToken);
    }
    if (adminSession.refreshToken) {
      sessionStorage.setItem(REFRESH_TOKEN_KEY, adminSession.refreshToken);
    }
    return;
  }

  localStorage.removeItem(REMEMBER_ME_KEY);
}

export function setAdminSession(
  session: Partial<AdminSession>,
  options?: { persist?: PersistMode | boolean },
) {
  hydrateSessionFromStorage();

  if (typeof options?.persist === "boolean") {
    persistMode = options.persist ? "local" : "session";
  } else if (options?.persist) {
    persistMode = options.persist;
  }

  adminSession = {
    accessToken: session.accessToken ?? adminSession.accessToken,
    refreshToken: session.refreshToken ?? adminSession.refreshToken,
  };

  persistToStorage();
}

export function clearAdminSession() {
  hydrateSessionFromStorage();

  adminSession = {
    accessToken: null,
    refreshToken: null,
  };

  persistMode = "memory";
  persistToStorage();
}

export function getAdminAccessToken() {
  hydrateSessionFromStorage();
  return adminSession.accessToken;
}

export function getAdminRefreshToken() {
  hydrateSessionFromStorage();
  return adminSession.refreshToken;
}
