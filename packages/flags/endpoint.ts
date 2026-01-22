import { createFlagsDiscoveryEndpoint, getProviderData } from "flags/next";
import * as flags from "./index";

export const getFlagsEndpoint: (request: any) => Promise<Response> =
  createFlagsDiscoveryEndpoint(() => getProviderData(flags));
