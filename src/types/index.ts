// Winter Arc 90 — Core Types
// All types used across the application

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ─── Program ──────────────────────────────────────────────────────────────────

export const PROGRAM_START = new Date('2026-10-01T00:00:00+05:30')
export const PROGRAM_END = new Date('2026-12-29T23:59:59+05:30')
export const PROGRAM_DAYS = 90
export const TIMEZONE = 'Asia/Kolkata'
export const CURRENCY = 'INR'

// ─── User & Auth ──────────────────────────────────────────────────────────────

export interface Profile {
  id: string
  user_id: string
  display_name: string | null
  avatar_url: string | null
  timezone: string
  currency: string
  theme: 'dark' | 'light' | 'system'
  monthly_income: number
  created_at: string
  updated_at: string
}

// ─── Habits ───────────────────────────────────────────────────────────────────

export type HabitType = 'boolean' | 'numeric' | 'duration' | 'abstinence' | 'rating'
export type HabitCategory = 'discipline' | 'health' | 'career' | 'english' | 'creative' | 'productivity' | 'optional'

export interface Habit {
  id: string
  user_id: string
  name: string
  description: string | null
  type: HabitType
  category: HabitCategory
  target_value: number | null // for numeric/duration habits
  unit: string | null // 'pages', 'minutes', 'ml', etc.
  is_optional: boolean
  weight: number // 0–100, contribution to daily score
  sort_order: number
  is_active: boolean
  created_at: string
}

export type HabitStatus = 'kept' | 'failed' | 'partial' | 'skipped' | 'recovery'

export interface HabitLog {
  id: string
  user_id: string
  habit_id: string
  date: string // YYYY-MM-DD in IST
  status: HabitStatus
  value: number | null
  notes: string | null
  logged_at: string
}

// ─── Daily Metrics ────────────────────────────────────────────────────────────

export interface DailyMetrics {
  id: string
  user_id: string
  date: string
  day_number: number // 1–90
  total_score: number // 0–100
  discipline_score: number
  health_score: number
  career_score: number
  english_score: number
  creative_score: number
  productivity_score: number
  habits_completed: number
  habits_total: number
  gym_done: boolean
  reading_pages: number
  career_minutes: number
  english_minutes: number
  creative_minutes: number
  water_ml: number
  rapido_earnings: number
  wake_time: string | null
  created_at: string
  updated_at: string
}

// ─── Daily Review ─────────────────────────────────────────────────────────────

export interface DailyReview {
  id: string
  user_id: string
  date: string
  went_well: string | null
  distracted_by: string | null
  improve_tomorrow: string | null
  tomorrow_priority: string | null
  mood: number | null // 1–5
  energy: number | null // 1–5
  created_at: string
  updated_at: string
}

// ─── Daily Plan ───────────────────────────────────────────────────────────────

export interface DailyPlan {
  id: string
  user_id: string
  date: string
  top_1: string | null
  top_2: string | null
  top_3: string | null
  career_topic: string | null
  english_topic: string | null
  workout_plan: string | null
  creative_task: string | null
  project_task: string | null
  rapido_plan: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

// ─── Books ────────────────────────────────────────────────────────────────────

export interface Book {
  id: string
  user_id: string
  title: string
  author: string | null
  total_pages: number | null
  current_pages: number
  start_date: string | null
  completion_date: string | null
  status: 'reading' | 'completed' | 'paused' | 'want_to_read'
  notes: string | null
  created_at: string
}

export interface BookProgress {
  id: string
  user_id: string
  book_id: string
  date: string
  pages_read: number
  notes: string | null
  created_at: string
}

// ─── Career ───────────────────────────────────────────────────────────────────

export type CareerTopic =
  | 'SQL' | 'Python' | 'PySpark' | 'Spark' | 'Databricks'
  | 'Azure Data Factory' | 'ADLS' | 'Azure' | 'Power BI' | 'Microsoft Fabric'
  | 'LangChain' | 'RAG' | 'GenAI' | 'Data Engineering' | 'System Design'
  | 'Project Explanation' | 'Interview Preparation' | 'Resume' | 'LinkedIn'
  | 'Applications' | 'Referrals' | 'Mock Interviews' | 'Other'

export interface LearningSession {
  id: string
  user_id: string
  date: string
  topic: string
  minutes: number
  questions_practiced: number
  notes: string | null
  created_at: string
}

export type ApplicationStatus =
  | 'saved' | 'applied' | 'referral' | 'recruiter' | 'screening'
  | 'l1' | 'l2' | 'final' | 'offer' | 'rejected' | 'withdrawn'

export interface JobApplication {
  id: string
  user_id: string
  company: string
  role: string
  date_applied: string | null
  source: string | null
  resume_version: string | null
  status: ApplicationStatus
  recruiter_name: string | null
  recruiter_contact: string | null
  referral_name: string | null
  interview_stage: string | null
  next_action: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Interview {
  id: string
  user_id: string
  job_application_id: string | null
  company: string
  role: string
  date: string
  round: string
  topics: string[]
  questions: string | null
  notes: string | null
  next_round: string | null
  status: 'scheduled' | 'completed' | 'cancelled' | 'rejected' | 'passed'
  created_at: string
}

// ─── English ──────────────────────────────────────────────────────────────────

export type EnglishActivityType =
  | 'speaking' | 'reading_aloud' | 'vocabulary' | 'grammar' | 'interview_speaking'

export interface EnglishSession {
  id: string
  user_id: string
  date: string
  activity_type: EnglishActivityType
  minutes: number
  topic: string | null
  self_rating: number | null // 1–5
  notes: string | null
  created_at: string
}

export interface EnglishVocabulary {
  id: string
  user_id: string
  date: string
  word: string
  meaning: string
  example_sentence: string | null
  user_sentence: string | null
  reviewed: boolean
  created_at: string
}

export interface EnglishInterviewAnswer {
  id: string
  user_id: string
  question: string
  answer_notes: string | null
  confidence: number | null // 1–5
  last_practiced: string | null
  practice_count: number
  created_at: string
  updated_at: string
}

// ─── Creative ─────────────────────────────────────────────────────────────────

export type CreativeProjectStatus =
  | 'idea' | 'developing' | 'script' | 'pre_production' | 'production' | 'editing' | 'completed'

export interface CreativeProject {
  id: string
  user_id: string
  title: string
  logline: string | null
  genre: string | null
  characters: string | null
  story: string | null
  scenes: string | null
  notes: string | null
  status: CreativeProjectStatus
  created_at: string
  updated_at: string
}

export interface CreativeSession {
  id: string
  user_id: string
  date: string
  project_id: string | null
  activity: string
  minutes: number
  notes: string | null
  created_at: string
}

// ─── Rapido ───────────────────────────────────────────────────────────────────

export interface RapidoEntry {
  id: string
  user_id: string
  date: string
  hours: number
  rides: number
  distance_km: number | null
  gross_earnings: number
  fuel_cost: number
  net_earnings: number // computed: gross - fuel
  notes: string | null
  created_at: string
}

// ─── Finance ──────────────────────────────────────────────────────────────────

export type ExpenseCategory =
  | 'rent' | 'home_family' | 'food' | 'seeds_oats_eggs'
  | 'fuel' | 'gym' | 'investment' | 'transport' | 'other'

export interface Expense {
  id: string
  user_id: string
  date: string
  category: ExpenseCategory
  amount: number
  description: string | null
  created_at: string
}

export type IncomeType = 'salary' | 'rapido' | 'other'

export interface IncomeEntry {
  id: string
  user_id: string
  date: string
  type: IncomeType
  amount: number
  description: string | null
  created_at: string
}

// ─── Water ────────────────────────────────────────────────────────────────────

export interface WaterLog {
  id: string
  user_id: string
  date: string
  amount_ml: number
  logged_at: string
}

// ─── Time Audit ───────────────────────────────────────────────────────────────

export type TimeCategory =
  | 'work' | 'learning' | 'gym' | 'reading' | 'rapido'
  | 'travel' | 'family' | 'creative' | 'entertainment' | 'social_media' | 'other'

export interface TimeEntry {
  id: string
  user_id: string
  date: string
  category: TimeCategory
  minutes: number
  notes: string | null
  created_at: string
}

// ─── Wake Up ──────────────────────────────────────────────────────────────────

export type WakeStatus = 'on_target' | 'close' | 'late'

export interface WakeLog {
  id: string
  user_id: string
  date: string
  wake_time: string // HH:MM
  target_time: string // HH:MM
  status: WakeStatus
  created_at: string
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface NotificationPreference {
  id: string
  user_id: string
  enabled: boolean
  private_mode: boolean
  morning_time: string // HH:MM
  reading_time: string | null
  career_time: string | null
  english_time: string | null
  review_time: string | null
  telegram_chat_id: string | null
  created_at: string
  updated_at: string
}

// ─── Badges ───────────────────────────────────────────────────────────────────

export type BadgeId =
  | 'first_day' | 'day_7_discipline' | 'day_14_focus' | 'day_30_arc'
  | 'halfway_45' | 'career_builder' | 'english_consistency'
  | 'pages_100' | 'gym_20' | 'creative_spark' | 'finisher_90'

export interface Badge {
  id: BadgeId
  name: string
  description: string
  icon: string
  condition: string
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: BadgeId
  earned_at: string
}

// ─── Streaks ──────────────────────────────────────────────────────────────────

export interface StreakInfo {
  current: number
  best: number
  total_completed: number
  completion_percentage: number
}

// ─── Score Weights ────────────────────────────────────────────────────────────

export interface ScoreWeights {
  discipline: number // 20
  health: number // 20
  career: number // 25
  productivity: number // 15
  english: number // 10
  creativity: number // 10
}

export const DEFAULT_SCORE_WEIGHTS: ScoreWeights = {
  discipline: 20,
  health: 20,
  career: 25,
  productivity: 15,
  english: 10,
  creativity: 10,
}

// ─── Routine ──────────────────────────────────────────────────────────────────

export interface RoutineItem {
  id: string
  time: string // HH:MM
  activity: string
  sort_order: number
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export type ProjectCategory =
  | 'data_engineering' | 'ai' | 'genai' | 'rag' | 'power_bi' | 'computer_vision' | 'filmmaking'

export type ProjectStatus = 'planning' | 'in_progress' | 'paused' | 'completed'

export interface Project {
  id: string
  user_id: string
  name: string
  description: string | null
  category: ProjectCategory
  start_date: string | null
  target_date: string | null
  status: ProjectStatus
  github_url: string | null
  demo_url: string | null
  hours_logged: number
  notes: string | null
  created_at: string
  updated_at: string
}

// ─── Offline Queue ────────────────────────────────────────────────────────────

export interface OfflineEntry {
  id: string
  table: string
  operation: 'insert' | 'update' | 'delete'
  data: Record<string, Json>
  created_at: number // timestamp
  synced: boolean
}

// ─── Gym ──────────────────────────────────────────────────────────────────────

export type WorkoutType = 'push' | 'pull' | 'legs' | 'full_body' | 'cardio' | 'other'
export type GymStatus = 'completed' | 'missed' | 'recovery'

export interface GymLog {
  id: string
  user_id: string
  date: string
  status: GymStatus
  workout_type: WorkoutType | null
  duration_minutes: number | null
  notes: string | null
  created_at: string
}
