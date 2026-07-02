# Homepage image masters

High-resolution PNG sources for the homepage hero and study cards. These files are **not deployed** — only the optimised WebP/AVIF variants in `public/` are served.

## Regenerate after editing a master

1. Replace the PNG here (same basename: `bus`, `video`, `podcast`, `infographic`, `questions`).
2. Run:

```bash
npm run optimize:images
```

This writes `public/{name}-{640|960|1280}.{webp|avif}` used by `index.html`.
