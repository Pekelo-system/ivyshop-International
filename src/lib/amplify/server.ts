/**
 * Server-side Amplify configuration for ivyshop International.
 * Use runWithAmplifyServerContext in Server Components, Route Handlers, and Proxy.
 */

import { createServerRunner } from "@aws-amplify/adapter-nextjs";
import outputs from "../../../amplify_outputs.json";

export const { runWithAmplifyServerContext } = createServerRunner({
  config: outputs as Parameters<typeof createServerRunner>[0]["config"],
});
