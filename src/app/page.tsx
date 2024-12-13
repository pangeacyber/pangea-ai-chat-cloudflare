"use client";

import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { AuthProvider } from "@pangeacyber/react-auth";

import { ChatProvider } from "./context";
import Layout from "./features/Layout";
import PangeaDark from "./theme";

const LOGIN_URL = process.env.NEXT_PUBLIC_AUTHN_UI_URL || "";
const CLIENT_TOKEN = process.env.NEXT_PUBLIC_PANGEA_CLIENT_TOKEN || "";
const PANGEA_DOMAIN =
  process.env.NEXT_PUBLIC_PANGEA_BASE_DOMAIN || "aws.us.pangea.cloud";

export default function Home() {
  return (
    <AuthProvider
      config={{
        domain: PANGEA_DOMAIN,
        clientToken: CLIENT_TOKEN,
      }}
      cookieOptions={{
        useCookie: true,
      }}
      // onLogin={handleLogin}
      loginUrl={LOGIN_URL}
      useStrictStateCheck={false}
    >
      <ThemeProvider theme={PangeaDark}>
        <CssBaseline />
        <ChatProvider>
          <Layout />
        </ChatProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
