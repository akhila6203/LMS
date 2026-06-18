// Public course catalog data — used by the public Home page and student pages.

// Sample video
// export const SAMPLE_VIDEO_URL =
//   "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
const sampleVideos = [
  { title: "Introduction", duration: "4:32", url: "https://cdn.pixabay.com/video/2019/03/21/22190-326722735_large.mp4" },
  { title: "Setup", duration: "6:10", url: "https://media.istockphoto.com/id/1665354820/video/leader-presentation-and-speaker-hands-at-work-with-office-crowd-and-seminar-at-workshop-with.mp4?s=mp4-640x640-is&k=20&c=vgTyhihA7bJgxxnq1zzKvdmoJd_mC0jOufaIcNSZK3c=" },
  { title: "Basics", duration: "10:20", url: "https://cdn.pixabay.com/video/2016/09/21/5456-183788693_medium.mp4" },
  { title: "Deep Dive", duration: "12:45", url: "https://media.istockphoto.com/id/2166590620/video/sports-coach-and-person-with-strategy-on-whiteboard-for-football-tactic-and-gameplay-solution.mp4?s=mp4-640x640-is&k=20&c=psT6lQaYIGNsYzveUZ57yQFDzHQeUemt9X3XalWbgeM=" },
  { title: "Project Start", duration: "15:00", url: "https://media.istockphoto.com/id/956243324/video/math-formulas-loop.mp4?s=mp4-640x640-is&k=20&c=ds00t9ZFqr-p18vlsWfh0EJnTn_SqZ28hbcnCe-Hvco=" },
  { title: "Project Build", duration: "18:30", url: "https://cdn.pixabay.com/video/2022/08/05/126830-737028186_large.mp4" },
  { title: "Testing", duration: "9:40", url: "https://cdn.pixabay.com/video/2018/09/26/18437-292228569_large.mp4" },
  { title: "Deployment", duration: "11:25", url: "https://cdn.pixabay.com/video/2023/05/05/161739-824152752_large.mp4" },
  { title: "Final Summary", duration: "5:50", url: "https://media.istockphoto.com/id/452649739/video/light-bulb-whiteboard-animation.mp4?s=mp4-640x640-is&k=20&c=zRhebagYG-LPT3bqUzGyKByv3D04ACQihvACC9jfqik=" }
];
// ✅ REMOVED TYPE
// export type CatalogCourse = {...}

/** School class levels (grades 1–9) + custom via "Others" */
export const CLASS_OPTIONS = [
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
];

/** Classes 1–9 for materials upload */
export const MATERIAL_CLASS_OPTIONS = [...CLASS_OPTIONS];

/** Schools for student enrollment — populated by admin via Add / bulk import */
export const SCHOOL_OPTIONS = [];

/** Primary subjects (Class 1–5) */
export const PRIMARY_SUBJECT_OPTIONS = [
  "Telugu",
  "Hindi",
  "English",
  "Science",
  "Maths",
  "Social",
  "Computer Science",
  "General",
];

/** Higher subjects (Class 6–9) */
export const HIGHER_SUBJECT_OPTIONS = [
  "Telugu",
  "Hindi",
  "English",
  "Maths",
  "Physics",
  "Biology",
  "Chemistry",
  "Social",
  "Computer Science",
  "General",
];

const CLASS_NUMBER = (classLevel = "") => {
  const match = String(classLevel).match(/(\d+)/);
  return match ? Number(match[1]) : 0;
};

/** Subjects shown when admin picks a class (Class 1–5 vs 6–9) */
export function getSubjectsForClass(classLevel) {
  const n = CLASS_NUMBER(classLevel);
  if (n >= 6) return [...HIGHER_SUBJECT_OPTIONS];
  if (n >= 1) return [...PRIMARY_SUBJECT_OPTIONS];
  return [...PRIMARY_SUBJECT_OPTIONS, ...HIGHER_SUBJECT_OPTIONS.filter(
    (s) => !PRIMARY_SUBJECT_OPTIONS.includes(s)
  )];
}

/** @deprecated use getSubjectsForClass(classLevel) */
export const SUBJECT_OPTIONS = PRIMARY_SUBJECT_OPTIONS;

/** Class is stored as category; subject as subCategory */
export const CATEGORIES = ["All", ...CLASS_OPTIONS];

export const CATEGORY_TABS = Object.fromEntries(
  CLASS_OPTIONS.map((cls) => [
    cls,
    [`All ${cls}`, ...getSubjectsForClass(cls)],
  ])
);

export const HOME_NAV_ITEMS = ["All", ...CLASS_OPTIONS];

const rawCatalog = [
  {
    id: "c1",
    title: "AI Coder: Vibe Coder to Agentic Engineer",
    category: "Development",
    subCategory: "Programming",
    instructor: "Sarah Chen",
    rating: 4.8,
    reviews: 1248,
    tag: "Bestseller",
    cover: "from-violet-500 to-fuchsia-500",
    level: "Advanced",
    hours: 18,
    lessons: 32,
    price: 529,
    originalPrice: 1999,
    description:
      "Master modern coding workflows with AI copilots, agentic engineering patterns, and hands-on production-ready builds.",
    
    },
  {
    id: "c2",
    title: "Claude Code - The Practical Guide",
    category: "Development",
    subCategory: "Programming",
    instructor: "Maximilian Muller",
    rating: 4.6,
    reviews: 6834,
    tag: "Premium",
    cover: "from-orange-200 via-orange-100 to-rose-200",
    level: "Intermediate",
    hours: 12,
    lessons: 18,
    price: 529,
    originalPrice: 1799,
    description:
      "Learn Claude Code workflows, prompt patterns, and practical usage for real development teams.",
    
 
    },
  {
    id: "c3",
    title: "AI Engineer Agentic Track: The Complete Agent & MCP Course",
    category: "Development",
    subCategory: "Programming",
    instructor: "Ed Donner",
    rating: 4.7,
    reviews: 38122,
    tag: "Bestseller",
    cover: "from-pink-500 to-rose-400",
    level: "Intermediate",
    hours: 22,
    lessons: 30,
    price: 529,
    originalPrice: 2299,
    description:
      "Build MCP-powered agent systems, automation flows, and reusable AI engineering patterns.",
    
    },
  {
    id: "c4",
    title: "100 Days of Code: The Complete Python Pro Bootcamp",
    category: "Data Science",
    subCategory: "Python",
    instructor: "Angela Yu",
    rating: 4.7,
    reviews: 421133,
    tag: "Bestseller",
    cover: "from-indigo-500 to-blue-500",
    level: "Beginner",
    hours: 60,
    lessons: 100,
    price: 529,
    originalPrice: 3499,
    description:
      "A complete Python journey from basics to automation, web apps, data projects, and portfolio-ready builds.",
    
    },
  {
    id: "c5",
    title: "Figma UI UX Design Essentials",
    category: "Design",
    subCategory: "UI Design",
    instructor: "Daniel Scott",
    rating: 4.7,
    reviews: 49054,
    tag: "Premium",
    cover: "from-slate-800 to-slate-600",
    level: "Beginner",
    hours: 16,
    lessons: 42,
    price: 629,
    originalPrice: 2099,
    description:
      "Learn Figma for wireframes, prototypes, UI systems, and polished app design workflows.",
    
    },
  {
    id: "c6",
    title: "Generative AI for Beginners",
    category: "Development",
    subCategory: "Programming",
    instructor: "Rohan Patel",
    rating: 4.6,
    reviews: 18872,
    tag: "Popular",
    cover: "from-cyan-500 to-blue-600",
    level: "Beginner",
    hours: 14,
    lessons: 26,
    price: 549,
    originalPrice: 2199,
    description:
      "Start building with GenAI, prompting, LLM APIs, and beginner-friendly mini projects.",
  },
  {
    id: "c7",
    title: "The Complete AI Guide: Learn ChatGPT, Generative AI & More",
    category: "Development",
    subCategory: "Mobile Development",
    instructor: "Evan Reed",
    rating: 4.6,
    reviews: 86494,
    tag: "Premium",
    cover: "from-sky-500 to-cyan-400",
    level: "Beginner",
    hours: 20,
    lessons: 35,
    price: 549,
    originalPrice: 2599,
    description:
      "A broad AI guide covering ChatGPT, copilots, automation use cases, and AI-assisted productivity.",
  },
  {
    id: "c8",
    title: "Full Stack Generative and Agentic AI with Python",
    category: "Development",
    subCategory: "Web Technology",
    instructor: "Priya Nair",
    rating: 4.5,
    reviews: 8635,
    tag: "Bestseller",
    cover: "from-purple-500 to-indigo-500",
    level: "Advanced",
    hours: 28,
    lessons: 40,
    price: 529,
    originalPrice: 2799,
    description:
      "Build full-stack agentic applications with Python, APIs, vector stores, and deployment-ready patterns.",
  },
  {
    id: "c9",
    title: "Build AI Assistants: AI Automation Agency",
    category: "Business",
    subCategory: "Entrepreneurship",
    instructor: "Sonia Kapoor",
    rating: 4.7,
    reviews: 15751,
    tag: "Highest Rated",
    cover: "from-amber-500 to-orange-400",
    level: "Intermediate",
    hours: 18,
    lessons: 24,
    price: 509,
    originalPrice: 1999,
    description:
      "Turn AI workflows into services with automation, client delivery templates, and scalable systems.",
  },
  {
    id: "c10",
    title: "Ultimate AWS Certified Solutions Architect Associate",
    category: "IT & Software",
    subCategory: "Cloud",
    instructor: "Stephane Maarek",
    rating: 4.7,
    reviews: 90784,
    tag: "Bestseller",
    cover: "from-yellow-400 to-orange-500",
    level: "Intermediate",
    hours: 27,
    lessons: 58,
    price: 579,
    originalPrice: 3299,
    description:
      "Prepare for AWS certification while learning real cloud architecture, deployment, and best practices.",
  },
  {
    id: "c11",
    title: "Digital Marketing Mastery",
    category: "Marketing",
    subCategory: "SEO",
    instructor: "Olivia Wang",
    rating: 4.5,
    reviews: 432,
    cover: "from-amber-500 to-orange-400",
    level: "Beginner",
    hours: 10,
    lessons: 16,
    price: 499,
    originalPrice: 1499,
    description:
      "SEO, paid acquisition, content strategy and analytics.",
  },
  {
    id: "c12",
    title: "Power BI Dashboard Projects",
    category: "Business",
    subCategory: "Analytics",
    instructor: "Neha Sharma",
    rating: 4.6,
    reviews: 8421,
    cover: "from-emerald-500 to-teal-400",
    level: "Intermediate",
    hours: 15,
    lessons: 29,
    price: 519,
    originalPrice: 1899,
    description:
      "Create interactive BI dashboards, reporting flows, and stakeholder-ready analytics projects.",
  },
  {
    id: "c13",
    title: "Business Communication for Product Teams",
    category: "Business",
    subCategory: "Communication",
    instructor: "Aarav Mehta",
    rating: 4.5,
    reviews: 2108,
    tag: "Popular",
    cover: "from-orange-300 to-amber-400",
    level: "Beginner",
    hours: 8,
    lessons: 20,
    price: 449,
    originalPrice: 1499,
    description:
      "Learn stakeholder communication, reports, and structured presentations for business impact.",
  },
  {
    id: "c14",
    title: "Machine Learning Foundations with Projects",
    category: "Data Science",
    subCategory: "Machine Learning",
    instructor: "Ritika Das",
    rating: 4.6,
    reviews: 10244,
    tag: "Bestseller",
    cover: "from-cyan-500 to-blue-500",
    level: "Intermediate",
    hours: 19,
    lessons: 36,
    price: 559,
    originalPrice: 2399,
    description:
      "Build ML models end-to-end and understand practical workflows using project-based lessons.",
  },
  {
    id: "c15",
    title: "Data Visualization with Tableau & Power BI",
    category: "Data Science",
    subCategory: "Visualization",
    instructor: "Kevin Dsouza",
    rating: 4.4,
    reviews: 3876,
    tag: "Premium",
    cover: "from-sky-400 to-cyan-300",
    level: "Beginner",
    hours: 11,
    lessons: 24,
    price: 499,
    originalPrice: 1799,
    description:
      "Design clear dashboards, KPIs and visual narratives for business decision-making.",
  },
  {
    id: "c16",
    title: "UX Research & Usability Testing",
    category: "Design",
    subCategory: "UX Research",
    instructor: "Nisha Varma",
    rating: 4.6,
    reviews: 2943,
    tag: "New",
    cover: "from-rose-400 to-pink-500",
    level: "Intermediate",
    hours: 9,
    lessons: 21,
    price: 479,
    originalPrice: 1699,
    description:
      "Run interviews, usability tests and turn insights into product-ready design decisions.",
  },
  {
    id: "c17",
    title: "Social Media Strategy for Brands",
    category: "Marketing",
    subCategory: "Social Media",
    instructor: "Ananya Rao",
    rating: 4.5,
    reviews: 1980,
    tag: "Popular",
    cover: "from-amber-400 to-orange-400",
    level: "Beginner",
    hours: 7,
    lessons: 18,
    price: 429,
    originalPrice: 1399,
    description:
      "Plan, schedule and optimize social campaigns across Instagram, LinkedIn and YouTube.",
  },
  {
    id: "c18",
    title: "Performance Marketing Ads Lab",
    category: "Marketing",
    subCategory: "Performance",
    instructor: "Rahul Iyer",
    rating: 4.7,
    reviews: 5220,
    tag: "Top Rated",
    cover: "from-yellow-400 to-orange-500",
    level: "Intermediate",
    hours: 13,
    lessons: 26,
    price: 549,
    originalPrice: 1999,
    description:
      "Launch and optimize Google and Meta ad campaigns with conversion-focused frameworks.",
  },
  {
    id: "c19",
    title: "Cyber Security Essentials for Developers",
    category: "IT & Software",
    subCategory: "Cyber Security",
    instructor: "Imran Shaik",
    rating: 4.6,
    reviews: 7652,
    tag: "Bestseller",
    cover: "from-indigo-500 to-violet-500",
    level: "Intermediate",
    hours: 14,
    lessons: 31,
    price: 569,
    originalPrice: 2499,
    description:
      "Understand threats, secure coding practices, and hardening techniques for modern apps.",
  },
  {
    id: "c20",
    title: "Computer Networking from Scratch",
    category: "IT & Software",
    subCategory: "Networking",
    instructor: "Sandeep Kulkarni",
    rating: 4.4,
    reviews: 3015,
    tag: "Popular",
    cover: "from-blue-500 to-indigo-600",
    level: "Beginner",
    hours: 12,
    lessons: 28,
    price: 499,
    originalPrice: 1799,
    description:
      "Learn core networking, protocols, troubleshooting and practical setups for IT roles.",
  },
];

export const catalog = rawCatalog.map((course) => ({
  ...course,

  videos: course.videos || sampleVideos,
  // thumbnail: course.thumbnail || `https://picsum.photos/seed/catalog-${course.id}/1200/675`,
  thumbnail:
  course.thumbnail ||
  `https://images.unsplash.com/photo-${
    [
      "1518779578993-ec3579fee39f", // coding
      "1517433456452-f9633a875f6f", // laptop
      "1519389950473-47ba0277781c", // programming
      "1550751827-4bd374c3f58b", // tech
      "1551288049-bebda4e38f71", // data
      "1498050108023-c5249f4df085", // computer
      "1515879218367-8466d910aaa4", // ai
      "1504384308090-c894fdcc538d", // electronics
      "1526378722484-bd91ca387e72", // engineering
      "1492724441997-5dc865305da7", // study desk
      "1537432376769-00a1c8a9f6c7", // developer
      "1484417894907-623942c8ee29", // software
    ][course.id.charCodeAt(1) % 12]
  }?w=1200&h=675&fit=crop`,
}));

// ✅ REMOVED TYPE
// export type Review = {...}

export const reviews = [
  {
    id: "r1",
    name: "Anika Sharma",
    role: "Frontend Engineer at Stripe",
    avatar: "AS",
    rating: 5,
    text:
      "The React Patterns course completely changed how I structure components.",
  },
  {
    id: "r2",
    name: "Diego Hernandez",
    role: "ML Engineer at Spotify",
    avatar: "DH",
    rating: 5,
    text:
      "Hands-on labs, real datasets, and great community.",
  },
  {
    id: "r3",
    name: "Mei Tanaka",
    role: "Product Designer at Figma",
    avatar: "MT",
    rating: 4,
    text:
      "The platform feels premium and well designed.",
  },
  {
    id: "r4",
    name: "Joseph Otieno",
    role: "DevOps Lead at Cloudflare",
    avatar: "JO",
    rating: 5,
    text:
      "AWS architecture course was extremely valuable.",
  },
];

// ✅ removed : string
export function getCourse(id) {
  return catalog.find((c) => c.id === id);
}
