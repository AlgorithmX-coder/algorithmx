import { Chakra_Petch, Inter, JetBrains_Mono } from "next/font/google";
import FieldUnit from "./FieldUnit";

/* The /cyberexplorers "Field Unit" page: this server wrapper loads the
 * design's three faces (Chakra Petch for display, Inter for body, JetBrains
 * Mono for labels) and hands their variables to the client page. Declaring
 * them here rather than in the "use client" file keeps the generated class
 * names identical on server and client (Inter is also declared by the root
 * layout, and declaring it again in a client module hydrated with a
 * different class name in dev). */

const disp = Chakra_Petch({ weight: ["600", "700"], subsets: ["latin"], variable: "--cx9-f-disp", display: "swap" });
const sans = Inter({ weight: ["400", "500", "600", "700"], subsets: ["latin"], variable: "--cx9-f-sans", display: "swap" });
const mono = JetBrains_Mono({ weight: ["500", "700"], subsets: ["latin"], variable: "--cx9-f-mono", display: "swap" });

export default function ExplorersFieldUnit() {
  return <FieldUnit fontClass={`${disp.variable} ${sans.variable} ${mono.variable}`} />;
}
