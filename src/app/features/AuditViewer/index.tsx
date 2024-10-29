import { Collapse, IconButton, Stack, Typography } from "@mui/material";
import { Close, DragHandle, LockOutlined } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { Audit, AuditLogViewer } from "@pangeacyber/react-mui-audit-log-viewer";
import { useAuth } from "@pangeacyber/react-auth";

import { Colors } from "@app/theme";
import { useChatContext } from "@app/context";
import { auditProxyRequest } from "@src/app/proxy";

const visibilityModel: any = {
  timestamp: true,
  event_type: true,
  event_input: true,
  event_findings: true,
};

const schema: any = {
  tamper_proofing: false,
  fields: [
    {
      id: "timestamp",
      name: "Timestamp",
      size: 128,
      type: "datetime",
      required: true,
    },
    {
      id: "event_type",
      name: "Event Type",
      required: true,
    },
    {
      id: "event_input",
      name: "Input",
      required: true,
    },
    {
      id: "event_output",
      name: "Output",
    },
    {
      id: "findings",
      name: "Findings",
      required: false,
    },
    {
      id: "event_context",
      name: "Context",
      required: false,
    },
  ],
};

const AuditViewer = () => {
  const theme = useTheme();
  const { authenticated, user } = useAuth();
  const { sidePanelOpen, auditPanelOpen, setAuditPanelOpen, setLoginOpen } =
    useChatContext();

  const handleSearch = async (body: Audit.SearchRequest) => {
    const token = user?.active_token?.token || "";

    if (!token) {
      const response: Audit.SearchResponse = {
        id: "none",
        count: 0,
        expires_at: "",
        events: [],
      };
      return response;
    } else {
      return await auditProxyRequest(token, "search", body);
    }
  };

  const handlePageChange = async (body: Audit.ResultRequest) => {
    const token = user?.active_token?.token || "";

    if (!token) {
      const response: Audit.SearchResponse = {
        id: "test",
        count: 0,
        expires_at: "",
        events: [],
      };
      return response;
    } else {
      return await auditProxyRequest(token, "page", body);
    }
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
            // @ts-ignore
            onSearch={handleSearch}
            // @ts-ignore
            onPageChange={handlePageChange}
            searchOnMount={false}
            schema={schema}
            visibilityModel={visibilityModel}
          />
        </Stack>
      </Collapse>
    </Stack>
  );
};

export default AuditViewer;
