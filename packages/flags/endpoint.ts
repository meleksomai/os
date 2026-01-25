import { createFlagsDiscoveryEndpoint, getProviderData } from "flags/next";
import type { NextRequest } from "next/server";
// biome-ignore lint/performance/noNamespaceImport: needed for dynamic flag imports
import * as flags from "./index";

export const getFlagsEndpoint: (request: NextRequest) => Promise<Response> =
  createFlagsDiscoveryEndpoint(() => getProviderData(flags));
