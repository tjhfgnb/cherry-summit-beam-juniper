import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  PracticeIntro,
  PracticeSession,
  type StartOpts,
} from "@/components/practice-session";

export const Route = createFileRoute("/practice")({ component: PracticePage });

function PracticePage() {
  const [session, setSession] = useState<StartOpts | null>(null);
  const [run, setRun] = useState(0);

  if (session) {
    return (
      <PracticeSession
        key={`${run}-${session.mode}-${session.wordIds?.join(",") ?? session.count}`}
        mode={session.mode}
        direction={session.direction}
        count={session.count}
        wordIds={session.wordIds}
        onExit={() => setSession(null)}
        onAgain={() => setRun((n) => n + 1)}
      />
    );
  }

  return <PracticeIntro onStart={setSession} />;
}
