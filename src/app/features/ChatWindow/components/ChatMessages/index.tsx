import { FC } from "react";
import { Avatar, Box, Stack, Typography } from "@mui/material";
import { MediationOutlined, ReviewsOutlined } from "@mui/icons-material";
import PangeaLogo from "@src/app/components/Logo";
import { Colors } from "@src/app/theme";

interface UserPromptProps {
  message: string;
  username: string;
}

interface DataGuardProps {
  findings: string;
}

interface PromptGuardProps {
  verdict: string;
  confidence: string;
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
      gap={1}
      sx={{
        margin: "24px 100px 24px 0",
        pre: {
          margin: "0",
          fontFamily: "inherit",
          fontSize: "12px",
          lineHeight: "16px",
          whiteSpace: "break-spaces",
        },
      }}
    >
      <Box width="32px">
        <PangeaLogo size={32} />
      </Box>
      <pre>{message}</pre>
    </Stack>
  );
};

export const DataGuardMessage: FC<DataGuardProps> = ({ findings }) => {
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
      <Typography variant="body2">{findings}</Typography>
    </Stack>
  );
};

export const PromptGuardMessage: FC<PromptGuardProps> = ({
  verdict,
  confidence,
}) => {
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
      <Stack direction="row" alignItems="center">
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
