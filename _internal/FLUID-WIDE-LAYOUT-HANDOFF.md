# Fluid wide-layout handoff

Use this brief in the `sociable.systems` and `saraloosa.org` repositories.

## Objective

Remove the fixed desktop-width ceiling that makes the site shrink into a narrow island when the browser is zoomed out or viewed on a wide/ultrawide display. Let the **page canvas** expand with the viewport while preserving deliberately narrow **reading measures** for prose.

This is not a request to enlarge everything, remove mobile breakpoints, or stretch paragraphs across the screen.

## Behaviour to reproduce

- Structural page wrappers, navigation, footer, heroes, galleries, card grids, maps and dashboards should use the full viewport with proportional desktop gutters.
- At desktop widths, use approximately `3vw` horizontal gutters (with a sensible `1rem` mobile fallback).
- Do not impose a universal `1280px`, `1400px`, `1500px`, `max-w-6xl` or `max-w-7xl` ceiling on the outer page canvas.
- At browser zoom below 100%, the available CSS viewport becomes wider; layouts must continue expanding instead of remaining capped in the centre.
- Preserve `max-width` on article bodies, form fields, explanatory paragraphs and other reading-focused content. A prose measure around `65–80ch` remains desirable.
- Preserve the existing mobile stack, navigation drawer and breakpoints.
- Prefer fluid grid tracks such as `clamp(220px, 17vw, 340px)` for side rails and `1fr` for the principal region.
- For visual tiles, use fluid heights such as `clamp(9rem, 11vw, 12rem)` where appropriate instead of allowing extreme ultrawide stretching.
- For card grids, galleries and tiled modules, increase the number of columns on wider breakpoints (e.g. `xl:grid-cols-4 2xl:grid-cols-5`) or use robust fluid tracks (`grid-cols-[repeat(auto-fit,minmax(280px,1fr))]`) to prevent tiles from stretching excessively on ultrawide monitors.

## Tailwind implementation pattern

If the repository uses Tailwind's `container` utility, configure it as a fluid canvas:

```js
theme: {
  container: {
    center: true,
    padding: {
      DEFAULT: '1rem',
      lg: '3vw',
    },
    screens: {
      sm: '100%',
      md: '100%',
      lg: '100%',
      xl: '100%',
      '2xl': '100%',
    },
  },
}
```

Then remove redundant structural caps from outer wrappers:

```diff
- <section className="container mx-auto px-4 max-w-7xl">
+ <section className="container">
```

Keep inner reading constraints:

```tsx
<section className="container">
  <div className="grid lg:grid-cols-[clamp(260px,20vw,400px)_1fr]">
    <aside>...</aside>
    <article className="max-w-4xl">...</article>
  </div>
</section>
```

Do not add `max-width: none !important` globally. That would also destroy intentional prose and form widths.

## Audit procedure

1. Search page and shared-layout files for `container`, `max-w-*`, fixed pixel widths and centered wrappers.
2. Classify every maximum width as either:
   - **structural canvas** — remove or make fluid;
   - **reading measure/control** — preserve.
3. Fix shared navigation and footer wrappers first.
4. Fix outer wrappers on every landing, listing, gallery, map, dashboard and research-index page.
   - **Crucial**: After fixing the wrapper, check grids inside these sections. A 3-column grid (`md:grid-cols-3`) will stretch badly on ultrawide monitors. Extend them up to 4, 5, or 6 columns for `xl` and `2xl`, or switch to `auto-fit` grid templates.
5. Keep individual article bodies and long text columns narrow.
6. Check for fixed-height heroes that make only a tiny portion of the page visible at normal zoom; reduce excessive vertical padding where it does not carry design meaning. Ensure hero text has a `max-w-*` constraint so it doesn't span the entire screen width.

## Required QA

Verify representative pages at:

- 390–430px mobile;
- 1440–1536px desktop at 100% zoom;
- 2560px or wider viewport;
- the user's ordinary wide display at 50–67% browser zoom.

For each site, inspect at least:

- home page;
- a content/index page;
- a card/grid-heavy page;
- a long-form article;
- navigation and footer.

Pass conditions:

- Wide views no longer show a small central island surrounded by excessive empty space.
- Major visual regions visibly gain width.
- Text articles remain comfortable to read.
- No horizontal overflow appears on mobile.
- Navigation does not become over-spaced or wrap unexpectedly.
- Existing content, hierarchy and visual identity remain unchanged.

Run the production build, compare screenshots before/after, ship to `main`, and verify the live domain rather than relying only on the deployment dashboard.
