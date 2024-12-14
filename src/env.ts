import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  client: {
    NEXT_PUBLIC_PANGEA_CLIENT_TOKEN: z.string().min(1).startsWith("pcl_"),
    NEXT_PUBLIC_AUTHN_UI_URL: z.string().min(1),
    NEXT_PUBLIC_PANGEA_BASE_DOMAIN: z
      .string()
      .min(1)
      .default("aws.us.pangea.cloud"),
  },
  server: {
    PANGEA_SERVICE_TOKEN: z.string().min(1).startsWith("pts_"),
    PANGEA_AUDIT_CONFIG_ID: z.string().min(1).startsWith("pci_"),
  },
  runtimeEnv: {
    NEXT_PUBLIC_PANGEA_CLIENT_TOKEN:
      process.env.NEXT_PUBLIC_PANGEA_CLIENT_TOKEN,
    NEXT_PUBLIC_AUTHN_UI_URL: process.env.NEXT_PUBLIC_AUTHN_UI_URL,
    NEXT_PUBLIC_PANGEA_BASE_DOMAIN: process.env.NEXT_PUBLIC_PANGEA_BASE_DOMAIN,
    PANGEA_SERVICE_TOKEN: process.env.PANGEA_SERVICE_TOKEN,
    PANGEA_AUDIT_CONFIG_ID: process.env.PANGEA_AUDIT_CONFIG_ID,
  },
});
