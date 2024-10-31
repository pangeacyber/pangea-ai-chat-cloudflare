import { FC } from "react";
import { Avatar, Box, Stack, Typography } from "@mui/material";
import { MediationOutlined, ReviewsOutlined } from "@mui/icons-material";
import PangeaLogo from "@src/app/components/Logo";
import { Colors } from "@src/app/theme";

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
  const findingsJSON = JSON.parse(findings);
  const malicous = findingsJSON?.malicious_count || 0;
  const injection = findingsJSON?.prompt_injection_count || 0;
  // const artifacts = findingsJSON?.artifact_count || 0;
  const redacted = findingsJSON?.security_issues?.redact_rule_match_count || 0;
  // const ips = findingsJSON?.security_issues?.malicious_ip_count || 0;
  // const domains = findingsJSON?.security_issues?.malicious_domain_count || 0;
  // const urls = findingsJSON?.security_issues?.malicious_url_count || 0;
  const emails =
    findingsJSON?.security_issues?.compromised_email_addresses || 0;

  let result = "Findings: ";
  let addPipe = false;

  if (injection) {
    addPipe = true;
    result += `Prompt injection`;
  }

  if (redacted) {
    if (addPipe) result += " | ";
    result += `${redacted} item${redacted > 1 ? "s" : ""} redacted`;
    addPipe = true;
  }

  if (malicous) {
    if (addPipe) result += " | ";
    result += `${malicous} malicous item${malicous > 1 ? "s" : ""}`;
    addPipe = true;
  }

  if (emails) {
    if (addPipe) result += " | ";
    result += `${emails} compromised email${emails > 1 ? "s" : ""}`;
    addPipe = true;
  }

  if (!(redacted || injection || malicous || emails)) {
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
        Data Guard
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
