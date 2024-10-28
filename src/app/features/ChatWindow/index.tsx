import { ChangeEvent, useEffect, useRef } from "react";
import { IconButton, InputBase, Paper, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SendIcon from "@mui/icons-material/Send";
import { useAuth } from "@pangeacyber/react-auth";

import { useChatContext, ChatMessage } from "@src/app/context";
import {
  auditSearch,
  auditUserPrompt,
  callInputDataGuard,
  callResponseDataGuard,
  callPromptGuard,
  sendUserMessage,
} from "./utils";
import ChatScroller from "./components/ChatScroller";
import { Colors } from "@src/app/theme";

const ChatWindow = () => {
  const theme = useTheme();
  const mounted = useRef(false);
  const {
    processing,
    promptGuardEnabled,
    dataGuardEnabled,
    systemPrompt,
    userPrompt,
    setProcessing,
    setUserPrompt,
    setMessages,
    setLoading,
    setLoginOpen,
  } = useChatContext();
  const { authenticated, user } = useAuth();

  const handleSubmit = async () => {
    if (!authenticated) {
      setLoginOpen(true);
      return;
    }

    const token = user?.active_token?.token || "";

    setProcessing(true);

    const logEvent = {
      event: {
        event_type: "user_prompt",
        event_input: userPrompt,
        event_context: JSON.stringify({
          system_prompt: systemPrompt,
        }),
      },
    };

    const logPromptResp = await auditUserPrompt(token, logEvent);
    console.log("log user prompt", logPromptResp);

    if (promptGuardEnabled) {
      const promptResp = await callPromptGuard(token, userPrompt, systemPrompt);
      // console.log("prompt guard response", promptResp);
    }

    if (dataGuardEnabled) {
      const dataResp = await callInputDataGuard(token, userPrompt);
      // console.log("input data guard response", dataResp);
    }

    const llmResponse = await sendUserMessage(token, userPrompt, systemPrompt);
    // console.log("LLM Response", llmResponse);

    if (dataGuardEnabled) {
      const dataResp = await callResponseDataGuard(token, llmResponse);
      // console.log("llm data guard response", dataResp);
    }

    setProcessing(false);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserPrompt(e.currentTarget.value);
  };

  useEffect(() => {
    const loadSearchData = async () => {
      const token = user?.active_token?.token || "";
      if (token) {
        setLoading(true);
        const response = await auditSearch(token, {});

        const messages_: ChatMessage[] = response.events.map((event: any) => {
          const message: ChatMessage = {
            hash: event.envelope.hash,
            type: event.envelope.event.event_type,
            context: event.envelope.event.event_context,
            input: event.envelope.event.event_input,
            output: event.envelope.event.event_output,
            findings: event.envelope.event.event_findings,
            malicious_count: event.envelope.event.malicious_entity_count,
          };
          return message;
        });
        setMessages(messages_.reverse());
        setLoading(false);
      }
    };

    loadSearchData();
  }, [user]);

  return (
    <Stack width="100%" height="100%">
      <Paper sx={{ height: "100%" }}>
        <Stack height="100%" alignItems="center" justifyContent="space-between">
          <Typography
            variant="h1"
            sx={{ display: "flex", height: "100%", alignItems: "center" }}
          >
            Welcome to Pangea Chat.
          </Typography>
          <Stack width="100%">
            <ChatScroller />
            <Stack
              direction="row"
              gap={1}
              alignItems="center"
              justifyContent="space-between"
              sx={{
                width: "calc(100% - 40px)",
                margin: "20px",
                padding: "4px 8px 4px 16px",
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: "25px",
                "&:focus-within": {
                  borderColor: Colors.icons,
                },
              }}
            >
              <InputBase
                value={userPrompt}
                placeholder="What’s the weather today?"
                size="small"
                multiline
                maxRows={3}
                sx={{ width: "calc(100% - 48px)" }}
                disabled={processing}
                onChange={handleChange}
              />
              <IconButton onClick={handleSubmit} disabled={processing}>
                <SendIcon />
              </IconButton>
            </Stack>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
};

export default ChatWindow;
