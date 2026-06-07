# Wildroots Deployable Material Audit

This folder is practical to turn into a website, but it should not be published as a raw file dump. It is already a coherent content system with five deployable layers:

1. Public narrative and article layer
2. Curriculum/course layer
3. Downloadable workbook and storybook layer
4. Reference library layer
5. Product funnel layer

## Inventory

Current material:

- 34 markdown documents
- 16 PDF files
- 7 WebP visual assets
- 5 XLSX reference tables
- Approximate total size: 18 MB

The folder is small enough for ordinary static hosting. The work is editorial and structural, not infrastructure-heavy.

## Strongest Public Shape

The strongest website form is a "living learning library" for BitSoil SageByte / Wildroots.

Suggested public architecture:

- Home: introduce the world, promise, tone, and routes into the material.
- Start Here: a plain guided path for first-time visitors.
- The Syllabus: the core learning map.
- Field Notes: lighter posts, stories, and reflections.
- The Compost Lore: the narrative world and BitSoil SageByte framing.
- Resource Library: PDFs, worksheets, infographics, storybooks, and tables.
- Shop or Downloads: Gumroad-led product layer for polished PDFs/workbooks.

## Monetization-First Shape

Treat the website as a public trust-and-curiosity engine from the beginning. The free material should be attractive, useful, and complete enough to earn confidence, but it should consistently point toward paid bundles.

Recommended checkout approach:

- Primary checkout: Gumroad product listings
- Secondary/later checkout: Selar only if a specific bundle belongs beside the existing Sociable Systems outlet
- Website role: discovery, education, preview, trust-building, and funneling
- Storefront role: payment, file delivery, coupons, updates, and customer records

Useful free bait:

- Polished public articles adapted from the markdown files
- A few high-value printable samples
- Infographic gallery pages
- One sample lesson per track
- A short "Start Here" quiz or guided path
- Preview cards for every workbook/storybook
- A free mini-pack in exchange for email signup, if an email tool is added later

Paid product candidates:

- Roots and Shoots family food-literacy pack
- Vital Earth Academy field guide bundle
- Dirt Alchemist's Grimoire / protocol bundle
- Soil-to-Soul reference compendium
- Storybook trilogy bundle
- Complete Wildroots starter library

Every free page should have one natural next step:

- Read the free article -> get the matching workbook
- View the infographic -> download the printable guide
- Browse a track -> buy the full bundle
- Read a story -> buy the storybook trilogy
- Use a table/reference -> get the field journal or protocol pack

Avoid making the site feel like a store first. It should feel generous and alive, but the path to purchase should be visible, repeated, and context-specific.

## Natural Content Tracks

### 1. Roots and Shoots

Audience: children, families, beginner food literacy.

Best deployable form:

- Course landing page
- Lesson pages
- Printable worksheet downloads
- Comic strip previews
- Simple activities and reflection prompts

Representative source folders/files:

- `roots-and-shoots`
- `storybooks`
- `comicstrips`
- `original_batch/field-guides`

### 2. Vital Earth Academy

Audience: students, educators, curious adults.

Best deployable form:

- Academy overview
- Study guide
- Soil and wellness lesson pages
- Infographic gallery
- Reference tables

Representative source folders/files:

- `vital-earth-academy`
- `soil-to-soul`
- `tables`
- `infogs`

### 3. Dirt Alchemists

Audience: advanced homesteading, wellness, soil-to-kitchen systems.

Best deployable form:

- A named track or mini-course
- "Five secrets" public article
- Technical protocol pages
- Downloadable grimoire/workbook
- Practical lab pages for milling, sprouting, composting, and circular resource use

Representative source folders/files:

- `dirt-alchemists`
- `general-protocols`
- `new-branding`

### 4. Wild Rooted / Soil to Soul

Audience: broader brand story and philosophy.

Best deployable form:

- Manifesto-style landing page
- Public essays
- Foundational primer
- Long-form guide or paid PDF

Representative source folders/files:

- `wild-rooted`
- `soil-to-soul`
- `strategy`

## What Should Become Website Pages

The markdown files are good candidates for Astro content pages after adding consistent frontmatter.

Suggested fields:

```yaml
title:
track:
type:
audience:
summary:
sourceFolder:
draft:
```

Suggested content types:

- `article`
- `lesson`
- `study-guide`
- `protocol`
- `briefing`
- `story`
- `reference`

## What Should Become Downloads

The PDFs should mostly be downloadable resources, at least initially.

Good download categories:

- Storybooks
- Field journals
- Workbooks
- Branded PDF guides
- Original batch resources

These can be shown with preview cards on the site, then linked as downloads.

NotebookLM watermark-covered copies have been generated in:

```text
wildroots/watermark-covered
```

Use these branded copies for public previews, Gumroad files, or website downloads. Keep the original PDFs as source/provenance copies.

## What Should Become Visual Assets

The WebP files are already useful.

Suggested use:

- Infographics: resource gallery and lesson support
- Comic strips: course preview cards and printable worksheet pages
- Wordmark: site branding if it fits the current visual direction

Some infographic text is small, so the website should not rely on the image alone. Convert the key ideas into readable HTML sections beside or below each image.

## What Should Become Reference Data

The spreadsheets are structured enough to become:

- Interactive tables
- Glossary/reference pages
- Appendix pages for lessons
- Downloadable source tables

Useful table themes:

- Ecological wellness lessons
- Soil layers and micro-organisms
- Botanical and grain profiles
- Dirt Alchemist techniques
- Homesteading wisdom and secrets

## Editorial Cleanup Before Public Launch

Recommended cleanup:

- Deduplicate the three BitSoil SageByte strategy drafts into one canonical strategy.
- Fix obvious transcript typos, such as `speckbone` where it appears to mean `Spekboom`.
- Normalize platform names like YouTube and TikTok.
- Add a safety disclaimer for foraging, food preparation, nutrition, and health claims.
- Add a clear copyright/licensing note.
- Decide what is public, private, paid, or draft.
- Convert dense markdown tables into readable web tables.
- Break very long paragraphs where some generated docs have sections run together.

## Safety and Trust Notes

Because the material touches nutrition, foraging, wellness, disease resistance, and food preservation, the public site should frame this as educational material rather than medical advice.

Recommended disclaimer themes:

- Foraging requires local identification and adult/expert supervision.
- Do not eat wild plants unless properly identified.
- Food preservation and sprouting require safe handling.
- Nutrition content is educational and not a substitute for professional medical advice.

## Practical Implementation Path

### Phase 1: Soft Launch Library

Goal: get the existing body of work visible without overbuilding.

Build:

- Home
- Start Here
- Track index pages
- Resource library
- Download cards for PDFs/images
- 8 to 12 polished public pages

### Phase 2: Curriculum Wiring

Goal: make it feel like a guided learning system.

Build:

- Lesson sequence pages
- Study guide pages
- Worksheets/downloads attached to each lesson
- Tables converted into web references

### Phase 3: Product Layer

Goal: make it sellable or shareable as finished packages.

Build:

- Product/download landing pages
- Email signup or external storefront links
- Bundled PDF packs
- Preview pages for each workbook or field guide

## Recommended First Public Set

Start with a small, coherent public launch:

1. Home: BitSoil SageByte / Wildroots
2. Start Here: What this is and who it is for
3. The Syllabus: the learning map
4. Roots and Shoots: family food literacy
5. Vital Earth Academy: soil, food, and wellness
6. Dirt Alchemists: advanced homestead systems
7. Resource Library: PDFs and infographics
8. A disclaimer/safety page

This would make the site feel intentional while leaving room to grow.
