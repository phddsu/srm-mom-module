-- V4__section_f_sub_tables.sql
ALTER TABLE minutes_of_meeting
    ADD COLUMN IF NOT EXISTS section_f_participation TEXT,
    ADD COLUMN IF NOT EXISTS section_f_planned_activities TEXT;