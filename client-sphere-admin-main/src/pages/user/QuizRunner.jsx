import { useEffect, useMemo, useState } from "react";
import { Check, X, Trophy, RotateCcw, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

function isAnswerCorrect(question, answer) {
  const type = question.type || "radio";

  if (type === "checkbox") {
    const expected = [...(question.correctIndices || [])].sort();
    const given = Array.isArray(answer) ? [...answer].sort() : [];
    return (
      expected.length === given.length &&
      expected.every((v, i) => v === given[i])
    );
  }

  if (type === "fill_blank") {
    const expected = String(question.blankAnswer || "").trim().toLowerCase();
    const given = String(answer || "").trim().toLowerCase();
    return expected.length > 0 && expected === given;
  }

  return answer === question.correctIndex;
}

function emptyAnswers(count) {
  return Array.from({ length: count }, () => null);
}

function getQuestionTypeMeta(type) {
  const t = type || "radio";

  if (t === "checkbox") {
    return {
      label: "Multiple choice (checkbox)",
      hint: "You can select more than one option — choose all correct answers.",
    };
  }

  if (t === "fill_blank") {
    return {
      label: "Fill in the blank",
      hint: "Type your answer in the box below.",
    };
  }

  return {
    label: "Multiple choice",
    hint: "Select one answer only.",
  };
}

function computeScore(questions, answers) {
  return questions.reduce(
    (sum, q, i) => (isAnswerCorrect(q, answers[i]) ? sum + 1 : sum),
    0
  );
}

export function QuizRunner({ open, onOpenChange, title, questions, onComplete }) {
  const total = questions.length;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(() => emptyAnswers(total));
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (open) {
      setStep(0);
      setAnswers(emptyAnswers(questions.length));
      setDone(false);
    }
  }, [open, questions]);

  const current = questions[step];
  const picked = answers[step];
  const typeMeta = current ? getQuestionTypeMeta(current.type) : null;

  const score = useMemo(
    () => computeScore(questions, answers),
    [questions, answers]
  );

  const setPicked = (value) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[step] = value;
      return next;
    });
  };

  const reset = () => {
    setStep(0);
    setAnswers(emptyAnswers(total));
    setDone(false);
  };

  const canProceed = () => {
    if (!current) return false;
    const type = current.type || "radio";
    if (type === "checkbox") {
      return Array.isArray(picked) && picked.length > 0;
    }
    if (type === "fill_blank") {
      return String(picked || "").trim().length > 0;
    }
    return picked !== null && picked !== undefined;
  };

  const previous = () => {
    if (step <= 0) return;
    setStep((prev) => prev - 1);
  };

  const next = () => {
    if (!canProceed()) return;

    if (step + 1 >= total) {
      const finalScore = computeScore(questions, answers);
      setDone(true);
      if (onComplete) {
        onComplete({ score: finalScore, total, answers });
      }
      return;
    }

    setStep((prev) => prev + 1);
  };

  const toggleCheckbox = (index) => {
    const currentPicked = Array.isArray(picked) ? picked : [];
    setPicked(
      currentPicked.includes(index)
        ? currentPicked.filter((i) => i !== index)
        : [...currentPicked, index]
    );
  };

  const formatCorrectAnswer = (q) => {
    const type = q.type || "radio";
    if (type === "checkbox") {
      return (q.correctIndices || [])
        .map((i) => q.options[i])
        .filter(Boolean)
        .join(", ");
    }
    if (type === "fill_blank") {
      return q.blankAnswer || "—";
    }
    return q.options[q.correctIndex] || "—";
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {done
              ? "You finished the quiz. Here's how you did."
              : `Question ${step + 1} of ${total}`}
          </DialogDescription>
        </DialogHeader>

        {!done ? (
          <div className="space-y-4">
            <Progress value={((step + 1) / total) * 100} className="h-2" />

            {typeMeta && (
              <div className="rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-xs dark:border-purple-900/60 dark:bg-purple-950/30">
                <p className="font-semibold text-purple-700 dark:text-purple-300">
                  {typeMeta.label}
                </p>
                <p className="mt-0.5 text-muted-foreground">{typeMeta.hint}</p>
              </div>
            )}

            <p className="text-sm font-medium">{current?.question}</p>

            {(current?.type || "radio") === "fill_blank" ? (
              <input
                value={picked || ""}
                onChange={(e) => setPicked(e.target.value)}
                placeholder="Type your answer..."
                className="w-full rounded-lg border px-4 py-3 text-sm"
              />
            ) : (current?.type || "radio") === "checkbox" ? (
              <div className="space-y-2">
                {current.options.map((opt, i) => {
                  const active = Array.isArray(picked) && picked.includes(i);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleCheckbox(i)}
                      className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition ${
                        active
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border hover:bg-accent/50"
                      }`}
                    >
                      <span className="mr-2 font-semibold text-primary">
                        {String.fromCharCode(65 + i)}.
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2">
                {current?.options.map((opt, i) => {
                  const active = picked === i;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPicked(i)}
                      className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition ${
                        active
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border hover:bg-accent/50"
                      }`}
                    >
                      <span className="mr-2 font-semibold text-primary">
                        {String.fromCharCode(65 + i)}.
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mt-4 flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={previous}
                disabled={step === 0}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                onClick={next}
                disabled={!canProceed()}
                className="bg-purple-600 text-white hover:bg-purple-700"
              >
                {step + 1 >= total ? "Submit" : "Next"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Card className="border-border/60 p-5 text-center">
              <Trophy className="mx-auto h-9 w-9 text-amber-500" />
              <p className="mt-2 text-2xl font-bold">
                {score} / {total}
              </p>
              <p className="text-xs text-muted-foreground">
                {score === total
                  ? "Perfect score!"
                  : score / total >= 0.7
                    ? "Nice work — you passed."
                    : "Keep practicing — review and try again."}
              </p>
            </Card>

            <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
              {questions.map((q, i) => {
                const ok = isAnswerCorrect(q, answers[i]);
                return (
                  <div
                    key={q.id || i}
                    className="rounded-lg border border-border/60 p-3 text-xs"
                  >
                    <div className="flex items-start gap-2">
                      {ok ? (
                        <Check className="mt-0.5 h-4 w-4 text-success" />
                      ) : (
                        <X className="mt-0.5 h-4 w-4 text-destructive" />
                      )}
                      <div>
                        <p className="font-medium text-foreground">{q.question}</p>
                        {!ok && (
                          <p className="mt-1 text-muted-foreground">
                            Correct answer:{" "}
                            <span className="text-foreground">
                              {formatCorrectAnswer(q)}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={reset}>
                <RotateCcw className="h-4 w-4" /> Retake
              </Button>
              <Button
                onClick={() => onOpenChange(false)}
                className="text-primary-foreground"
                style={{ background: "var(--gradient-primary)" }}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export const sampleQuiz = [
  {
    id: "q1",
    type: "radio",
    question: "Which hook is best for sharing logic between components?",
    options: ["useEffect", "Custom hook", "useState", "useReducer"],
    correctIndex: 1,
  },
];
