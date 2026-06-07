# Deployment Notes

This project is an Astro static site. The website app lives in this folder:

```text
saraloosa-os
```

The larger repository also contains source material in `wildroots`, but that content is not automatically published until pages or downloads are wired into the Astro app.

## What Gets Deployed

Running the production build creates a static website in:

```text
saraloosa-os/dist
```

That `dist` folder is what a hosting provider serves to visitors.

## Recommended Hosts

Netlify, Cloudflare Pages, and Vercel are all practical options for this site.

### Netlify

There is a `netlify.toml` file at the repository root, so Netlify can use these settings automatically:

```text
Base directory: saraloosa-os
Build command: npm run build
Publish directory: dist
Node version: 22.12.0
```

Practical steps:

1. Push this repository to GitHub.
2. In Netlify, choose "Add new site" and import the GitHub repository.
3. Let Netlify read the included config.
4. Deploy.
5. Add a custom domain later if desired.

### Cloudflare Pages

Cloudflare Pages works well too, but the settings usually go into the dashboard:

```text
Root directory: saraloosa-os
Build command: npm run build
Build output directory: dist
Node version: 22.12.0 or newer
```

Practical steps:

1. Push this repository to GitHub.
2. In Cloudflare, go to Workers & Pages.
3. Create a Pages project from the GitHub repository.
4. Use the settings above.
5. Deploy.

### Vercel

Vercel should detect Astro automatically.

```text
Root directory: saraloosa-os
Build command: npm run build
Output directory: dist
Node version: 22.12.0 or newer
```

Practical steps:

1. Push this repository to GitHub.
2. In Vercel, import the GitHub repository.
3. Set the project root to `saraloosa-os`.
4. Deploy.

## Before Sharing Publicly

The homepage currently builds, but some links point to pages that do not exist yet:

```text
/the_syllabus
/the_compost
```

Before sending the site to an audience, add those pages or temporarily remove those links.

## Local Check

From inside `saraloosa-os`, run:

```sh
npm run build
```

If that succeeds, the static site is ready for a host to deploy.
