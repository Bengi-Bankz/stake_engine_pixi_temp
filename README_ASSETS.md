
# Pixi.js Asset Loading with Strict CDN Requirements

## Overview

This project is **not a React app**—it's a Pixi.js project built with Vite and TypeScript. I want to be clear: I'm not an expert, and this is the only dependable way I've found to load assets reliably when deploying to a strict CDN or static file host. I built this by trial, error, and a lot of searching, and I'm sharing it in case it helps someone else in the community.

## Key Approach

- **All assets (images, sounds, etc.) are placed inside the `src/assets` directory.**
- **Assets are referenced using the ECMAScript module pattern:**
  ```js
  new URL("./assets/filename.png", import.meta.url).href;
  ```
- This pattern ensures that the build tool (Vite, etc.) resolves and bundles the asset, and the CDN serves it correctly.

## Example Usage in Pixi.js

```js
const imgUrl = new URL("./assets/1.png", import.meta.url).href;
const sprite = PIXI.Sprite.from(imgUrl);
```

## Why This Works

- **Direct references** (e.g., `/1.png` or `public/1.png`) may fail on strict CDNs due to path rewriting, cache busting, or security policies.
- **The `new URL(..., import.meta.url).href` pattern** guarantees the asset is included in the build output and the path is always correct, regardless of CDN or deployment structure.

## Important Notes

- Do **not** use the `public` folder for assets you want to reference in code.
- Do **not** use relative paths like `./assets/1.png` directly in Pixi.js or HTML.
- Always use the `new URL(..., import.meta.url).href` pattern for any asset in `src/assets`.


## Authentication & RGS Integration

This project also includes a simple authentication flow and RGS (Remote Game Server) integration, all handled within the Pixi.js canvas. You don't need to know Svelte, React, or any other frontend framework to get started. The authentication and game logic are managed in plain TypeScript, making it easier for beginners or anyone who wants a straightforward base for their own game or interactive project.

## My Honest Experience

I'm still learning, and this project is the result of figuring things out as I go. If you're looking for a polished, production-grade template, this probably isn't it. But if you want a working example of Pixi.js asset loading, simple authentication, and RGS integration that survives strict CDN rules, this is what worked for me.

## Summary

> **This is the only way I've found to reliably load assets in a Pixi.js project on a strict CDN.**

If you follow this pattern, your assets should load correctly in both development and production, regardless of CDN restrictions. If you know a better way, please share it with the community!

---

If you found this helpful, consider following me on [GitHub](https://github.com/Bengi-Bankz)!

Good luck building your own project!
