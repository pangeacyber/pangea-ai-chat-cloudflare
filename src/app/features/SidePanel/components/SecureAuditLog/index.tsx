import { Button, Stack, Typography } from "@mui/material";

import { useAppState } from "@src/app/context";

const SecureAuditLog = () => {
  const { setAuditPanelOpen } = useAppState();

  return (
    <Stack spacing={2}>
      <Typography variant="body2">
        Secure Audit Log provides an AI Schema for attribution and tracking,
        including model details, prompts, responses, RAG source details,
        injections, PII entities, malicious entities, access details, and more.
      </Typography>

      <Button onClick={() => setAuditPanelOpen(true)} variant="outlined">
        Open Audit Log Viewer
      </Button>
    </Stack>
  );
};

export default SecureAuditLog;
