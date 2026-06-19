import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { searchService } from "@/services/searchService";
import { useAuth } from "@/contexts/AuthContext";

function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function HeaderSearch({
  placeholder = "Search classes, subjects, lessons…",
  className = "",
  inputClassName = "",
  variant = "inline",
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const debouncedQuery = useDebouncedValue(query);
  const containerRef = useRef(null);
  const mobileInputRef = useRef(null);

  const runSearch = useCallback(async (term) => {
    const q = String(term || "").trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await searchService.search(q);
      setResults(res.data?.results || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      runSearch(debouncedQuery);
    } else {
      setResults([]);
    }
  }, [debouncedQuery, runSearch]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (mobileOpen && mobileInputRef.current) {
      mobileInputRef.current.focus();
    }
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const closeMobile = () => {
    setMobileOpen(false);
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  const handleSelect = (item) => {
    closeMobile();

    if (isAdmin) {
      navigate(`/admin/classes/${item.id}`);
      return;
    }

    if (user?.role === "user") {
      if (item.subject) {
        navigate(`/classes?subject=${encodeURIComponent(item.subject)}`);
      } else {
        navigate(`/classes/${item.id}`);
      }
      return;
    }

    navigate(`/classes/${item.id}`);
  };

  const showDropdown = open && query.trim().length >= 2;

  const dropdown = (
    <div className="absolute left-0 right-0 top-full z-[60] mt-2 max-h-72 overflow-y-auto rounded-xl border border-border bg-card shadow-lg">
      {loading && (
        <p className="px-4 py-3 text-sm text-muted-foreground">Searching…</p>
      )}
      {!loading && results.length === 0 && (
        <p className="px-4 py-3 text-sm text-muted-foreground">No results found</p>
      )}
      {!loading &&
        results.map((item) => (
          <button
            key={`${item.type}-${item.id}`}
            type="button"
            onClick={() => handleSelect(item)}
            className="flex w-full flex-col gap-0.5 px-4 py-2.5 text-left text-sm transition hover:bg-secondary"
          >
            <span className="font-medium text-foreground">{item.title}</span>
            {item.subtitle && (
              <span className="text-xs text-muted-foreground">{item.subtitle}</span>
            )}
          </button>
        ))}
    </div>
  );

  const searchInput = (
    <div className="relative flex items-center rounded-full border border-border bg-background focus-within:ring-2 focus-within:ring-primary/30">
      <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
      <input
        ref={variant === "mobile-overlay" ? mobileInputRef : undefined}
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className={`h-11 w-full rounded-full bg-transparent pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none ${inputClassName}`}
      />
      {query && (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            setResults([]);
          }}
          className="absolute right-3 flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );

  if (variant === "mobile-only-icon") {
    return (
      <>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className={`flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground ${className}`}
          aria-label="Open search"
        >
          <Search className="h-4 w-4" />
        </button>

        {mobileOpen && (
          <div className="fixed inset-x-0 top-0 z-[100] border-b border-border bg-card/98 px-3 py-3 shadow-md backdrop-blur-md sm:px-4">
            <div className="mx-auto flex max-w-3xl items-center gap-2">
              <div ref={containerRef} className="relative flex-1">
                {searchInput}
                {showDropdown && dropdown}
              </div>
              <button
                type="button"
                onClick={closeMobile}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary"
                aria-label="Close search"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {searchInput}
      {showDropdown && dropdown}
    </div>
  );
}
