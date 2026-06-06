import { GraduationCap, Users, Trophy, Sparkles } from "lucide-react";
import { PageWithFooter } from "@/components/layout/PageWithFooter";

const stats = [
  { label: "Active Learners", value: "50K+" },
  { label: "Expert Mentors", value: "120+" },
  { label: "Courses", value: "200+" },
  { label: "Completion Rate", value: "93%" },
];

const values = [
  {
    icon: GraduationCap,
    title: "Practical Learning",
    text: "We focus on hands-on skills that learners can use immediately in real projects.",
  },
  {
    icon: Users,
    title: "Mentor Support",
    text: "Every learner gets guidance through structured content and responsive support.",
  },
  {
    icon: Trophy,
    title: "Career Outcomes",
    text: "Our goal is simple: help learners become job-ready with confidence.",
  },
];

export default function About() {
  return (
    <PageWithFooter>
    <div className="bg-background px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
      <div className="mx-auto max-w-6xl space-y-10">
        <section className="rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 px-8 py-14 text-white shadow-xl">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
              <Sparkles className="h-4 w-4" /> About LMS
            </p>
            <h1 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-bold">Building better careers through focused learning.</h1>
            <p className="mt-4 text-sm text-white/90">
              LMS helps students and professionals gain modern skills through structured content, guided practice,
              and measurable progress.
            </p>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="rounded-2xl border bg-card p-4 sm:p-5 shadow-sm">
              <p className="text-3xl font-bold text-foreground">{item.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border bg-card p-8 shadow-sm">
          <h2 className="text-2xl font-semibold">Our mission</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            We are creating a learning platform that blends industry-level content with smooth product experience.
            From beginner to advanced level, we want every learner to discover, practice, and apply knowledge with
            confidence.
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          {values.map((item) => {
            const Icon = item.icon;   // ✅ ADD THIS LINE

            return (
              <div key={item.title} className="rounded-2xl border bg-card p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                  <Icon className="h-5 w-5" />   {/* ✅ CHANGE HERE */}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
              </div>
            );
          })}
        </section>
      </div>
    </div>
    </PageWithFooter>
  );
}
