import { useCallback, useEffect, useRef } from "react";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import { useSetAtom } from "jotai";
import { AgentTerminal } from "./AgentTerminal";
import { AgentControlPanel } from "./AgentControlPanel";
import { useAgent } from "../../hooks/useAgent";
import { AGENT_EVENTS } from "../../constants/agent";
import { updateSessionStatusAtom } from "../../stores/agentAtoms";
import type { AgentStatusPayload } from "../../types/agent";
import type { TerminalSize } from "../../types/terminal";

type AgentSessionViewProps = {
  worktreePath: string;
  issueContext: string;
};

export const AgentSessionView = ({
  worktreePath,
  issueContext,
}: AgentSessionViewProps) => {
  const {
    activeSession,
    isAgentRunning,
    startAgent,
    stopAgent,
    sendInput,
    resizeAgent,
  } = useAgent();

  const doUpdateSessionStatus = useSetAtom(updateSessionStatusAtom);
  const unlistenRef = useRef<UnlistenFn | undefined>(undefined);

  useEffect(() => {
    const setupListener = async () => {
      const unlisten = await listen<AgentStatusPayload>(
        AGENT_EVENTS.STATUS_CHANGED,
        (event) => {
          doUpdateSessionStatus({
            sessionId: event.payload.session_id,
            status: event.payload.status,
          });
        }
      ).catch((): undefined => undefined);

      unlistenRef.current = unlisten;
    };

    void setupListener();

    return () => {
      unlistenRef.current?.();
      unlistenRef.current = undefined;
    };
  }, [doUpdateSessionStatus]);

  const handleStart = useCallback(
    async ({ mode }: { mode: "plan" | "act" }) => {
      await startAgent({
        worktreePath,
        issueContext,
        mode,
      });
    },
    [startAgent, worktreePath, issueContext]
  );

  const handleStop = useCallback(async () => {
    if (activeSession === undefined) {
      return;
    }
    await stopAgent({ sessionId: activeSession.id });
  }, [activeSession, stopAgent]);

  const handleInput = useCallback(
    ({ data }: { data: string }) => {
      if (activeSession === undefined) {
        return;
      }
      void sendInput({ sessionId: activeSession.id, input: data });
    },
    [activeSession, sendInput]
  );

  const handleResize = useCallback(
    ({ size }: { size: TerminalSize }) => {
      if (activeSession === undefined) {
        return;
      }
      void resizeAgent({ sessionId: activeSession.id, size });
    },
    [activeSession, resizeAgent]
  );

  return (
    <div className="flex h-full flex-col gap-4">
      <AgentControlPanel
        worktreePath={worktreePath}
        isAgentRunning={isAgentRunning}
        agentStatus={activeSession?.status}
        onStart={handleStart}
        onStop={handleStop}
      />

      <div className="min-h-0 flex-1 rounded-lg border border-gray-700 bg-gray-900">
        <AgentTerminal
          sessionId={activeSession?.id}
          onInput={handleInput}
          onResize={handleResize}
        />
      </div>
    </div>
  );
};
