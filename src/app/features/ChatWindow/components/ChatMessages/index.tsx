import { ReviewsOutlined } from "@mui/icons-material";
import { Avatar, Box, Stack, Typography } from "@mui/material";
import PangeaLogo from "@src/app/components/Logo";
import { Colors } from "@src/app/theme";
import type { AIGuardResult } from "@src/types";
import type { FC } from "react";

interface UserPromptProps {
  message: string;
  username: string;
}

interface AiGuardProps {
  findings: string;
}

interface LlmMessageProps {
  message: string;
}

export const UserPromptMessage: FC<UserPromptProps> = ({
  message,
  username,
}) => {
  return (
    <Stack
      alignItems="center"
      direction="row"
      gap={1}
      justifyContent="flex-end"
      sx={{
        margin: "24px 0 24px 100px",
      }}
    >
      <Typography variant="body1">{message}</Typography>
      <Avatar
        sx={{
          width: 32,
          height: 32,
          fontSize: "14px",
          textTransform: "uppercase",
        }}
      >
        {username[0]}
      </Avatar>
    </Stack>
  );
};

export const LlmResponse: FC<LlmMessageProps> = ({ message }) => {
  return (
    <Stack
      direction="row"
      gap={2}
      justifyContent="flex-start"
      sx={{
        margin: "24px 100px 24px 0",
        pre: {
          margin: "0",
          fontFamily: "inherit",
          fontSize: "14px",
          lineHeight: "18px",
          whiteSpace: "break-spaces",
        },
      }}
    >
      <Box width="32px">
        <PangeaLogo size={32} />
      </Box>
      <Stack justifyContent="center">
        <pre>{message}</pre>
      </Stack>
    </Stack>
  );
};

export const AiGuardMessage: FC<AiGuardProps> = ({ findings }) => {
  const findingsJSON: AIGuardResult["detectors"] = JSON.parse(findings);

  const malicious = findingsJSON?.malicious_entity?.data?.entities?.length || 0;
  const injection =
    findingsJSON?.prompt_injection?.data?.analyzer_responses?.length || 0;
  const redacted =
    findingsJSON?.pii_entity?.data?.entities?.filter(
      (entity) => entity.action === "redacted",
    ).length || 0;

  let result = "Findings: ";
  let addPipe = false;

  if (injection) {
    addPipe = true;
    result += "Prompt injection";
  }

  if (redacted) {
    if (addPipe) {
      result += " | ";
    }
    result += `${redacted} ${redacted > 1 ? "entities" : "entity"} detected`;
    addPipe = true;
  }

  if (malicious) {
    if (addPipe) {
      result += " | ";
    }
    result += `${malicious} malicious item${malicious > 1 ? "s" : ""}`;
    addPipe = true;
  }

  if (!(redacted || injection || malicious)) {
    result += "None";
  }

  return (
    <Stack
      alignItems="center"
      direction="row"
      gap={1}
      justifyContent="flex-start"
      sx={{
        marginBottom: "2px",
        padding: "12px 20px",
        borderRadius: "10px",
        background: Colors.card,
      }}
    >
      <ReviewsOutlined sx={{ color: Colors.secondary }} />
      <Typography
        sx={{ fontSize: "14px", whiteSpace: "nowrap" }}
        variant="body1"
      >
        AI Guard
      </Typography>
      <Typography variant="body2">{result}</Typography>
    </Stack>
  );
};
