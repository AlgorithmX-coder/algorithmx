/**
 * The six AlgorithmX streams — the modules that orbit the Learning Core.
 *
 * Shared by the 3D core (orbiting course modules + success constellation)
 * and the compact stream HUD so the two never drift. Colours are
 * restrained and cohesive (mostly cool, one warm accent for
 * entrepreneurship) so six tints read as one system, not a rainbow.
 *
 * Order defines orbit placement (evenly spaced around the core).
 */

export interface Stream {
  id: string;
  /** Short label for the HUD. */
  label: string;
  /** Restrained stream colour (hex). Used as an emissive tint. */
  color: string;
}

export const STREAMS: Stream[] = [
  { id: "cyber", label: "Cybersecurity", color: "#36dbff" }, // cyan
  { id: "game", label: "Game Dev", color: "#8b6cff" }, // violet
  { id: "ai", label: "AI & ML", color: "#5b8cff" }, // blue
  { id: "app", label: "App Dev", color: "#36e0c8" }, // teal
  { id: "venture", label: "Entrepreneurship", color: "#e0b25b" }, // warm accent
  { id: "robotics", label: "Robotics", color: "#9fb4e0" }, // steel
];
