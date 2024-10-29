import { ChangeEvent, KeyboardEvent, useEffect, useState } from "react";
import {
  CircularProgress,
  IconButton,
  InputBase,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SendIcon from "@mui/icons-material/Send";
import { useAuth } from "@pangeacyber/react-auth";

import { DAILY_MAX_MESSAGES } from "@src/const";
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

function hashCode(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
  }
  return (hash >>> 0).toString(36).padStart(7, "0") + Date.now();
}

const ChatWindow = () => {
  const theme = useTheme();
  const {
    loading,
    processing,
    promptGuardEnabled,
    dataGuardEnabled,
    systemPrompt,
    userPrompt,
    setProcessing,
    setUserPrompt,
    setLoading,
    setLoginOpen,
  } = useChatContext();
  const { authenticated, user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [remaining, setRemaining] = useState(DAILY_MAX_MESSAGES);

  const handleSubmit = async () => {
    // require authentication
    if (!authenticated) {
      setLoginOpen(true);
      return;
    }

    // don't accept empty prompts
    if (!userPrompt) {
      return;
    }

    const token = user?.active_token?.token || "";

    setProcessing("Logging user prompt");

    const logEvent = {
      event: {
        event_type: "user_prompt",
        event_input: userPrompt,
        event_context: JSON.stringify({
          system_prompt: systemPrompt,
        }),
      },
    };

    const logResp = await auditUserPrompt(token, logEvent);
    const promptMsg: ChatMessage = {
      hash: logResp.hash,
      type: "user_prompt",
      input: userPrompt,
    };
    setMessages((prevMessages) => [...prevMessages, promptMsg]);
    setUserPrompt("");

    if (promptGuardEnabled) {
      setProcessing("Checking user prompt with Prompt Guard");

      const promptResp = await callPromptGuard(token, userPrompt, "");
      const pgMsg: ChatMessage = {
        hash: hashCode(JSON.stringify(promptResp)),
        type: "prompt_guard",
        output: JSON.stringify(promptResp),
      };
      setMessages((prevMessages) => [...prevMessages, pgMsg]);

      // don't send to the llm if prompt is malicious
      if (promptResp?.detected) {
        setProcessing("");
        return;
      }
    }

    let llmUserPrompt = userPrompt;

    if (dataGuardEnabled) {
      setProcessing("Checking user prompt with AI Guard");

      const dataResp = await callInputDataGuard(token, userPrompt);
      const dgiMsg: ChatMessage = {
        hash: hashCode(JSON.stringify(dataResp)),
        type: "data_guard",
        findings: JSON.stringify(dataResp.findings),
      };
      setMessages((prevMessages) => [...prevMessages, dgiMsg]);

      llmUserPrompt = dataResp.redacted_prompt;
    }

    setProcessing("Waiting for LLM response");

    const dataGuardMessages: ChatMessage[] = [];
    let llmResponse = await sendUserMessage(token, llmUserPrompt, systemPrompt);

    // decrement daily remaining count
    setRemaining((curVal) => curVal - 1);

    if (dataGuardEnabled) {
      setProcessing("Checking LLM response with AI Guard");
      const dataResp = await callResponseDataGuard(token, llmResponse);
      const dgrMsg: ChatMessage = {
        hash: hashCode(JSON.stringify(dataResp)),
        type: "data_guard",
        findings: JSON.stringify(dataResp.findings),
      };
      dataGuardMessages.push(dgrMsg);

      llmResponse = dataResp.redacted_prompt;
    }

    const llmMsg: ChatMessage = {
      hash: hashCode(llmResponse),
      type: "llm_response",
      output: llmResponse,
    };

    setMessages((prevMessages) => [
      ...prevMessages,
      llmMsg,
      ...dataGuardMessages,
    ]);
    setProcessing("");
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserPrompt(e.currentTarget.value);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    const loadSearchData = async () => {
      const token = user?.active_token?.token || "";
      if (token) {
        setLoading(true);

        //*************** */
        // TODO: move to shared function, and use in ai request as well
        // daily limit search
        const dt = new Date();
        const today = `${dt.getUTCFullYear()}-${(dt.getUTCMonth() + 1).toString().padStart(2, "0")}-${dt.getUTCDate().toString().padStart(2, "0")}T07:00:00Z`;

        const limitSearch = {
          query: "event_type:llm_response",
          limit: 1,
          start: today,
        };

        const searchResp = await auditSearch(token, limitSearch);
        const count = searchResp?.count || 20;
        setRemaining(DAILY_MAX_MESSAGES - count);
        //*************** */

        const response = await auditSearch(token, { limit: 50 });

        const messages_: ChatMessage[] = response.events.map((event: any) => {
          const message: ChatMessage = {
            hash: event.hash,
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

    if (authenticated && !loading && !processing) {
      loadSearchData();
    } else if (!authenticated && !loading) {
      setMessages([]);
    }
  }, [authenticated]);

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
          <Stack width="100%" sx={{ position: "relative" }}>
            <ChatScroller messages={messages} />
            <Stack
              direction="row"
              gap={1}
              alignItems="center"
              justifyContent="space-between"
              sx={{
                width: "calc(100% - 40px)",
                margin: "20px 20px 8px 20px",
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
                disabled={loading || !!processing}
                onChange={handleChange}
                onKeyDown={handleKeyPress}
              />
              <IconButton
                onClick={handleSubmit}
                disabled={loading || !!processing || remaining <= 0}
              >
                <SendIcon />
              </IconButton>
            </Stack>

            {!!processing && (
              <Stack
                direction="row"
                gap={2}
                alignItems="center"
                sx={{
                  position: "absolute",
                  bottom: "50px",
                  background: Colors.background.paper,
                  borderRadius: "10px",
                  padding: "12px 20px",
                  opacity: "0.8",
                  alignSelf: "center",
                }}
              >
                <Typography variant="body2">{processing}</Typography>
                <CircularProgress
                  size="20px"
                  sx={{ color: Colors.secondary }}
                />
              </Stack>
            )}
          </Stack>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            mb="12px"
          >
            <Typography
              variant="body2"
              sx={{ fontSize: "12px", lineHeight: "20px" }}
            >
              Message count: {remaining} remaining | You can send{" "}
              {DAILY_MAX_MESSAGES} messages a day
            </Typography>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
};

export default ChatWindow;
