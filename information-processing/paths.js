export function appBase() {
  const cfg = window.STUDIO9_CONFIG || {};
  const base = cfg.basePath || "/";
  return base.endsWith("/") ? base : `${base}/`;
}

export function publicMediaUrl(file) {
  const normalized = file.replace(/^\/?Public\//, "");
  const cfg = window.STUDIO9_CONFIG || {};
  if (cfg.mediaOrigin) {
    const origin = cfg.mediaOrigin.endsWith("/") ? cfg.mediaOrigin : `${cfg.mediaOrigin}/`;
    return `${origin}Public/${normalized}`;
  }
  return `${appBase()}Public/${normalized}`;
}
