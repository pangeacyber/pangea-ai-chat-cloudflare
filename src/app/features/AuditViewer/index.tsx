import { Collapse, IconButton, Stack, Typography } from "@mui/material";
import { Close, DragHandle, LockOutlined } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import {
  Audit,
  AuditLogViewerProps,
  AuditLogViewer,
} from "@pangeacyber/react-mui-audit-log-viewer";
import { useAuth } from "@pangeacyber/react-auth";

import { Colors } from "@app/theme";
import { useChatContext } from "@app/context";

const AuditViewer = () => {
  const theme = useTheme();
  const { authenticated } = useAuth();
  const { sidePanelOpen, auditPanelOpen, setAuditPanelOpen, setLoginOpen } =
    useChatContext();

  const handleSearch = async (body: Audit.SearchRequest) => {
    // Perform search logic here
    const response: Audit.SearchResponse = {
      id: "test",
      count: 0,
      expires_at: "",
      events: [],
    };
    return response;
  };

  const handlePageChange = async (body: Audit.ResultRequest) => {
    // Handle page change logic here
    const response: Audit.SearchResponse = {
      id: "test",
      count: 0,
      expires_at: "",
      events: [],
    };
    return response;
  };

  const handleHandleClick = () => {
    if (!authenticated) {
      setLoginOpen(true);
      return;
    }

    setAuditPanelOpen(!auditPanelOpen);
  };

  return (
    <Stack width="100%">
      <Stack direction="row" justifyContent="center">
        <DragHandle
          fontSize="small"
          onClick={handleHandleClick}
          sx={{ cursor: "pointer", color: Colors.icons }}
        />
      </Stack>
      <Collapse orientation="vertical" in={auditPanelOpen}>
        <Stack
          gap={2}
          sx={{
            width: sidePanelOpen
              ? "calc(100vw - 375px)"
              : "calc(100vw - 120px)",
            marginBottom: "20px",
            padding: "20px",
            borderRadius: "10px",
            background: theme.palette.background.paper,
          }}
        >
          <Stack direction="row" justifyContent="space-between">
            <Stack direction="row" gap={2}>
              <LockOutlined sx={{ color: theme.palette.secondary.main }} />
              <Typography variant="body1">Secure Audit Log Viewer</Typography>
            </Stack>
            <IconButton
              onClick={() => {
                setAuditPanelOpen(!auditPanelOpen);
              }}
            >
              <Close sx={{ color: Colors.icons }} />
            </IconButton>
          </Stack>
          <AuditLogViewer
            initialQuery=""
            onSearch={handleSearch}
            onPageChange={handlePageChange}
          />
        </Stack>
      </Collapse>
    </Stack>
  );
};

export default AuditViewer;
