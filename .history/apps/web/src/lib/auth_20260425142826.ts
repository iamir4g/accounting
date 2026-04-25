export const ACCESS_TOKEN_KEY = "accessToken";
export const ACCESS_TOKEN_COOKIE = "accessToken";

const ONE_WEEK_IN_SECONDS = 60 * 60 * 24 * 7;

export function persistAccessToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${ACCESS_TOKEN_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${ONE_WEEK_IN_SECONDS}; SameSite=Lax${secure}`;
}

export function clearAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  document.cookie = `${ACCESS_TOKEN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}
