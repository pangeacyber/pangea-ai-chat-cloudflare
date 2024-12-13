import {
  LockOutlined,
  MediationOutlined,
  ReviewsOutlined,
} from "@mui/icons-material";
import { Stack } from "@mui/material";
import { useAuth } from "@pangeacyber/react-auth";

import CollapsablePanel from "@app/components/CollapsablePanel";
import { useChatContext } from "@app/context";

import ServiceToggle from "./ServiceToggle";

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
          link="https://pangea.cloud/docs/api/prompt-guard"
          active={promptGuardEnabled}
          type="toggle"
          changeHandler={() => {
            setPromptGuardEnabled(!promptGuardEnabled);
          }}
        />

        <ServiceToggle
          icon={<ReviewsOutlined />}
          name="AI Guard"
          link="https://pangea.cloud/docs/api/ai-guard"
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
          link="https://pangea.cloud/docs/api/audit"
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
