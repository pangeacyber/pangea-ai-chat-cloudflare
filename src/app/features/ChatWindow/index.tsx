"use client";

import type { DocumentInterface } from "@langchain/core/documents";
import RestartAlt from "@mui/icons-material/RestartAlt";
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
import { type AuthUser, useAuth } from "@pangeacyber/react-auth";
import type { AIGuard } from "pangea-node-sdk";
import {
  type ChangeEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { useAppState } from "@src/app/context";
import { Colors } from "@src/app/theme";
import { DAILY_MAX_MESSAGES, PROMPT_MAX_CHARS } from "@src/const";
import type {
  AIGuardResult,
  ChatMessage,
  DetectorOverrides,
  PangeaResponse,
} from "@src/types";
import { constructLlmInput, rateLimitQuery } from "@src/utils";

import ChatScroller from "./components/ChatScroller";
import {
  auditSearch,
  auditUserPrompt,
  callInputDataGuard,
  callResponseDataGuard,
  fetchDocuments,
  generateCompletions,
  unredact,
} from "./utils";

function hashCode(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
  }
  return (hash >>> 0).toString(36).padStart(7, "0") + Date.now();
}

/** Returns whether or not the given user is a Pangean. */
function isPangean(user: AuthUser): boolean {
  // Email is assumed to have been verified by the social auth provider.
  return user.email.endsWith("@pangea.cloud");
}

const ChatWindow = () => {
  const theme = useTheme();
  const {
    loading,
    authzEnabled,
    systemPrompt,
    userPrompt,
    detectors,
    setUserPrompt,
    setLoading,
    setLoginOpen,
    setAiGuardResponses,
    setAuthzResponses,
    setDocuments,
  } = useAppState();
  const { authenticated, user, logout } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [remaining, setRemaining] = useState(DAILY_MAX_MESSAGES);
  const [overlimit, setOverLimit] = useState(false);
  const [processing, setProcessing] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>();

  const processingError = (msg: string, status = 0) => {
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
  };

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

    setProcessing("Fetching documents");
    let docs: DocumentInterface[] = [];
    try {
      const docsResponse = await fetchDocuments(
        token,
        userPrompt,
        authzEnabled,
      );
      docs = docsResponse.documents;
      setAuthzResponses(docsResponse.authzResponses);
      setDocuments(docs);
    } catch (_) {
      setAuthzResponses([]);
      setDocuments([]);
    }

    let llmInput = constructLlmInput({
      systemPrompt,
      userPrompt,
      documents: docs,
      profile: user!.profile,
    });
    const overrides: DetectorOverrides = {
      code_detection: { disabled: !detectors.code_detection },
      language_detection: { disabled: !detectors.language_detection },
      malicious_entity: { disabled: !detectors.malicious_entity },
      pii_entity: { disabled: !detectors.pii_entity },
      prompt_injection: { disabled: !detectors.prompt_injection },
      secrets_detection: { disabled: !detectors.secrets_detection },
    };
    let guardedInput: PangeaResponse<AIGuardResult>;

    setProcessing("Checking user prompt with AI Guard");

    try {
      guardedInput = await callInputDataGuard(token, llmInput, overrides);
      setAiGuardResponses([
        guardedInput,
        {} as PangeaResponse<AIGuard.TextGuardResult<never>>,
      ]);
      const dgiMsg: ChatMessage = {
        hash: hashCode(JSON.stringify(guardedInput)),
        type: "ai_guard",
        findings: JSON.stringify(guardedInput.result.detectors),
      };
      setMessages((prevMessages) => [...prevMessages, dgiMsg]);

      llmInput = guardedInput.result.prompt_messages;

      // Halt early if any enabled detector detected something.
      if (
        (detectors.prompt_injection &&
          guardedInput.result.detectors.prompt_injection.detected) ||
        (detectors.malicious_entity &&
          guardedInput.result.detectors.malicious_entity?.detected)
      ) {
        processingError("Processing halted: suspicious prompt");
        return;
      }
    } catch (err) {
      const status = err instanceof Response ? err.status : 0;
      processingError("AI Guard call failed, please try again", status);
      return;
    }

    setProcessing("Waiting for LLM response");

    const dataGuardMessages: ChatMessage[] = [];
    let llmResponse = "";

    try {
      const llmResponseObj = await generateCompletions(
        token,
        llmInput,
        systemPrompt,
        userPrompt,
      );
      llmResponse = llmResponseObj.content;

      // Decrement daily remaining count if not a Pangean.
      if (user && !isPangean(user)) {
        setRemaining((curVal) => curVal - 1);
      }
    } catch (err) {
      const status = err instanceof Response ? err.status : 0;
      processingError("LLM call failed, please try again", status);
      return;
    }

    setProcessing("Checking LLM response with AI Guard");

    try {
      const dataResp = await callResponseDataGuard(
        token,
        llmResponse,
        overrides,
      );
      setAiGuardResponses([guardedInput!, dataResp]);
      const dgrMsg: ChatMessage = {
        hash: hashCode(JSON.stringify(dataResp)),
        type: "ai_guard",
        findings: JSON.stringify(dataResp.result.detectors),
      };
      dataGuardMessages.push(dgrMsg);

      llmResponse = dataResp.result.prompt_text;
    } catch (err) {
      const status = err instanceof Response ? err.status : 0;
      processingError("AI Guard call failed, please try again", status);
    }

    // Unredact if a FPE context was returned.
    if (guardedInput.result.fpe_context) {
      const unredacted = await unredact(
        token,
        llmResponse,
        guardedInput.result.fpe_context,
      );
      llmResponse = unredacted.result.data;
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

        // Rate limit for non-Pangeans.
        if (user && !isPangean(user)) {
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
        }

        // Load Chat history from audit log
        const response = await auditSearch(token, { limit: 50 });

        // biome-ignore lint/suspicious/noExplicitAny: TODO
        const messages_: ChatMessage[] = response.events.map((event: any) => {
          const message: ChatMessage = {
            hash: event.hash,
            type:
              event.envelope.event.type === "llm/end"
                ? "llm_response"
                : event.envelope.event.type,
            context: event.envelope.event.context,
            input: event.envelope.event.input,
            output: event.envelope.event.output,
            findings: event.envelope.event.findings,
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
        <Stack
          height="100%"
          alignItems="center"
          justifyContent="space-between"
          position="relative"
        >
          <IconButton
            aria-label="clear"
            title="Clear chat"
            onClick={() => setMessages([])}
            size="small"
            disableRipple
            sx={{
              position: "absolute",
              top: "0.35em",
              right: "0.45em",
            }}
          >
            <RestartAlt />
          </IconButton>
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
            {!loading && authenticated && user && !isPangean(user) && (
              <Typography
                variant="body2"
                fontSize="12px"
                lineHeight="20px"
                height="20px"
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
