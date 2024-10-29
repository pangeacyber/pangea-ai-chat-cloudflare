import { Stack } from "@mui/material";
import {
  LockOutlined,
  MediationOutlined,
  ReviewsOutlined,
} from "@mui/icons-material";
import { useAuth } from "@pangeacyber/react-auth";

import CollapsablePanel from "@app/components/CollapsablePanel";
import ServiceToggle from "./ServiceToggle";
import { useChatContext } from "@app/context";

const SecurityControls = () => {
  const { authenticated } = useAuth();
  const {
    dataGuardEnabled,
    promptGuardEnabled,
    auditPanelOpen,
    setDataGuardEnabled,
    setPromptGuardEnabled,
    setAuditPanelOpen,
    setLoginOpen,
  } = useChatContext();

  return (
    <CollapsablePanel title="Security">
      <Stack gap={1} py={1}>
        <ServiceToggle
          icon={<MediationOutlined />}
          name="Prompt Guard"
          link="#"
          active={promptGuardEnabled}
          type="toggle"
          changeHandler={() => {
            setPromptGuardEnabled(!promptGuardEnabled);
          }}
        />

        <ServiceToggle
          icon={<ReviewsOutlined />}
          name="AI Guard"
          link="#"
          active={dataGuardEnabled}
          type="toggle"
          changeHandler={() => {
            setDataGuardEnabled(!dataGuardEnabled);
          }}
        />

        <ServiceToggle
          icon={
            <LockOutlined color={auditPanelOpen ? "secondary" : "primary"} />
          }
          name="Secure Audit Log"
          link="#"
          active={true}
          type="link"
          changeHandler={() => {
            if (!authenticated) {
              setLoginOpen(true);
              return;
            }
            setAuditPanelOpen(!auditPanelOpen);
          }}
          linkLabel={auditPanelOpen ? "Hide" : "View"}
        />
      </Stack>
    </CollapsablePanel>
  );
};

export default SecurityControls;
