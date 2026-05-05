"use client";

import { useCallback, useState } from "react";
import LessonPlayer from "./LessonPlayer";
import TitleScreen from "@/app/components/TitleScreen";
import {
  getActiveSlotId,
  getSlot,
  setActiveSlot,
  type SaveSlot,
} from "@/app/lib/saveSlots";

/**
 * LessonGate — fronts the lesson with a console-style title screen and
 * save-slot picker. Once a slot is chosen the gate unmounts the title
 * and mounts the existing LessonPlayer with no behavioural changes.
 *
 * Slot persistence is local-storage only (per-browser saves), which
 * matches how the rest of the progression already works. A future
 * server-backed sync layer can read the same slot ids without breaking
 * existing data.
 */
export default function LessonGate({
  userName,
  moduleId,
  childName,
}: {
  userName: string;
  moduleId: string;
  childName: string;
}) {
  const [started, setStarted] = useState<SaveSlot | null>(() => {
    /* If an active slot already exists from a prior visit, skip the
     * title screen and resume play. The pause menu's "Main Menu" action
     * clears it explicitly to bring the player back here. */
    if (typeof window === "undefined") return null;
    const id = getActiveSlotId();
    if (!id) return null;
    const slot = getSlot(id);
    if (slot) setActiveSlot(slot.id);
    return slot;
  });

  const handleStart = useCallback((slot: SaveSlot) => {
    setStarted(slot);
  }, []);

  if (!started) {
    return <TitleScreen defaultName={childName} onStart={handleStart} />;
  }

  return (
    <LessonPlayer
      userName={userName}
      moduleId={moduleId}
      childName={started.name || childName}
    />
  );
}
