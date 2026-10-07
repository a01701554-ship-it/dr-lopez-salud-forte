-- Migration: Add completed_at and duration_seconds to lesson_progress
-- Ensures full idempotence and exact video duration/completion tracking

ALTER TABLE public.lesson_progress 
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

ALTER TABLE public.lesson_progress 
  ADD COLUMN IF NOT EXISTS duration_seconds INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_lesson_progress_completed 
  ON public.lesson_progress(user_id, completed);
