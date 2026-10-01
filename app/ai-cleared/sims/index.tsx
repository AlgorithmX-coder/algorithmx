"use client";

import type { AttachedDocument, OfficeApp, Tool } from "../engine/types";
import type { SimProps } from "./types";
import CopilotSim from "./Copilot";
import ChatGPTSim from "./ChatGPT";
import GeminiSim from "./Gemini";
import ClaudeSim from "./Claude";
import OfficeFrame from "./OfficeFrame";

export type { SimMessage, SimProps, SimTier } from "./types";

/* The player mounts a simulator by tool and never knows which. With
 * `office`, Copilot runs as the pane inside that Office app with the
 * material open; the other three tools show the material as an
 * attachment chip above the composer. */
export default function Simulator({ tool, office, material, ...props }: SimProps & { tool: Tool; office?: OfficeApp; material?: AttachedDocument }) {
  const attachment = props.attachment ?? (material ? { title: material.title, kind: material.kind } : undefined);
  switch (tool) {
    case "chatgpt":
      return <ChatGPTSim {...props} attachment={attachment} />;
    case "gemini":
      return <GeminiSim {...props} attachment={attachment} />;
    case "claude":
      return <ClaudeSim {...props} attachment={attachment} />;
    default:
      if (office && material) {
        return (
          <OfficeFrame app={office} material={material} firmName={props.firmName} learnerName={props.learnerName}>
            <CopilotSim {...props} pane />
          </OfficeFrame>
        );
      }
      return <CopilotSim {...props} attachment={attachment} />;
  }
}
