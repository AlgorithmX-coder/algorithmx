"use client";

/**
 * The dashboard, rendered from fixed props so it can be SEEN without a
 * database, a session or a child profile.
 *
 * DashboardView already anticipated this - its `onLogout` prop is documented
 * "Omit in dev preview" - but no such preview existed, so every dashboard
 * change had to be verified by reading the code. That is exactly the habit
 * that once shipped a broken screen past fourteen green checks.
 *
 * ?state=fresh | mid | done  switches the progress the view is given, so the
 * empty case and the finished case are both one URL away. Fresh is the
 * default because it is what a new child actually sees, and it is the state
 * the owner screenshotted.
 */

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import DashboardView, { type WeekItem } from "@/app/dashboard/DashboardView";

/* The real twenty, lifted from the course page, so the preview shows the
 * same titles and the same per-week colours the live list will. */
const TITLES: [string, string][] = [
  ["Passwords: The Secret Code", "Why passwords matter and how to create super-strong ones."],
  ["Private Info: Guard Your Secrets", "What personal information is and why some things stay private."],
  ["Stranger Danger: Friend or Foe?", "Spot fake profiles and stay safe chatting to people online."],
  ["Scams and Tricks: Real or Fake?", "Spot scam messages, fake pop-ups and sneaky tricks."],
  ["Cyberbullying: Words Have Power", "How words can hurt online and what to do if it happens."],
  ["Gaming Safety: Defend Your Game Zone", "Stay safe in Roblox, Minecraft and Fortnite — chat, reporting, blocking."],
  ["In-Game Spending: The V-Bucks Trap", "Loot boxes, Robux and V-Bucks — and why to ask a grown-up first."],
  ["Photos & Videos: Think Before You Share", "Why screenshots last forever and why consent matters."],
  ["Apps & Downloads: Spot the Fakes", "Spot fake apps, understand permissions and download safely."],
  ["YouTube & Videos: Escape the Rabbit Hole", "Stay safe watching videos and manage screen time."],
  ["Something Wrong? Emergency Protocol", "How to report, block and tell a trusted grown-up — it's never your fault."],
  ["Digital Footprint: Tracks in the Snow", "Everything you do online leaves a trail — learn to be proud of yours."],
  ["Screen Time: Balance Your Power", "The right balance between time online, breaks, sleep and healthy habits."],
  ["Smart Devices: Who's Listening?", "What Alexa, Siri and smart devices hear — and how to protect your privacy."],
  ["AI & Chatbots: Robot or Real?", "ChatGPT and chatbots — what they know and what never to share."],
  ["QR Codes & Links: Don't Take the Bait", "Check before you scan or click — not every link is safe."],
  ["Social Media: The Profile Shield", "Stay safe on TikTok, Snapchat and Instagram — privacy and smart posting."],
  ["Sharing Devices: Lock Before You Leave", "Keep your stuff private on family tablets — logging out and boundaries."],
  ["Protecting Family: Family Firewall", "Become the family cyber expert and help everyone stay safe."],
  ["Graduation Day: The Final Mission", "The ultimate challenge — earn your Cyber Hero certificate!"],
];

function build(done: number): WeekItem[] {
  return TITLES.map(([title, description], i) => {
    const week = i + 1;
    const state: WeekItem["state"] =
      week <= done ? "completed" : week === done + 1 ? "current" : "available";
    return {
      id: `w${week}`,
      week,
      title,
      description,
      state,
      stars: state === "completed" ? 3 : 0,
      screen: null,
      href: `/lesson/${week}`,
    };
  });
}

function Preview() {
  const q = useSearchParams().get("state") ?? "fresh";
  const done = q === "done" ? TITLES.length : q === "mid" ? 2 : 0;
  const total = TITLES.length;
  const weeks = build(done);

  return (
    <DashboardView
      userName="Zayd"
      childAge={10}
      completedCount={done}
      totalWeeks={total}
      progressPct={Math.round((done / total) * 100)}
      remaining={total - done}
      /* The villain's power drains as weeks are finished, so a fresh account
         sees him at full strength: the 100% the owner screenshotted. */
      raccoonPower={Math.max(0, 100 - Math.round((done / total) * 100))}
      product={{ name: "Cyber Heroes Academy", ageRange: "6-10", weeksCount: total, duration: "20 weeks" }}
      weeks={weeks}
      heroCtaHref="/lesson/1"
    />
  );
}

export default function DevDashboard() {
  return (
    <Suspense fallback={null}>
      <Preview />
    </Suspense>
  );
}
