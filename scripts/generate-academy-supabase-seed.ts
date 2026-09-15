import fs from 'node:fs';
import path from 'node:path';
import { INITIAL_COURSES } from '../lib/academy/db';

const sqlText = (value: unknown) => {
  if (value === null || value === undefined || value === '') return 'NULL';
  return `'${String(value).replaceAll("'", "''")}'`;
};

const sqlNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? String(parsed) : String(fallback);
};

const statements: string[] = [
  '-- Generated from lib/academy/db.ts. Do not edit course rows by hand here.',
  'BEGIN;',
  '',
  'ALTER TABLE public.masterclasses',
  '  DROP CONSTRAINT IF EXISTS masterclasses_access_type_check;',
  'ALTER TABLE public.masterclasses',
  "  ADD CONSTRAINT masterclasses_access_type_check CHECK (access_type IN ('free', 'paid', 'lifetime', 'limited_days'));",
  '',
  'CREATE UNIQUE INDEX IF NOT EXISTS idx_modules_masterclass_position_unique',
  '  ON public.modules(masterclass_id, position);',
  'CREATE UNIQUE INDEX IF NOT EXISTS idx_lessons_masterclass_slug_unique',
  '  ON public.lessons(masterclass_id, slug);',
  '',
];

for (const course of INITIAL_COURSES) {
  statements.push(
    `-- ${course.title}`,
    `INSERT INTO public.masterclasses (`,
    `  slug, title, subtitle, short_description, full_description, category,`,
    `  access_type, price, compare_at_price, currency, cover_image,`,
    `  duration_minutes, lesson_count, status, published_at, updated_at`,
    `) VALUES (`,
    `  ${sqlText(course.slug)}, ${sqlText(course.title)}, ${sqlText(course.subtitle)},`,
    `  ${sqlText(course.shortDescription)}, ${sqlText(course.description)}, ${sqlText(course.category)},`,
    `  ${sqlText(course.accessType || 'paid')}, ${sqlNumber(course.price)},`,
    `  ${course.compareAtPrice == null ? 'NULL' : sqlNumber(course.compareAtPrice)}, ${sqlText(course.currency || 'MXN')},`,
    `  ${sqlText(course.coverImage || course.image)}, ${sqlNumber(course.durationMinutes)},`,
    `  ${sqlNumber(course.lessonCount)}, ${sqlText(course.status)}, ${course.status === 'published' ? 'NOW()' : 'NULL'}, NOW()`,
    `) ON CONFLICT (slug) DO UPDATE SET`,
    `  title = EXCLUDED.title, subtitle = EXCLUDED.subtitle,`,
    `  short_description = EXCLUDED.short_description, full_description = EXCLUDED.full_description,`,
    `  category = EXCLUDED.category, access_type = EXCLUDED.access_type,`,
    `  price = EXCLUDED.price, compare_at_price = EXCLUDED.compare_at_price,`,
    `  currency = EXCLUDED.currency, cover_image = EXCLUDED.cover_image,`,
    `  duration_minutes = EXCLUDED.duration_minutes, lesson_count = EXCLUDED.lesson_count,`,
    `  status = EXCLUDED.status, updated_at = NOW();`,
    '',
  );

  for (const module of course.modules || []) {
    statements.push(
      `INSERT INTO public.modules (masterclass_id, title, description, position, status, updated_at)`,
      `SELECT id, ${sqlText(module.title)}, ${sqlText(module.description)}, ${sqlNumber(module.position, 1)}, ${sqlText(module.status)}, NOW()`,
      `FROM public.masterclasses WHERE slug = ${sqlText(course.slug)}`,
      `ON CONFLICT (masterclass_id, position) DO UPDATE SET`,
      `  title = EXCLUDED.title, description = EXCLUDED.description, status = EXCLUDED.status, updated_at = NOW();`,
      '',
    );

    for (const lesson of module.lessons || []) {
      statements.push(
        `INSERT INTO public.lessons (`,
        `  masterclass_id, module_id, slug, title, summary, description, position,`,
        `  duration_seconds, video_provider, video_asset_id, video_external_id,`,
        `  is_preview, transcript, status, updated_at`,
        `) SELECT`,
        `  mc.id, mo.id, ${sqlText(lesson.slug)}, ${sqlText(lesson.title)},`,
        `  ${sqlText(lesson.summary)}, ${sqlText((lesson as any).description || lesson.summary)},`,
        `  ${sqlNumber(lesson.position, 1)}, ${sqlNumber(lesson.durationSeconds)},`,
        `  'none', NULL, NULL, ${lesson.isPreview ? 'TRUE' : 'FALSE'},`,
        `  ${sqlText(lesson.transcript)}, ${sqlText(lesson.status)}, NOW()`,
        `FROM public.masterclasses mc`,
        `JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = ${sqlNumber(module.position, 1)}`,
        `WHERE mc.slug = ${sqlText(course.slug)}`,
        `ON CONFLICT (masterclass_id, slug) DO UPDATE SET`,
        `  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,`,
        `  description = EXCLUDED.description, position = EXCLUDED.position,`,
        `  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,`,
        `  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();`,
        '',
      );
    }
  }
}

statements.push('COMMIT;', '');

const outputPath = path.resolve('supabase/migrations/20260915_seed_real_academy_catalog.sql');
fs.writeFileSync(outputPath, statements.join('\n'), 'utf8');
console.log(`Generated ${outputPath}`);
console.log(`${INITIAL_COURSES.length} courses`);
console.log(`${INITIAL_COURSES.reduce((sum, course) => sum + (course.modules?.length || 0), 0)} modules`);
console.log(`${INITIAL_COURSES.reduce((sum, course) => sum + (course.modules || []).reduce((moduleSum, module) => moduleSum + module.lessons.length, 0), 0)} lessons`);
