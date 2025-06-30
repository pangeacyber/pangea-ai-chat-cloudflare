"use client";

import RightSideBar from "@app/components/RightSideBar";
import SideBar from "@app/components/SideBar";
import { useAppState } from "@app/context";
import { Colors } from "@app/theme";
import { Box, Button, Drawer, Modal, Stack, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useAuth } from "@pangeacyber/react-auth";
import PangeaLogo from "@src/app/components/Logo";

import AuditViewer from "../AuditViewer";
import ChatWindow from "../ChatWindow";
import ResponsesSidePanel from "../ResponsesSidePanel";
import SidePanel from "../SidePanel";

const panelOpenWidth = 330;

const Main = styled(Stack, {
  shouldForwardProp: (prop) => prop !== "leftOpen" && prop !== "rightOpen",
})<{
  leftOpen?: boolean;
  rightOpen?: boolean;
}>(({ theme, leftOpen, rightOpen }) => ({
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
  ...(leftOpen && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),

  ...(rightOpen && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: 0,
  }),
}));

const Layout = () => {
  const {
    sidePanelOpen,
    rightPanelOpen,
    loginOpen,
    setSidePanelOpen,
    setRightPanelOpen,
    setLoginOpen,
  } = useAppState();
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
          anchor="left"
          open={sidePanelOpen}
          sx={{
            width: panelOpenWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: panelOpenWidth,
              boxSizing: "border-box",
              borderRight: "none",
            },
          }}
          variant="persistent"
        >
          <SidePanel onClose={handlePanelClose} open={sidePanelOpen} />
        </Drawer>
        <Main leftOpen={sidePanelOpen} rightOpen={rightPanelOpen}>
          <ChatWindow />
          <Stack alignItems="center">
            <AuditViewer />
          </Stack>
        </Main>

        {!rightPanelOpen && (
          <RightSideBar handleClick={() => setRightPanelOpen(true)} />
        )}
        <Drawer
          anchor="right"
          open={rightPanelOpen}
          sx={{
            flexShrink: 0,
            ...(rightPanelOpen && {
              width: panelOpenWidth * 1.5,
            }),
            "& .MuiDrawer-paper": {
              width: panelOpenWidth * 1.5,
              boxSizing: "border-box",
              borderLeft: "none",
            },
          }}
          variant="persistent"
        >
          <ResponsesSidePanel
            onClose={() => setRightPanelOpen(false)}
            open={rightPanelOpen}
          />
        </Drawer>
      </Box>
      <Modal onClose={handleLoginClose} open={loginOpen}>
        <Stack alignItems="center" height="100vh" justifyContent="center">
          <Stack
            gap={2}
            p={4}
            sx={{
              width: "380px",
              borderRadius: "10px",
              background: Colors.background.paper,
            }}
          >
            <Stack alignItems="center" direction="row" gap={1}>
              <PangeaLogo />
              <Typography variant="body1">Pangea Chat</Typography>
            </Stack>
            <Typography variant="h5">Unlock Pangea Chat</Typography>
            <Typography variant="body2">
              Unlock access to try out Pangea AI Guard and Prompt Guard
              Services.
            </Typography>
            <Button onClick={login} variant="outlined">
              Sign up or log in
            </Button>
          </Stack>
        </Stack>
      </Modal>
    </>
  );
};

export default Layout;
