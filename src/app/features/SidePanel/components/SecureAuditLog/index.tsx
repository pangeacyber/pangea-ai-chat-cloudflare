import { Button, Stack, Typography } from "@mui/material";

import { useChatContext } from "@src/app/context";

const SecureAuditLog = () => {
  const { setAuditPanelOpen } = useChatContext();

  return (
    <Stack spacing={2}>
      <Typography variant="body2">
        Secure Audit Log provides an AI Schema for attribution and tracking,
        including model details, prompts, responses, RAG source details,
        injections, PII entities, malicious entities, access details, and more.
      </Typography>

      <Button variant="outlined" onClick={() => setAuditPanelOpen(true)}>
        Open Audit Log Viewer
      </Button>
    </Stack>
  );
};

export default SecureAuditLog;
