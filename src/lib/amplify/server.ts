/**
 * Server-side Amplify configuration for ivyshop International.
 * Use runWithAmplifyServerContext in Server Components, Route Handlers, and Middleware.
 */

import { createServerRunner } from "@aws-amplify/adapter-nextjs";

let outputs: Record<string, unknown> = {};

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  outputs = require("../../../amplify_outputs.json");
} catch {
  // amplify_outputs.json not yet generated
}

export const { runWithAmplifyServerContext } = createServerRunner({
  config: outputs as Parameters<typeof createServerRunner>[0]["config"],
});
