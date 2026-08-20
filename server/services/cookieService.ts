// Parse a Netscape-format cookies.txt (e.g. exported by the
// "Get cookies.txt LOCALLY" Chrome extension) into a Playwright storageState.

const YT_DOMAINS = /(^|\.)(youtube\.com|youtube\.google\.com|google\.com|ytimg\.com|googlevideo\.com|googleusercontent\.com)$/i;

interface StorageCookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires: number;
  httpOnly: boolean;
  secure: boolean;
  sameSite: "Lax";
}

export const cookieService = {
  parseCookiesTxt(text: string): { cookies: StorageCookie[]; origins: never[] } {
    const cookies: StorageCookie[] = [];

    for (const rawLine of text.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line) continue;

      let httpOnly = false;
      let domain = "";
      if (line.startsWith("#HttpOnly_")) {
        httpOnly = true;
        domain = line.slice("#HttpOnly_".length);
      } else if (line.startsWith("#")) {
        continue;
      } else {
        domain = line;
      }

      const parts = domain.split("\t");
      if (parts.length < 7) continue;
      domain = parts[0];
      if (!domain) continue;

      // Only keep cookies relevant to YouTube / Google auth
      if (!YT_DOMAINS.test(domain.replace(/^\./, ""))) continue;

      const [, , path, secure, expiresStr, name, value] = parts;
      const expires = Number(expiresStr);
      cookies.push({
        name,
        value,
        domain,
        path: path || "/",
        expires: expires > 0 ? expires : -1,
        httpOnly,
        secure: secure === "TRUE",
        sameSite: "Lax",
      });
    }

    return { cookies, origins: [] };
  },
};
