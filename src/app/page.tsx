"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { AuthProvider } from "@pangeacyber/react-auth";

import { env } from "@src/env";
import Layout from "./features/Layout";
import PangeaDark from "./theme";

export default function Home() {
  return (
    <AuthProvider
      config={{
        domain: env.NEXT_PUBLIC_PANGEA_BASE_DOMAIN,
        clientToken: env.NEXT_PUBLIC_PANGEA_CLIENT_TOKEN,
      }}
      cookieOptions={{
        useCookie: true,
      }}
      // onLogin={handleLogin}
      loginUrl={env.NEXT_PUBLIC_AUTHN_UI_URL}
      useStrictStateCheck={false}
    >
      <AppRouterCacheProvider options={{ enableCssLayer: true }}>
        <ThemeProvider theme={PangeaDark()}>
          <CssBaseline />
          <Layout />
        </ThemeProvider>
      </AppRouterCacheProvider>
    </AuthProvider>
  );
}
