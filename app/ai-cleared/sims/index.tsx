"use client";

import type { Tool } from "../engine/types";
import type { SimProps } from "./types";
import CopilotSim from "./Copilot";
import ChatGPTSim from "./ChatGPT";
import GeminiSim from "./Gemini";
import ClaudeSim from "./Claude";

export type { SimMessage, SimProps, SimTier } from "./types";

/* The player mounts a simulator by tool and never knows which. */
export default function Simulator({ tool, ...props }: SimProps & { tool: Tool }) {
  switch (tool) {
    case "chatgpt":
      return <ChatGPTSim {...props} />;
    case "gemini":
      return <GeminiSim {...props} />;
    case "claude":
      return <ClaudeSim {...props} />;
    default:
      return <CopilotSim {...props} />;
  }
}
