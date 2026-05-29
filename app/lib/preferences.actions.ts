"use server";

/**
 * Server actions for accessibility / comfort preferences. Backed by
 * the UserPreference table so the same setting follows the child
 * across devices (the localStorage version in comfortMode.tsx stays
 * as an offline / unauth fallback).
 */

import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

async function requireUserId(): Promise<string> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

export interface UserPreferencesPayload {
  comfortMode: boolean;
  narrationEnabled: boolean;
  reducedMotion: boolean;
}

export async function getPreferences(): Promise<UserPreferencesPayload | null> {
  const userId = await requireUserId();
  const row = await prisma.userPreference.findUnique({ where: { userId } });
  if (!row) return null;
  return {
    comfortMode: row.comfortMode,
    narrationEnabled: row.narrationEnabled,
    reducedMotion: row.reducedMotion,
  };
}

export async function savePreferences(
  input: Partial<UserPreferencesPayload>
): Promise<UserPreferencesPayload> {
  const userId = await requireUserId();
  const payload = {
    comfortMode: !!input.comfortMode,
    narrationEnabled: input.narrationEnabled !== false, // default true
    reducedMotion: !!input.reducedMotion,
  };
  const row = await prisma.userPreference.upsert({
    where: { userId },
    create: { userId, ...payload },
    update: payload,
  });
  return {
    comfortMode: row.comfortMode,
    narrationEnabled: row.narrationEnabled,
    reducedMotion: row.reducedMotion,
  };
}
