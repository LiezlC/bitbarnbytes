import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const loreCollection = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: "./src/content/lore" }),
  schema: z.object({
    title: z.string(),
    exile: z.string(),
    pope: z.string().optional(),
    date: z.string(),
    draft: z.boolean().default(false),
  }),
});

const curriculumCollection = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: "./src/content/curriculum" }),
  schema: z.object({
    title: z.string(),
    track: z.enum(['vital-earth', 'dirt-alchemist', 'wild-roots']),
    module: z.number(),
    lesson: z.number(),
    tags: z.array(z.string()),
    copyright: z.string().default('© 2026 Liezl Coetzee. All Rights Reserved.'),
  }),
});

const fieldNotesCollection = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: "./src/content/field-notes" }),
  schema: z.object({
    date: z.string(),
    log: z.number(),
  }),
});

export const collections = {
  'lore': loreCollection,
  'curriculum': curriculumCollection,
  'field-notes': fieldNotesCollection,
};
