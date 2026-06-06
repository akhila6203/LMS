// COURSES
export const courses = [
  {
    id: "c1",
    title: "Advanced React Patterns",
    category: "Web Development",
    instructor: "Sarah Chen",
    students: 1248,
    lessons: 32,
    status: "Published",
    cover: "from-violet-500 to-fuchsia-500",
    progress: 100,
    updatedAt: "2d ago",
  },
  {
    id: "c2",
    title: "Machine Learning Foundations",
    category: "Data Science",
    instructor: "Marcus Liu",
    students: 894,
    lessons: 24,
    status: "Published",
    cover: "from-sky-500 to-cyan-400",
    progress: 100,
    updatedAt: "5d ago",
  },
  {
    id: "c3",
    title: "UI/UX Design Principles",
    category: "Design",
    instructor: "Emma Rodriguez",
    students: 612,
    lessons: 18,
    status: "Draft",
    cover: "from-pink-500 to-rose-400",
    progress: 65,
    updatedAt: "1d ago",
  },
  {
    id: "c4",
    title: "Python for Data Analysis",
    category: "Data Science",
    instructor: "James Park",
    students: 1502,
    lessons: 28,
    status: "Published",
    cover: "from-emerald-500 to-teal-400",
    progress: 100,
    updatedAt: "3d ago",
  },
  {
    id: "c5",
    title: "Digital Marketing Mastery",
    category: "Marketing",
    instructor: "Olivia Wang",
    students: 432,
    lessons: 16,
    status: "Draft",
    cover: "from-amber-500 to-orange-400",
    progress: 40,
    updatedAt: "6h ago",
  },
  {
    id: "c6",
    title: "Cloud Architecture on AWS",
    category: "Cloud",
    instructor: "David Kim",
    students: 728,
    lessons: 22,
    status: "Published",
    cover: "from-indigo-500 to-blue-500",
    progress: 100,
    updatedAt: "1w ago",
  },
];

// STUDENTS
export const students = [
  { id: "s1", name: "Alex Johnson", email: "alex.j@example.com", enrolled: 5, completed: 3, progress: 72, joinedAt: "Mar 12, 2024", status: "Active" },
  { id: "s2", name: "Priya Patel", email: "priya@example.com", enrolled: 8, completed: 6, progress: 88, joinedAt: "Feb 03, 2024", status: "Active" },
  { id: "s3", name: "Noah Williams", email: "noah.w@example.com", enrolled: 3, completed: 1, progress: 45, joinedAt: "Apr 22, 2024", status: "Active" },
  { id: "s4", name: "Sophia Martinez", email: "sophia.m@example.com", enrolled: 6, completed: 5, progress: 91, joinedAt: "Jan 18, 2024", status: "Active" },
  { id: "s5", name: "Liam Brown", email: "liam.b@example.com", enrolled: 2, completed: 0, progress: 18, joinedAt: "May 02, 2024", status: "Inactive" },
  { id: "s6", name: "Ava Garcia", email: "ava.g@example.com", enrolled: 4, completed: 2, progress: 60, joinedAt: "Mar 28, 2024", status: "Active" },
  { id: "s7", name: "Ethan Davis", email: "ethan.d@example.com", enrolled: 7, completed: 4, progress: 76, joinedAt: "Feb 14, 2024", status: "Active" },
  { id: "s8", name: "Mia Wilson", email: "mia.w@example.com", enrolled: 1, completed: 0, progress: 8, joinedAt: "May 19, 2024", status: "Inactive" },
];

// MATERIALS
export const materials = [
  { id: "m1", title: "Course Introduction.pdf", type: "PDF", size: "2.4 MB", uploadedAt: "2d ago" },
  { id: "m2", title: "Week 1 Slides", type: "Slides", size: "8.1 MB", uploadedAt: "1w ago" },
  { id: "m3", title: "Reference Guide", type: "Doc", size: "640 KB", uploadedAt: "3d ago" },
];

// VIDEOS
export const videos = [
  { id: "v1", title: "Welcome to the Course", duration: "4:32", views: 1240, uploadedAt: "1w ago" },
  { id: "v2", title: "Getting Started with Hooks", duration: "18:05", views: 892, uploadedAt: "5d ago" },
  { id: "v3", title: "State Management Deep Dive", duration: "27:41", views: 614, uploadedAt: "2d ago" },
];

// QUIZZES
export const quizzes = [
  { id: "q1", title: "Module 1 Knowledge Check", questions: 10, attempts: 248, passRate: 84 },
  { id: "q2", title: "Hooks & State Quiz", questions: 15, attempts: 192, passRate: 71 },
];

// CHART DATA
export const enrollmentData = [
  { month: "Jan", students: 240, completions: 120 },
  { month: "Feb", students: 320, completions: 180 },
  { month: "Mar", students: 410, completions: 240 },
  { month: "Apr", students: 380, completions: 260 },
  { month: "May", students: 520, completions: 340 },
  { month: "Jun", students: 610, completions: 420 },
  { month: "Jul", students: 720, completions: 510 },
];