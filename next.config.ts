import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {};

export default withSentryConfig(nextConfig, {
  org: "buildwithcode",
  project: "gko-hack-desktop",
  silent: !process.env.CI,
});
