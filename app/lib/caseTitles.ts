/**
 * Shared case-title metadata used by:
 *   - SceneTitleCard (full-screen fade between cases)
 *   - LessonHUD (slim chip in the bar showing current case)
 *
 * Keep both consumers in sync by reading from this single source.
 * The labels are intentionally kid-friendly ("CASE 7", "BOSS",
 * "PROLOGUE") rather than internal screen indices.
 */

export interface CaseMeta {
  /** Small kicker (CASE 7 / BOSS / PROLOGUE / VICTORY). */
  label: string;
  /** The named scene shown to the player. */
  title: string;
}

export const CASE_TITLES: Record<number, CaseMeta> = {
  0: { label: "PROLOGUE", title: "Welcome, Hero" },
  1: { label: "MISSION BRIEF", title: "Your Training Begins" },
  2: { label: "CASE 1", title: "Lock the Locks" },
  3: { label: "CASE 2", title: "Quick Drill" },
  4: { label: "CASE 3", title: "Shield Up" },
  5: { label: "CASE 4", title: "Quick Drill" },
  6: { label: "CASE 5", title: "Password Lab" },
  7: { label: "CASE 6", title: "Firewall Builder" },
  8: { label: "CASE 7", title: "Memory Match" },
  9: { label: "CASE 8", title: "Sort the Data" },
  10: { label: "CASE 9", title: "Crack the Code" },
  11: { label: "CASE 10", title: "Quick Drill" },
  12: { label: "CASE 11", title: "Choose Your Path" },
  13: { label: "CASE 12", title: "Phishing Hunt" },
  14: { label: "CASE 13", title: "What Would You Do?" },
  15: { label: "BOSS", title: "Hacker Raccoon" },
  16: { label: "VICTORY", title: "Hero Defeated the Hacker" },
  17: { label: "GRADUATION", title: "Cyber Hero" },
};

export function getCaseMeta(screen: number): CaseMeta | undefined {
  return CASE_TITLES[screen];
}

// Friendly names per exercise/game type (used for the "DRILL" chip title).
const GAME_TITLES: Record<string, string> = {
  memoryMatch: "Memory Match",
  threeRandomWords: "Build a Passphrase",
  passwordHospital: "Password Hospital",
  chooseYourPath: "Choose Your Path",
  weakSorter: "Weakness Detective",
  passwordLab: "Password Lab",
  crackTheCode: "Crack the Code",
  firewallBuilder: "Firewall Builder",
  phishInspector: "Phish Inspector",
  inboxSimulator: "Inbox Simulator",
  spamBlaster: "Spam Blaster",
  popupPanic: "Popup Panic",
  accountRescue: "Account Rescue",
  protectTheData: "Protect the Data",
  cyberMaze: "Cyber Maze",
  chatSimulator: "Chat Simulator",
  reveal: "Reveal Board",
  conveyorSort: "Sorting Machine",
  requestInspector: "Request Inspector",
  profileInspector: "Profile Detective",
  replyCards: "Reply Cards",
  clueBoard: "Clue Board",
  teamPoster: "Team Poster",
  snowballChase: "Snowball Chase",
  trailStamper: "Trail Stamper",
  signBingo: "Sign Bingo",
  dayBalancer: "Day Balancer",
  plaquePeek: "Plaque Peek",
  growthRings: "Growth Rings",
  passcodeForge: "Passcode Forge",
  hookSort: "Hook Sort",
  senderLineup: "Sender Lineup",
  stepOrder: "Step Order",
  settingsSwitch: "Settings Sweep",
  buttonHunt: "Button Hunt",
  usernameBuilder: "Username Builder",
  vaultDrop: "Vault Drop",
};

/**
 * Derive the case-chip meta from the ACTUAL screen, so it's correct for
 * every week. The old per-index CASE_TITLES map was a stale 18-screen
 * layout that mislabelled real lessons (e.g. "BOSS" on a learning screen
 * in Week 1's 23-screen structure). Prefer this for any data-driven lesson.
 */
export function deriveCaseMeta(
  def: { type: string; title?: string; introTitle?: string } | null | undefined,
  index: number,
): CaseMeta | null {
  if (!def) return null;
  switch (def.type) {
    case "video":
      return index === 0
        ? { label: "PROLOGUE", title: "The Mission Begins" }
        : { label: "FINALE", title: "The Showdown" };
    case "alert":
      return { label: "ALERT", title: "Incident Report" };
    case "mission":
      return { label: "BRIEFING", title: "Your Mission" };
    case "info":
      return { label: "LEARN", title: def.title ?? "Lesson" };
    case "quickCheck":
      return { label: "QUICK CHECK", title: "Prove It!" };
    case "recap":
      return { label: "CHECKPOINT", title: "Concept Complete" };
    case "cyberScanner":
      return { label: "FINAL DRILL", title: "Cyber Scanner" };
    case "bossBattle":
      return { label: "BOSS", title: "Hacker Raccoon" };
    case "missionDebrief":
      return { label: "DEBRIEF", title: def.title ?? "Mission Complete" };
    case "stickerUnlock":
      return { label: "REWARDS", title: "Stickers Unlocked" };
    case "completion":
      return { label: "VICTORY", title: "Week Complete" };
    default:
      // Prefer the week's own dressing ("The Banner X-Ray") over the
      // generic engine name ("Phish Inspector").
      return { label: "DRILL", title: def.introTitle ?? GAME_TITLES[def.type] ?? "Training Drill" };
  }
}
