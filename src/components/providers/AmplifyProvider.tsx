"use client";

import { Amplify } from "aws-amplify";
import outputs from "../../../amplify_outputs.json";

// Configure Amplify on module load (client-side only)
Amplify.configure(outputs as Parameters<typeof Amplify.configure>[0], {
  ssr: true,
});

export function AmplifyProvider({ children }: { children: React.ReactNode }) {
  // Always render children — Amplify is configured at module level
  return <>{children}</>;
}
