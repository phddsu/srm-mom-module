-- V8__user_profile_fields.sql
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS designation VARCHAR(100),
    ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
    ADD COLUMN IF NOT EXISTS office_location VARCHAR(200);