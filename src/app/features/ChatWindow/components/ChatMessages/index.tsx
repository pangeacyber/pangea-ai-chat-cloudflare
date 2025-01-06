import { MediationOutlined, ReviewsOutlined } from "@mui/icons-material";
import { Avatar, Box, Stack, Typography } from "@mui/material";
import type { FC } from "react";

import PangeaLogo from "@src/app/components/Logo";
import { Colors } from "@src/app/theme";
import type { AIGuardResultV1, AIGuardResultV2 } from "@src/types";

function isAIGuardFindings(
  x: AIGuardResultV1["findings"] | AIGuardResultV2["detectors"],
): x is AIGuardResultV1["findings"] {
  return "prompt_injection_count" in x || "security_issues" in x;
}

interface UserPromptProps {
  message: string;
  username: string;
}

interface AiGuardProps {
  findings: string;
}

interface PromptGuardProps {
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
      direction="row"
      gap={1}
      alignItems="center"
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
      justifyContent="flex-start"
      gap={2}
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
  const findingsJSON:
    | AIGuardResultV1["findings"]
    | AIGuardResultV2["detectors"] = JSON.parse(findings);

  let malicious = 0;
  let injection = 0;
  let redacted = 0;

  if (isAIGuardFindings(findingsJSON)) {
    malicious = findingsJSON?.malicious_count || 0;

    // @ts-expect-error SDK interface is outdated.
    injection = findingsJSON?.prompt_injection_count || 0;

    // const artifacts = findingsJSON?.artifact_count || 0;
    redacted = findingsJSON?.security_issues?.redact_rule_match_count || 0;
    // const ips = findingsJSON?.security_issues?.malicious_ip_count || 0;
    // const domains = findingsJSON?.security_issues?.malicious_domain_count || 0;
    // const urls = findingsJSON?.security_issues?.malicious_url_count || 0;
  } else {
    malicious = findingsJSON?.malicious_entity?.data?.entities?.length || 0;
    injection =
      findingsJSON?.prompt_injection?.data?.analyzer_responses?.length || 0;
    redacted =
      findingsJSON?.pii_entity?.data?.entities?.filter(
        (entity) => entity.redacted,
      ).length || 0;
  }

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
    result += `${malicious} malicous item${malicious > 1 ? "s" : ""}`;
    addPipe = true;
  }

  if (!(redacted || injection || malicious)) {
    result += "None";
  }

  return (
    <Stack
      direction="row"
      gap={1}
      alignItems="center"
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
        variant="body1"
        sx={{ fontSize: "14px", whiteSpace: "nowrap" }}
      >
        AI Guard
      </Typography>
      <Typography variant="body2">{result}</Typography>
    </Stack>
  );
};

export const PromptGuardMessage: FC<PromptGuardProps> = ({ findings }) => {
  const findingsJSON = JSON.parse(findings);
  const verdict = findingsJSON?.detected ? "Detected" : "Benign";
  const confidence = findingsJSON?.confidence
    ? `${findingsJSON.confidence}%`
    : "";

  return (
    <Stack
      direction="row"
      gap={1}
      alignItems="center"
      justifyContent="space-between"
      sx={{
        marginBottom: "2px",
        padding: "12px 20px",
        borderRadius: "10px",
        background: Colors.card,
      }}
    >
      <Stack direction="row" alignItems="center" gap={1}>
        <MediationOutlined sx={{ color: Colors.secondary }} />
        <Typography
          variant="body1"
          sx={{ fontSize: "14px", whiteSpace: "nowrap" }}
        >
          Prompt Guard
        </Typography>
        <Typography variant="body2">{verdict}</Typography>
      </Stack>
      <Typography variant="body2">{confidence}</Typography>
    </Stack>
  );
};
