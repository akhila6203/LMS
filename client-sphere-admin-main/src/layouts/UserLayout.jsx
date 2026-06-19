// layouts/UserLayout.jsx

import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Languages } from "lucide-react";

import { TopHeader } from "@/components/TopHeader";
import PronunciationSearch from "@/components/PronunciationSearch";
import { useAuth } from "@/contexts/AuthContext";
import { subjectService } from "@/services/subjectService";

export default function UserLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const search = new URLSearchParams(location.search);
  const { user } = useAuth();

  const [subjectTabs, setSubjectTabs] = useState([]);

  useEffect(() => {
    if (!user || user.role !== "user") {
      setSubjectTabs([]);
      return;
    }

    subjectService
      .getUserSubjects()
      .then((res) => setSubjectTabs(res.data?.subjects || []))
      .catch(() => setSubjectTabs([]));
  }, [user]);

  const activeSubject = search.get("subject") || "";
  const isDashboard = location.pathname === "/dashboard";
  const isAllSubjectsActive = isDashboard && !activeSubject;
  const hideSubjectNav =
    location.pathname.startsWith("/settings") ||
    location.pathname.startsWith("/my-learning");

  const [pronunciationOpen, setPronunciationOpen] = useState(false);

  const goToSubject = (subject) => {
    if (!subject) {
      navigate("/dashboard", { replace: true });
      return;
    }
    navigate(`/classes?subject=${encodeURIComponent(subject)}`, {
      replace: true,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b bg-card">
        <TopHeader />
      </header>

      <div className="pt-16">
        {subjectTabs.length > 0 && !hideSubjectNav && (
          <nav className="sticky top-16 z-40 border-b bg-card shadow-sm">
            <div className="flex justify-start overflow-x-auto px-3 py-2 sm:justify-center sm:px-4">
              <div className="inline-flex items-center gap-4 sm:gap-6">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className={`shrink-0 whitespace-nowrap border-b-2 pb-1 text-sm font-medium transition ${
                    isAllSubjectsActive
                      ? "border-purple-600 text-purple-700"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All subjects
                </button>

                {subjectTabs.map((subject) => (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => goToSubject(subject)}
                    className={`shrink-0 whitespace-nowrap border-b-2 pb-1 text-sm font-medium transition ${
                      activeSubject === subject &&
                      location.pathname.startsWith("/classes")
                        ? "border-purple-600 text-purple-700"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {subject}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setPronunciationOpen(true)}
                  className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 border-transparent pb-1 text-sm font-medium text-muted-foreground transition hover:text-foreground"
                >
                  <Languages className="h-4 w-4" />
                  Pronunciation
                </button>
              </div>
            </div>
          </nav>
        )}

        <main>{children ?? <Outlet />}</main>
      </div>

      <PronunciationSearch open={pronunciationOpen} onOpenChange={setPronunciationOpen} />
    </div>
  );
}
