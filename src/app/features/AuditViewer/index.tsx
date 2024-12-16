import {
  Close,
  ExpandLess,
  ExpandMore,
  LockOutlined,
} from "@mui/icons-material";
import { Collapse, IconButton, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useAuth } from "@pangeacyber/react-auth";
import {
  type Audit,
  AuditLogViewer,
} from "@pangeacyber/react-mui-audit-log-viewer";

import { useChatContext } from "@app/context";
import { Colors } from "@app/theme";
import { auditProxyRequest } from "@src/app/proxy";

const visibilityModel = {
  timestamp: true,
  type: true,
  input: true,
  findings: true,
};

const schema = {
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
      id: "type",
      name: "Event Type",
      required: true,
    },
    {
      id: "input",
      name: "Input",
      required: true,
    },
    {
      id: "output",
      name: "Output",
    },
    {
      id: "findings",
      name: "Findings",
      type: "string",
      required: false,
    },
    {
      id: "context",
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

    if (token) {
      return await auditProxyRequest(token, "search", body);
    }

    const response: Audit.SearchResponse = {
      id: "none",
      count: 0,
      expires_at: "",
      events: [],
    };
    return response;
  };

  const handlePageChange = async (body: Audit.ResultRequest) => {
    const token = user?.active_token?.token || "";

    if (token) {
      return await auditProxyRequest(token, "page", body);
    }

    const response: Audit.SearchResponse = {
      id: "none",
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

  const Icon = auditPanelOpen ? ExpandMore : ExpandLess;

  return (
    <Stack width="100%">
      <Stack direction="row" justifyContent="center">
        <Icon
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
              ? "calc(100vw - 860px)"
              : "calc(100vw - 580px)",
            marginBottom: "20px",
            padding: "20px",
            borderRadius: "10px",
            background: theme.palette.background.paper,
            "& .react-json-view": {
              backgroundColor: "#D3D3D3 !important",
              borderRadius: "2px",
            },
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
          {auditPanelOpen && (
            <AuditLogViewer
              initialQuery=""
              // @ts-ignore
              onSearch={handleSearch}
              // @ts-ignore
              onPageChange={handlePageChange}
              searchOnMount={true}
              schema={schema as unknown as Audit.Schema}
              visibilityModel={visibilityModel}
            />
          )}
        </Stack>
      </Collapse>
    </Stack>
  );
};

export default AuditViewer;
