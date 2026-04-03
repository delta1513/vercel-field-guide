# Vercel Field Guide

**[Take a look 👀](https://delta1513.github.io/vercel-field-guide/)**

A plain-language guide to Vercel's platform. Not how to configure anything,
but what each product actually is, how it works, and what people build with it.

## How it works

Static SPA. No build tools, no npm, no framework. Markdown articles rendered
client-side with marked.js, hash-based routing, hosted on GitHub Pages.

## How to add articles

There is a Claude command in `.claude/commands/vercel-add-page.md` that
automates writing new articles. Point a Claude Code agent at it and it will
fetch Vercel docs, write a magazine-style article, and save it to `content/`.

## Structure

- `index.html` — shell with sidebar navigation
- `style.css` — Vercel-branded styling
- `app.js` — hash-based router, 28 content routes
- `content/*.md` — one markdown article per product
- `.claude/commands/vercel-add-page.md` — AI automation for adding pages

---


![](https://html-to-image-eta.vercel.app/template?template=https://gitlab.com/delta1512/deltadelta.dev/-/raw/main/badges/ai-transparency.njk&width=400&height=300&scale=4&c1=Website+Code&l1=ai&c2=Page+Content&l2=ai&c3=This+README&l3=assist&c4=This+Badge&l4=ai)
