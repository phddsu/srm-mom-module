-- V2__coordinator_and_new_features.sql
-- Additive migration for Commit 3: Coordinator, Period Lock, Journal Tracking, Notifications

-- 1. Add Section H and Section I columns to minutes_of_meeting
ALTER TABLE minutes_of_meeting 
ADD COLUMN IF NOT EXISTS section_h_recommendation VARCHAR(50),
ADD COLUMN IF NOT EXISTS section_h_assessment_scores JSONB,
ADD COLUMN IF NOT EXISTS section_h_month VARCHAR(50),
ADD COLUMN IF NOT EXISTS section_i_certified_leave VARCHAR(10),
ADD COLUMN IF NOT EXISTS section_i_certified_fellowship VARCHAR(10),
ADD COLUMN IF NOT EXISTS section_i_hoi_remarks TEXT,
ADD COLUMN IF NOT EXISTS section_i_directorate_remarks TEXT,
ADD COLUMN IF NOT EXISTS section_i_dean_remarks TEXT;

-- 2. Create mom_period_lock table
CREATE TABLE IF NOT EXISTS mom_period_lock (
    id BIGSERIAL PRIMARY KEY,
    period_year INT NOT NULL,
    period_month INT NOT NULL,
    deadline DATE NOT NULL,
    is_locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_period_year_month UNIQUE (period_year, period_month)
);

-- 3. Create mom_journal_paper table
CREATE TABLE IF NOT EXISTS mom_journal_paper (
    id BIGSERIAL PRIMARY KEY,
    mom_id BIGINT NOT NULL,
    title VARCHAR(500) NOT NULL,
    journal_name VARCHAR(255),
    journal_type VARCHAR(50),
    status VARCHAR(50),
    expected_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_journal_mom FOREIGN KEY (mom_id) REFERENCES minutes_of_meeting(id) ON DELETE CASCADE
);

-- 4. Create notification table
CREATE TABLE IF NOT EXISTS notification (
    id BIGSERIAL PRIMARY KEY,
    recipient_user_id BIGINT NOT NULL,
    recipient_role VARCHAR(50) NOT NULL,
    mom_id BIGINT,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_user FOREIGN KEY (recipient_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Seed an example Period Lock for August 2026
INSERT INTO mom_period_lock (period_year, period_month, deadline, is_locked)
SELECT 2026, 8, '2026-09-27', FALSE
WHERE NOT EXISTS (
    SELECT 1 FROM mom_period_lock WHERE period_year = 2026 AND period_month = 8
);

-- 6. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notification_recipient ON notification(recipient_user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_journal_mom ON mom_journal_paper(mom_id);