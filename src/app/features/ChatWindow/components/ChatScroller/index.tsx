import { Stack } from "@mui/material";

import { ChatMessage, useChatContext } from "@src/app/context";
import {
  UserPromptMessage,
  LlmResponse,
  DataGuardMessage,
  PromptGuardMessage,
} from "../ChatMessages";
import { useAuth } from "@pangeacyber/react-auth";

const ChatScroller = () => {
  const { user } = useAuth();
  const { processing, messages, auditPanelOpen } = useChatContext();

  return (
    <Stack
      sx={{
        maxHeight: auditPanelOpen ? "60vh" : "calc(100vh - 200px)",
        overflow: "hidden",
        overflowY: "auto",
        padding: "0 20px",
      }}
    >
      <Stack>
        {messages.map((message: ChatMessage) => {
          switch (message.type) {
            case "llm_response":
              return <LlmResponse message={message.output} />;
            case "user_prompt":
              return (
                <UserPromptMessage
                  message={message.input}
                  username={user?.username?.toUpperCase() || "?"}
                />
              );
            case "data_guard":
              return <DataGuardMessage findings={message.output} />;
            case "prompt_guard":
              return (
                <PromptGuardMessage verdict={message.output} confidence="75%" />
              );
            default:
              return null;
          }
        })}
      </Stack>
    </Stack>
  );
};

export default ChatScroller;
