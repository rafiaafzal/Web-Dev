const SKILL_ALIASES: Record<string, string> = {
  // Languages
  js: 'JavaScript',
  javascript: 'JavaScript',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  py: 'Python',
  py3: 'Python',
  python: 'Python',
  python3: 'Python',
  golang: 'Go',
  go: 'Go',
  rust: 'Rust',
  java: 'Java',
  c: 'C',
  'c++': 'C++',
  cpp: 'C++',
  'c#': 'C#',
  csharp: 'C#',
  ruby: 'Ruby',
  php: 'PHP',
  swift: 'Swift',
  kotlin: 'Kotlin',
  dart: 'Dart',
  html: 'HTML',
  html5: 'HTML',
  css: 'CSS',
  css3: 'CSS',
  sql: 'SQL',
  nosql: 'NoSQL',

  // Frameworks & Runtimes
  node: 'Node.js',
  nodejs: 'Node.js',
  'node.js': 'Node.js',
  react: 'React',
  reactjs: 'React',
  'react.js': 'React',
  next: 'Next.js',
  nextjs: 'Next.js',
  'next.js': 'Next.js',
  vue: 'Vue',
  vuejs: 'Vue',
  'vue.js': 'Vue',
  angular: 'Angular',
  angularjs: 'Angular',
  django: 'Django',
  flask: 'Flask',
  fastapi: 'FastAPI',
  express: 'Express',
  expressjs: 'Express',
  'express.js': 'Express',
  spring: 'Spring Boot',
  springboot: 'Spring Boot',
  'spring boot': 'Spring Boot',
  rails: 'Ruby on Rails',
  'ruby on rails': 'Ruby on Rails',
  laravel: 'Laravel',
  tailwind: 'Tailwind CSS',
  tailwindcss: 'Tailwind CSS',

  // Databases & Storage
  postgres: 'PostgreSQL',
  postgresql: 'PostgreSQL',
  pgsql: 'PostgreSQL',
  mysql: 'MySQL',
  mongodb: 'MongoDB',
  mongo: 'MongoDB',
  redis: 'Redis',
  sqlite: 'SQLite',
  supabase: 'Supabase',
  dynamodb: 'DynamoDB',
  cassandra: 'Cassandra',

  // DevOps & Cloud
  docker: 'Docker',
  k8s: 'Kubernetes',
  kubernetes: 'Kubernetes',
  aws: 'AWS',
  'amazon web services': 'AWS',
  gcp: 'GCP',
  'google cloud': 'GCP',
  'google cloud platform': 'GCP',
  azure: 'Azure',
  git: 'Git',
  github: 'Git',
  gitlab: 'Git',
  cicd: 'CI/CD',
  'ci/cd': 'CI/CD',
  linux: 'Linux',
  terraform: 'Terraform',
  ansible: 'Ansible',
  graphql: 'GraphQL',
  rest: 'REST',
  'rest api': 'REST',
  restful: 'REST',

  // AI & Data
  pandas: 'Pandas',
  numpy: 'NumPy',
  pytorch: 'PyTorch',
  tensorflow: 'TensorFlow',
  tf: 'TensorFlow',
  scikit: 'Scikit-Learn',
  'scikit-learn': 'Scikit-Learn',
  sklearn: 'Scikit-Learn',
};

export function normalizeSkill(name: string): string {
  if (!name) return '';
  const trimmed = name.trim();
  const lower = trimmed.toLowerCase();

  // Check alias map
  if (SKILL_ALIASES[lower]) {
    return SKILL_ALIASES[lower];
  }

  // Common pattern replacements
  if (lower === 'postgres' || lower.startsWith('postgres')) return 'PostgreSQL';
  if (lower === 'mongo' || lower.startsWith('mongo')) return 'MongoDB';

  // Capitalize nicely if not in alias map
  return trimmed;
}

export function normalizeSkills(skills: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const s of skills) {
    const normalized = normalizeSkill(s);
    if (!normalized) continue;
    const key = normalized.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(normalized);
    }
  }

  return result;
}
