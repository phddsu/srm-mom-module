-- V1__init_base_schema.sql
-- Base schema (safe/IF NOT EXISTS) — supports both fresh installs and existing DBs

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(200),
    role VARCHAR(50) NOT NULL,
    department VARCHAR(200),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS minutes_of_meeting (
    id BIGSERIAL PRIMARY KEY,
    mom_number VARCHAR(50) UNIQUE NOT NULL,
    scholar_id BIGINT NOT NULL,
    supervisor_id BIGINT NOT NULL,
    current_status VARCHAR(50) NOT NULL,
    current_stage VARCHAR(50) NOT NULL,

    -- Period
    period_year INT,
    period_month INT,

    -- Section A
    section_a_scholar_name VARCHAR(200),
    section_a_registration_date DATE,
    section_a_session_year VARCHAR(50),
    section_a_supervisor_name VARCHAR(200),
    section_a_cosupervisor_name VARCHAR(200),
    section_a_department VARCHAR(200),
    section_a_scopus_id VARCHAR(100),
    section_a_orcid_id VARCHAR(100),
    section_a_linked BOOLEAN,
    section_a_phd_title VARCHAR(500),
    section_a_funding VARCHAR(20),
    section_a_jrf_srf VARCHAR(20),
    section_a_project_title VARCHAR(500),
    section_a_funding_agency VARCHAR(200),
    section_a_pi_name VARCHAR(200),

    -- Section B
    section_b_coursework_completed BOOLEAN,
    section_b_courseworks_recommended INT,

    -- Section C
    section_c_milestones JSONB,

    -- Section D
    section_d_throughputs JSONB,

    -- Section E
    section_e_skills JSONB,

    -- Section F
    section_f_challenges JSONB,

    -- Section G
    section_g_lab_hours INT,
    section_g_tutorial_hours INT,
    section_g_support VARCHAR(20),
    section_g_remarks TEXT,

    -- Section H (Supervisor)
    section_h_month VARCHAR(50),
    section_h_assessment_scores JSONB,
    section_h_recommendation VARCHAR(50),

    -- Section I
    section_i_certified_leave VARCHAR(10),
    section_i_certified_fellowship VARCHAR(10),
    section_i_hoi_remarks TEXT,
    section_i_directorate_remarks TEXT,
    section_i_dean_remarks TEXT,

    submission_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mom_history (
    id BIGSERIAL PRIMARY KEY,
    mom_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL,
    previous_status VARCHAR(50),
    new_status VARCHAR(50),
    previous_stage VARCHAR(50),
    new_stage VARCHAR(50),
    performed_by_user_id BIGINT,
    performed_by_username VARCHAR(100),
    performed_by_role VARCHAR(50),
    remarks TEXT,
    action_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_history_mom FOREIGN KEY (mom_id) REFERENCES minutes_of_meeting(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mom_signature (
    id BIGSERIAL PRIMARY KEY,
    mom_id BIGINT NOT NULL,
    role VARCHAR(50) NOT NULL,
    signed_by_user_id BIGINT,
    signed_by_name VARCHAR(200),
    signature_hash VARCHAR(500),
    signed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_signature_mom FOREIGN KEY (mom_id) REFERENCES minutes_of_meeting(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mom_attachment (
    id BIGSERIAL PRIMARY KEY,
    mom_id BIGINT NOT NULL,
    uploaded_by BIGINT,
    uploaded_by_role VARCHAR(50),
    stage VARCHAR(50),
    file_name VARCHAR(500),
    file_path VARCHAR(1000),
    file_size BIGINT,
    content_type VARCHAR(200),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_attachment_mom FOREIGN KEY (mom_id) REFERENCES minutes_of_meeting(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_mom_scholar ON minutes_of_meeting(scholar_id);
CREATE INDEX IF NOT EXISTS idx_mom_supervisor ON minutes_of_meeting(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_mom_stage ON minutes_of_meeting(current_stage);
CREATE INDEX IF NOT EXISTS idx_history_mom ON mom_history(mom_id);
CREATE INDEX IF NOT EXISTS idx_signature_mom ON mom_signature(mom_id);
CREATE INDEX IF NOT EXISTS idx_attachment_mom ON mom_attachment(mom_id);