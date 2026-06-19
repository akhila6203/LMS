import { useState } from "react";
import { Search, Volume2, BookOpen, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { vocabularyService } from "@/services/vocabularyService";

function playAudio(url) {
  if (!url) return;
  const audio = new Audio(url);
  audio.play().catch(() => {});
}

export function VocabularySearch({ open, onOpenChange }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e?.preventDefault();
    const word = query.trim();
    if (word.length < 2) {
      setError("Enter at least 2 characters");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await vocabularyService.lookup(word);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not find this word");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (value) => {
    if (!value) {
      setQuery("");
      setResult(null);
      setError("");
    }
    onOpenChange(value);
  };

  const dict = result?.dictionary;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Vocabulary</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search word meaning..."
              className="pl-9"
              autoFocus
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
          </Button>
        </form>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {dict && (
          <div className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-xl font-semibold capitalize">{dict.word}</h3>
                {dict.phonetic && (
                  <p className="text-sm text-muted-foreground">{dict.phonetic}</p>
                )}
              </div>
              {dict.audioUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => playAudio(dict.audioUrl)}
                  className="gap-1"
                >
                  <Volume2 className="h-4 w-4" />
                  Listen
                </Button>
              )}
            </div>

            {dict.meanings?.map((m, i) => (
              <div key={i}>
                <p className="text-xs font-medium uppercase text-purple-600">
                  {m.partOfSpeech}
                </p>
                <ul className="mt-1 space-y-2">
                  {m.definitions.map((d, j) => (
                    <li key={j} className="text-sm">
                      <p>{d.definition}</p>
                      {d.example && (
                        <p className="mt-0.5 text-xs italic text-muted-foreground">
                          &ldquo;{d.example}&rdquo;
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {dict.relatedWords?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Related words
                </p>
                <div className="flex flex-wrap gap-2">
                  {dict.relatedWords.map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => {
                        setQuery(w);
                        vocabularyService.lookup(w).then((res) => {
                          setResult(res.data);
                          setError("");
                        }).catch((err) => {
                          setError(err.response?.data?.message || "Could not find this word");
                        });
                      }}
                      className="rounded-full border px-2.5 py-1 text-xs hover:bg-secondary"
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {result?.lessonMatches?.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              From your lessons
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {result.lessonMatches.map((match) => (
                <button
                  key={match.courseId}
                  type="button"
                  onClick={() => {
                    handleClose(false);
                    navigate(`/classes/${match.courseId}`);
                  }}
                  className="w-full rounded-lg border p-3 text-left hover:bg-secondary transition"
                >
                  <p className="text-sm font-medium">{match.lessonTitle}</p>
                  <p className="text-xs text-muted-foreground">
                    {match.subject}
                    {match.topics?.length
                      ? ` · ${match.topics.slice(0, 3).join(", ")}`
                      : ""}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default VocabularySearch;
