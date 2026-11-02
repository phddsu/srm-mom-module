-- V5__section_attachments.sql
CREATE TABLE IF NOT EXISTS mom_section_attachment (
    id BIGSERIAL PRIMARY KEY,
    mom_id BIGINT NOT NULL,
    section VARCHAR(20) NOT NULL,
    row_index INT,
    file_name VARCHAR(500),
    file_path VARCHAR(1000),
    file_size BIGINT,
    content_type VARCHAR(200),
    description TEXT,
    uploaded_by BIGINT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_secattach_mom FOREIGN KEY (mom_id) REFERENCES minutes_of_meeting(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_secattach_mom ON mom_section_attachment(mom_id, section);