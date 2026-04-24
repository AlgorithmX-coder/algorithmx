import type { CutsceneSlide } from "@/app/components/StoryCutscene";

export interface WeekContent {
  weekNumber: number;
  title: string;
  topic: string;
  badgeName: string;
  badgeIcon: string;

  introCutscene: CutsceneSlide[];

  screens: ScreenDef[];

  bossQuestions: {
    easy: BossQuestion[];
    medium: BossQuestion[];
    hard: BossQuestion[];
  };

  /**
   * Per-screen character reactions (by screen index). Either character can be
   * null for that screen — the other will use their idle pose.
   */
  reactions: Record<
    number,
    {
      adam: { mood: string; message: string } | null;
      layla: { mood: string; message: string } | null;
    }
  >;
}

export interface BossQuestion {
  question: string;
  answers: string[];
  correctIndex: number;
  explanation: string;
}

/**
 * A single lesson screen. The rendering logic in `app/lesson/[week]/page.tsx`
 * switches on `type` to mount the right component with the right data.
 */
export type ScreenDef =
  | { type: "video"; videoPlaceholder: string }
  | { type: "mission"; objectives: string[] }
  | {
      type: "info";
      title: string;
      content: string;
      bullets?: string[];
    }
  | {
      type: "cyberScanner";
      items: { text: string; isStrong: boolean; explanation: string }[];
    }
  | {
      type: "protectTheData";
      items: { text: string; isPrivate: boolean }[];
    }
  | { type: "passwordLab" }
  | { type: "crackTheCode" }
  | {
      type: "conveyorBelt";
      items: { text: string; category: "strong" | "weak" }[];
    }
  | {
      type: "chooseYourPath";
      scenarios: {
        setup: string;
        choices: { text: string; isSafe: boolean; consequence: string }[];
      }[];
    }
  | {
      type: "memoryMatch";
      pairs: { term: string; match: string; colour: string }[];
    }
  | {
      type: "firewallBuilder";
      goodBlocks?: string[];
      badBlocks?: string[];
    }
  | {
      type: "spamBlaster";
      emails: {
        sender: string;
        subject: string;
        isPhishing: boolean;
        clue: string;
      }[];
    }
  | {
      type: "cyberMaze";
      questions: {
        question: string;
        answers: string[];
        correctIndex: number;
      }[];
    }
  | { type: "bossBattle" }
  | { type: "completion" };
