import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  BookOpen,
  Moon,
  Sun,
  User,
  LogOut,
  Settings,
  Languages,
} from "lucide-react";
import { useState } from "react";
import { catalog } from "../../lib/catalog";
import { isLearnerLoggedIn } from "@/utils/userStore";
import { getSessionUser, clearAuthSession } from "@/utils/authSession";
import { useHeaderProfile } from "@/hooks/useHeaderProfile";
import { useTheme } from "@/contexts/ThemeContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AnimatePresence, motion } from "framer-motion";

import logo from "../../assets/photos/logo.png";
import VocabularySearch from "@/components/VocabularySearch";

function SlidePanel({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 h-full w-80 bg-card border-l border-border shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="font-heading font-semibold text-foreground">{title}</h3>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function Header() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const { isDark, toggle } = useTheme();
  const user = getSessionUser();
  const isAdmin = user?.role === "admin";
  const headerProfile = useHeaderProfile();

  const avatarSrc = user && !isAdmin ? headerProfile.avatar : "";
  const nameText = user && !isAdmin ? headerProfile.name : user?.name || "Learner";
  const emailText = user && !isAdmin ? headerProfile.email : user?.email || "";

  const [openPanel, setOpenPanel] = useState("none");
  const [vocabOpen, setVocabOpen] = useState(false);
  const closePanel = () => setOpenPanel("none");
  const togglePanel = (panel) => setOpenPanel((prev) => (prev === panel ? "none" : panel));

  const filteredCourses = catalog.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-10 border-b bg-card/95 shadow-sm backdrop-blur">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-2 sm:px-3 py-3">
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2 cursor-pointer"
          >
            <img
              src={logo}
              alt="LMS"
              className="h-10 sm:h-10 md:h-12 w-auto object-contain"
            />
          </div>

          <div className="relative w-full sm:w-40 md:w-80 lg:w-96">
            <div className="flex items-center rounded-lg bg-secondary px-3 py-2 focus-within:ring-2 focus-within:ring-purple-500">
              <Search className="mr-2 h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search classes..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>

            {query && (
              <div className="absolute top-full mt-2 max-h-60 w-full overflow-y-auto rounded-xl border bg-card shadow-lg">
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => (
                    <div
                      key={course.id}
                      onClick={() => {
                        navigate(`/courses/${course.id}`);
                        setQuery("");
                      }}
                      className="cursor-pointer px-4 py-2 text-sm hover:bg-secondary"
                    >
                      {course.title}
                    </div>
                  ))
                ) : (
                  <p className="p-4 text-sm text-muted-foreground">No results</p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 sm:gap-6">
            <button
              onClick={() => navigate("/homecourses")}
              className="hidden md:flex items-center gap-1 text-sm font-medium"
            >
              <BookOpen className="h-4 w-4" />
              Classes
            </button>

            {user && !isAdmin && (
              <>
                <button
                  type="button"
                  onClick={() => setVocabOpen(true)}
                  className="hidden md:flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <Languages className="h-4 w-4" />
                  Vocabulary
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/settings?tab=learning")}
                  className="hidden md:flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <BookOpen className="h-4 w-4" />
                  My Learning
                </button>
              </>
            )}

            <Link to="/about" className="hidden md:block text-sm">
              About
            </Link>

            <button
              onClick={toggle}
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <button
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-full hover:bg-secondary"
              onClick={() => togglePanel("menu")}
            >
              ☰
            </button>

            {!user || isAdmin ? (
              <button
                onClick={() => navigate("/login")}
                className="bg-gradient-to-r from-purple-600 to-indigo-500 text-white px-2 py-2 rounded-lg text-sm shadow"
              >
                Login
              </button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full transition hover:scale-[1.03]">
                    {avatarSrc ? (
                      <img
                        src={avatarSrc}
                        alt="Profile"
                        className="h-9 w-9 rounded-full object-cover ring-1 ring-border"
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-semibold text-white">
                        {(user?.name || "U").slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="pb-2">
                    <div className="flex items-center gap-3">
                      {avatarSrc ? (
                        <img
                          src={avatarSrc}
                          alt="Profile"
                          className="h-10 w-10 rounded-full object-cover ring-1 ring-border"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold text-xs">
                          {(user?.name || "U").slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold leading-tight">{nameText}</p>
                        <p className="text-xs font-normal text-muted-foreground">{emailText}</p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isAdmin ? (
                    <>
                      <DropdownMenuItem
                        onClick={() => navigate("/settings?tab=profile")}
                        className="cursor-pointer gap-2"
                      >
                        <User className="h-4 w-4" /> Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => navigate("/settings?tab=personal")}
                        className="cursor-pointer gap-2"
                      >
                        <Settings className="h-4 w-4" /> Settings
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem
                        onClick={() => navigate("/settings?tab=profile")}
                        className="cursor-pointer gap-2"
                      >
                        <User className="h-4 w-4" /> Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => navigate("/settings?tab=learning")}
                        className="cursor-pointer gap-2"
                      >
                        <BookOpen className="h-4 w-4" /> My learning
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => navigate("/settings?tab=personal")}
                        className="cursor-pointer gap-2"
                      >
                        <Settings className="h-4 w-4" /> Settings
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      clearAuthSession();
                      navigate("/", { replace: true });
                    }}
                    className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      <SlidePanel open={openPanel === "menu"} onClose={closePanel} title="Menu">
        <div className="p-4 space-y-4">
          <button
            onClick={() => {
              navigate("/homecourses");
              closePanel();
            }}
            className="w-full text-left"
          >
            Classes
          </button>
          {user && !isAdmin && (
            <button
              onClick={() => {
                setVocabOpen(true);
                closePanel();
              }}
              className="w-full text-left"
            >
              Vocabulary
            </button>
          )}
          <button
            onClick={() => {
              navigate("/about");
              closePanel();
            }}
            className="w-full text-left"
          >
            About
          </button>
        </div>
      </SlidePanel>

      {user && !isAdmin && (
        <VocabularySearch open={vocabOpen} onOpenChange={setVocabOpen} />
      )}
    </>
  );
}
