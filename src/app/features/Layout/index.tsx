import { Box, Button, Drawer, Modal, Stack, Typography } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";

import { useAuth } from "@pangeacyber/react-auth";

import { Colors } from "@app/theme";
import SideBar from "@app/components/SideBar";
import AuditViewer from "../AuditViewer";
import SidePanel from "../SidePanel";
import ChatWindow from "../ChatWindow";
import { useChatContext } from "@app/context";
import PangeaLogo from "@src/app/components/Logo";

const panelOpenWidth = 330;

const Main = styled(Stack, { shouldForwardProp: (prop) => prop !== "open" })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  width: "100%",
  height: "100vh",
  padding: theme.spacing(2.5),
  paddingBottom: 0,
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${panelOpenWidth}px`,
  ...(open && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

const Layout = () => {
  const { sidePanelOpen, loginOpen, setSidePanelOpen, setLoginOpen } =
    useChatContext();
  const { login } = useAuth();

  const handlePanelOpen = () => {
    setSidePanelOpen(true);
  };

  const handlePanelClose = () => {
    setSidePanelOpen(false);
  };

  const handleLoginClose = () => {
    setLoginOpen(false);
  };

  return (
    <>
      <Box sx={{ display: "flex", background: Colors.background.default }}>
        {!sidePanelOpen && <SideBar handleClick={handlePanelOpen} />}
        <Drawer
          sx={{
            width: panelOpenWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: panelOpenWidth,
              boxSizing: "border-box",
              borderRight: "none",
            },
          }}
          open={sidePanelOpen}
          variant="persistent"
          anchor="left"
        >
          <SidePanel open={sidePanelOpen} onClose={handlePanelClose} />
        </Drawer>
        <Main open={sidePanelOpen}>
          <ChatWindow />
          <Stack alignItems="center">
            <AuditViewer />
          </Stack>
        </Main>
      </Box>
      <Modal open={loginOpen} onClose={handleLoginClose}>
        <Stack alignItems="center" justifyContent="center" height="100vh">
          <Stack
            gap={2}
            p={4}
            sx={{
              width: "380px",
              borderRadius: "10px",
              background: Colors.background.paper,
            }}
          >
            <Stack direction="row" gap={1} alignItems="center">
              <PangeaLogo />
              <Typography variant="body1">Pangea Chat</Typography>
            </Stack>
            <Typography variant="h5">Unlock Pangea Chat</Typography>
            <Typography variant="body2">
              Unlock access to try out Pangea AI Guard and Prompt Guard
              Services.
            </Typography>
            <Button variant="outlined" onClick={login}>
              Sign up or log in
            </Button>
          </Stack>
        </Stack>
      </Modal>
    </>
  );
};

export default Layout;
