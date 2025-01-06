import SendIcon from "@mui/icons-material/Send";
import {
  Alert,
  Box,
  CircularProgress,
  IconButton,
  InputBase,
  Paper,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useAuth } from "@pangeacyber/react-auth";
import type { AIGuard } from "pangea-node-sdk";
import {
  type ChangeEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { type ChatMessage, useChatContext } from "@src/app/context";
import { Colors } from "@src/app/theme";
import { DAILY_MAX_MESSAGES, PROMPT_MAX_CHARS } from "@src/const";
import type { AIGuardResult, PangeaResponse } from "@src/types";
import { isAIGuardResultV2, rateLimitQuery } from "@src/utils";

import ChatScroller from "./components/ChatScroller";
import {
  auditSearch,
  auditUserPrompt,
  callInputDataGuard,
  callPromptGuard,
  callResponseDataGuard,
  sendUserMessage,
} from "./utils";

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
    promptGuardEnabled,
    dataGuardEnabled,
    authzEnabled,
    systemPrompt,
    userPrompt,
    setUserPrompt,
    setLoading,
    setLoginOpen,
    setPromptGuardResponse,
    setAiGuardResponses,
    setAuthzResponses,
    setDocuments,
  } = useChatContext();
  const { authenticated, user, logout } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [remaining, setRemaining] = useState(DAILY_MAX_MESSAGES);
  const [overlimit, setOverLimit] = useState(false);
  const [processing, setProcessing] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>();

  const processingError = useCallback(
    (msg: string, status = 0) => {
      if (status && status === 403) {
        setError("Session expired, please log in again");
        setProcessing("");
        logout();
        setLoginOpen(true);
      } else {
        setError(msg);
        setProcessing("");
        setOpen(true);
      }
    },
    [logout, setLoginOpen],
  );

  const handleSubmit = async () => {
    // require authentication
    if (!authenticated) {
      setLoginOpen(true);
      return;
    }

    // don't accept empty prompts
    if (!userPrompt || loading || !!processing || overlimit || remaining <= 0) {
      return;
    }

    const token = user?.active_token?.token || "";

    setProcessing("Logging user prompt");

    const logEvent = {
      event: {
        type: "user_prompt",
        input: userPrompt,
        context: JSON.stringify({
          system_prompt: systemPrompt,
        }),
      },
    };

    try {
      const logResp = await auditUserPrompt(token, logEvent);
      const promptMsg: ChatMessage = {
        hash: logResp.hash,
        type: "user_prompt",
        input: userPrompt,
      };
      setMessages((prevMessages) => [...prevMessages, promptMsg]);
      setUserPrompt("");
    } catch (err) {
      const status = err instanceof Response ? err.status : 0;
      processingError("User prompt logging failed, please try again", status);
      return;
    }

    if (promptGuardEnabled) {
      setProcessing("Checking user prompt with Prompt Guard");

      try {
        const promptResp = await callPromptGuard(token, userPrompt, "");
        setPromptGuardResponse(promptResp);
        const pgMsg: ChatMessage = {
          hash: hashCode(JSON.stringify(promptResp)),
          type: "prompt_guard",
          output: JSON.stringify(promptResp?.result),
        };
        setMessages((prevMessages) => [...prevMessages, pgMsg]);

        // don't send to the llm if prompt is malicious
        if (promptResp.result.detected) {
          processingError("Processing halted: suspicious prompt");
          return;
        }
      } catch (err) {
        const status = err instanceof Response ? err.status : 0;
        processingError("Prompt Guard call failed, please try again", status);
        return;
      }
    }

    let llmUserPrompt = userPrompt;
    let guardedInput: PangeaResponse<AIGuardResult>;

    if (dataGuardEnabled) {
      setProcessing("Checking user prompt with AI Guard");

      try {
        guardedInput = await callInputDataGuard(token, userPrompt);
        setAiGuardResponses([
          guardedInput,
          {} as PangeaResponse<AIGuard.TextGuardResult>,
        ]);
        const dgiMsg: ChatMessage = {
          hash: hashCode(JSON.stringify(guardedInput)),
          type: "ai_guard",
          findings: JSON.stringify(
            isAIGuardResultV2(guardedInput.result)
              ? guardedInput.result.detectors
              : guardedInput.result.findings,
          ),
        };
        setMessages((prevMessages) => [...prevMessages, dgiMsg]);

        llmUserPrompt = isAIGuardResultV2(guardedInput.result)
          ? guardedInput.result.prompt
          : guardedInput.result.redacted_prompt;
      } catch (err) {
        const status = err instanceof Response ? err.status : 0;
        processingError("AI Guard call failed, please try again", status);
        return;
      }
    }

    // don't send empty prompt
    if (!llmUserPrompt) {
      processingError("Processing halted: suspicious prompt");
      return;
    }

    setProcessing("Waiting for LLM response");

    const dataGuardMessages: ChatMessage[] = [];
    let llmResponse = "";

    try {
      const llmResponseObj = await sendUserMessage(
        token,
        llmUserPrompt,
        systemPrompt,
        authzEnabled,
      );
      llmResponse = llmResponseObj.content;
      setAuthzResponses(llmResponseObj.authzResponses);
      setDocuments(llmResponseObj.documents);

      // decrement daily remaining count
      setRemaining((curVal) => curVal - 1);
    } catch (err) {
      const status = err instanceof Response ? err.status : 0;
      processingError("LLM call failed, please try again", status);
      return;
    }

    if (dataGuardEnabled) {
      setProcessing("Checking LLM response with AI Guard");

      try {
        const dataResp = await callResponseDataGuard(token, llmResponse);
        setAiGuardResponses([guardedInput!, dataResp]);
        const dgrMsg: ChatMessage = {
          hash: hashCode(JSON.stringify(dataResp)),
          type: "ai_guard",
          findings: JSON.stringify(
            isAIGuardResultV2(dataResp.result)
              ? dataResp.result.detectors
              : dataResp.result.findings,
          ),
        };
        dataGuardMessages.push(dgrMsg);

        llmResponse = isAIGuardResultV2(dataResp.result)
          ? dataResp.result.prompt
          : dataResp.result.redacted_prompt;
      } catch (err) {
        const status = err instanceof Response ? err.status : 0;
        processingError("AI Guard call failed, please try again", status);
      }
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

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    setOverLimit(userPrompt.length + systemPrompt.length > PROMPT_MAX_CHARS);
  }, [userPrompt, systemPrompt]);

  useEffect(() => {
    if (!authenticated) {
      setError("");
    } else if (remaining <= 0) {
      setError("Your daily quota has been exceeded");
      setOpen(true);
    } else if (overlimit) {
      setError("Your prompt exceeds the maximum limit");
      setOpen(true);
    } else {
      setError("");
      setOpen(false);
    }
  }, [authenticated, remaining, overlimit]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: TODO
  useEffect(() => {
    const loadSearchData = async () => {
      const token = user?.active_token?.token || "";
      if (token) {
        setLoading(true);

        // Get LLM responses for the last 24-hours
        const limitSearch = rateLimitQuery();
        limitSearch.search_restriction = { actor: [user?.username] };
        const searchResp = await auditSearch(token, limitSearch).catch(
          (err) => {
            const status = err instanceof Response ? err.status : 0;
            processingError("", status);
            setLoading(false);
            throw err;
          },
        );
        const count = searchResp?.count || 0;
        setRemaining(DAILY_MAX_MESSAGES - count);

        // Load Chat history from audit log
        const response = await auditSearch(token, { limit: 50 });

        // biome-ignore lint/suspicious/noExplicitAny: TODO
        const messages_: ChatMessage[] = response.events.map((event: any) => {
          const message: ChatMessage = {
            hash: event.hash,
            type: event.envelope.event.type,
            context: event.envelope.event.context,
            input: event.envelope.event.input,
            output: event.envelope.event.output,
            findings: event.envelope.event.findings,
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

  useEffect(() => {
    if (!loading && !processing) {
      inputRef.current?.focus();
    }
  }, [processing, loading]);

  return (
    <Stack width="100%" height="100%">
      <Paper sx={{ height: "100%" }}>
        <Stack height="100%" alignItems="center" justifyContent="space-between">
          <Typography
            variant="h1"
            sx={{
              display: "flex",
              height: "100%",
              alignItems: "center",
              textAlign: "center",
            }}
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
                position: "relative",
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
              <Box
                sx={{
                  position: "absolute",
                  top: "0",
                  width: "100%",
                }}
              >
                <Snackbar
                  open={open}
                  autoHideDuration={5000}
                  anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                  onClose={handleClose}
                  sx={{
                    position: "absolute",
                    width: "100%",
                  }}
                >
                  <Alert severity="info" variant="filled">
                    <Typography variant="body1">{error}</Typography>
                  </Alert>
                </Snackbar>
              </Box>
              <InputBase
                inputRef={inputRef}
                value={userPrompt}
                placeholder="What’s the weather today?"
                size="small"
                multiline
                maxRows={4}
                sx={{ width: "calc(100% - 48px)" }}
                disabled={loading || !!processing}
                onChange={handleChange}
                onKeyDown={handleKeyPress}
              />
              <Tooltip title={error} placement="top" color="warning">
                <span>
                  <IconButton
                    onClick={handleSubmit}
                    disabled={
                      loading || !!processing || overlimit || remaining <= 0
                    }
                  >
                    <SendIcon />
                  </IconButton>
                </span>
              </Tooltip>
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
            {!loading && authenticated && (
              <Typography
                variant="body2"
                sx={{ fontSize: "12px", lineHeight: "20px", height: "20px" }}
              >
                Message count: {remaining} remaining | You can send{" "}
                {DAILY_MAX_MESSAGES} messages a day
              </Typography>
            )}
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
};

export default ChatWindow;
