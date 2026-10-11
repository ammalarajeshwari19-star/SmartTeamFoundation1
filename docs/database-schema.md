# SmartTeamFoundation — Database Schema & Data Dictionary

## 1. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    users ||--o| student_profiles : "has"
    users ||--o{ student_skills : "possesses"
    skills ||--o{ student_skills : "mapped in"
    users ||--o{ projects : "creates/owns"
    projects ||--o{ project_required_skills : "demands"
    skills ||--o{ project_required_skills : "required by"
    projects ||--o{ project_roles : "specifies"
    projects ||--o{ project_members : "includes"
    users ||--o{ project_members : "joins"
    projects ||--o{ join_requests : "receives"
    users ||--o{ join_requests : "submits"
    users ||--o{ notifications : "receives"
    projects ||--o{ project_activity : "logs"
    projects ||--o{ recommendation_history : "generates"

    users {
        int id PK
        string name
        string email UK
        string password_hash
        string role
        string avatar_url
        datetime created_at
    }

    student_profiles {
        int id PK
        int user_id FK
        string department
        string college
        int year_of_study
        text bio
        string interests
        text experience_summary
        string experience_level
        string preferred_roles
        int weekly_availability
        string github_url
        string portfolio_url
    }

    skills {
        int id PK
        string name UK
        string category
    }

    student_skills {
        int id PK
        int user_id FK
        int skill_id FK
        string proficiency
        decimal years_experience
    }

    projects {
        int id PK
        int owner_id FK
        string title
        text description
        string domain
        string difficulty_level
        int expected_team_size
        int duration_weeks
        int weekly_commitment_hours
        string status
    }

    project_required_skills {
        int id PK
        int project_id FK
        int skill_id FK
        string min_proficiency
        string importance
        decimal weight
    }

    project_roles {
        int id PK
        int project_id FK
        string role_name
        int count_needed
        text description
    }

    project_members {
        int id PK
        int project_id FK
        int user_id FK
        string assigned_role
        datetime joined_at
    }

    join_requests {
        int id PK
        int project_id FK
        int user_id FK
        string type
        string status
        string proposed_role
        text message
    }

    notifications {
        int id PK
        int user_id FK
        string title
        text message
        string type
        string link
        int is_read
    }
```

---

## 2. Table Specifications & Constraints

### 2.1 `users`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| `name` | VARCHAR(150) | NOT NULL | Student's full name |
| `email` | VARCHAR(191) | NOT NULL, UNIQUE, INDEX | College email address |
| `password_hash` | VARCHAR(255) | NOT NULL | Bcrypt salted hash (10 rounds) |
| `role` | VARCHAR(50) | DEFAULT 'student' | Role (`student`, `coordinator`, `admin`) |
| `avatar_url` | VARCHAR(255) | NULL | Profile image link |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Account creation timestamp |
| `updated_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Last modified timestamp |

### 2.2 `student_profiles`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Profile primary key |
| `user_id` | INTEGER | UNIQUE, FK `users(id)` ON DELETE CASCADE | 1-to-1 mapping with `users` |
| `department` | VARCHAR(150) | NULL | Major / Academic branch |
| `college` | VARCHAR(200) | NULL | College or institute name |
| `year_of_study`| INTEGER | DEFAULT 3 | 1st to 4th year |
| `bio` | TEXT | NULL | Personal introduction & background |
| `interests` | TEXT | NULL | Comma-separated domain interests |
| `experience_summary` | TEXT | NULL | Prior hackathon / project summary |
| `experience_level` | VARCHAR(50) | DEFAULT 'Intermediate' | `Beginner`, `Intermediate`, `Advanced` |
| `preferred_roles` | TEXT | NULL | Preferred project team roles |
| `weekly_availability` | INTEGER | DEFAULT 10 | Hours available per week |
| `github_url` | VARCHAR(255) | NULL | GitHub profile URL |
| `portfolio_url` | VARCHAR(255) | NULL | Portfolio website URL |

### 2.3 `skills` & `student_skills`
- **`skills`:** Master technical catalog containing standard industry skill names and categories (`Frontend`, `Backend`, `Database`, `AI/ML`, `DevOps`, `Mobile`, `UI/UX`).
- **`student_skills`:** Many-to-many relationship mapping student competencies with specific proficiency tiers (`Beginner`, `Intermediate`, `Advanced`, `Expert`) and years of experience. Compound unique constraint `UNIQUE(user_id, skill_id)` strictly prohibits duplicate entries.

### 2.4 `projects` & `project_required_skills`
- **`projects`:** Stores project title, domain, expected team size, duration, weekly commitment hours, status (`Open`, `In Progress`, `Completed`, `Archived`), and project owner reference.
- **`project_required_skills`:** Links projects to required competencies with minimum required proficiency, importance classification (`Required`, `Preferred`, `Nice to have`), and weight. Compound unique constraint `UNIQUE(project_id, skill_id)`.

### 2.5 `project_members` & `join_requests`
- **`project_members`:** Confirmed team roster. Compound unique constraint `UNIQUE(project_id, user_id)` guarantees no duplicate memberships.
- **`join_requests`:** Application and invitation pipeline with statuses: `pending`, `accepted`, `rejected`. Capacity enforcement logic prevents accepting members when `current_count >= expected_team_size`.
