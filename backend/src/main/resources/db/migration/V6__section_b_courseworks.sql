-- V6__section_b_courseworks.sql
ALTER TABLE minutes_of_meeting
    ADD COLUMN IF NOT EXISTS section_b_courseworks TEXT;
