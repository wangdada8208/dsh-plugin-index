# DSH plugin market index — Memoh desktop

A [DSH plugin market index (format 1)](https://github.com/deepseek-ai/deepseek-harness) hosting one plugin. Add the URL below in **DeepSeek Harness → Plugins → Discover → 添加索引源** to browse and install it with one click.

## Index URL

```
https://wangdada8208.github.io/dsh-plugin-index/index.json
```

Alternative CDN (usually live immediately after a push, no Pages deployment wait):

```
https://cdn.jsdelivr.net/gh/wangdada8208/dsh-plugin-index@main/index.json
```

## What is listed

| Plugin | Version | Source |
| --- | --- | --- |
| `dsh-plugin-memoh-desktop` | 1.0.0 | Git commit pinned to [`wangdada8208/dsh-plugin-memoh-desktop`](https://github.com/wangdada8208/dsh-plugin-memoh-desktop) |

The Git source is pinned to a full 40-character commit SHA, so installs are reproducible and do **not** require an npm publish. Equivalent command:

```sh
dsh plugin --profile web add git+https://github.com/wangdada8208/dsh-plugin-memoh-desktop.git#<sha>
```

## Platform requirement

This plugin reads a local X11 display. It requires `import` (ImageMagick) and `xdotool`, and honors `MEMOH_DESKTOP_DISPLAY` / `MEMOH_DESKTOP_XAUTHORITY`. It does not work on Windows/macOS or a headless host. See the [plugin README](https://github.com/wangdada8208/dsh-plugin-memoh-desktop#readme).

## Regenerate after a release

```sh
MHD_COMMIT=<new-40-char-sha> node build.mjs
git add index.json && git commit -m "Release <version>" && git push
```

`build.mjs` reads `../memoh-desktop/package.json` and `icon.svg`, pins the supplied commit, refreshes `publishTimestamp`, and validates the result with DSH's own `@deepseek-ai/dsh-plugin-market-index` when available. DSH caches a successfully read index for 10 minutes, so a new release appears after the cache expires or the index is re-read.
