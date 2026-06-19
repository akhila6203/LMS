import { useState, useEffect } from "react";

import { Search, Volume2, BookOpen, Loader2, X } from "lucide-react";

import { useNavigate } from "react-router-dom";

import { AnimatePresence, motion } from "framer-motion";

import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";

import { vocabularyService } from "@/services/vocabularyService";



function playAudio(url) {

  if (!url) return;

  const audio = new Audio(url);

  audio.play().catch(() => {});

}



function speakText(text) {

  const trimmed = String(text || "").trim();

  if (!trimmed || typeof window === "undefined" || !window.speechSynthesis) return;



  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(trimmed);

  utterance.lang = "en-US";

  utterance.rate = 0.9;

  window.speechSynthesis.speak(utterance);

}



export function PronunciationSearch({ open, onOpenChange }) {

  const navigate = useNavigate();

  const [query, setQuery] = useState("");

  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState(null);

  const [error, setError] = useState("");



  const handleSearch = async (e) => {

    e?.preventDefault();

    const text = query.trim();

    if (text.length < 2) {

      setError("Enter at least 2 characters");

      return;

    }



    setLoading(true);

    setError("");

    setResult(null);



    try {

      const res = await vocabularyService.lookup(text);

      setResult(res.data);

    } catch (err) {

      setError(err.response?.data?.message || "Could not find pronunciation");

      setResult(null);

    } finally {

      setLoading(false);

    }

  };



  const handleClose = () => {

    setQuery("");

    setResult(null);

    setError("");

    if (typeof window !== "undefined" && window.speechSynthesis) {

      window.speechSynthesis.cancel();

    }

    onOpenChange(false);

  };



  const dict = result?.dictionary;

  const isSentence = Boolean(result?.isSentence || query.trim().includes(" "));

  const speakLabel = isSentence ? "Listen sentence" : "Listen";



  const handleListen = () => {

    if (isSentence) {

      speakText(result?.text || query);

      return;

    }

    if (dict?.audioUrl) {

      playAudio(dict.audioUrl);

      return;

    }

    speakText(result?.text || dict?.word || query);

  };



  return (

    <AnimatePresence>

      {open && (

        <>

          <motion.div

            initial={{ opacity: 0 }}

            animate={{ opacity: 1 }}

            exit={{ opacity: 0 }}

            transition={{ duration: 0.2 }}

            className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-[2px]"

            onClick={handleClose}

          />

          <motion.aside

            initial={{ x: "100%", opacity: 0.8 }}

            animate={{ x: 0, opacity: 1 }}

            exit={{ x: "100%", opacity: 0.8 }}

            transition={{ type: "spring", damping: 28, stiffness: 320 }}

            className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-2xl sm:top-4 sm:mr-4 sm:h-[calc(100vh-2rem)] sm:max-h-[720px] sm:rounded-2xl sm:border"

          >

            <div className="flex items-center justify-between border-b px-4 py-3 sm:px-5">

              <h2 className="text-lg font-semibold">Pronunciation</h2>

              <button

                type="button"

                onClick={handleClose}

                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground"

                aria-label="Close pronunciation panel"

              >

                <X className="h-5 w-5" />

              </button>

            </div>



            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">

              <form onSubmit={handleSearch} className="flex gap-2">

                <div className="relative flex-1">

                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input

                    value={query}

                    onChange={(e) => setQuery(e.target.value)}

                    placeholder="Word or full sentence..."

                    className="pl-9"

                    autoFocus

                  />

                </div>

                <Button type="submit" disabled={loading}>

                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}

                </Button>

              </form>



              {error && <p className="text-sm text-destructive">{error}</p>}



              {(dict || result?.isSentence) && (

                <div className="space-y-4 rounded-xl border bg-background/60 p-4 shadow-sm">

                  <div className="flex items-start justify-between gap-2">

                    <div className="min-w-0 flex-1">

                      <h3 className="text-lg font-semibold capitalize break-words">

                        {isSentence ? result?.text || query : dict?.word}

                      </h3>

                      {!isSentence && dict?.phonetic && (

                        <p className="text-sm text-muted-foreground">{dict.phonetic}</p>

                      )}

                      {isSentence && result?.sentencePhonetics?.length > 0 && (

                        <p className="mt-1 text-sm text-muted-foreground break-words">

                          {result.sentencePhonetics

                            .map((w) => w.phonetic || w.word)

                            .join(" · ")}

                        </p>

                      )}

                      {isSentence && !result?.sentencePhonetics?.length && (

                        <p className="text-sm text-muted-foreground">

                          Tap listen to hear this sentence

                        </p>

                      )}

                    </div>

                    <Button

                      type="button"

                      variant="outline"

                      size="sm"

                      onClick={handleListen}

                      className="shrink-0 gap-1"

                    >

                      <Volume2 className="h-4 w-4" />

                      {speakLabel}

                    </Button>

                  </div>



                  {isSentence && result?.sentencePhonetics?.length > 0 && (

                    <div className="flex flex-wrap gap-2">

                      {result.sentencePhonetics.map((w) => (

                        <span

                          key={w.word}

                          className="rounded-full border bg-secondary/50 px-2.5 py-1 text-xs"

                        >

                          <span className="font-medium">{w.word}</span>

                          {w.phonetic && (

                            <span className="ml-1 text-muted-foreground">{w.phonetic}</span>

                          )}

                        </span>

                      ))}

                    </div>

                  )}



                  {!isSentence &&

                    dict?.meanings?.map((m, i) => (

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



                  {!isSentence && dict?.relatedWords?.length > 0 && (

                    <div>

                      <p className="mb-2 text-xs font-medium text-muted-foreground">

                        Related words

                      </p>

                      <div className="flex flex-wrap gap-2">

                        {dict.relatedWords.map((w) => (

                          <button

                            key={w}

                            type="button"

                            onClick={() => {

                              setQuery(w);

                              vocabularyService

                                .lookup(w)

                                .then((res) => {

                                  setResult(res.data);

                                  setError("");

                                })

                                .catch((err) => {

                                  setError(

                                    err.response?.data?.message ||

                                      "Could not find pronunciation"

                                  );

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

                  <p className="flex items-center gap-1 text-sm font-medium">

                    <BookOpen className="h-4 w-4" />

                    From your lessons

                  </p>

                  <div className="max-h-48 space-y-2 overflow-y-auto">

                    {result.lessonMatches.map((match) => (

                      <button

                        key={match.classId || match.courseId}

                        type="button"

                        onClick={() => {

                          handleClose();

                          navigate(`/classes/${match.classId || match.courseId}`);

                        }}

                        className="w-full rounded-lg border p-3 text-left transition hover:bg-secondary"

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

            </div>

          </motion.aside>

        </>

      )}

    </AnimatePresence>

  );

}



export default PronunciationSearch;

