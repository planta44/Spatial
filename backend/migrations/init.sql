-- Spatial AI Platform Database Setup
-- PostgreSQL with PostGIS extension

-- Enable PostGIS extension for spatial data
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for fresh setup)
DROP TABLE IF EXISTS user_certifications CASCADE;
DROP TABLE IF EXISTS certifications CASCADE;
DROP TABLE IF EXISTS spatial_projects CASCADE;
DROP TABLE IF EXISTS compositions CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS region_analytics CASCADE;
DROP TABLE IF EXISTS artists CASCADE;
DROP TABLE IF EXISTS spatial_audios CASCADE;
DROP TABLE IF EXISTS policies CASCADE;
DROP TABLE IF EXISTS page_contents CASCADE;
DROP TABLE IF EXISTS resources CASCADE;
DROP TABLE IF EXISTS universities CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Universities table
CREATE TABLE universities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(50),
    description TEXT,
    country VARCHAR(100) NOT NULL DEFAULT 'Kenya',
    county VARCHAR(100),
    city VARCHAR(100),
    address TEXT,
    website VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    infrastructure_info JSONB DEFAULT '{
        "hasComputerLab": false,
        "computerCount": 0,
        "hasAudioStudio": false,
        "hasInternetAccess": true,
        "bandwidthMbps": 0,
        "softwareAvailable": []
    }'::jsonb,
    music_program_info JSONB DEFAULT '{
        "hasPreServiceTeaching": false,
        "hasInServiceTraining": false,
        "studentsPerYear": 0,
        "facultyCount": 0,
        "currentCurriculum": "traditional"
    }'::jsonb,
    subscription_type VARCHAR(50) DEFAULT 'free' CHECK (subscription_type IN ('free', 'basic', 'premium', 'institutional')),
    subscription_expiry TIMESTAMP,
    settings JSONB DEFAULT '{
        "branding": {
            "logo": null,
            "colors": { "primary": "#1e40af", "secondary": "#64748b" }
        },
        "policies": {
            "requireApproval": true,
            "allowPublicSharing": false,
            "dataRetentionDays": 365
        }
    }'::jsonb,
    analytics JSONB DEFAULT '{
        "totalUsers": 0,
        "totalCourses": 0,
        "totalProjects": 0,
        "lastActivityDate": null
    }'::jsonb,
    is_active BOOLEAN DEFAULT true,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    university_id UUID REFERENCES universities(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin', 'university_admin')),
    profile_info JSONB DEFAULT '{
        "avatar": null,
        "bio": null,
        "specializations": [],
        "experience": null
    }'::jsonb,
    preferences JSONB DEFAULT '{
        "notifications": true,
        "publicProfile": false,
        "language": "en"
    }'::jsonb,
    verification_status VARCHAR(50) DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified')),
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL CHECK (category IN ('ai-composition', 'spatial-audio', 'teacher-training', 'policy', 'research')),
    difficulty VARCHAR(50) DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    estimated_hours INTEGER DEFAULT 1,
    modules JSONB DEFAULT '[]'::jsonb,
    downloadable_resources JSONB DEFAULT '[]'::jsonb,
    prerequisites UUID[],
    certification_required BOOLEAN DEFAULT false,
    certification_criteria JSONB DEFAULT '{
        "minScore": 80,
        "requiredTasks": [],
        "timeLimit": null
    }'::jsonb,
    curriculum_standards JSONB DEFAULT '{}'::jsonb,
    policy_guidelines JSONB DEFAULT '{}'::jsonb,
    author_id UUID NOT NULL REFERENCES users(id),
    university_id UUID REFERENCES universities(id),
    is_published BOOLEAN DEFAULT false,
    enrollment_count INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    tags TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Compositions table
CREATE TABLE compositions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    music_xml TEXT,
    midi_data BYTEA,
    audio_file_url VARCHAR(500),
    ai_model VARCHAR(100) DEFAULT 'rule-based' CHECK (ai_model IN ('magenta', 'rule-based', 'chord-generator', 'melody-generator')),
    generation_params JSONB DEFAULT '{
        "key": "C major",
        "tempo": 120,
        "timeSignature": "4/4",
        "style": "classical",
        "complexity": "beginner"
    }'::jsonb,
    harmony_analysis JSONB DEFAULT '{}'::jsonb,
    suggested_improvements TEXT[],
    course_id UUID REFERENCES courses(id),
    author_id UUID NOT NULL REFERENCES users(id),
    is_public BOOLEAN DEFAULT false,
    completion_status VARCHAR(50) DEFAULT 'draft' CHECK (completion_status IN ('draft', 'in-progress', 'completed', 'submitted')),
    tags TEXT[],
    difficulty VARCHAR(50) DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Spatial Projects table
CREATE TABLE spatial_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    audio_tracks JSONB DEFAULT '[]'::jsonb,
    track_count INTEGER DEFAULT 0,
    spatial_config JSONB DEFAULT '{
        "roomSize": { "width": 10, "height": 3, "depth": 10 },
        "listenerPosition": { "x": 0, "y": 0, "z": 0 },
        "reverbSettings": { "wetness": 0.3, "roomType": "medium" },
        "masterVolume": 1.0
    }'::jsonb,
    sound_objects JSONB DEFAULT '[]'::jsonb,
    audio_settings JSONB DEFAULT '{
        "sampleRate": 44100,
        "bufferSize": 4096,
        "binauralMode": true,
        "hrtfEnabled": true
    }'::jsonb,
    project_data JSONB DEFAULT '{}'::jsonb,
    course_id UUID REFERENCES courses(id),
    assignment_id UUID,
    author_id UUID NOT NULL REFERENCES users(id),
    collaborators UUID[],
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'in-progress', 'completed', 'shared')),
    is_public BOOLEAN DEFAULT false,
    play_count INTEGER DEFAULT 0,
    last_played TIMESTAMP,
    average_session_time INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Certifications table
CREATE TABLE certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    certificate_name VARCHAR(255) NOT NULL,
    certificate_type VARCHAR(100) NOT NULL CHECK (certificate_type IN ('course-completion', 'skill-mastery', 'teacher-certification', 'policy-training')),
    description TEXT,
    requirements JSONB DEFAULT '{
        "coursesRequired": [],
        "minimumScore": 80,
        "practicalTasks": [],
        "timeFrame": null
    }'::jsonb,
    certificate_template TEXT,
    validity_period INTEGER,
    issuing_institution VARCHAR(255) NOT NULL,
    issued_by_id UUID NOT NULL REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    total_issued INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Certifications table
CREATE TABLE user_certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    certification_id UUID NOT NULL REFERENCES certifications(id),
    certificate_number VARCHAR(100) UNIQUE NOT NULL,
    issued_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expiry_date TIMESTAMP,
    final_score DECIMAL(5,2),
    completed_tasks JSONB DEFAULT '[]'::jsonb,
    completion_time INTEGER,
    certificate_url VARCHAR(500),
    certificate_hash VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
    verification_code VARCHAR(100) UNIQUE,
    verified_by UUID REFERENCES users(id),
    verification_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE page_contents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(150) UNIQUE NOT NULL,
    title VARCHAR(255),
    content JSONB DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Legacy tables for existing functionality
CREATE TABLE policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    scope VARCHAR(100),
    universities TEXT[],
    objectives TEXT[],
    requirements TEXT[],
    resources TEXT[],
    budget JSONB,
    timeline JSONB,
    stakeholders TEXT[],
    documents TEXT[],
    impact_metrics JSONB,
    status VARCHAR(50) DEFAULT 'draft',
    created_by UUID REFERENCES users(id),
    last_reviewed_date TIMESTAMP,
    next_review_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(100),
    category VARCHAR(100),
    format VARCHAR(50),
    file_url VARCHAR(500),
    file_size BIGINT,
    duration INTEGER,
    difficulty VARCHAR(50),
    prerequisites TEXT[],
    tags TEXT[],
    language VARCHAR(10) DEFAULT 'en',
    sort_order INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id),
    university_id UUID REFERENCES universities(id),
    is_public BOOLEAN DEFAULT true,
    downloads INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE spatial_audios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    audio_file_url VARCHAR(500),
    format VARCHAR(50),
    channels INTEGER,
    sample_rate INTEGER,
    bit_depth INTEGER,
    duration INTEGER,
    spatial_config JSONB,
    analysis JSONB,
    visualization JSONB,
    tags TEXT[],
    category VARCHAR(100),
    owner UUID REFERENCES users(id),
    resource UUID REFERENCES resources(id),
    is_public BOOLEAN DEFAULT false,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE artists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    spotify_id VARCHAR(100),
    genres TEXT[],
    popularity INTEGER,
    followers INTEGER,
    location GEOMETRY(POINT, 4326),
    country VARCHAR(100),
    city VARCHAR(100),
    streaming_data JSONB DEFAULT '{}'::jsonb,
    social_media JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE region_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_name VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    region_type VARCHAR(50),
    geometry GEOMETRY(POLYGON, 4326),
    center_point GEOMETRY(POINT, 4326),
    population INTEGER,
    stats JSONB DEFAULT '{}'::jsonb,
    music_metrics JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_university ON users(university_id);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_author ON courses(author_id);
CREATE INDEX idx_compositions_author ON compositions(author_id);
CREATE INDEX idx_compositions_course ON compositions(course_id);
CREATE INDEX idx_spatial_projects_author ON spatial_projects(author_id);
CREATE INDEX idx_spatial_projects_course ON spatial_projects(course_id);
CREATE INDEX idx_certifications_type ON certifications(certificate_type);
CREATE INDEX idx_user_certifications_user ON user_certifications(user_id);
CREATE INDEX idx_user_certifications_cert ON user_certifications(certification_id);

-- Add comments for documentation
COMMENT ON TABLE universities IS 'Educational institutions using the platform';
COMMENT ON TABLE users IS 'Platform users (students, teachers, admins)';
COMMENT ON TABLE courses IS 'Training courses and curriculum modules';
COMMENT ON TABLE compositions IS 'AI-generated and user-created musical compositions';
COMMENT ON TABLE spatial_projects IS '3D spatial audio projects';
COMMENT ON TABLE certifications IS 'Available certification types';
COMMENT ON TABLE user_certifications IS 'Issued certificates to users';

-- Comments on specific columns
COMMENT ON COLUMN courses.downloadable_resources IS 'PDFs, lesson plans, guides, certificates';
COMMENT ON COLUMN courses.curriculum_standards IS 'Kenyan curriculum alignment';
COMMENT ON COLUMN courses.policy_guidelines IS 'FOSS policies, academic integrity, etc.';
COMMENT ON COLUMN spatial_projects.audio_tracks IS 'Array of audio track objects with file URLs and metadata';
COMMENT ON COLUMN spatial_projects.sound_objects IS 'Array of sound objects with 3D positions and properties';
COMMENT ON COLUMN compositions.music_xml IS 'MuseScore compatible XML';
COMMENT ON COLUMN compositions.midi_data IS 'MIDI file binary data';

-- Insert sample data
INSERT INTO universities (name, short_name, country, county, city) VALUES 
('University of Nairobi', 'UoN', 'Kenya', 'Nairobi', 'Nairobi'),
('Kenyatta University', 'KU', 'Kenya', 'Kiambu', 'Kahawa'),
('Jomo Kenyatta University of Agriculture and Technology', 'JKUAT', 'Kenya', 'Kiambu', 'Juja');

-- Create default admin user (password: admin123 - should be changed in production)
INSERT INTO users (first_name, last_name, email, password, role) VALUES 
('System', 'Administrator', 'ruachkol@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

PRINT 'Database setup completed successfully!';
