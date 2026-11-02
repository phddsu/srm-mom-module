-- V7__scholar_profile.sql
CREATE TABLE IF NOT EXISTS scholar_profile (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    supervisor_id BIGINT REFERENCES users(id),
    university_reg_id VARCHAR(100),
    batch VARCHAR(20),
    mode VARCHAR(20),
    tentative_topic VARCHAR(500),
    university_email VARCHAR(200),
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    rejection_remarks TEXT,
    submitted_at TIMESTAMP,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_scholar_profile_status ON scholar_profile(status);
CREATE INDEX IF NOT EXISTS idx_scholar_profile_supervisor ON scholar_profile(supervisor_id);
