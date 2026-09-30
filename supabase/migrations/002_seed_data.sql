-- ============================================================
-- WINTER ARC 90 — Seed Default Habits
-- Run this AFTER creating a user account (replace USER_ID)
-- Or call the /api/onboarding endpoint which does this automatically
-- ============================================================

-- This is a template — the app calls this via the onboarding API
-- Replace 'YOUR_USER_ID' with actual UUID

-- NOTE: The app handles seeding via /api/onboarding/seed-habits
-- These are just for reference

/*
INSERT INTO habits (user_id, name, description, type, category, target_value, unit, is_optional, weight, sort_order) VALUES
-- DISCIPLINE (20% weight total)
('YOUR_USER_ID', 'No Porn', 'Abstinence habit. Track your streak.', 'abstinence', 'discipline', NULL, NULL, FALSE, 50, 1),
('YOUR_USER_ID', 'Digital Discipline', 'Manually log whether you avoided distraction apps today.', 'boolean', 'discipline', NULL, NULL, FALSE, 50, 2),

-- HEALTH (20% weight total)
('YOUR_USER_ID', 'Gym', 'Daily gym session', 'boolean', 'health', NULL, NULL, FALSE, 30, 1),
('YOUR_USER_ID', 'Reading', 'Morning reading — target 3 pages', 'numeric', 'health', 3, 'pages', FALSE, 20, 2),
('YOUR_USER_ID', 'Water', 'Stay hydrated', 'numeric', 'health', 2500, 'ml', FALSE, 20, 3),
('YOUR_USER_ID', 'Healthy Food', 'Eat clean and healthy', 'rating', 'health', NULL, NULL, FALSE, 15, 4),
('YOUR_USER_ID', 'No Added Sugar', 'Avoid added sugar today', 'boolean', 'health', NULL, NULL, FALSE, 15, 5),

-- CAREER (25% weight total)
('YOUR_USER_ID', 'Career Preparation', 'Study for job switch — SQL, Python, Databricks, etc.', 'duration', 'career', 60, 'minutes', FALSE, 60, 1),
('YOUR_USER_ID', 'Job Applications', 'Apply or follow up on job opportunities', 'boolean', 'career', NULL, NULL, FALSE, 40, 2),

-- ENGLISH (10% weight total)
('YOUR_USER_ID', 'English Practice', 'Speaking, vocabulary, grammar or interview prep', 'duration', 'english', 30, 'minutes', FALSE, 100, 1),

-- CREATIVE (10% weight total)
('YOUR_USER_ID', 'Creative Session', 'Filmmaking, writing, or creative work', 'duration', 'creative', 30, 'minutes', FALSE, 100, 1),

-- PRODUCTIVITY (15% weight total)
('YOUR_USER_ID', 'Morning Routine', 'Wake up on time and complete morning routine', 'boolean', 'productivity', NULL, NULL, FALSE, 40, 1),
('YOUR_USER_ID', 'Daily Review', 'End-of-day review and planning', 'boolean', 'productivity', NULL, NULL, FALSE, 40, 2),
('YOUR_USER_ID', 'Time Audit', 'Track where your time went today', 'boolean', 'productivity', NULL, NULL, FALSE, 20, 3),

-- OPTIONAL (not counted in score)
('YOUR_USER_ID', 'Rapido', 'Side income driving', 'boolean', 'optional', NULL, NULL, TRUE, 0, 1);
*/

SELECT 'Seed template ready. Use the app onboarding to create default habits.' as message;
