-- V3__jsonb_to_text.sql
-- Convert jsonb columns to text so the String entity fields can be stored without casting

ALTER TABLE minutes_of_meeting
    ALTER COLUMN section_c_milestones    TYPE TEXT USING section_c_milestones::text,
    ALTER COLUMN section_d_throughputs   TYPE TEXT USING section_d_throughputs::text,
    ALTER COLUMN section_e_skills        TYPE TEXT USING section_e_skills::text,
    ALTER COLUMN section_f_challenges    TYPE TEXT USING section_f_challenges::text,
    ALTER COLUMN section_h_assessment_scores TYPE TEXT USING section_h_assessment_scores::text;