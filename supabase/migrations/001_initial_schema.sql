-- ============================================================
-- WINTER ARC 90 — Complete Database Migration
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  currency TEXT NOT NULL DEFAULT 'INR',
  theme TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark', 'light', 'system')),
  monthly_income NUMERIC(10,2) DEFAULT 23600,
  score_weights JSONB DEFAULT '{"discipline":20,"health":20,"career":25,"productivity":15,"english":10,"creativity":10}'::jsonb,
  water_target_ml INTEGER DEFAULT 2500,
  wake_target_time TEXT DEFAULT '06:00',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- HABITS
-- ============================================================
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('boolean','numeric','duration','abstinence','rating')),
  category TEXT NOT NULL CHECK (category IN ('discipline','health','career','english','creative','productivity','optional')),
  target_value NUMERIC,
  unit TEXT,
  is_optional BOOLEAN DEFAULT FALSE,
  weight INTEGER DEFAULT 10,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS habits_user_id_idx ON habits(user_id);
CREATE INDEX IF NOT EXISTS habits_category_idx ON habits(category);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own habits" ON habits
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- HABIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('kept','failed','partial','skipped','recovery')),
  value NUMERIC,
  notes TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, habit_id, date)
);

CREATE INDEX IF NOT EXISTS habit_logs_user_date_idx ON habit_logs(user_id, date);
CREATE INDEX IF NOT EXISTS habit_logs_habit_id_idx ON habit_logs(habit_id);

ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own habit logs" ON habit_logs
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- DAILY METRICS
-- ============================================================
CREATE TABLE IF NOT EXISTS daily_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  day_number INTEGER,
  total_score NUMERIC(5,2) DEFAULT 0,
  discipline_score NUMERIC(5,2) DEFAULT 0,
  health_score NUMERIC(5,2) DEFAULT 0,
  career_score NUMERIC(5,2) DEFAULT 0,
  english_score NUMERIC(5,2) DEFAULT 0,
  creative_score NUMERIC(5,2) DEFAULT 0,
  productivity_score NUMERIC(5,2) DEFAULT 0,
  habits_completed INTEGER DEFAULT 0,
  habits_total INTEGER DEFAULT 0,
  gym_done BOOLEAN DEFAULT FALSE,
  reading_pages INTEGER DEFAULT 0,
  career_minutes INTEGER DEFAULT 0,
  english_minutes INTEGER DEFAULT 0,
  creative_minutes INTEGER DEFAULT 0,
  water_ml INTEGER DEFAULT 0,
  rapido_earnings NUMERIC(10,2) DEFAULT 0,
  wake_time TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS daily_metrics_user_date_idx ON daily_metrics(user_id, date);

ALTER TABLE daily_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own daily metrics" ON daily_metrics
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- DAILY REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS daily_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  went_well TEXT,
  distracted_by TEXT,
  improve_tomorrow TEXT,
  tomorrow_priority TEXT,
  mood INTEGER CHECK (mood BETWEEN 1 AND 5),
  energy INTEGER CHECK (energy BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS daily_reviews_user_date_idx ON daily_reviews(user_id, date);

ALTER TABLE daily_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own daily reviews" ON daily_reviews
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- DAILY PLANS
-- ============================================================
CREATE TABLE IF NOT EXISTS daily_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  top_1 TEXT,
  top_2 TEXT,
  top_3 TEXT,
  career_topic TEXT,
  english_topic TEXT,
  workout_plan TEXT,
  creative_task TEXT,
  project_task TEXT,
  rapido_plan BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS daily_plans_user_date_idx ON daily_plans(user_id, date);

ALTER TABLE daily_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own daily plans" ON daily_plans
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- BOOKS
-- ============================================================
CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT,
  total_pages INTEGER,
  current_pages INTEGER DEFAULT 0,
  start_date DATE,
  completion_date DATE,
  status TEXT DEFAULT 'reading' CHECK (status IN ('reading','completed','paused','want_to_read')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS books_user_id_idx ON books(user_id);

ALTER TABLE books ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own books" ON books
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- BOOK PROGRESS
-- ============================================================
CREATE TABLE IF NOT EXISTS book_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  pages_read INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS book_progress_user_date_idx ON book_progress(user_id, date);

ALTER TABLE book_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own book progress" ON book_progress
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- LEARNING SESSIONS (Career)
-- ============================================================
CREATE TABLE IF NOT EXISTS learning_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  topic TEXT NOT NULL,
  minutes INTEGER NOT NULL DEFAULT 0,
  questions_practiced INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS learning_sessions_user_date_idx ON learning_sessions(user_id, date);

ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own learning sessions" ON learning_sessions
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- JOB APPLICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  date_applied DATE,
  source TEXT,
  resume_version TEXT,
  status TEXT DEFAULT 'saved' CHECK (status IN ('saved','applied','referral','recruiter','screening','l1','l2','final','offer','rejected','withdrawn')),
  recruiter_name TEXT,
  recruiter_contact TEXT,
  referral_name TEXT,
  interview_stage TEXT,
  next_action TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS job_apps_user_id_idx ON job_applications(user_id);
CREATE INDEX IF NOT EXISTS job_apps_status_idx ON job_applications(status);

ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own job applications" ON job_applications
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- INTERVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS interviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_application_id UUID REFERENCES job_applications(id) ON DELETE SET NULL,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  date DATE NOT NULL,
  round TEXT NOT NULL,
  topics TEXT[] DEFAULT '{}',
  questions TEXT,
  notes TEXT,
  next_round TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled','completed','cancelled','rejected','passed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS interviews_user_id_idx ON interviews(user_id);

ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own interviews" ON interviews
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- RESUME VERSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS resume_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  version_name TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE resume_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own resume versions" ON resume_versions
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- ENGLISH SESSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS english_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('speaking','reading_aloud','vocabulary','grammar','interview_speaking')),
  minutes INTEGER NOT NULL DEFAULT 0,
  topic TEXT,
  self_rating INTEGER CHECK (self_rating BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS english_sessions_user_date_idx ON english_sessions(user_id, date);

ALTER TABLE english_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own english sessions" ON english_sessions
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- ENGLISH VOCABULARY
-- ============================================================
CREATE TABLE IF NOT EXISTS english_vocabulary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  word TEXT NOT NULL,
  meaning TEXT NOT NULL,
  example_sentence TEXT,
  user_sentence TEXT,
  reviewed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS vocab_user_date_idx ON english_vocabulary(user_id, date);
CREATE INDEX IF NOT EXISTS vocab_user_word_idx ON english_vocabulary(user_id, word);

ALTER TABLE english_vocabulary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own vocabulary" ON english_vocabulary
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- ENGLISH INTERVIEW ANSWERS
-- ============================================================
CREATE TABLE IF NOT EXISTS english_interview_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer_notes TEXT,
  confidence INTEGER CHECK (confidence BETWEEN 1 AND 5),
  last_practiced DATE,
  practice_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE english_interview_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own interview answers" ON english_interview_answers
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- CREATIVE PROJECTS
-- ============================================================
CREATE TABLE IF NOT EXISTS creative_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  logline TEXT,
  genre TEXT,
  characters TEXT,
  story TEXT,
  scenes TEXT,
  notes TEXT,
  status TEXT DEFAULT 'idea' CHECK (status IN ('idea','developing','script','pre_production','production','editing','completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS creative_projects_user_id_idx ON creative_projects(user_id);

ALTER TABLE creative_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own creative projects" ON creative_projects
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- CREATIVE SESSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS creative_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  project_id UUID REFERENCES creative_projects(id) ON DELETE SET NULL,
  activity TEXT NOT NULL,
  minutes INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS creative_sessions_user_date_idx ON creative_sessions(user_id, date);

ALTER TABLE creative_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own creative sessions" ON creative_sessions
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- RAPIDO ENTRIES
-- ============================================================
CREATE TABLE IF NOT EXISTS rapido_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hours NUMERIC(4,2) DEFAULT 0,
  rides INTEGER DEFAULT 0,
  distance_km NUMERIC(8,2),
  gross_earnings NUMERIC(10,2) DEFAULT 0,
  fuel_cost NUMERIC(10,2) DEFAULT 0,
  net_earnings NUMERIC(10,2) GENERATED ALWAYS AS (gross_earnings - fuel_cost) STORED,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS rapido_user_date_idx ON rapido_entries(user_id, date);

ALTER TABLE rapido_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own rapido entries" ON rapido_entries
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- EXPENSES
-- ============================================================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('rent','home_family','food','seeds_oats_eggs','fuel','gym','investment','transport','other')),
  amount NUMERIC(10,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS expenses_user_date_idx ON expenses(user_id, date);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own expenses" ON expenses
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- INCOME ENTRIES
-- ============================================================
CREATE TABLE IF NOT EXISTS income_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('salary','rapido','other')),
  amount NUMERIC(10,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS income_user_date_idx ON income_entries(user_id, date);

ALTER TABLE income_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own income" ON income_entries
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- WATER LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS water_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount_ml INTEGER NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS water_logs_user_date_idx ON water_logs(user_id, date);

ALTER TABLE water_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own water logs" ON water_logs
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- TIME ENTRIES
-- ============================================================
CREATE TABLE IF NOT EXISTS time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('work','learning','gym','reading','rapido','travel','family','creative','entertainment','social_media','other')),
  minutes INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS time_entries_user_date_idx ON time_entries(user_id, date);

ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own time entries" ON time_entries
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- GYM LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS gym_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('completed','missed','recovery')),
  workout_type TEXT CHECK (workout_type IN ('push','pull','legs','full_body','cardio','other')),
  duration_minutes INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS gym_logs_user_date_idx ON gym_logs(user_id, date);

ALTER TABLE gym_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own gym logs" ON gym_logs
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- NOTIFICATION PREFERENCES
-- ============================================================
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT FALSE,
  private_mode BOOLEAN DEFAULT TRUE,
  morning_time TEXT DEFAULT '06:00',
  reading_time TEXT DEFAULT '07:30',
  career_time TEXT DEFAULT '19:30',
  english_time TEXT DEFAULT '20:30',
  review_time TEXT DEFAULT '21:30',
  telegram_chat_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own notification prefs" ON notification_preferences
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- PUSH SUBSCRIPTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS push_subs_user_id_idx ON push_subscriptions(user_id);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own push subscriptions" ON push_subscriptions
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- BADGES
-- ============================================================
CREATE TABLE IF NOT EXISTS badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  condition TEXT NOT NULL
);

INSERT INTO badges (id, name, description, icon, condition) VALUES
  ('first_day', 'First Step', 'Completed your first day of Winter Arc', '🌅', 'Complete Day 1'),
  ('day_7_discipline', '7-Day Discipline', '7 consecutive days of discipline habits', '🔥', '7-day discipline streak'),
  ('day_14_focus', '14-Day Focus', '14 consecutive days of focused effort', '⚡', '14-day overall streak'),
  ('day_30_arc', '30-Day Arc', 'Survived the first 30 days', '🏔️', 'Complete 30 days'),
  ('halfway_45', 'Halfway There', 'Reached Day 45 of 90', '🎯', 'Reach Day 45'),
  ('career_builder', 'Career Builder', '20+ hours of career preparation', '💼', '20 hours career prep'),
  ('english_consistency', 'English Consistency', '14 days of English practice', '🗣️', '14 days English streak'),
  ('pages_100', 'Century Reader', 'Read 100 pages total', '📚', '100 pages read'),
  ('gym_20', 'Iron Will', '20 gym sessions completed', '💪', '20 gym sessions'),
  ('creative_spark', 'Creative Spark', 'First creative session logged', '🎬', 'Log first creative session'),
  ('finisher_90', 'Winter Arc Complete', 'Finished all 90 days', '🏆', 'Complete Day 90')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- USER BADGES
-- ============================================================
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL REFERENCES badges(id),
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own badges" ON user_badges
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service inserts badges" ON user_badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- PROJECTS
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('data_engineering','ai','genai','rag','power_bi','computer_vision','filmmaking')),
  start_date DATE,
  target_date DATE,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning','in_progress','paused','completed')),
  github_url TEXT,
  demo_url TEXT,
  hours_logged NUMERIC(8,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS projects_user_id_idx ON projects(user_id);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own projects" ON projects
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- WEEKLY PLANS
-- ============================================================
CREATE TABLE IF NOT EXISTS weekly_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  career_focus TEXT,
  english_focus TEXT,
  gym_target INTEGER,
  reading_target INTEGER,
  creative_target INTEGER,
  project_target TEXT,
  income_target NUMERIC(10,2),
  biggest_win TEXT,
  biggest_challenge TEXT,
  challenge_cause TEXT,
  next_week_priority TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

ALTER TABLE weekly_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own weekly plans" ON weekly_plans
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- TRIGGER: Auto-create profile after signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name')
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.notification_preferences (user_id)
  VALUES (new.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- TRIGGER: Auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE OR REPLACE TRIGGER daily_metrics_updated_at
  BEFORE UPDATE ON daily_metrics
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE OR REPLACE TRIGGER daily_reviews_updated_at
  BEFORE UPDATE ON daily_reviews
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE OR REPLACE TRIGGER job_applications_updated_at
  BEFORE UPDATE ON job_applications
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE OR REPLACE TRIGGER creative_projects_updated_at
  BEFORE UPDATE ON creative_projects
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE OR REPLACE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
