#!/usr/bin/env node
/**
 * Regenerate index.json for this hosted DSH plugin-market index.
 *
 *   MHD_COMMIT=<40-char-sha> node build.mjs
 *
 * After a new plugin release: bump memoh-desktop/package.json, push the plugin
 * repo, put its new commit SHA in MHD_COMMIT, run this script, commit and push.
 * The index pins a git commit, so installs work without an npm publish.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const pluginRoot = path.resolve(here, '..', 'memoh-desktop');
const pkg = JSON.parse(fs.readFileSync(path.join(pluginRoot, 'package.json'), 'utf8'));
const iconSvg = fs.readFileSync(path.join(pluginRoot, 'icon.svg'));

const repo = process.env.MHD_REPO || 'https://github.com/wangdada8208/dsh-plugin-memoh-desktop';
const commit = process.env.MHD_COMMIT || '';
if (!/^[0-9a-f]{40}$/u.test(commit)) {
  throw new Error('MHD_COMMIT must be a 40-character lowercase commit SHA');
}
if (!repo.startsWith('https://github.com/')) {
  throw new Error('MHD_REPO must be an https GitHub repository URL without a trailing .git');
}

const index = {
  format: 1,
  title: { en: 'Memoh desktop plugin index', zh: 'Memoh 桌面插件索引' },
  description: {
    en: 'Live X11 desktop plugin for DeepSeek Harness, installed from a pinned Git commit.',
    zh: 'DeepSeek Harness 的实时 X11 桌面插件，从钉死的 Git 提交安装。',
  },
  metadata: {
    categories: { desktop: { title: { en: 'Desktop', zh: '桌面' } } },
    labels: {
      x11: { title: { en: 'X11', zh: 'X11' } },
      live: { title: { en: 'Live view', zh: '实时画面' } },
      control: { title: { en: 'Remote control', zh: '远程操控' } },
    },
  },
  plugins: [
    {
      name: pkg.name,
      title: { en: 'Memoh desktop', zh: 'Memoh 桌面' },
      description: {
        en: 'Live X11 desktop in the right sidebar of DeepSeek Harness, with optional mouse and keyboard control.',
        zh: '在 DeepSeek Harness 右侧栏实时显示 X11 桌面，可选地转发鼠标与键盘操作。',
      },
      icon: `data:image/svg+xml;base64,${iconSvg.toString('base64')}`,
      homepage: 'https://github.com/wangdada8208/dsh-plugin-memoh-desktop',
      repository: { url: repo },
      metadata: {
        category: 'desktop',
        keywords: ['dsh', 'desktop', 'x11', 'screenshot', 'remote-control', 'sidebar'],
        labels: ['x11', 'live', 'control'],
      },
      versions: [
        {
          version: pkg.version,
          publishTimestamp: Math.floor(Date.now() / 1000),
          source: { type: 'git', url: repo, commit },
          engines: { dsh: pkg.engines.dsh },
        },
      ],
    },
  ],
};

const out = path.join(here, 'index.json');
fs.writeFileSync(out, `${JSON.stringify(index, null, 2)}\n`, 'utf8');
console.log(`wrote ${out}`);

let validator;
try {
  validator = await import('@deepseek-ai/dsh-plugin-market-index');
} catch {
  const fallback = process.env.DSH_MARKET_INDEX_VALIDATOR
    || '/data/tools/dsh/node_modules/@deepseek-ai/dsh-plugin-market-index/lib/index.js';
  try {
    validator = await import(pathToFileURL(fallback).href);
  } catch {
    console.log('validator unavailable; install @deepseek-ai/dsh-plugin-market-index');
  }
}
if (validator) {
  const parsed = validator.parseMarketIndex(index, 'https://example.com/index.json');
  const plugin = parsed.plugins[0];
  for (const version of plugin.versions) {
    console.log(`  ${plugin.name}@${version.version} ->`, JSON.stringify(validator.marketInstallTarget(plugin.name, version)));
  }
  console.log('format-1 validation: OK');
}
