import type { TopicManifest } from "../../learn/types";
import { RecoveryTestLab } from "../../learn/conceptLabs";

/* Module 19 - Topic 5: testing your recovery (the untested plan fails).
 * Case: the recurring, well-documented reality that untested backups and
 * recovery plans frequently fail when finally needed, backups that do
 * not restore, plans that do not work. Public record: repeated incident
 * findings and continuity guidance. */
const topic5: TopicManifest = {
  id: "m19t5",
  weekLabel: "Module 19",
  act: "Act 4 - Get hired",
  title: "Testing your recovery",
  role: "A backup you have never restored, or a recovery plan you have never run, is a guess, not a guarantee. Testing recovery, actually proving you can come back, is the step that turns resilience from hope into certainty, and it is one of the most neglected and valuable things a team can do.",
  minutes: 14,
  promise: "Learn why untested backups so often fail, and how testing turns a hopeful plan into a proven one, completing your resilience.",
  brief: "In this lesson, we'll close the module with the step that makes all the rest real: testing. Backups and recovery plans fail far more often than people expect, precisely because they are rarely tested until a real disaster, when it is too late. We'll see why 'the backup succeeded' is not the same as 'we can recover', and how regular, realistic recovery testing turns resilience from a hopeful assumption into a proven capability.",

  learn: [
    {
      heading: "Untested recovery fails more often than you think",
      body: [
        "Here is an uncomfortable, well-documented truth: backups and recovery plans fail surprisingly often when they are finally needed. Backups turn out to be corrupt, incomplete, or unrestorable; recovery plans have gaps, wrong assumptions, or steps that no longer work. The reason is simple: these things are rarely tested until a real disaster, and a real disaster is the worst possible time to discover your safety net has a hole.",
        "Crucially, 'the backup succeeded' is not the same as 'we can recover'. A backup job reporting success only means data was copied; it does not prove that data can actually be restored, is complete, and works. Countless organisations have discovered, mid-crisis, that their faithfully-running backups could not be restored. Existence is not recovery. Only an actual, tested restore proves you can come back.",
      ],
      examples: [
        "Backups turn out corrupt, incomplete or unrestorable; plans have gaps.",
        "They are rarely tested until a real disaster, the worst time to find a hole.",
        "'Backup succeeded' only means data was copied, not that it can be restored.",
      ],
      analogy: {
        plain: "A parachute you have packed but never checked is a hopeful bundle, not a guarantee. You verify it works before you need it, because mid-jump is too late.",
        realTerm: "untested recovery",
      },
    },
    {
      heading: "Testing properly: actually restore, and measure",
      body: [
        "Testing recovery means actually doing it: restoring to a test environment and confirming the data and systems genuinely work, not just that the files exist. A proper test verifies the restore completes, the data is intact and usable, and the systems function, and it measures how long it took and how much data was lost, checking these against your RTO and RPO. This turns your targets from aspirations into verified facts: 'we can restore this system in 90 minutes, losing at most 15 minutes of data, we have proven it.'",
        "Realistic testing also exercises the plan, not just the backup: can the team actually follow the recovery steps, are the contacts and access right, does the failover trigger? This is where a tabletop exercise (Module 16) and a technical restore test complement each other. The point is to find the gaps in calm, planned conditions, when you can fix them, rather than in a real crisis, when you cannot. Every gap found in a test is a disaster averted.",
      ],
      examples: [
        "Actually restore to a test environment and confirm data and systems work.",
        "Measure time and data loss against your RTO and RPO: verify the targets.",
        "Test the plan too: can the team follow it, is access right, does failover trigger?",
      ],
    },
    {
      heading: "Testing is ongoing, and it is the proof",
      body: [
        "A recovery capability is not tested once and forgotten, because systems, data and teams change constantly. A plan that worked last year may not work now: new systems, changed configurations, departed staff, drifted backups. So recovery testing must be regular, and should follow major changes, to keep the capability real. An old, one-off test gives false confidence; regular testing keeps resilience honest.",
        "Ultimately, testing is what turns everything in this module, backups, RTO/RPO, redundancy, into a proven capability rather than a hopeful assumption. It is the difference between 'we should be able to recover' and 'we have recovered, in a test, and we know exactly how'. This is why it is both so valuable and so neglected: it is unglamorous, ongoing work, but it is the only thing that proves your resilience is real before the day you desperately need it to be. An untested plan is a guess; a tested one is a guarantee.",
      ],
      examples: [
        "Systems, data and teams change, so a plan that worked last year may not now.",
        "Test regularly and after major changes; a one-off old test gives false confidence.",
        "Testing turns 'we should be able to recover' into 'we have, and we know how'.",
      ],
      analogy: {
        plain: "Fire drills are repeated, not done once a decade, because people and buildings change. Recovery testing is the fire drill for your systems: regular, or it is not real.",
        realTerm: "regular recovery testing",
      },
    },
  ],

  glossary: [
    { term: "recovery testing", definition: "Actually restoring from backup and running the recovery plan to prove you can come back, before a real disaster." },
    { term: "restore test", definition: "Restoring data to a test environment and confirming it is complete, intact and usable, not just that the backup files exist." },
    { term: "false confidence", definition: "Believing you can recover based on untested backups or an old plan; a dangerous assumption that fails when needed." },
    { term: "verified RTO/RPO", definition: "Recovery targets that have been proven by an actual test (how long it took, how much data was lost), not just aspired to." },
  ],

  seeHeading: "When the safety net had a hole",

  cases: [
    {
      org: "Untested backups & plans",
      year: "recurring",
      headline: "Backups and recovery plans that were never tested fail exactly when needed",
      whatHappened: "A recurring, well-documented finding across incidents is that untested backups and recovery plans fail when finally relied upon. Organisations discover, mid-crisis, that their backups are corrupt, incomplete or cannot be restored; that their recovery plan has gaps, wrong assumptions, or steps that no longer work; or that the restore takes far longer, or loses far more data, than anyone believed. The common thread is that these capabilities were assumed rather than tested, so the hole in the safety net was discovered at the worst possible moment, during the real disaster.",
      theMissedMeasure: "Regular, realistic recovery testing: actually restoring and running the plan, measuring against RTO and RPO, and fixing what is found, before a real disaster. It is the step that turns resilience from a hopeful assumption into a proven capability, and it is consistently emphasised in continuity guidance precisely because it is so often skipped.",
      theCost: "The recurring cost is organisations that believed they were protected failing to recover, extended outages, data loss, and sometimes business failure, all avoidable, because an untested plan is a guess, and the guess was wrong.",
      control: "secure-configuration",
      impact: ["untested backups/plans frequently fail when needed", "'backup succeeded' is not 'we can recover'", "testing turns a guess into a guarantee"],
      source: "Public record; repeated incident findings and business-continuity guidance.",
      brandColor: "#c0392b",
      news: { headline: "Why untested backups fail exactly when you need them", outlet: "Incident findings and continuity guidance (recurring)", date: "recurring" },
    },
  ],

  lab: {
    title: "Test the recovery",
    intro: "Nothing to install and nothing leaves this page. You have backups and a plan. Make the decisions that prove you can actually recover.",
    prompts: [
      "Untested backups often fail: existence is not recovery.",
      "Test by actually restoring and verifying, and measure against RTO and RPO.",
      "Test regularly and after changes, an old one-off test gives false confidence.",
    ],
    component: RecoveryTestLab,
  },

  check: {
    explain: {
      prompt: "Explain why untested backups and plans so often fail, what proper recovery testing involves, and why testing must be ongoing.",
      modelAnswer: "Untested backups and recovery plans fail surprisingly often when finally needed because they are rarely tested until a real disaster: backups turn out corrupt, incomplete or unrestorable, and plans have gaps, wrong assumptions or steps that no longer work, and the real disaster is the worst possible time to discover it. Crucially, 'the backup succeeded' is not the same as 'we can recover', a backup job reporting success only means data was copied, not that it can actually be restored, is complete, and works; existence is not recovery, and only an actual, tested restore proves you can come back. Proper recovery testing means actually restoring to a test environment and confirming the data and systems genuinely work, not just that files exist, and measuring how long it took and how much data was lost against your RTO and RPO, turning those targets from aspirations into verified facts; it also exercises the plan itself (can the team follow the steps, is access right, does failover trigger), finding the gaps in calm conditions where they can be fixed. Testing must be ongoing because systems, data and teams change constantly, so a plan that worked last year may not work now; an old one-off test gives false confidence, while regular testing, and testing after major changes, keeps the capability real. Ultimately testing is what turns backups, RTO/RPO and redundancy into a proven capability rather than a hopeful assumption: an untested plan is a guess, a tested one is a guarantee.",
    },
    quiz: [
      {
        q: "Why do untested backups so often fail when needed?",
        options: [
          "Backups never fail",
          "They are rarely tested until a real disaster, so corruption, gaps or unrestorable data are discovered too late",
          "Because testing causes failures",
          "Because backups are unnecessary",
        ],
        answer: 1,
        why: "A real disaster is the worst time to find the hole. 'Backup succeeded' is not 'we can recover'; only a tested restore proves it.",
      },
      {
        q: "What does proper recovery testing involve?",
        options: [
          "Just checking the backup files exist",
          "Actually restoring to a test environment, confirming data and systems work, and measuring against RTO and RPO",
          "Assuming it will be fine",
          "Reading the plan once",
        ],
        answer: 1,
        why: "A real, verified, timed restore is the only true test, and it exercises the plan too, finding gaps in calm, not crisis.",
      },
      {
        q: "Why must recovery testing be ongoing?",
        options: [
          "It does not; once is enough",
          "Because systems, data and teams change, so a plan that worked before may not work now; regular testing keeps it real",
          "To waste time",
          "Because backups expire daily",
        ],
        answer: 1,
        why: "Environments drift constantly. An old one-off test gives false confidence; regular testing keeps resilience honest.",
      },
    ],
  },

  wrap: {
    headline: "You finished Module 19: you can build resilient systems and, crucially, prove they recover, turning hope into guarantee.",
    takeaways: [
      "Untested backups and plans fail surprisingly often; 'backup succeeded' is not 'we can recover'.",
      "Test by actually restoring and running the plan, verify it works, and measure against RTO and RPO.",
      "Testing must be ongoing, because systems change; an untested plan is a guess, a tested one is a guarantee.",
    ],
    project: {
      name: "Do a real restore test",
      blurb: "Pick something you have backed up and actually restore it (to a safe location), confirming the data is complete and usable. Time it. You will likely learn something surprising. Proving you can recover, rather than assuming it, is the step that makes resilience real, for yourself and as a habit you will carry into any role.",
    },
    ethicsNote: "Recovery testing is constructive, protective work on your own or authorised systems and data. It is how you ensure you can genuinely protect what matters when disaster strikes. Next, Module 20 turns to the roles and the certification roadmap.",
  },
};

export default topic5;
