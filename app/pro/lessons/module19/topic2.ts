import type { TopicManifest } from "../../learn/types";
import { Backup321Lab } from "../../learn/conceptLabs";

/* Module 19 - Topic 2: backups that survive ransomware (3-2-1). Case:
 * the well-documented reality that modern ransomware deliberately seeks
 * out and encrypts or deletes reachable backups, so only offline /
 * immutable, offsite backups reliably survive. Public record: repeated
 * ransomware incident analyses and NCSC/CISA guidance. */
const topic2: TopicManifest = {
  id: "m19t2",
  weekLabel: "Module 19",
  act: "Act 4 - Get hired",
  title: "Backups that survive ransomware",
  role: "Backups are the single most important defence against ransomware and data loss, but only if they survive the very event you need them for. Knowing the 3-2-1 rule, and why backups must be offline or immutable, is essential, practical knowledge.",
  minutes: 15,
  promise: "Learn the simple rule that makes backups actually reliable, and why ransomware hunts your backups first.",
  brief: "In this lesson, we'll learn how to make backups that actually save you. The classic 3-2-1 rule, three copies, two media types, one offsite, is the foundation. But modern ransomware adds a twist: it deliberately seeks out and destroys reachable backups, so a backup must also be offline or immutable to survive. We'll see why 'we had backups' is not enough, and what makes backups genuinely resilient.",

  learn: [
    {
      heading: "The 3-2-1 rule",
      body: [
        "The time-tested foundation for reliable backups is the 3-2-1 rule: keep at least three copies of your data (the original plus two backups), on at least two different types of media or locations, with at least one copy kept offsite (somewhere a single local disaster cannot reach). The logic is simple: multiple independent copies mean no single failure, a dead drive, a fire, a theft, destroys all of them.",
        "The offsite copy is the crucial part, and exactly what the OVHcloud customers lacked. If all your copies are in one place, one disaster takes them all. An offsite copy (another location, or a reputable cloud backup) survives a fire, flood or theft at your main site. 3-2-1 is memorable precisely so it is actually followed, and following it defeats a huge range of data-loss scenarios at a stroke.",
      ],
      examples: [
        "3 copies, 2 media types/locations, 1 offsite: the classic rule.",
        "Multiple independent copies mean no single failure destroys all of them.",
        "The offsite copy survives a local disaster, exactly what OVHcloud customers lacked.",
      ],
      analogy: {
        plain: "Keep your valuables in a few places, and at least one in a different building, so one fire, flood or burglary cannot take everything. 3-2-1 is that principle for data.",
        realTerm: "the 3-2-1 rule",
      },
    },
    {
      heading: "Ransomware hunts your backups",
      body: [
        "Here is the modern twist that 3-2-1 alone does not fully address: ransomware deliberately seeks out and destroys your backups. Attackers know that backups are what let a victim recover without paying, so before (or while) encrypting your data, they hunt for reachable backups, any backup connected to the network or accessible with the credentials they have stolen, and encrypt or delete those too. A backup the ransomware can reach is a backup the ransomware will take.",
        "This is why so many ransomware victims who 'had backups' still could not recover: their backups were online and reachable, and got encrypted along with everything else. The defeat for this is a backup the ransomware cannot touch: offline (physically disconnected) or immutable (stored so it cannot be altered or deleted for a set period). An offline or immutable, offsite backup is what reliably survives ransomware, and makes the difference between recovery and paying.",
      ],
      examples: [
        "Ransomware hunts and encrypts reachable backups before/while encrypting your data.",
        "'We had backups' fails when those backups were online and got encrypted too.",
        "Offline (disconnected) or immutable backups are what survive ransomware.",
      ],
    },
    {
      heading: "The modern rule: 3-2-1, with one offline/immutable",
      body: [
        "Putting it together, resilient backup in the ransomware era is 3-2-1 with a crucial addition: at least one copy that is offline or immutable as well as offsite. Three copies protect against failure; the offsite copy protects against local disaster; and the offline/immutable copy protects against ransomware (and against an attacker with your credentials). That combination survives the realistic range of disasters, hardware, physical and malicious, which is exactly the point of resilience.",
        "This is genuinely empowering, because it is achievable for anyone, from an individual to a large organisation. The principles scale down and up. And it is the single highest-value resilience measure there is: good, tested, offline/offsite backups turn ransomware from a catastrophe into an inconvenience, remove the pressure to pay, and recover you from a huge range of disasters. If you take one practical thing from this module, make it this.",
      ],
      examples: [
        "3-2-1 plus at least one offline/immutable copy: survives failure, disaster and ransomware.",
        "Achievable for anyone, from an individual to a large organisation.",
        "The highest-value resilience measure: it defeats ransomware and removes the pressure to pay.",
      ],
      analogy: {
        plain: "A fireproof safe (immutable) in a different building (offsite), plus copies at home (multiple): now neither a fire, nor a thief, nor a burst pipe takes everything.",
        realTerm: "offline/immutable backups",
      },
    },
  ],

  glossary: [
    { term: "3-2-1 rule", definition: "Keep 3 copies of data, on 2 different media/locations, with 1 offsite: the classic foundation of reliable backups." },
    { term: "offsite backup", definition: "A backup kept in a different location, so a single local disaster (fire, flood, theft) cannot destroy all copies." },
    { term: "offline backup", definition: "A backup physically disconnected from the network, so ransomware and attackers cannot reach and encrypt it." },
    { term: "immutable backup", definition: "A backup stored so it cannot be altered or deleted for a set period, surviving ransomware even if it is reachable." },
  ],

  seeHeading: "Why ransomware victims who 'had backups' still paid",

  cases: [
    {
      org: "Ransomware vs backups",
      year: "recurring",
      headline: "Modern ransomware deliberately destroys reachable backups, so only offline/immutable ones survive",
      whatHappened: "Across countless ransomware incidents, a consistent, painful pattern emerges: victims who believed they were protected because they 'had backups' still could not recover, because their backups were online and reachable, and the ransomware found and encrypted them too, along with the live data. Attackers deliberately hunt for backups precisely because backups are what let victims recover without paying. The organisations that recovered without paying were overwhelmingly those with offline or immutable, offsite backups the ransomware could not reach, exactly what NCSC and CISA guidance emphasises.",
      theMissedMeasure: "Offline or immutable, offsite backups. Having backups is not enough if the ransomware can reach them; the backup must survive the very event you need it for. This is the single most important lesson of ransomware resilience.",
      theCost: "The recurring cost is ransomware victims forced to pay, or to lose their data, because their backups were encrypted too, an avoidable outcome that offline/immutable backups prevent, turning catastrophe into inconvenience.",
      control: "malware-protection",
      impact: ["ransomware deliberately finds and encrypts reachable backups", "'we had backups' fails when they were online", "offline/immutable offsite backups are what survive"],
      source: "Public record; repeated ransomware incident analyses and NCSC/CISA guidance.",
      brandColor: "#d32f2f",
      news: { headline: "Why ransomware victims with backups still can't recover", outlet: "NCSC/CISA guidance and incident analyses", date: "recurring" },
    },
  ],

  lab: {
    title: "Does it follow 3-2-1?",
    intro: "Nothing to install and nothing leaves this page. For each backup setup, decide: does it follow the 3-2-1 rule (and survive ransomware), or violate it?",
    prompts: [
      "3 copies, 2 media/locations, 1 offsite, and ideally one offline/immutable.",
      "Backups in one place, or always online, fail to a fire or ransomware.",
      "The offline/immutable, offsite copy is what reliably survives.",
    ],
    component: Backup321Lab,
  },

  check: {
    explain: {
      prompt: "Explain the 3-2-1 rule, why it is not quite enough against modern ransomware, and what addition makes backups genuinely resilient.",
      modelAnswer: "The 3-2-1 rule is the foundation of reliable backups: keep at least three copies of your data (the original plus two backups), on at least two different types of media or locations, with at least one copy kept offsite somewhere a single local disaster cannot reach. The logic is that multiple independent copies mean no single failure, a dead drive, a fire, a theft, destroys all of them, and the offsite copy in particular survives a local disaster (exactly what OVHcloud customers lacked). It is not quite enough against modern ransomware because attackers deliberately hunt for and destroy reachable backups, knowing backups are what let victims recover without paying: before or while encrypting your data, they find any backup connected to the network or accessible with stolen credentials and encrypt or delete it too, which is why so many victims who 'had backups' still could not recover. The addition that makes backups genuinely resilient is at least one copy that is offline (physically disconnected) or immutable (stored so it cannot be altered or deleted for a period), as well as offsite, so the ransomware simply cannot reach it. 3-2-1 with one offline/immutable copy survives the realistic range of disasters, hardware, physical and malicious, and is the single highest-value resilience measure, turning ransomware from a catastrophe into an inconvenience and removing the pressure to pay.",
    },
    quiz: [
      {
        q: "What is the 3-2-1 backup rule?",
        options: [
          "3 passwords, 2 firewalls, 1 antivirus",
          "3 copies of data, on 2 different media/locations, with 1 kept offsite",
          "Back up 3 times a day",
          "Keep data for 321 days",
        ],
        answer: 1,
        why: "Three copies, two media/locations, one offsite: multiple independent copies so no single failure destroys all of them.",
      },
      {
        q: "Why is 3-2-1 alone not fully enough against ransomware?",
        options: [
          "Ransomware cannot touch backups",
          "Modern ransomware deliberately finds and encrypts reachable (online) backups too",
          "3-2-1 is outdated and useless",
          "Backups are irrelevant to ransomware",
        ],
        answer: 1,
        why: "Attackers hunt backups because they enable recovery without paying. A reachable backup gets encrypted along with the data.",
      },
      {
        q: "What makes a backup genuinely survive ransomware?",
        options: [
          "Keeping it always online for convenience",
          "Having at least one copy offline (disconnected) or immutable, as well as offsite",
          "Storing it on the same server",
          "Backing up more often to the same place",
        ],
        answer: 1,
        why: "A backup the ransomware cannot reach, offline or immutable, is what reliably survives, turning catastrophe into inconvenience.",
      },
    ],
  },

  wrap: {
    headline: "You now know how to make backups that actually save you, the highest-value resilience measure there is.",
    takeaways: [
      "The 3-2-1 rule: 3 copies, 2 media/locations, 1 offsite, so no single failure destroys everything.",
      "Modern ransomware hunts and encrypts reachable backups, so 'we had backups' is not enough.",
      "Add at least one offline or immutable copy: 3-2-1 plus offline/immutable survives failure, disaster and ransomware.",
    ],
    project: {
      name: "Fix your own backups",
      blurb: "Check your own important data against 3-2-1: how many copies, where, and is any copy offsite and offline/immutable? If not, set one up (a reputable cloud backup, or an external drive you disconnect). This single action is the most valuable resilience step you can take, for yourself and as advice you can give anyone.",
    },
    ethicsNote: "Backups protect your own or your organisation's data and the people it belongs to. This is purely constructive, protective work, and the single best defence against the ransomware studied earlier, within the Module 5 principles.",
  },
};

export default topic2;
