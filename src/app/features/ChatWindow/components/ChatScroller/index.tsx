import { CircularProgress, Stack } from "@mui/material";
import { useAuth } from "@pangeacyber/react-auth";
import { useAppState } from "@src/app/context";
import { Colors } from "@src/app/theme";
import type { ChatMessage } from "@src/types";
import { type FC, useCallback, useMemo } from "react";

import {
  AiGuardMessage,
  LlmResponse,
  UserPromptMessage,
} from "../ChatMessages";

interface Props {
  messages: ChatMessage[];
}

const ChatScroller: FC<Props> = ({ messages }) => {
  const { user } = useAuth();
  const { loading, auditPanelOpen } = useAppState();

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll to the bottom whenever new messages appear
  const scroller = useCallback(
    (node: Element | null) => {
      node?.scrollIntoView({ behavior: "smooth" });
    },
    [messages],
  );

  const messageContent = useMemo(() => {
    return (
      <Stack sx={{ width: "100%", maxWidth: "700px", margin: "0 auto" }}>
        {messages.map((message: ChatMessage, idx: number) => {
          switch (message.type) {
            case "llm_response":
              return (
                <LlmResponse
                  key={`message-${message.hash}`}
                  message={message.output!}
                />
              );
            case "user_prompt":
              return (
                <UserPromptMessage
                  key={`message-${message.hash}`}
                  message={message.input || ""}
                  username={user?.username || "?"}
                />
              );
            case "ai_guard":
              return (
                <AiGuardMessage
                  findings={message.findings || "{}"}
                  key={`message-${message.hash || idx}`}
                />
              );
            default:
              return null;
          }
        })}
      </Stack>
    );
  }, [messages, user]);

  return (
    <Stack
      sx={{
        maxHeight: auditPanelOpen ? "60vh" : "calc(100vh - 260px)",
        overflow: "hidden",
        overflowY: "auto",
        padding: "0 20px",
      }}
    >
      {loading ? (
        <Stack alignItems="center" width="100%">
          <CircularProgress sx={{ color: Colors.secondary }} />
        </Stack>
      ) : (
        <>
          {messageContent}
          <div ref={scroller} />
        </>
      )}
    </Stack>
  );
};

export default ChatScroller;
