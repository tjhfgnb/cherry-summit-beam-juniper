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

  if (session) {
    return (
      <PracticeSession
        key={`${session.mode}-${session.direction}-${session.wordIds?.join(",") ?? session.count}`}
        mode={session.mode}
        direction={session.direction}
        count={session.count}
        wordIds={session.wordIds}
        onExit={() => setSession(null)}
      />
    );
  }

  return <PracticeIntro onStart={setSession} />;
}
