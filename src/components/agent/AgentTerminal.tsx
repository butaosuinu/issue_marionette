import { useEffect, useRef } from "react";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import "@xterm/xterm/css/xterm.css";
import { XTERM_OPTIONS, TERMINAL_STYLES } from "../../constants/terminal";
import { AGENT_EVENTS } from "../../constants/agent";
import type { AgentOutputPayload } from "../../types/agent";
import type { TerminalSize } from "../../types/terminal";

type AgentTerminalProps = {
  sessionId: string | undefined;
  onInput: (params: { data: string }) => void;
  onResize: (params: { size: TerminalSize }) => void;
};

type XTermRefs = {
  terminalRef: React.RefObject<HTMLDivElement | null>;
  xtermRef: React.RefObject<XTerm | undefined>;
  fitAddonRef: React.RefObject<FitAddon | undefined>;
};

const useXtermInstance = (): XTermRefs => {
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const xtermRef = useRef<XTerm | undefined>(undefined);
  const fitAddonRef = useRef<FitAddon | undefined>(undefined);

  useEffect(() => {
    if (terminalRef.current === null) {
      return;
    }
    if (xtermRef.current !== undefined) {
      return;
    }

    const xterm = new XTerm(XTERM_OPTIONS);
    const fitAddon = new FitAddon();
    xterm.loadAddon(fitAddon);
    xterm.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = xterm;
    fitAddonRef.current = fitAddon;

    return () => {
      xterm.dispose();
      xtermRef.current = undefined;
      fitAddonRef.current = undefined;
    };
  }, []);

  return { terminalRef, xtermRef, fitAddonRef };
};

const useAgentOutputListener = (
  sessionId: string | undefined,
  xtermRef: React.RefObject<XTerm | undefined>
) => {
  const unlistenRef = useRef<UnlistenFn | undefined>(undefined);

  useEffect(() => {
    if (sessionId === undefined) {
      return;
    }

    const setupListener = async () => {
      const unlisten = await listen<AgentOutputPayload>(
        AGENT_EVENTS.OUTPUT,
        (event) => {
          if (event.payload.session_id !== sessionId) {
            return;
          }
          const xterm = xtermRef.current;
          if (xterm === undefined) {
            return;
          }
          const data = new Uint8Array(event.payload.data);
          xterm.write(data);
        }
      ).catch((): undefined => undefined);

      if (unlisten !== undefined) {
        unlistenRef.current = unlisten;
      }
    };

    void setupListener();

    return () => {
      unlistenRef.current?.();
      unlistenRef.current = undefined;
    };
  }, [sessionId, xtermRef]);
};

const useInputHandler = (
  xtermRef: React.RefObject<XTerm | undefined>,
  onInput: (params: { data: string }) => void
) => {
  useEffect(() => {
    const xterm = xtermRef.current;
    if (xterm === undefined) {
      return;
    }

    const disposable = xterm.onData((data) => {
      onInput({ data });
    });

    return () => {
      disposable.dispose();
    };
  }, [xtermRef, onInput]);
};

const useResizeHandler = (
  terminalRef: React.RefObject<HTMLDivElement | null>,
  fitAddonRef: React.RefObject<FitAddon | undefined>,
  xtermRef: React.RefObject<XTerm | undefined>,
  onResize: (params: { size: TerminalSize }) => void
) => {
  useEffect(() => {
    if (terminalRef.current === null) {
      return;
    }
    const fitAddon = fitAddonRef.current;
    const xterm = xtermRef.current;
    if (fitAddon === undefined || xterm === undefined) {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
      onResize({ size: { cols: xterm.cols, rows: xterm.rows } });
    });

    resizeObserver.observe(terminalRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [terminalRef, fitAddonRef, xtermRef, onResize]);
};

const useFitOnMount = (
  fitAddonRef: React.RefObject<FitAddon | undefined>
) => {
  useEffect(() => {
    const fitAddon = fitAddonRef.current;
    if (fitAddon === undefined) {
      return;
    }
    fitAddon.fit();
  }, [fitAddonRef]);
};

export const AgentTerminal = ({
  sessionId,
  onInput,
  onResize,
}: AgentTerminalProps) => {
  const { terminalRef, xtermRef, fitAddonRef } = useXtermInstance();

  useAgentOutputListener(sessionId, xtermRef);
  useInputHandler(xtermRef, onInput);
  useResizeHandler(terminalRef, fitAddonRef, xtermRef, onResize);
  useFitOnMount(fitAddonRef);

  return (
    <div
      ref={terminalRef}
      className={TERMINAL_STYLES.container}
      data-testid="agent-terminal-container"
    />
  );
};
