# React Asset Loading with Strict CDN Requirements

## Overview

This project demonstrates the **only reliable way** to load image and other static assets in a React app when deploying to a strict CDN or static file host that enforces import path resolution and does not allow direct `/public` or relative asset references.

## Key Approach

- **All assets (images, etc.) must be placed inside the `src/assets` directory.**
- **Assets are referenced using the ECMAScript module pattern:**
  ```js
  new URL("./assets/filename.png", import.meta.url).href;
  ```
- This pattern ensures that the build tool (Vite, Webpack, etc.) resolves and bundles the asset, and the CDN serves it correctly.

## Example Usage

```js
const imgUrl = new URL("./assets/1.png", import.meta.url).href;
<img src={imgUrl} alt="Asset" />;
```

## Why This Works

- **Direct references** (e.g., `/1.png` or `public/1.png`) may fail on strict CDNs due to path rewriting, cache busting, or security policies.
- **The `new URL(..., import.meta.url).href` pattern** guarantees the asset is included in the build output and the path is always correct, regardless of CDN or deployment structure.

## Important Notes

- Do **not** use the `public` folder for assets you want to reference in code.
- Do **not** use relative paths like `./assets/1.png` in JSX directly.
- Always use the `new URL(..., import.meta.url).href` pattern for any asset in `src/assets`.

## Summary

> **This is the only way to reliably load assets in a React app on a strict CDN.**

If you follow this pattern, your assets will always load correctly in both development and production, regardless of CDN restrictions.
