export interface CandidateProfile {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  location: string;
  currentRole: string;
  company: string;
  targetRole: string;
  targetJobId: string;
  appliedDate: string;
  status: 'submitted' | 'parsed' | 'assessed' | 'review' | 'shortlisted' | 'interview' | 'selected' | 'rejected';
  totalScore: number;
  breakdown: {
    skills: number;
    experience: number;
    projects: number;
    qualifications: number;
  };
  skills: {
    name: string;
    verified: boolean;
    excerpt: string;
    similarity: number;
  }[];
  gaps: {
    skill: string;
    status: 'missing_evidence' | 'confirmed_absent';
    note: string;
  }[];
  experience: {
    title: string;
    company: string;
    period: string;
    years: number;
    summary: string;
    excerpt: string;
  }[];
  projects: {
    name: string;
    tech: string[];
    description: string;
    excerpt: string;
  }[];
  education: {
    degree: string;
    institution: string;
    year: string;
    excerpt: string;
  }[];
  summary: string;
  learningSuggestions: string[];
  unsupportedClaims: string[];
}

export interface JobRequisition {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'full-time' | 'contract' | 'part-time';
  salary: string;
  experienceYears: number;
  status: 'open' | 'closed';
  applicantCount: number;
  description: string;
  requiredSkills: { name: string; importance: number; required: boolean }[];
  qualifications: string;
}

export interface InterviewScheduleItem {
  id: string;
  candidateId: string;
  candidateName: string;
  jobTitle: string;
  interviewer: string;
  date: string;
  time: string;
  durationMin: number;
  type: 'technical' | 'hr' | 'managerial';
  hasConflict?: boolean;
  conflictReason?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  feedback?: {
    technical: number;
    communication: number;
    problemSolving: number;
    recommendation: 'strong_hire' | 'hire' | 'hold' | 'no_hire';
    notes: string;
  };
}

export interface InterviewQuestionItem {
  id: string;
  candidateId: string;
  category: 'role' | 'project';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  question: string;
  answerGuide: string;
  projectContext?: string;
}

export const MOCK_JOBS: JobRequisition[] = [
  {
    id: 'job-1',
    title: 'Senior Backend Engineer',
    department: 'Core Infrastructure',
    location: 'San Francisco, CA (Hybrid)',
    type: 'full-time',
    salary: '$165,000 - $195,000',
    experienceYears: 4,
    status: 'open',
    applicantCount: 42,
    description:
      'We are looking for a Senior Backend Engineer to architect high-throughput distributed microservices. You will scale our Postgres data tier, implement asynchronous job queues with Redis and Celery, and build production containerized workloads using Docker and Kubernetes.',
    requiredSkills: [
      { name: 'Python', importance: 5, required: true },
      { name: 'Django', importance: 4, required: true },
      { name: 'PostgreSQL', importance: 5, required: true },
      { name: 'Docker', importance: 4, required: true },
      { name: 'Kubernetes', importance: 3, required: false },
      { name: 'Redis', importance: 4, required: false },
    ],
    qualifications: "Bachelor's degree in Computer Science, Software Engineering, or equivalent practical experience.",
  },
  {
    id: 'job-2',
    title: 'Lead AI / ML Systems Engineer',
    department: 'Applied Intelligence',
    location: 'Remote (US & Canada)',
    type: 'full-time',
    salary: '$180,000 - $225,000',
    experienceYears: 5,
    status: 'open',
    applicantCount: 28,
    description:
      'Lead our vector embedding retrieval pipelines and fine-tune open-source LLM architectures. You will orchestrate GPU clusters, build low-latency RAG systems with pgvector, and deploy model inference servers using FastAPI and PyTorch.',
    requiredSkills: [
      { name: 'Python', importance: 5, required: true },
      { name: 'PyTorch', importance: 5, required: true },
      { name: 'pgvector', importance: 4, required: true },
      { name: 'FastAPI', importance: 4, required: true },
      { name: 'Hugging Face', importance: 3, required: false },
      { name: 'CUDA', importance: 3, required: false },
    ],
    qualifications: "Master's or Ph.D. in Computer Science, Machine Learning, or 5+ years of production deep learning deployment.",
  },
  {
    id: 'job-3',
    title: 'Full-Stack Next.js Architect',
    department: 'Product Engineering',
    location: 'New York, NY (On-site)',
    type: 'full-time',
    salary: '$150,000 - $185,000',
    experienceYears: 3,
    status: 'open',
    applicantCount: 35,
    description:
      'Design modern, lightning-fast web applications using Next.js App Router, React Server Components, TypeScript, and Tailwind CSS. Integrate real-time WebSockets and Supabase Postgres backend.',
    requiredSkills: [
      { name: 'TypeScript', importance: 5, required: true },
      { name: 'Next.js', importance: 5, required: true },
      { name: 'React', importance: 5, required: true },
      { name: 'Tailwind CSS', importance: 4, required: true },
      { name: 'Supabase', importance: 3, required: false },
    ],
    qualifications: 'Demonstrated history of shipping production Next.js applications with optimal Web Vitals.',
  },
];

export const MOCK_CANDIDATES: CandidateProfile[] = [
  {
    id: 'cand-1',
    name: 'Elena Rostova',
    avatar: 'ER',
    email: 'elena.rostova@techmail.io',
    phone: '+1 (415) 892-4410',
    location: 'San Francisco, CA',
    currentRole: 'Staff Distributed Systems Engineer',
    company: 'Apex Cloud Solutions',
    targetRole: 'Senior Backend Engineer',
    targetJobId: 'job-1',
    appliedDate: '2 hours ago',
    status: 'review',
    totalScore: 94,
    breakdown: {
      skills: 96,
      experience: 92,
      projects: 95,
      qualifications: 90,
    },
    skills: [
      {
        name: 'Python',
        verified: true,
        excerpt: 'Architected high-throughput Python asynchronous pipelines processing 45k transactions/second with sub-50ms p99 latency.',
        similarity: 0.98,
      },
      {
        name: 'Django',
        verified: true,
        excerpt: 'Maintained monolithic Django REST framework backend with automated unit testing and token-based authentication.',
        similarity: 0.95,
      },
      {
        name: 'PostgreSQL',
        verified: true,
        excerpt: 'Optimized PostgreSQL connection pooling with PgBouncer, tuned query indexes, and executed zero-downtime partitioning across 4TB datasets.',
        similarity: 0.97,
      },
      {
        name: 'Docker',
        verified: true,
        excerpt: 'Containerized 14 internal microservices with multi-stage Docker builds reducing image sizes from 1.4GB to 140MB.',
        similarity: 0.92,
      },
      {
        name: 'Redis',
        verified: true,
        excerpt: 'Designed Redis caching layer and pub/sub message brokers that diminished primary database read load by 68%.',
        similarity: 0.91,
      },
    ],
    gaps: [
      {
        skill: 'Kubernetes',
        status: 'missing_evidence',
        note: 'Candidate mentions Docker and Helm deployments, but production Kubernetes cluster administration is not explicitly documented in work experience.',
      },
    ],
    experience: [
      {
        title: 'Senior Backend Engineer',
        company: 'Apex Cloud Solutions',
        period: '2021 — Present (3.5 yrs)',
        years: 3.5,
        summary: 'Led the core banking integration team, architected distributed Python services, and migrated legacy SQL schemas to PostgreSQL with zero data loss.',
        excerpt: 'Led team of 6 engineers redesigning core transaction ledger using Python, Django, and PostgreSQL.',
      },
      {
        title: 'Software Engineer II',
        company: 'Stratum Data Systems',
        period: '2019 — 2021 (2 yrs)',
        years: 2.0,
        summary: 'Developed REST APIs in Django, optimized database queries, and implemented Redis caching systems.',
        excerpt: 'Engineered backend microservices in Python for real-time telemetry analytics.',
      },
    ],
    projects: [
      {
        name: 'LedgerFlow: Distributed Financial Ledger',
        tech: ['Python', 'Django', 'PostgreSQL', 'Docker', 'Redis'],
        description: 'Open-source distributed double-entry bookkeeping engine with transactional isolation and audit trails.',
        excerpt: 'LedgerFlow guarantees ACID compliance using PostgreSQL row-level locks and Redis distributed locks.',
      },
      {
        name: 'KubeSentinel: Container Health Daemon',
        tech: ['Python', 'Docker', 'Prometheus'],
        description: 'Lightweight sidecar container for monitoring microservice crash-loops and automated memory throttling.',
        excerpt: 'Wrote autonomous watchdog daemon that reduced OOM container crashes by 80%.',
      },
    ],
    education: [
      {
        degree: 'B.S. in Computer Science',
        institution: 'University of California, Berkeley',
        year: '2019',
        excerpt: 'B.S. Computer Science, UC Berkeley, Honors in Algorithms & Distributed Systems.',
      },
    ],
    summary:
      'Elena demonstrates exceptional mastery of Python, PostgreSQL, and distributed system internals. She exceeds the required minimum experience with 5.5 years of verifiable production engineering. Excellent candidate for senior infrastructure responsibilities.',
    learningSuggestions: [
      'Evaluate deep Kubernetes cluster debugging (CNI networking, ingress controllers) during technical round.',
      'Probe experience with distributed tracing tools like OpenTelemetry.',
    ],
    unsupportedClaims: [],
  },
  {
    id: 'cand-2',
    name: 'Marcus Vance',
    avatar: 'MV',
    email: 'marcus.vance@devstack.org',
    phone: '+1 (206) 554-1982',
    location: 'Seattle, WA',
    currentRole: 'Backend Engineer',
    company: 'Northwest Cloud Labs',
    targetRole: 'Senior Backend Engineer',
    targetJobId: 'job-1',
    appliedDate: '5 hours ago',
    status: 'shortlisted',
    totalScore: 88,
    breakdown: {
      skills: 89,
      experience: 85,
      projects: 90,
      qualifications: 88,
    },
    skills: [
      {
        name: 'Python',
        verified: true,
        excerpt: '4+ years building production backend microservices in Python with asynchronous event loops.',
        similarity: 0.94,
      },
      {
        name: 'PostgreSQL',
        verified: true,
        excerpt: 'Managed PostgreSQL instances, created complex CTE queries and database backup automation.',
        similarity: 0.91,
      },
      {
        name: 'Docker',
        verified: true,
        excerpt: 'Wrote Dockerfiles and integrated continuous deployment pipelines with GitHub Actions.',
        similarity: 0.88,
      },
      {
        name: 'Redis',
        verified: true,
        excerpt: 'Utilized Redis sorted sets for leaderboard computations and transient session tokens.',
        similarity: 0.85,
      },
    ],
    gaps: [
      {
        skill: 'Django',
        status: 'missing_evidence',
        note: 'Extensive FastAPI and Flask experience evidenced, but resume contains no explicit mention of Django ORM or Django admin.',
      },
      {
        skill: 'Kubernetes',
        status: 'confirmed_absent',
        note: 'Candidate stated in summary that deployment orchestrations were managed by a dedicated DevOps team without direct K8s authoring.',
      },
    ],
    experience: [
      {
        title: 'Backend Engineer',
        company: 'Northwest Cloud Labs',
        period: '2020 — Present (4 yrs)',
        years: 4.0,
        summary: 'Built API endpoints, maintained PostgreSQL databases, and orchestrated Docker container environments.',
        excerpt: 'Developed REST APIs in Python for automated fleet logistics.',
      },
    ],
    projects: [
      {
        name: 'FleetPulse: Real-time Telematics',
        tech: ['Python', 'PostgreSQL', 'Docker', 'Redis'],
        description: 'Scalable IoT ingest service processing GPS coordinates from 10,000 delivery vehicles.',
        excerpt: 'Engineered ingest layer using Python async sockets writing to PostgreSQL.',
      },
    ],
    education: [
      {
        degree: 'B.S. in Software Engineering',
        institution: 'University of Washington',
        year: '2020',
        excerpt: 'B.S. Software Engineering, University of Washington.',
      },
    ],
    summary:
      'Marcus possesses solid Python backend skills with 4 years of hands-on experience and verified containerized deployments. Minor gap in Django framework specifics which should easily transition from his FastAPI background.',
    learningSuggestions: [
      'Assess familiarity with Django ORM migration workflows vs SQLAlchemy.',
    ],
    unsupportedClaims: [],
  },
  {
    id: 'cand-3',
    name: 'Amina Al-Mansoor',
    avatar: 'AA',
    email: 'amina.mansoor@ai-research.de',
    phone: '+49 30 9182 3441',
    location: 'Berlin, Germany (Willing to relocate)',
    currentRole: 'Senior Machine Learning Specialist',
    company: 'NeuroSynthetics GmbH',
    targetRole: 'Lead AI / ML Systems Engineer',
    targetJobId: 'job-2',
    appliedDate: 'Yesterday',
    status: 'interview',
    totalScore: 96,
    breakdown: {
      skills: 98,
      experience: 94,
      projects: 97,
      qualifications: 95,
    },
    skills: [
      {
        name: 'Python',
        verified: true,
        excerpt: 'Engineered high-performance neural network training suites in Python across multi-GPU SLURM clusters.',
        similarity: 0.99,
      },
      {
        name: 'PyTorch',
        verified: true,
        excerpt: 'Implemented custom PyTorch transformer attention mechanisms with FlashAttention kernels and tensor parallel inference.',
        similarity: 0.98,
      },
      {
        name: 'pgvector',
        verified: true,
        excerpt: 'Deployed enterprise hybrid search combining PostgreSQL pgvector cosine similarity with BM25 full-text rankers.',
        similarity: 0.95,
      },
      {
        name: 'FastAPI',
        verified: true,
        excerpt: 'Served production inference endpoints with FastAPI, streaming responses, and Pydantic validation handling 800 req/sec.',
        similarity: 0.94,
      },
    ],
    gaps: [],
    experience: [
      {
        title: 'Senior ML Systems Engineer',
        company: 'NeuroSynthetics GmbH',
        period: '2019 — Present (5.5 yrs)',
        years: 5.5,
        summary: 'Architected vector search RAG systems, managed H100 GPU clusters, and published 3 papers on efficient transformer quantization.',
        excerpt: 'Led AI infrastructure team serving billions of daily embedding queries.',
      },
    ],
    projects: [
      {
        name: 'VectorScale: Low-Latency Embedding Engine',
        tech: ['PyTorch', 'pgvector', 'FastAPI', 'CUDA'],
        description: 'Scalable similarity engine using hierarchical quantized indices and pgvector.',
        excerpt: 'Benchmarked sub-15ms vector retrieval across 20M enterprise documents.',
      },
    ],
    education: [
      {
        degree: 'M.S. in Artificial Intelligence',
        institution: 'Technical University of Munich (TUM)',
        year: '2019',
        excerpt: 'M.S. Informatics & AI, Technical University of Munich (TUM).',
      },
    ],
    summary:
      'Outstanding, premier-tier candidate for the Lead AI role. Verifiable mastery of PyTorch, pgvector, and FastAPI with extensive real-world model deployment experience.',
    learningSuggestions: ['Explore architectural tradeoffs regarding speculative decoding vs model distillation.'],
    unsupportedClaims: [],
  },
  {
    id: 'cand-4',
    name: 'David Chen',
    avatar: 'DC',
    email: 'david.chen@modernweb.dev',
    phone: '+1 (512) 349-8802',
    location: 'Austin, TX',
    currentRole: 'Senior Frontend Developer',
    company: 'Quantum Canvas Co.',
    targetRole: 'Full-Stack Next.js Architect',
    targetJobId: 'job-3',
    appliedDate: '1 day ago',
    status: 'shortlisted',
    totalScore: 91,
    breakdown: {
      skills: 93,
      experience: 88,
      projects: 94,
      qualifications: 89,
    },
    skills: [
      {
        name: 'Next.js',
        verified: true,
        excerpt: 'Built enterprise portal using Next.js 14 App Router, Server Actions, and partial prerendering with 100/100 Lighthouse score.',
        similarity: 0.98,
      },
      {
        name: 'TypeScript',
        verified: true,
        excerpt: 'Strict TypeScript design across monorepo with Zod schema validation and shared RPC interfaces.',
        similarity: 0.96,
      },
      {
        name: 'React',
        verified: true,
        excerpt: '7+ years deeply familiar with React concurrent features, transitions, and component lifecycle optimization.',
        similarity: 0.95,
      },
      {
        name: 'Tailwind CSS',
        verified: true,
        excerpt: 'Authored company design token system using Tailwind CSS and Radix UI primitives.',
        similarity: 0.94,
      },
    ],
    gaps: [
      {
        skill: 'Supabase',
        status: 'missing_evidence',
        note: 'Candidate has strong raw PostgreSQL and Firebase experience, but direct Supabase Auth/Storage SDK integration is unevidenced.',
      },
    ],
    experience: [
      {
        title: 'Senior Frontend Architect',
        company: 'Quantum Canvas Co.',
        period: '2021 — Present (3.5 yrs)',
        years: 3.5,
        summary: 'Spearheaded migration of legacy client SPA to Next.js App Router, slashing initial page load from 3.2s to 640ms.',
        excerpt: 'Architected Next.js enterprise analytics dashboard used by 250,000 monthly active users.',
      },
    ],
    projects: [
      {
        name: 'HyperGrid: Data Grid Component Library',
        tech: ['Next.js', 'TypeScript', 'Tailwind CSS', 'React'],
        description: 'Virtual-scrolling data table with inline editing, keyboard navigation, and zero dependencies.',
        excerpt: 'HyperGrid renders 100,000 rows at consistent 60fps.',
      },
    ],
    education: [
      {
        degree: 'B.S. in Computer Science',
        institution: 'UT Austin',
        year: '2020',
        excerpt: 'B.S. Computer Science, University of Texas at Austin.',
      },
    ],
    summary:
      'Premier Next.js and TypeScript frontend specialist with high aesthetic taste and deep performance awareness. Highly recommended for lead UI architecture.',
    learningSuggestions: ['Clarify database schema migration and RLS policy experience during architectural round.'],
    unsupportedClaims: [],
  },
  {
    id: 'cand-5',
    name: 'Sophia Patel',
    avatar: 'SP',
    email: 'sophia.patel@dataforge.io',
    phone: '+1 (312) 670-4491',
    location: 'Chicago, IL',
    currentRole: 'Backend Developer',
    company: 'Fintech Forge Systems',
    targetRole: 'Senior Backend Engineer',
    targetJobId: 'job-1',
    appliedDate: '3 days ago',
    status: 'assessed',
    totalScore: 78,
    breakdown: {
      skills: 79,
      experience: 74,
      projects: 82,
      qualifications: 80,
    },
    skills: [
      {
        name: 'Python',
        verified: true,
        excerpt: 'Wrote data parsing scripts in Python 3.9 and integrated pandas dataframes for CSV ingestion.',
        similarity: 0.88,
      },
      {
        name: 'Django',
        verified: true,
        excerpt: 'Maintained internal Django web portal for compliance reporting.',
        similarity: 0.82,
      },
      {
        name: 'PostgreSQL',
        verified: true,
        excerpt: 'Wrote SQL select queries and basic joins in PostgreSQL.',
        similarity: 0.80,
      },
    ],
    gaps: [
      {
        skill: 'Docker',
        status: 'missing_evidence',
        note: 'Resume mentions working in Linux environments, but containerization, multi-stage builds, or Dockerfile creation are completely absent.',
      },
      {
        skill: 'Kubernetes',
        status: 'confirmed_absent',
        note: 'Confirmed absent: candidate has not worked with container orchestration.',
      },
    ],
    experience: [
      {
        title: 'Backend Developer',
        company: 'Fintech Forge Systems',
        period: '2022 — Present (2.2 yrs)',
        years: 2.2,
        summary: 'Built compliance reporting endpoints and database export scripts in Python and Django.',
        excerpt: 'Maintained backend compliance tools using Django.',
      },
    ],
    projects: [
      {
        name: 'AuditTrail Parser',
        tech: ['Python', 'Django', 'PostgreSQL'],
        description: 'Internal ETL script parsing payment audit logs into relational tables.',
        excerpt: 'ETL script converting flat transaction files into PostgreSQL.',
      },
    ],
    education: [
      {
        degree: 'B.S. in Information Systems',
        institution: 'University of Illinois Urbana-Champaign',
        year: '2022',
        excerpt: 'B.S. Information Systems, UIUC.',
      },
    ],
    summary:
      'Solid junior-to-mid developer with 2.2 years of Python and Django exposure. Falls below the required 4-year senior threshold and lacks containerization credentials for Senior Backend Engineer.',
    learningSuggestions: ['Explore junior-to-mid backend positions or recommend containerization certification.'],
    unsupportedClaims: [],
  },
  {
    id: 'cand-6',
    name: 'Liam O’Connor',
    avatar: 'LO',
    email: 'liam.oconnor@dublincloud.ie',
    phone: '+353 1 496 0192',
    location: 'Dublin, Ireland',
    currentRole: 'Cloud Infrastructure Engineer',
    company: 'Celtica Cloud Services',
    targetRole: 'Senior Backend Engineer',
    targetJobId: 'job-1',
    appliedDate: '4 days ago',
    status: 'submitted',
    totalScore: 71,
    breakdown: {
      skills: 70,
      experience: 72,
      projects: 70,
      qualifications: 75,
    },
    skills: [
      {
        name: 'Docker',
        verified: true,
        excerpt: 'Built Docker base images and managed container registry lifecycle.',
        similarity: 0.90,
      },
      {
        name: 'PostgreSQL',
        verified: true,
        excerpt: 'Administered managed AWS RDS PostgreSQL instances, backups, and failovers.',
        similarity: 0.85,
      },
    ],
    gaps: [
      {
        skill: 'Python',
        status: 'missing_evidence',
        note: 'Candidate has strong Bash and Golang credentials, but Python application development is limited to automation scripts.',
      },
      {
        skill: 'Django',
        status: 'confirmed_absent',
        note: 'Candidate has never developed in Django.',
      },
    ],
    experience: [
      {
        title: 'Infrastructure Engineer',
        company: 'Celtica Cloud Services',
        period: '2021 — Present (3 yrs)',
        years: 3.0,
        summary: 'Cloud infrastructure provisioning and database maintenance.',
        excerpt: 'Provisioned cloud resources and automated database maintenance.',
      },
    ],
    projects: [
      {
        name: 'AutoBackup Daemon',
        tech: ['Docker', 'PostgreSQL', 'Bash'],
        description: 'Automated script snapshots for cloud relational databases.',
        excerpt: 'Shell scripts orchestrating automated PostgreSQL backup schedules.',
      },
    ],
    education: [
      {
        degree: 'B.Sc. in Computing',
        institution: 'Trinity College Dublin',
        year: '2021',
        excerpt: 'B.Sc. in Computing, Trinity College Dublin.',
      },
    ],
    summary:
      'Strong DevOps and database operations background, but lacks the core application-layer Python and Django engineering depth required for this role.',
    learningSuggestions: ['Consider for Cloud DevOps / Platform Infrastructure requisitions instead.'],
    unsupportedClaims: [],
  },
];

export const MOCK_INTERVIEWS: InterviewScheduleItem[] = [
  {
    id: 'int-1',
    candidateId: 'cand-1',
    candidateName: 'Elena Rostova',
    jobTitle: 'Senior Backend Engineer',
    interviewer: 'Alex Morgan (Engineering Director)',
    date: '2026-11-06',
    time: '10:00 AM - 10:45 AM',
    durationMin: 45,
    type: 'technical',
    status: 'scheduled',
  },
  {
    id: 'int-2',
    candidateId: 'cand-3',
    candidateName: 'Amina Al-Mansoor',
    jobTitle: 'Lead AI / ML Systems Engineer',
    interviewer: 'Dr. Sarah Lin (Head of AI)',
    date: '2026-11-06',
    time: '02:00 PM - 02:45 PM',
    durationMin: 45,
    type: 'technical',
    hasConflict: true,
    conflictReason: 'Double booking: Dr. Sarah Lin has "Architecture Sync" on calendar at 02:00 PM.',
    status: 'scheduled',
  },
  {
    id: 'int-3',
    candidateId: 'cand-2',
    candidateName: 'Marcus Vance',
    jobTitle: 'Senior Backend Engineer',
    interviewer: 'Jordan Reed (Lead Architect)',
    date: '2026-11-07',
    time: '11:30 AM - 12:15 PM',
    durationMin: 45,
    type: 'technical',
    status: 'scheduled',
  },
  {
    id: 'int-4',
    candidateId: 'cand-4',
    candidateName: 'David Chen',
    jobTitle: 'Full-Stack Next.js Architect',
    interviewer: 'Rachel Kim (VP of Engineering)',
    date: '2026-11-08',
    time: '04:00 PM - 04:45 PM',
    durationMin: 45,
    type: 'managerial',
    status: 'scheduled',
  },
];

export const MOCK_QUESTIONS: InterviewQuestionItem[] = [
  {
    id: 'q-1',
    candidateId: 'cand-1',
    category: 'role',
    difficulty: 'advanced',
    question: 'How would you architect a zero-downtime schema migration on a 4TB PostgreSQL table undergoing 10,000 writes/sec?',
    answerGuide:
      'Candidate should mention adding new columns as nullable, dual-writing via triggers or application layer, backfilling in chunks with batch sleeps to avoid lock contention, and cutting over with an index build CONCURRENTLY before dropping old columns.',
  },
  {
    id: 'q-2',
    candidateId: 'cand-1',
    category: 'project',
    difficulty: 'advanced',
    projectContext: 'LedgerFlow: Distributed Financial Ledger',
    question: 'In your LedgerFlow project, how do you prevent distributed deadlocks when multiple concurrent transfers access the same pair of accounts?',
    answerGuide:
      'Candidate should explain acquiring row locks in a strictly deterministic order (e.g. sorted by account UUID ascending) to eliminate circular lock dependencies across transactional threads.',
  },
  {
    id: 'q-3',
    candidateId: 'cand-1',
    category: 'role',
    difficulty: 'intermediate',
    question: 'Explain the difference between Redis connection pooling and PostgreSQL PgBouncer in an asynchronous Python worker fleet.',
    answerGuide:
      'Candidate should articulate that Redis is single-threaded in-memory with lightweight multiplexed connections, while PostgreSQL spawns OS processes per connection where PgBouncer transaction pooling prevents backend resource exhaustion.',
  },
  {
    id: 'q-4',
    candidateId: 'cand-3',
    category: 'project',
    difficulty: 'advanced',
    projectContext: 'VectorScale: Low-Latency Embedding Engine',
    question: 'In VectorScale, what trade-offs did you encounter between HNSW index build time and pgvector IVFFlat recall rates for high-dimensional vectors?',
    answerGuide:
      'Candidate should highlight that HNSW provides superior recall with zero training steps at the cost of higher RAM consumption, whereas IVFFlat requires prior clustering centroids and experiences recall drop-off if data drifts from training distributions.',
  },
];
