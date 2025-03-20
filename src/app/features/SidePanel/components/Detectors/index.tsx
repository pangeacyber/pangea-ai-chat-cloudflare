import {
  AssignmentIndRounded,
  LanguageRounded,
  ReadMoreRounded,
  SettingsAccessibilityRounded,
  TerminalRounded,
  VpnKeyRounded,
} from "@mui/icons-material";
import {
  Box,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import type { ReactElement, ReactNode } from "react";

import { useChatContext } from "@src/app/context";

interface Detector {
  key: string;
  name: string;
  description: string;
  icon: ReactNode;
}

const DETECTORS: readonly Detector[] = [
  {
    key: "prompt_injection",
    name: "Prompt Injection",
    description: "Detects prompt injection and jailbreak attempts in text.",
    icon: <ReadMoreRounded />,
  },
  {
    key: "malicious_entity",
    name: "Malicious Entity",
    description:
      "Detect entities in text and run intelligence checks to determine if values are malicious.",
    icon: <AssignmentIndRounded />,
  },
  {
    key: "pii_entity",
    name: "Confidential and PII Entity",
    description:
      "Detect confidential and PII entity data within text leveraging out-of-box Redact rules.",
    icon: <SettingsAccessibilityRounded />,
  },
  {
    key: "secrets_detection",
    name: "Secret and Key Entity",
    description:
      "Detect API secret and key entities within text leveraging out-of-box Redact rules.",
    icon: <VpnKeyRounded />,
  },
  {
    key: "language_detection",
    name: "Language",
    description:
      "Detect languages within text and block based on the configured allow or block list.",
    icon: <LanguageRounded />,
  },
  {
    key: "code_detection",
    name: "Code",
    description: "Detect usage of a programming language in the text.",
    icon: <TerminalRounded />,
  },
];

const InfoTooltip = ({
  children,
  title,
}: {
  children: ReactElement;
  title: string;
}) => (
  <Tooltip
    title={
      <Box sx={{ p: 1 }}>
        <Typography variant="body2">
          {title}{" "}
          <Link
            target="_blank"
            rel="noreferrer"
            href="https://pangea.cloud/docs/ai-guard/general"
            sx={{
              color: "secondary.main",
              fontSize: "0.875rem",
              mt: 0.5,
              textDecoration: "none",
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            Learn more in docs.
          </Link>
        </Typography>
      </Box>
    }
    placement="right"
  >
    {children}
  </Tooltip>
);

const Detectors = () => {
  const { detectors, setDetectors } = useChatContext();

  return (
    <>
      <Typography variant="body2">
        AI Guard allows you to design recipes to protect against AI risks.
        Recipes are collections of detectors to block attacks, prevent
        disclosure, and avoid unwanted topics and content types.
      </Typography>

      <List>
        {DETECTORS.map((detector: Detector) => (
          <ListItem key={detector.name} disablePadding>
            <InfoTooltip title={detector.description}>
              <ListItemButton sx={{ borderRadius: "10px" }}>
                <ListItemIcon color="white">{detector.icon}</ListItemIcon>
                <ListItemText primary={detector.name} />
                <Switch
                  color="secondary"
                  inputProps={{ "aria-label": detector.name }}
                  checked={detectors[detector.key]}
                  onChange={(_, checked) =>
                    setDetectors({
                      ...detectors,
                      [detector.key]: checked,
                    })
                  }
                />
              </ListItemButton>
            </InfoTooltip>
          </ListItem>
        ))}
      </List>
    </>
  );
};

export default Detectors;
