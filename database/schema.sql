-- SmartTeamFoundation MySQL 8.0 Schema
-- Database: smartteam_foundation

CREATE DATABASE IF NOT EXISTS smartteam_foundation CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smartteam_foundation;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(191) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'student',
  avatar_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB;

-- Student profiles table
CREATE TABLE IF NOT EXISTS student_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  department VARCHAR(150),
  college VARCHAR(200),
  year_of_study INT DEFAULT 3,
  bio TEXT,
  interests TEXT,
  experience_summary TEXT,
  experience_level ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Intermediate',
  preferred_roles TEXT,
  weekly_availability INT DEFAULT 10,
  github_url VARCHAR(255),
  portfolio_url VARCHAR(255),
  linkedin_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Master skills table
CREATE TABLE IF NOT EXISTS skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

-- Student skills mapping
CREATE TABLE IF NOT EXISTS student_skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  skill_id INT NOT NULL,
  proficiency ENUM('Beginner', 'Intermediate', 'Advanced', 'Expert') NOT NULL,
  years_experience DECIMAL(4,1) DEFAULT 1.0,
  UNIQUE KEY uq_user_skill (user_id, skill_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  owner_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  domain VARCHAR(100) NOT NULL,
  difficulty_level ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Intermediate',
  expected_team_size INT DEFAULT 4,
  duration_weeks INT DEFAULT 8,
  weekly_commitment_hours INT DEFAULT 10,
  status ENUM('Open', 'In Progress', 'Completed', 'Archived') DEFAULT 'Open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_owner (owner_id),
  INDEX idx_status (status)
) ENGINE=InnoDB;

-- Project required skills
CREATE TABLE IF NOT EXISTS project_required_skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  skill_id INT NOT NULL,
  min_proficiency ENUM('Beginner', 'Intermediate', 'Advanced', 'Expert') DEFAULT 'Intermediate',
  importance ENUM('Required', 'Preferred', 'Nice to have') DEFAULT 'Required',
  weight DECIMAL(4,2) DEFAULT 1.00,
  UNIQUE KEY uq_proj_skill (project_id, skill_id),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Project roles
CREATE TABLE IF NOT EXISTS project_roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  role_name VARCHAR(100) NOT NULL,
  count_needed INT DEFAULT 1,
  description TEXT,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Project members
CREATE TABLE IF NOT EXISTS project_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  user_id INT NOT NULL,
  assigned_role VARCHAR(100) DEFAULT 'Team Member',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_proj_member (project_id, user_id),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Join requests and team invitations
CREATE TABLE IF NOT EXISTS join_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  user_id INT NOT NULL,
  type ENUM('request', 'invitation') DEFAULT 'request',
  status ENUM('pending', 'accepted', 'rejected', 'cancelled') DEFAULT 'pending',
  proposed_role VARCHAR(100),
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info',
  link VARCHAR(255),
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Project Activity feed
CREATE TABLE IF NOT EXISTS project_activity (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  user_id INT,
  action_type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Recommendation History
CREATE TABLE IF NOT EXISTS recommendation_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  user_id INT NOT NULL,
  compatibility_score DECIMAL(5,2) NOT NULL,
  matching_skills JSON,
  missing_skills JSON,
  rationale TEXT,
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
