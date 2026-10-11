import bcrypt from 'bcryptjs';
import { run, get, query, exec } from '../config/db.js';
import { initializeDatabase } from './schema.js';

export async function seedDatabase() {
  console.log('[SEED] Initializing tables...');
  await initializeDatabase();

  // Check if users already exist
  const existingUsers = await get('SELECT COUNT(*) as count FROM users');
  if (existingUsers && existingUsers.count > 0) {
    console.log('[SEED] Database already contains records. Skipping seed.');
    return;
  }

  console.log('[SEED] Inserting skills catalog...');
  const skillsList = [
    { name: 'React', category: 'Frontend' },
    { name: 'Vue.js', category: 'Frontend' },
    { name: 'Angular', category: 'Frontend' },
    { name: 'Next.js', category: 'Frontend' },
    { name: 'TypeScript', category: 'Frontend' },
    { name: 'JavaScript', category: 'Frontend' },
    { name: 'Tailwind CSS', category: 'Frontend' },
    { name: 'HTML5/CSS3', category: 'Frontend' },
    { name: 'Node.js', category: 'Backend' },
    { name: 'Express.js', category: 'Backend' },
    { name: 'Python', category: 'Backend' },
    { name: 'Django', category: 'Backend' },
    { name: 'FastAPI', category: 'Backend' },
    { name: 'Java', category: 'Backend' },
    { name: 'Spring Boot', category: 'Backend' },
    { name: 'Go', category: 'Backend' },
    { name: 'MySQL', category: 'Database' },
    { name: 'PostgreSQL', category: 'Database' },
    { name: 'MongoDB', category: 'Database' },
    { name: 'Redis', category: 'Database' },
    { name: 'SQLite', category: 'Database' },
    { name: 'Machine Learning', category: 'AI/ML' },
    { name: 'Deep Learning', category: 'AI/ML' },
    { name: 'PyTorch', category: 'AI/ML' },
    { name: 'TensorFlow', category: 'AI/ML' },
    { name: 'Natural Language Processing', category: 'AI/ML' },
    { name: 'Computer Vision', category: 'AI/ML' },
    { name: 'Docker', category: 'DevOps' },
    { name: 'Kubernetes', category: 'DevOps' },
    { name: 'AWS', category: 'Cloud' },
    { name: 'CI/CD', category: 'DevOps' },
    { name: 'Git', category: 'DevOps' },
    { name: 'Figma', category: 'UI/UX' },
    { name: 'UI/UX Design', category: 'UI/UX' },
    { name: 'React Native', category: 'Mobile' },
    { name: 'Flutter', category: 'Mobile' }
  ];

  for (const skill of skillsList) {
    await run('INSERT INTO skills (name, category) VALUES (?, ?)', [skill.name, skill.category]);
  }

  // Get skill map
  const allSkills = await query('SELECT id, name FROM skills');
  const skillMap = {};
  allSkills.forEach(s => { skillMap[s.name] = s.id; });

  console.log('[SEED] Creating demo students and accounts...');
  const passwordHash = await bcrypt.hash('password123', 10);

  const demoUsers = [
    {
      name: 'Alice Chen',
      email: 'alice@campus.edu',
      department: 'Computer Science and Engineering',
      college: 'Institute of Technology',
      year: 4,
      bio: 'Full-stack software developer passionate about building reliable cloud web applications and leading collaborative student teams.',
      interests: 'Web Development, Cloud Computing, Distributed Systems',
      experience_summary: 'Built 3 full-stack hackathon projects and interned as a software engineering intern.',
      experience_level: 'Advanced',
      preferred_roles: 'Full Stack Developer, Team Lead, Backend Engineer',
      availability: 15,
      github: 'https://github.com/alice-chen',
      portfolio: 'https://alice-portfolio.dev',
      skills: [
        { name: 'React', prof: 'Advanced', yrs: 2.5 },
        { name: 'Node.js', prof: 'Advanced', yrs: 2.0 },
        { name: 'MySQL', prof: 'Intermediate', yrs: 2.0 },
        { name: 'Docker', prof: 'Intermediate', yrs: 1.5 },
        { name: 'TypeScript', prof: 'Advanced', yrs: 2.0 },
        { name: 'Tailwind CSS', prof: 'Advanced', yrs: 2.0 }
      ]
    },
    {
      name: 'Bob Miller',
      email: 'bob@campus.edu',
      department: 'Artificial Intelligence & Data Science',
      college: 'Institute of Technology',
      year: 3,
      bio: 'Data scientist & ML researcher focusing on applied NLP, predictive analytics, and FastAPI model serving.',
      interests: 'Machine Learning, Natural Language Processing, Data Engineering',
      experience_summary: 'Published 1 paper on sentiment analysis and developed open-source ML pipelines.',
      experience_level: 'Advanced',
      preferred_roles: 'ML Specialist, Data Scientist, Backend Engineer',
      availability: 12,
      github: 'https://github.com/bob-miller',
      portfolio: 'https://bob-ml.io',
      skills: [
        { name: 'Python', prof: 'Expert', yrs: 3.5 },
        { name: 'Machine Learning', prof: 'Advanced', yrs: 2.5 },
        { name: 'PyTorch', prof: 'Advanced', yrs: 2.0 },
        { name: 'Natural Language Processing', prof: 'Advanced', yrs: 2.0 },
        { name: 'FastAPI', prof: 'Intermediate', yrs: 1.5 },
        { name: 'PostgreSQL', prof: 'Intermediate', yrs: 1.5 }
      ]
    },
    {
      name: 'Clara Patel',
      email: 'clara@campus.edu',
      department: 'Information Technology',
      college: 'Institute of Technology',
      year: 3,
      bio: 'UI/UX designer and frontend engineer obsessed with clean micro-interactions, responsive design, and accessibility.',
      interests: 'UI/UX Design, Web Development, Design Systems',
      experience_summary: 'Designed product design systems for 4 collegiate organizations and built frontend in React/Tailwind.',
      experience_level: 'Intermediate',
      preferred_roles: 'UI/UX Designer, Frontend Developer',
      availability: 14,
      github: 'https://github.com/clara-patel',
      portfolio: 'https://claradesign.co',
      skills: [
        { name: 'React', prof: 'Advanced', yrs: 2.0 },
        { name: 'Tailwind CSS', prof: 'Expert', yrs: 2.5 },
        { name: 'Figma', prof: 'Expert', yrs: 3.0 },
        { name: 'UI/UX Design', prof: 'Expert', yrs: 3.0 },
        { name: 'TypeScript', prof: 'Intermediate', yrs: 1.0 },
        { name: 'HTML5/CSS3', prof: 'Expert', yrs: 3.0 }
      ]
    },
    {
      name: 'David Kumar',
      email: 'david@campus.edu',
      department: 'Computer Science and Engineering',
      college: 'Institute of Technology',
      year: 3,
      bio: 'Backend architect focused on relational databases, query optimization, Redis caching, and microservices.',
      interests: 'Backend Architecture, Database Systems, API Design',
      experience_summary: 'Developed REST APIs handling high-throughput student voting systems.',
      experience_level: 'Intermediate',
      preferred_roles: 'Backend Engineer, Database Administrator',
      availability: 12,
      github: 'https://github.com/david-kumar',
      portfolio: '',
      skills: [
        { name: 'Node.js', prof: 'Advanced', yrs: 2.0 },
        { name: 'Express.js', prof: 'Advanced', yrs: 2.0 },
        { name: 'MySQL', prof: 'Expert', yrs: 2.5 },
        { name: 'PostgreSQL', prof: 'Advanced', yrs: 2.0 },
        { name: 'Redis', prof: 'Intermediate', yrs: 1.5 },
        { name: 'Docker', prof: 'Intermediate', yrs: 1.0 }
      ]
    },
    {
      name: 'Eva Zhang',
      email: 'eva@campus.edu',
      department: 'Computer Science and Engineering',
      college: 'Institute of Technology',
      year: 4,
      bio: 'Cross-platform mobile developer with strong cloud deployment skills on AWS and Google Cloud.',
      interests: 'Mobile App, Cloud Computing, IoT / Hardware',
      experience_summary: 'Released 2 mobile apps on Google Play Store with 5K+ downloads.',
      experience_level: 'Advanced',
      preferred_roles: 'Mobile Developer, Cloud Engineer',
      availability: 16,
      github: 'https://github.com/eva-zhang',
      portfolio: 'https://evazhang.me',
      skills: [
        { name: 'React Native', prof: 'Expert', yrs: 3.0 },
        { name: 'Flutter', prof: 'Intermediate', yrs: 1.5 },
        { name: 'TypeScript', prof: 'Advanced', yrs: 2.0 },
        { name: 'AWS', prof: 'Intermediate', yrs: 1.5 },
        { name: 'Node.js', prof: 'Intermediate', yrs: 1.5 }
      ]
    },
    {
      name: 'Frank Gomez',
      email: 'frank@campus.edu',
      department: 'Information Technology',
      college: 'Institute of Technology',
      year: 2,
      bio: 'Enthusiastic sophomore programmer expanding frontend skills and eager to contribute to collaborative web projects.',
      interests: 'Web Development, Open Source',
      experience_summary: 'Completed web dev bootcamp and coursework in data structures.',
      experience_level: 'Beginner',
      preferred_roles: 'Frontend Developer, Quality Assurance',
      availability: 8,
      github: 'https://github.com/frank-gomez',
      portfolio: '',
      skills: [
        { name: 'HTML5/CSS3', prof: 'Intermediate', yrs: 1.0 },
        { name: 'JavaScript', prof: 'Intermediate', yrs: 1.0 },
        { name: 'React', prof: 'Beginner', yrs: 0.5 },
        { name: 'Git', prof: 'Intermediate', yrs: 1.0 }
      ]
    },
    {
      name: 'Grace Hopper',
      email: 'grace@campus.edu',
      department: 'Artificial Intelligence & Data Science',
      college: 'Institute of Technology',
      year: 4,
      bio: 'AI researcher specialized in deep computer vision models, PyTorch, and scalable Python inference.',
      interests: 'AI & Machine Learning, Computer Vision, Deep Learning',
      experience_summary: 'Co-authored computer vision research and won 1st prize in collegiate hackathon.',
      experience_level: 'Advanced',
      preferred_roles: 'AI Specialist, Lead Researcher',
      availability: 14,
      github: 'https://github.com/grace-hopper',
      portfolio: '',
      skills: [
        { name: 'Python', prof: 'Expert', yrs: 3.0 },
        { name: 'PyTorch', prof: 'Expert', yrs: 2.5 },
        { name: 'Computer Vision', prof: 'Advanced', yrs: 2.0 },
        { name: 'Deep Learning', prof: 'Advanced', yrs: 2.5 },
        { name: 'Machine Learning', prof: 'Expert', yrs: 3.0 },
        { name: 'Docker', prof: 'Intermediate', yrs: 1.0 }
      ]
    },
    {
      name: 'Henry Ford',
      email: 'henry@campus.edu',
      department: 'Computer Science and Engineering',
      college: 'Institute of Technology',
      year: 4,
      bio: 'DevOps enthusiast who loves automated CI/CD pipelines, container orchestration, and system reliability.',
      interests: 'DevOps, Cloud Computing, Infrastructure',
      experience_summary: 'Maintains university lab cluster and automated deployment environments.',
      experience_level: 'Advanced',
      preferred_roles: 'DevOps Engineer, Cloud Architect',
      availability: 12,
      github: 'https://github.com/henry-devops',
      portfolio: '',
      skills: [
        { name: 'Docker', prof: 'Expert', yrs: 2.5 },
        { name: 'Kubernetes', prof: 'Intermediate', yrs: 1.5 },
        { name: 'CI/CD', prof: 'Advanced', yrs: 2.0 },
        { name: 'AWS', prof: 'Advanced', yrs: 2.0 },
        { name: 'Go', prof: 'Intermediate', yrs: 1.0 },
        { name: 'Git', prof: 'Expert', yrs: 3.0 }
      ]
    }
  ];

  const userIds = {};

  for (const u of demoUsers) {
    const res = await run(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [u.name, u.email, passwordHash, 'student']
    );
    const userId = res.lastInsertRowid;
    userIds[u.name] = userId;

    await run(
      `INSERT INTO student_profiles 
       (user_id, department, college, year_of_study, bio, interests, experience_summary, experience_level, preferred_roles, weekly_availability, github_url, portfolio_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, u.department, u.college, u.year, u.bio, u.interests, u.experience_summary, u.experience_level, u.preferred_roles, u.availability, u.github, u.portfolio]
    );

    for (const sk of u.skills) {
      const skillId = skillMap[sk.name];
      if (skillId) {
        await run(
          'INSERT INTO student_skills (user_id, skill_id, proficiency, years_experience) VALUES (?, ?, ?, ?)',
          [userId, skillId, sk.prof, sk.yrs]
        );
      }
    }
  }

  console.log('[SEED] Creating sample projects...');

  // Project 1: Alice's Project
  const proj1 = await run(
    `INSERT INTO projects 
     (owner_id, title, description, domain, difficulty_level, expected_team_size, duration_weeks, weekly_commitment_hours, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userIds['Alice Chen'],
      'Smart Campus Navigation & Interactive Hub',
      'An end-to-end web and mobile system helping students navigate campus facilities, find available study spots, and RSVP to campus events in real time.',
      'Web Application',
      'Intermediate',
      4,
      10,
      12,
      'Open'
    ]
  );
  const p1Id = proj1.lastInsertRowid;

  // Add Alice as Project Owner member
  await run('INSERT INTO project_members (project_id, user_id, assigned_role) VALUES (?, ?, ?)', [p1Id, userIds['Alice Chen'], 'Project Lead & Full Stack']);

  // Add required skills for Project 1: React, Node.js, MySQL, UI/UX Design, Docker
  const p1Skills = [
    { name: 'React', prof: 'Advanced', importance: 'Required', weight: 1.2 },
    { name: 'Node.js', prof: 'Intermediate', importance: 'Required', weight: 1.0 },
    { name: 'MySQL', prof: 'Intermediate', importance: 'Required', weight: 1.0 },
    { name: 'UI/UX Design', prof: 'Intermediate', importance: 'Required', weight: 0.9 },
    { name: 'Docker', prof: 'Beginner', importance: 'Preferred', weight: 0.6 }
  ];
  for (const req of p1Skills) {
    if (skillMap[req.name]) {
      await run('INSERT INTO project_required_skills (project_id, skill_id, min_proficiency, importance, weight) VALUES (?, ?, ?, ?, ?)', [p1Id, skillMap[req.name], req.prof, req.importance, req.weight]);
    }
  }

  // Add Project 1 Roles
  await run('INSERT INTO project_roles (project_id, role_name, count_needed, description) VALUES (?, ?, ?, ?)', [p1Id, 'Project Lead', 1, 'Architecture and team coordinator']);
  await run('INSERT INTO project_roles (project_id, role_name, count_needed, description) VALUES (?, ?, ?, ?)', [p1Id, 'UI/UX Designer', 1, 'Figma wireframes and interface components']);
  await run('INSERT INTO project_roles (project_id, role_name, count_needed, description) VALUES (?, ?, ?, ?)', [p1Id, 'Backend Developer', 1, 'Database schema and REST API endpoints']);
  await run('INSERT INTO project_roles (project_id, role_name, count_needed, description) VALUES (?, ?, ?, ?)', [p1Id, 'DevOps Engineer', 1, 'Docker packaging and CI deployment']);

  // Project 2: Bob's Project
  const proj2 = await run(
    `INSERT INTO projects 
     (owner_id, title, description, domain, difficulty_level, expected_team_size, duration_weeks, weekly_commitment_hours, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userIds['Bob Miller'],
      'AI Clinical Diagnostics & X-Ray Screening Assistant',
      'Deep learning assisted triage tool that processes anonymized radiological scans, produces attention heatmaps, and provides explainable diagnostic suggestions.',
      'AI & Machine Learning',
      'Advanced',
      4,
      12,
      14,
      'Open'
    ]
  );
  const p2Id = proj2.lastInsertRowid;

  await run('INSERT INTO project_members (project_id, user_id, assigned_role) VALUES (?, ?, ?)', [p2Id, userIds['Bob Miller'], 'ML Lead & Researcher']);

  const p2Skills = [
    { name: 'Python', prof: 'Advanced', importance: 'Required', weight: 1.2 },
    { name: 'Machine Learning', prof: 'Advanced', importance: 'Required', weight: 1.2 },
    { name: 'Computer Vision', prof: 'Advanced', importance: 'Required', weight: 1.1 },
    { name: 'FastAPI', prof: 'Intermediate', importance: 'Required', weight: 0.9 },
    { name: 'React', prof: 'Intermediate', importance: 'Preferred', weight: 0.8 }
  ];
  for (const req of p2Skills) {
    if (skillMap[req.name]) {
      await run('INSERT INTO project_required_skills (project_id, skill_id, min_proficiency, importance, weight) VALUES (?, ?, ?, ?, ?)', [p2Id, skillMap[req.name], req.prof, req.importance, req.weight]);
    }
  }

  // Project 3: Clara's Project
  const proj3 = await run(
    `INSERT INTO projects 
     (owner_id, title, description, domain, difficulty_level, expected_team_size, duration_weeks, weekly_commitment_hours, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userIds['Clara Patel'],
      'SkillSwap: Peer-to-Peer Academic Mentorship Platform',
      'A community micro-mentoring platform connecting students seeking coding help with peer tutors, featuring real-time collaborative workspace and review badges.',
      'Web Application',
      'Intermediate',
      3,
      8,
      10,
      'Open'
    ]
  );
  const p3Id = proj3.lastInsertRowid;
  await run('INSERT INTO project_members (project_id, user_id, assigned_role) VALUES (?, ?, ?)', [p3Id, userIds['Clara Patel'], 'UI/UX & Frontend Lead']);
  await run('INSERT INTO project_members (project_id, user_id, assigned_role) VALUES (?, ?, ?)', [p3Id, userIds['David Kumar'], 'Backend Engineer']);

  const p3Skills = [
    { name: 'React', prof: 'Intermediate', importance: 'Required', weight: 1.0 },
    { name: 'Node.js', prof: 'Intermediate', importance: 'Required', weight: 1.0 },
    { name: 'MySQL', prof: 'Intermediate', importance: 'Required', weight: 1.0 },
    { name: 'UI/UX Design', prof: 'Intermediate', importance: 'Preferred', weight: 0.8 }
  ];
  for (const req of p3Skills) {
    if (skillMap[req.name]) {
      await run('INSERT INTO project_required_skills (project_id, skill_id, min_proficiency, importance, weight) VALUES (?, ?, ?, ?, ?)', [p3Id, skillMap[req.name], req.prof, req.importance, req.weight]);
    }
  }

  // Seed sample join requests
  await run(
    `INSERT INTO join_requests (project_id, user_id, type, status, proposed_role, message)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      p1Id,
      userIds['Clara Patel'],
      'request',
      'pending',
      'UI/UX Designer',
      'Hi Alice! I love the campus hub idea and would love to design the Figma design system and code the responsive Tailwind components!'
    ]
  );

  // Seed notifications
  await run(
    `INSERT INTO notifications (user_id, title, message, type, link)
     VALUES (?, ?, ?, ?, ?)`,
    [
      userIds['Alice Chen'],
      'New Join Request',
      'Clara Patel requested to join your project "Smart Campus Navigation & Interactive Hub" as UI/UX Designer.',
      'join_request',
      `/projects/${p1Id}/manage`
    ]
  );

  await run(
    `INSERT INTO notifications (user_id, title, message, type, link)
     VALUES (?, ?, ?, ?, ?)`,
    [
      userIds['Clara Patel'],
      'Welcome to SmartTeamFoundation',
      'Your profile has been created! Explore projects or discover teammates matching your skillset.',
      'info',
      '/dashboard'
    ]
  );

  // Seed initial project activity
  await run(
    `INSERT INTO project_activity (project_id, user_id, action_type, description)
     VALUES (?, ?, ?, ?)`,
    [p1Id, userIds['Alice Chen'], 'project_created', 'Alice Chen created the project "Smart Campus Navigation & Interactive Hub"']
  );
  await run(
    `INSERT INTO project_activity (project_id, user_id, action_type, description)
     VALUES (?, ?, ?, ?)`,
    [p2Id, userIds['Bob Miller'], 'project_created', 'Bob Miller created the project "AI Clinical Diagnostics & X-Ray Screening Assistant"']
  );

  console.log('[SEED] Demo seed completed successfully!');
}

// Allow direct CLI execution
if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase().then(() => {
    console.log('[SEED] Done.');
    process.exit(0);
  }).catch(err => {
    console.error('[SEED] Error:', err);
    process.exit(1);
  });
}

export default seedDatabase;
