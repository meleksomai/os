import { createFlagsDiscoveryEndpoint, getProviderData } from "flags/next";

// biome-ignore lint/performance/noNamespaceImport: needed for dynamic flag imports
import * as flags from "./index";

// biome-ignore lint/suspicious/noExplicitAny: needed for dynamic flag imports
export const getFlagsEndpoint: (request: any) => Promise<Response> =
  createFlagsDiscoveryEndpoint(() => getProviderData(flags));
