import ViewSidebarOutlinedIcon from "@mui/icons-material/ViewSidebarOutlined";
import { IconButton, Stack, Tabs, Typography } from "@mui/material";
import { type FC, useState } from "react";

import LoginWidget from "@app/components/LoginWidget";
import PangeaLogo from "@app/components/Logo";
import PanelHeader from "@app/components/PanelHeader";
import { Colors } from "@app/theme";

import AuthZ from "./components/AuthZ";
import Detectors from "./components/Detectors";
import SecureAuditLog from "./components/SecureAuditLog";
import ServiceTab from "./components/ServiceTab";

interface Props {
  open: boolean;
  onClose: () => void;
}

const SidePanel: FC<Props> = ({ onClose }) => {
  const [tab, setTab] = useState(0);

  return (
    <Stack
      justifyContent="space-between"
      sx={{
        height: "100%",
        background: Colors.background.default,
      }}
    >
      <Stack ml="20px" overflow="auto">
        <PanelHeader>
          <Stack direction="row" gap={1} p="24px 20px">
            <PangeaLogo />
            <Typography variant="h6">Pangea Chat</Typography>
          </Stack>
          <IconButton onClick={onClose}>
            <ViewSidebarOutlinedIcon sx={{ color: Colors.icons }} />
          </IconButton>
        </PanelHeader>

        <Tabs
          value={tab}
          onChange={(_, newValue) => setTab(newValue)}
          sx={{
            borderBottom: "1px solid #4D5159",
            marginBottom: "20px",
            "& .MuiTabs-indicator": { display: "none" },
          }}
        >
          <ServiceTab label="AI Guard" />
          <ServiceTab label="AuthZ" />
          <ServiceTab label="Secure Audit Log" />
        </Tabs>

        {tab === 0 && <Detectors />}
        {tab === 1 && <AuthZ />}
        {tab === 2 && <SecureAuditLog />}
      </Stack>
      <LoginWidget />
    </Stack>
  );
};

export default SidePanel;
