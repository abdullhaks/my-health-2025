import { CookieOptions } from "express";

/**
 * Standardized cookie options for production and cross-site/subdomain auth.
 */
export const getCookieOptions = (maxAge?: number): CookieOptions => {
  const defaultMaxAge = parseInt(process.env.MAX_AGE || "604800000", 10);
  const sameSiteEnv = process.env.COOKIE_SAME_SITE?.toLowerCase();
  const sameSite: "none" | "lax" | "strict" =
    sameSiteEnv === "lax" || sameSiteEnv === "strict" ? sameSiteEnv : "none";

  const options: CookieOptions = {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE !== "false", // secure by default for HTTPS
    sameSite: sameSite,
    maxAge: maxAge !== undefined ? maxAge : defaultMaxAge,
    path: "/",
  };

  // Optional custom cookie domain (e.g., '.myhealthcarelive.in')
  // Note: Only set when backend and frontend share a common root domain.
  if (process.env.COOKIE_DOMAIN) {
    options.domain = process.env.COOKIE_DOMAIN;
  }

  // Partitioned cookies (CHIPS) support for modern browsers
  // NOTE: According to RFC specifications, Partitioned MUST only be set with Secure
  if (options.secure && (process.env.COOKIE_PARTITIONED === "true" || (process.env.NODE_ENV === "production" && options.sameSite === "none"))) {
    (options as any).partitioned = true;
  }

  return options;
};

/**
 * Standardized clear-cookie options matching getCookieOptions attributes.
 */
export const getClearCookieOptions = (): CookieOptions => {
  const sameSiteEnv = process.env.COOKIE_SAME_SITE?.toLowerCase();
  const sameSite: "none" | "lax" | "strict" =
    sameSiteEnv === "lax" || sameSiteEnv === "strict" ? sameSiteEnv : "none";

  const options: CookieOptions = {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE !== "false",
    sameSite: sameSite,
    path: "/",
  };

  if (process.env.COOKIE_DOMAIN) {
    options.domain = process.env.COOKIE_DOMAIN;
  }

  if (options.secure && (process.env.COOKIE_PARTITIONED === "true" || (process.env.NODE_ENV === "production" && options.sameSite === "none"))) {
    (options as any).partitioned = true;
  }

  return options;
};
