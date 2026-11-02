ALTER TABLE minutes_of_meeting
ADD COLUMN section_b_completed_count INTEGER DEFAULT 0,
ADD COLUMN section_b_cv_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN section_b_cv_date VARCHAR(50),
ADD COLUMN section_b_dcm_conducted BOOLEAN DEFAULT FALSE,
ADD COLUMN section_b_prephd_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN section_b_synopsis_submitted BOOLEAN DEFAULT FALSE,
ADD COLUMN section_b_thesis_submitted BOOLEAN DEFAULT FALSE;