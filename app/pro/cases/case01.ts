import type { CaseManifest } from "../console/types";

/* Case 01: the canonical first investigation. A credential attack that
 * worked: a string of 4625 failures then a 4624 success from the same
 * external address, against an account with no MFA. This is also the
 * single most common live interview scenario ("did the brute force
 * succeed, and how do you tell?").
 *
 * All names, addresses, and enrichment values are fictional offline
 * training data. The console makes no network calls. */
const case01: CaseManifest = {
  id: "case-01",
  alertId: "ALRT-4102",
  title: "Multiple failed sign-ins followed by a success",
  firedAt: "Tue 09:16 UTC",
  source: "Sign-in anomaly rule · DC-01 Security log",
  severityAuto: "medium",
  summary:
    "The detection rule fired because account k.reyes recorded eight failed sign-ins in ninety seconds, immediately followed by a successful sign-in from the same source address. Two other accounts saw single failures from that address in the same window.",
  attack: { techniqueId: "T1110", techniqueName: "Brute Force" },

  logs: [
    { t: "09:14:02", source: "DC-01/Security", eventId: 4625, text: "Logon failure · account k.reyes · source 185.220.101.34 · logon type 3 · status 0xC000006A (bad password)", entities: ["acct-kreyes", "ip-tor"] },
    { t: "09:14:13", source: "DC-01/Security", eventId: 4625, text: "Logon failure · account k.reyes · source 185.220.101.34 · logon type 3 · status 0xC000006A", entities: ["acct-kreyes", "ip-tor"] },
    { t: "09:14:25", source: "DC-01/Security", eventId: 4625, text: "Logon failure · account k.reyes · source 185.220.101.34 · logon type 3 · status 0xC000006A", entities: ["acct-kreyes", "ip-tor"] },
    { t: "09:14:38", source: "DC-01/Security", eventId: 4625, text: "Logon failure · account k.reyes · source 185.220.101.34 · logon type 3 · status 0xC000006A", entities: ["acct-kreyes", "ip-tor"] },
    { t: "09:14:51", source: "DC-01/Security", eventId: 4625, text: "Logon failure · account k.reyes · source 185.220.101.34 · logon type 3 · status 0xC000006A", entities: ["acct-kreyes", "ip-tor"] },
    { t: "09:15:04", source: "DC-01/Security", eventId: 4625, text: "Logon failure · account k.reyes · source 185.220.101.34 · logon type 3 · status 0xC000006A", entities: ["acct-kreyes", "ip-tor"] },
    { t: "09:15:17", source: "DC-01/Security", eventId: 4625, text: "Logon failure · account k.reyes · source 185.220.101.34 · logon type 3 · status 0xC000006A", entities: ["acct-kreyes", "ip-tor"] },
    { t: "09:15:31", source: "DC-01/Security", eventId: 4625, text: "Logon failure · account k.reyes · source 185.220.101.34 · logon type 3 · status 0xC000006A", entities: ["acct-kreyes", "ip-tor"] },
    { t: "09:15:44", source: "DC-01/Security", eventId: 4625, text: "Logon failure · account a.whitfield · source 185.220.101.34 · logon type 3 · status 0xC000006A", entities: ["ip-tor"] },
    { t: "09:15:52", source: "DC-01/Security", eventId: 4625, text: "Logon failure · account j.okafor · source 185.220.101.34 · logon type 3 · status 0xC000006A", entities: ["ip-tor"] },
    { t: "09:16:10", source: "DC-01/Security", eventId: 4624, text: "Logon SUCCESS · account k.reyes · source 185.220.101.34 · logon type 3 (network)", entities: ["acct-kreyes", "ip-tor"] },
    { t: "09:47:21", source: "DC-01/Security", eventId: 4624, text: "Logon SUCCESS · account k.reyes · source 82.13.44.7 · logon type 3 (network)", entities: ["acct-kreyes", "ip-home"] },
  ],

  entities: [
    {
      id: "ip-tor",
      kind: "ip",
      label: "185.220.101.34",
      title: "185.220.101.34 · external",
      rows: [
        { k: "Reputation", v: "412 abuse reports (offline training feed)" },
        { k: "Listed as", v: "TOR exit node" },
        { k: "Geolocation", v: "Netherlands" },
        { k: "First seen", v: "2019" },
        { k: "Seen in your logs", v: "10 failures, 1 success, 3 accounts" },
      ],
      note: "A TOR exit with hundreds of reports, touching three of your accounts in two minutes. Nothing about this source is normal for your users.",
    },
    {
      id: "acct-kreyes",
      kind: "account",
      label: "k.reyes",
      title: "k.reyes · Finance analyst",
      rows: [
        { k: "Department", v: "Finance" },
        { k: "Admin roles", v: "None" },
        { k: "MFA", v: "Not enrolled (migration pilot group)" },
        { k: "Usual sign-in", v: "82.13.44.7 · Manchester ISP" },
        { k: "Usual hours", v: "08:30 to 17:30 UK" },
      ],
      note: "No MFA on this account. If a password guess landed, nothing stood in the way.",
    },
    {
      id: "ip-home",
      kind: "ip",
      label: "82.13.44.7",
      title: "82.13.44.7 · residential UK",
      rows: [
        { k: "Reputation", v: "0 abuse reports" },
        { k: "Listed as", v: "Consumer ISP, Manchester" },
        { k: "History", v: "k.reyes' regular address for 14 months" },
      ],
      note: "This is her normal address. The 09:47 sign-in is almost certainly the real user, unaware anything happened.",
    },
    {
      id: "host-dc01",
      kind: "host",
      label: "DC-01",
      title: "DC-01 · domain controller",
      rows: [
        { k: "Role", v: "Domain controller, collects the Security log" },
        { k: "Why events land here", v: "Network (type 3) logons are validated by the DC, so the 4624/4625 trail is recorded here, not on the attacker's machine" },
      ],
    },
  ],

  correct: {
    classification: "true-positive-malicious",
    escalate: true,
    severity: "high",
  },

  evidenceKeywords: ["4625", "4624", "185.220.101.34", "type 3", "k.reyes", "TOR"],

  hints: [
    "Look at the order of events. What happens right after the string of failures between 09:14 and 09:15?",
    "Event 4624 is a successful sign-in, and it comes from the same address as all eight failures. Open that address under Entities and read its reputation.",
    "Eight failures then a success from a TOR exit node is a credential attack that worked. The account is compromised. That makes this a true positive, malicious, and it needs escalating now.",
  ],

  debrief: [
    "The pattern is the whole case: 4625 eight times, then 4624, same source, logon type 3. Failures followed by a success from one address is the signature of a credential attack that landed.",
    "Enrichment sealed the verdict. The source is a TOR exit node with 412 reports; her real address is a Manchester ISP with none. Two other accounts caught single failures from the same source, the light touch of a spray.",
    "The 09:47 success from 82.13.44.7 is her normal pattern. Separating the attack window from the legitimate tail is exactly the judgement interviewers probe for.",
    "On the framework map this is T1110 Brute Force succeeding into T1078 Valid Accounts. A Tier 1 escalates for containment: reset credentials, revoke live sessions, and pull everything the account touched after 09:16.",
  ],
};

export default case01;
