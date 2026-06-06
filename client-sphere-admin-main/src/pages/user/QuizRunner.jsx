import { useState } from "react";
import { Check, X, Trophy, RotateCcw } from "lucide-react";
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

export function QuizRunner({ open, onOpenChange, title, questions, onComplete }) {
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [done, setDone] = useState(false);

  const total = questions.length;
  const current = questions[step];

  const score = answers.reduce(
    (s, a, i) => (a === questions[i].correctIndex ? s + 1 : s),
    0
  );

  const reset = () => {
    setStep(0);
    setPicked(null);
    setAnswers([]);
    setDone(false);
  };

  const next = () => {
  if (picked === null) return;

  const nextAnswers = [...answers, picked];
  setAnswers(nextAnswers);
  setPicked(null);

  // 🔥 LAST QUESTION
  if (step + 1 >= total) {
    setDone(true);

    // 🔥 SAVE DATA HERE
    if (onComplete) onComplete(nextAnswers);

  } else {
    setStep((prev) => prev + 1);
  }
};
  // const next = () => {
  //   if (picked === null) return;

  //   const nextAnswers = [...answers, picked];
  //   setAnswers(nextAnswers);
  //   setPicked(null);

  //   if (step + 1 >= total) {
  //     if (onComplete) onComplete(nextAnswers);
  //     setDone(true);
  //   } else {
  //     setStep(step + 1);
  //   }
  // };

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
            <Progress value={(step / total) * 100} className="h-2" />

            <p className="text-sm font-medium">{current.question}</p>

            <div className="space-y-2">
              {current.options.map((opt, i) => {
                const active = picked === i;

                return (
                  <button
                    key={i}
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

            <div className="mt-4 flex justify-end">
              <Button
                onClick={next}
                disabled={picked === null}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                // className="bg-purple-600 text-white"
                // style={{ background: "var(--gradient-primary)" }}
              >
                {step + 1 >= total ? "Save" : "Next"}
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
                  ? "Perfect score! 🎉"
                  : score / total >= 0.7
                  ? "Nice work — you passed."
                  : "Keep practicing — review and try again."}
              </p>
            </Card>

            <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
              {questions.map((q, i) => {
                const ok = answers[i] === q.correctIndex;

                return (
                  <div
                    key={q.id}
                    className="rounded-lg border border-border/60 p-3 text-xs"
                  >
                    <div className="flex items-start gap-2">
                      {ok ? (
                        <Check className="mt-0.5 h-4 w-4 text-success" />
                      ) : (
                        <X className="mt-0.5 h-4 w-4 text-destructive" />
                      )}

                      <div>
                        <p className="font-medium text-foreground">
                          {q.question}
                        </p>

                        {!ok && (
                          <p className="mt-1 text-muted-foreground">
                            Correct answer:{" "}
                            <span className="text-foreground">
                              {q.options[q.correctIndex]}
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
    question: "Which hook is best for sharing logic between components?",
    options: ["useEffect", "Custom hook", "useState", "useReducer"],
    correctIndex: 1,
    explanation: "Custom hooks let you extract reusable stateful logic.",
  },
  {
    id: "q2",
    question: "What does the dependency array in useEffect control?",
    options: [
      "Initial state value",
      "When the effect re-runs",
      "The return type of the effect",
      "Component name",
    ],
    correctIndex: 1,
  },
  {
    id: "q3",
    question: "Which pattern is most useful for flexible component APIs?",
    options: ["Singleton", "Compound components", "Inheritance", "Globals"],
    correctIndex: 1,
  },
];