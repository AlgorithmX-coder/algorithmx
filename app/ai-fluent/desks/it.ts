import type { AttachedDocument, DataPack, TrackBlock } from "@/app/ai-cleared/engine/types";
import { SHARED_PROVE } from "./general";

/* The Engineering and IT desk for AI Fluent, modules 4 to 9: a small
 * firm's IT function with an incident report, a vendor renewal, a patch
 * status export and the weekly change meeting. Modules 1 to 3 run on the
 * General desk. Every name, firm, host and number is invented. */

export const IT_PACK: DataPack = {
  facts:
    "IT this month: incident INC-2210, the invoicing export fault, root cause a schema change in release 4.18; the Nimbus Hosting renewal at £46,000 (account manager Jude Farrow, j.farrow@nimbushosting.example); the patch backlog with eleven servers behind; the office move rack relocation on the 28th; the IT lead Dev Patel; the admin account svc-backup with password rotated on the 1st; the firewall management address 10.20.0.1.",
  entities: [
    { pattern: "INC-?2210", flags: "gi", cls: "I", label: "an incident reference", placeholder: "[incident]" },
    { pattern: "nimbus(\\s+hosting)?", cls: "C", label: "supplier name", placeholder: "[supplier]" },
    { pattern: "jude\\s+farrow|farrow", cls: "C", label: "supplier contact", placeholder: "[contact]" },
    { pattern: "j\\.farrow@nimbushosting\\.example", cls: "C", label: "contact email", placeholder: "[contact email]" },
    { pattern: "dev\\s+patel|patel", cls: "C", label: "a colleague", placeholder: "[colleague]" },
    { pattern: "svc-?backup", flags: "gi", cls: "R", label: "a service account", placeholder: "" },
    { pattern: "10\\.20\\.0\\.1", flags: "g", cls: "R", label: "an internal address", placeholder: "" },
    { pattern: "password", flags: "gi", cls: "R", label: "a credential", placeholder: "" },
    { pattern: "release\\s+4\\.18", flags: "gi", cls: "I", label: "a release", placeholder: "[release]" },
  ],
  restrictedFallback: "Leave account names, addresses and anything about credentials out; add them yourself afterwards.",
};

export const INCIDENT_REPORT: AttachedDocument = {
  title: "Incident report, INC-2210",
  kind: "Word document, 6 sections",
  sections: [
    { heading: "Summary", paragraphs: [{ text: "Between the 5th and the 17th the invoicing export produced blank files for every customer on the shared platform. Three customers reported it; one escalated. Root cause: a column rename in release 4.18 on the 5th that the export job did not pick up. Fixed in release 4.19 on the 17th." }] },
    { heading: "Timeline", paragraphs: [{ text: "5th, 02:00: release 4.18 deployed. 5th, 09:30: first internal report of blank exports; logged as low priority. 9th: first customer report. 10th: root cause identified; fix estimated at two days. 13th: manual export workaround documented. 17th, 02:00: release 4.19 deployed. 17th, 09:00: exports confirmed working on all customers." }] },
    { heading: "Impact", paragraphs: [{ text: "Twelve days without the export for all customers; eight working days. Three customer tickets, one escalation with a service credit of £2,300. No data was lost; exports regenerated from the 17th include the missing period." }] },
    { heading: "What went wrong", paragraphs: [{ text: "The release checklist does not include a run of the export job. The internal report on the 5th was logged low priority because the reporter did not know customers used the export. The fix, estimated at two days on the 10th, waited for the scheduled release on the 17th rather than going out as a hotfix." }] },
    { heading: "Actions", paragraphs: [{ text: "Add the export job to the release checklist, owner Dev Patel, by the 24th. Classify any fault affecting customer-facing output as high priority, in the handbook by the 22nd, owner Lena Ortiz. Define the hotfix criteria: any customer-facing fault with a fix under one day ships within one working day; owner Dev, by the 24th." }] },
    { heading: "Open questions", paragraphs: [{ text: "Whether the two other customers who reported it should also be offered a credit; for the support lead and a partner. Whether the schema change should have been caught in staging; the staging data has no customer with the export enabled." }] },
  ],
};

export const VENDOR_THREAD: AttachedDocument = {
  title: "Nimbus Hosting renewal",
  kind: "Email thread, 4 messages",
  emails: [
    { from: "Jude Farrow, Nimbus Hosting", subject: "Renewal, 12th next month", time: "Mon", preview: "Your hosting agreement renews on the 12th. The renewal price is £49,700, a 8% uplift reflecting…" },
    { from: "Dev Patel", subject: "RE: Renewal, 12th next month", time: "Mon", preview: "Thanks Jude. Before we talk price: we had an eleven-hour outage in March that was inside your SLA only because…" },
    { from: "Jude Farrow, Nimbus Hosting", subject: "RE: Renewal, 12th next month", time: "Wed", preview: "Understood. We can hold the price at £46,000 for a two-year term, and include the enhanced backup tier…" },
    { from: "Rowan Fletcher (partner)", subject: "FW: Renewal, position", time: "Thu", preview: "One year at £46,000 flat, enhanced backup included, and the DPA updated before signature. No two-year…" },
  ],
  sections: [
    { heading: "Subject: Renewal, 12th next month (Jude Farrow)", paragraphs: [{ text: "Your hosting agreement renews on the 12th. The renewal price is £49,700, an 8% uplift reflecting the enhanced backup tier now included as standard. Let me know if you would like to discuss." }] },
    { heading: "Subject: RE (Dev Patel)", paragraphs: [{ text: "Thanks Jude. Before we talk price: we had an eleven-hour outage in March that was inside your SLA only because the SLA excludes planned maintenance that overran. We would want that excluded from the exclusions. And our data processing agreement is due a review before any renewal." }] },
    { heading: "Subject: RE (Jude Farrow)", paragraphs: [{ text: "Understood. We can hold the price at £46,000 for a two-year term, include the enhanced backup tier, and I will send the updated DPA this week. Overrunning maintenance counting as downtime is something I need to take to our legal team." }] },
    { heading: "Subject: FW: Renewal, position (Rowan Fletcher)", paragraphs: [{ text: "Dev: one year at £46,000 flat, enhanced backup included, the DPA updated and reviewed by Amara before signature, and overrunning maintenance counted as downtime. No two-year term while the office move is on. Reply by Friday." }] },
  ],
};

export const PATCH_STATUS: AttachedDocument = {
  title: "Patch status, servers",
  kind: "Spreadsheet, 8 rows",
  table: {
    columns: ["Host", "Role", "OS", "Last patched", "Pending", "Critical pending", "Owner"],
    rows: [
      ["app-01", "Application", "Linux", "3rd", "4", "0", "Dev"],
      ["app-02", "Application", "Linux", "3rd", "4", "0", "Dev"],
      ["db-01", "Database", "Linux", "41 days ago", "9", "2", "Dev"],
      ["web-01", "Web", "Linux", "3rd", "2", "0", "Lena"],
      ["file-01", "File server", "Windows", "58 days ago", "14", "3", "Lena"],
      ["mail-gw", "Mail gateway", "Linux", "19 days ago", "6", "1", "Lena"],
      ["backup-01", "Backup", "Windows", "58 days ago", "14", "3", "Dev"],
      ["vpn-01", "VPN", "Appliance", "12 days ago", "1", "1", "Dev"],
    ],
  },
  sections: [
    { heading: "Rows", paragraphs: [
      { text: "app-01 · application · Linux · patched the 3rd · 4 pending · 0 critical · Dev." },
      { text: "app-02 · application · Linux · the 3rd · 4 pending · 0 critical · Dev." },
      { text: "db-01 · database · Linux · 41 days ago · 9 pending · 2 critical · Dev." },
      { text: "web-01 · web · Linux · the 3rd · 2 pending · 0 critical · Lena." },
      { text: "file-01 · file server · Windows · 58 days ago · 14 pending · 3 critical · Lena." },
      { text: "mail-gw · mail gateway · Linux · 19 days ago · 6 pending · 1 critical · Lena." },
      { text: "backup-01 · backup · Windows · 58 days ago · 14 pending · 3 critical · Dev." },
      { text: "vpn-01 · VPN · appliance · 12 days ago · 1 pending · 1 critical · Dev." },
    ] },
    { heading: "Notes", paragraphs: [{ text: "Eight hosts. Ten critical patches pending across five hosts. Two hosts are 58 days behind. The firm's standard: critical patches within 14 days, all others within 30." }] },
  ],
};

export const CHANGE_MEETING: AttachedDocument = {
  title: "Weekly change meeting",
  kind: "Meeting recap, Tuesday, 25 minutes",
  transcript: [
    { who: "Dev Patel", line: "Patching first. Ten criticals across five hosts, two hosts 58 days behind. The file server and backup server get patched Thursday night; db-01 Saturday morning with a maintenance notice sent Wednesday." },
    { who: "Lena Ortiz", line: "I will do file-01 and mail-gw Thursday from 8pm. The VPN appliance critical: that is a vendor firmware; I need a change window, suggest Sunday 6am." },
    { who: "Dev Patel", line: "Sunday 6am approved. INC-2210 actions: the export job is in the release checklist as of yesterday. The hotfix criteria are drafted; Rowan signs them off Friday." },
    { who: "Lena Ortiz", line: "The priority rule is in the handbook. One thing: staging still has no customer with the export enabled, so the checklist step would pass on staging and still miss it." },
    { who: "Dev Patel", line: "Good catch. Add a synthetic customer with the export on to staging; you, by the 24th. Nimbus: Rowan wants one year flat at £46,000, enhanced backup, DPA reviewed by Amara, overrunning maintenance counted as downtime. I reply to Jude by Friday." },
    { who: "Lena Ortiz", line: "The rack move on the 28th: the IT contractor is confirmed from 7am. Backups run Friday night; I will verify the restore on Saturday morning before the rack is powered down." },
    { who: "Dev Patel", line: "Actions: Lena, file-01 and mail-gw Thursday 8pm, VPN firmware Sunday 6am, synthetic staging customer by the 24th, restore test Saturday the 27th; me, db-01 Saturday with notice Wednesday, Nimbus reply Friday, hotfix criteria to Rowan Friday." },
  ],
  sections: [
    { heading: "Recap", paragraphs: [{ text: "Patching: file-01 and mail-gw Thursday 8pm (Lena); db-01 Saturday with notice Wednesday (Dev); VPN firmware Sunday 6am (Lena). Incident actions: checklist done, priority rule in the handbook, hotfix criteria to the partner Friday, synthetic staging customer by the 24th. Nimbus reply by Friday on the partner's terms. Restore test Saturday the 27th before the rack move." }] },
  ],
};

export const IT_BLOCKS: Record<number, TrackBlock> = {
  4: {
    dataPack: IT_PACK,
    practise: {
      kind: "loop",
      task: "Summarise the incident report for the partner, inside Word, then find out what the summary left out.",
      brief: "Rowan has five minutes and is not technical. He needs what customers experienced, why it took twelve days, what changes, and the open questions that need him. Nothing about the schema. The report is open in Word; Copilot has it.",
      material: INCIDENT_REPORT,
      office: "word",
      followUp: true,
      turns: [
        { instruction: "Send 1: ask for the summary. Reader, length, shape, what to flag, what to leave out, from the document.", rubric: { requires: ["reader", "length", "format", "constraints", "material"], goal: "A summary for a non-technical partner: customer impact, why twelve days, the actions, the open questions flagged, under a stated length, no technical detail." }, placeholder: "For the partner, who is not technical, under … words, lead with what customers saw and the questions that need him…" },
        { instruction: "Send 2: ask what it left out, and whether any date or figure in the summary is not in the report.", placeholder: "What did you leave out? Which dates or figures are not stated in the report?" },
      ],
      playbook: { workflow: "Summarise", whenToUse: "An incident report a non-technical reader needs in minutes: impact, cause in plain words, actions, open questions; drop the internals.", check: "Ask what was left out, and check every date and figure against the report." },
    },
    prove: SHARED_PROVE[4],
  },
  5: {
    dataPack: IT_PACK,
    practise: {
      kind: "loop",
      task: "Draft the reply to Jude inside Outlook, then fix its tone in one turn.",
      brief: "The partner's position: one year at £46,000 flat, enhanced backup included, the DPA reviewed before signature, overrunning maintenance counted as downtime, no two-year term. You want to put all four plainly, keep it friendly, and not explain why there is no two-year term. Reply as Dev.",
      material: VENDOR_THREAD,
      office: "outlook",
      followUp: true,
      turns: [
        { instruction: "Send 1: brief Copilot. From whom and to whom, the one thing the reply must achieve, the tone, the length, anything it must not do.", rubric: { requires: ["role", "reader", "task", "constraints", "length"], goal: "A friendly, short reply that sets out the four terms as the firm's position and gives no reason for refusing two years." }, placeholder: "Reply as Dev to Jude… the one thing it must do is put our four terms… do not explain why not two years…" },
        { instruction: "Send 2: fix the tone or the length in one line.", placeholder: "Put the four terms as bullets, and drop the thanks at the end…" },
      ],
      playbook: { workflow: "Draft", whenToUse: "Any reply with one job: from whom and to whom, the one thing, the voice, the length, what not to explain.", check: "Read it as the vendor would; check every figure and term against the partner's email." },
    },
    prove: SHARED_PROVE[5],
  },
  6: {
    dataPack: IT_PACK,
    practises: [
      {
        kind: "spot",
        task: "Read Copilot's reply about the patch status. One sentence states something the sheet does not say. Tap it.",
        prompt: "Summarise what this sheet says about patching",
        sentences: [
          "Eight hosts are listed; ten critical patches are pending across five of them.",
          "The file server and the backup server are both 58 days behind with three criticals each.",
          "The database server is 41 days behind with two criticals pending.",
          "The application and web servers were patched on the 3rd and have no criticals pending.",
          "The two Windows hosts are behind because their patch window was cancelled during the incident.",
        ],
        errorIndex: 4,
        why: "The sheet has no column for why. The cancelled window is a plausible story the tool supplied; nothing in the source supports it. Specific, reasonable, invented.",
        material: PATCH_STATUS,
      },
      {
        kind: "loop",
        task: "Now ask the sheet the question that would have caught that guess, inside Excel.",
        brief: "Dev wants to know, from the sheet alone, which hosts breach the 14-day critical standard, how many criticals each owner has, and which host is furthest behind. Ask for the figures and the workings from named columns, and ask Copilot to mark anything not in the sheet.",
        material: PATCH_STATUS,
        office: "excel",
        followUp: false,
        turns: [
          { instruction: "One send: a question with a definite answer, the workings from named columns, and an instruction to mark anything not in the sheet.", rubric: { requires: ["task", "format", "constraints", "material"], goal: "Hosts breaching the standard by the Last patched and Critical pending columns, criticals summed by the Owner column, with the arithmetic shown." }, placeholder: "From the Last patched, Critical pending and Owner columns, which hosts breach the 14-day critical standard and how many criticals does each owner have? Show the arithmetic and mark anything…" },
        ],
        playbook: { workflow: "Analyse", whenToUse: "Any question of a status export: ask the question, name the columns, ask for the workings, ask it to mark anything not in the sheet.", check: "Check the one figure that matters against the cells it came from." },
      },
    ],
    prove: SHARED_PROVE[6],
  },
  7: {
    dataPack: IT_PACK,
    practises: [
      {
        kind: "loop",
        task: "Research a question for the partner with web mode on, then get the sources.",
        brief: "Rowan wants to know what a UK firm must do when a supplier processes personal data on its behalf, as a short checklist for the hosting renewal. Do not name the supplier or the firm in the prompt.",
        followUp: true,
        webMode: true,
        turns: [
          { instruction: "Send 1: the question, for the partner, with the constraints: UK only, current guidance, cite sources, say when each was last updated.", rubric: { requires: ["task", "reader", "constraints"], goal: "A short checklist of a controller's duties when using a processor in the UK, with sources and dates." }, placeholder: "For the partner: what must a UK firm put in place when a supplier processes personal data on its behalf… current guidance, cite sources with dates…" },
          { instruction: "Send 2: ask for the sources as a numbered list with publisher, title and date, and ask it to mark any it is not certain exists.", placeholder: "List your sources with publisher, title and date, and mark any you are not certain exist…" },
        ],
        playbook: { workflow: "Research", whenToUse: "A question you cannot answer from your own files: reader, constraints, UK only and current, sources with dates.", check: "Open two of the sources. If one does not exist, trust nothing in the reply." },
      },
      {
        kind: "sources",
        task: "Here is the sources list a colleague got for the same question. One of the four does not exist. Mark it.",
        prompt: "List the sources for that answer with publisher, title and date.",
        reply: "Here are the sources:\n\n1. ICO, Contracts and liabilities between controllers and processors\n2. UK GDPR, Article 28, legislation.gov.uk\n3. NCSC, Supply chain security guidance\n4. ICO, Processor Due Diligence Standard 2025, annex B\n\nI am confident in all four.",
        sources: [
          { label: "ICO, Contracts and liabilities between controllers and processors", real: true, note: "The ICO publishes guidance on controller-processor contracts." },
          { label: "UK GDPR, Article 28, legislation.gov.uk", real: true, note: "Article 28 sets the processor contract requirements." },
          { label: "NCSC, Supply chain security guidance", real: true, note: "The NCSC publishes supply chain security guidance." },
          { label: "ICO, Processor Due Diligence Standard 2025, annex B", real: false, note: "There is no such standard. The publisher is real, the year is recent, the annex is specific, and it does not exist." },
        ],
      },
    ],
    prove: SHARED_PROVE[7],
  },
  8: {
    dataPack: IT_PACK,
    practises: [
      {
        kind: "loop",
        task: "Write the recap prompt once with slots, run it twice inside Teams, then check the second run against the transcript.",
        brief: "The partner missed the change meeting and wants a recap: what was decided, then the actions with an owner and a date each. Run the same template twice, the second time for a colleague who needs only their own actions, in a fresh chat each time.",
        material: CHANGE_MEETING,
        office: "teams",
        followUp: false,
        turns: [
          { instruction: "Send 1: the template, filled in for the partner. Reader, shape (decisions, then actions with owner and date), length, what to flag, and the check written into the prompt.", rubric: { requires: ["reader", "format", "length", "constraints", "material"], goal: "A recap: decisions as bullets, actions with owner and date, under a stated length, anything needing the partner flagged, every owner and date from the transcript." }, placeholder: "Recap the change meeting for the partner, who missed it: three bullets on what was decided, then actions with owner and date, under … words, flag anything that needs him. Check: …" },
          { instruction: "Send 2: the same template, filled in for Lena, who was there and needs only her own actions. Change the slots, not the prompt.", rubric: { requires: ["reader", "format", "length", "constraints", "material"], goal: "The same shape for a different reader: only Lena's actions, with dates and times." }, placeholder: "Recap the change meeting for Lena, who was there and needs only her own actions…" },
        ],
        playbook: { workflow: "Automate", whenToUse: "A task you do every week with different inputs: write it once with slots for the meeting, the reader and the length, and write the check into the prompt.", check: "Every owner, date and time traced to the transcript; ask the tool to mark anything not stated in the source." },
      },
      {
        kind: "spot",
        task: "Here is the recap a colleague's template produced. One action has a detail the transcript does not support. Tap it.",
        prompt: "Recap the change meeting for the partner: decisions, then actions with owner and date, under 100 words.",
        sentences: [
          "Decided: the VPN firmware change window is Sunday at 6am.",
          "Decided: the Nimbus reply goes on the partner's terms, one year flat with enhanced backup and the DPA reviewed first.",
          "Action: Lena patches the file server and mail gateway Thursday from 8pm, and adds a synthetic staging customer by the 24th.",
          "Action: Dev patches the database server Saturday night after sending notice on Wednesday.",
          "Action: Lena verifies the backup restore on Saturday the 27th before the rack is powered down.",
        ],
        errorIndex: 3,
        why: "The transcript says db-01 is patched Saturday morning, not Saturday night. A patch window moved by twelve hours is the kind of error that has a database server down during a working morning. Trace every time to the transcript.",
        material: CHANGE_MEETING,
      },
    ],
    prove: SHARED_PROVE[8],
  },
  9: {
    dataPack: IT_PACK,
    practises: [
      {
        kind: "loop",
        task: "Turn the incident report into the one-page note that goes to the partners, inside Word, in three turns.",
        brief: "The partners want one page: what customers experienced with dates, the cost, why it took twelve days in plain words, the three actions with owners and dates, and the two decisions they need to make. Nothing about hosts, accounts or releases by number. The report is open in Word; Copilot has it. Three turns: ask, fix, finish. Then check it.",
        material: INCIDENT_REPORT,
        office: "word",
        followUp: true,
        turns: [
          { instruction: "Turn 1: the full ask. Who it is for, the shape, the length, what to flag and leave out, from the report.", rubric: { requires: ["reader", "task", "format", "length", "constraints", "material"], goal: "A one-page partners' note: impact with dates and cost, plain cause, three actions with owners and dates, two decisions flagged, nothing technical, from the report." }, placeholder: "For the partners, who are not technical: one page with what customers experienced and when, the cost, why it took twelve days in plain words, the three actions with owner and date, and the two decisions they need to make, under … words, from the report…" },
          { instruction: "Turn 2: look at it as a partner would. Say what was wrong or narrow it.", placeholder: "Cut the release numbers; the decisions must be at the top; the cost needs the figure…" },
          { instruction: "Turn 3: ask it to check every date, figure and owner against the report and mark anything it stated that the report does not.", placeholder: "Check every date, figure and owner in the note against the report and mark anything not stated in it…" },
        ],
        playbook: { workflow: "Your real task", whenToUse: "A partners' note from an incident report: reader, shape, length, what to leave out, from the report; then fix, then check.", check: "Every date, figure and owner traced to the report; nothing technical or restricted on the page; the tool asked to mark anything the report does not say." },
      },
      {
        kind: "spot",
        task: "Here is a partners' note a colleague's prompt produced from the same report. One figure is wrong. Tap the sentence.",
        prompt: "One page for the partners: impact with dates and cost, plain cause, three actions with owner and date, the two decisions, under 150 words, from the report.",
        sentences: [
          "Decisions needed: whether the two other customers who reported the fault are offered a credit, and whether the test environment should mirror customer settings.",
          "Impact: every customer on the shared platform was without the invoicing export from the 5th to the 17th; three reported it and one escalated, with a service credit of £2,300.",
          "Cause, in plain words: a change in a release broke the export, the first internal report was logged as low priority, and the fix waited eight days for the scheduled release instead of going out early.",
          "Actions: the export is added to the release checklist by the 24th (Dev); customer-facing faults become high priority in the handbook by the 22nd (Lena); hotfix criteria are defined by the 24th (Dev).",
          "No customer data was lost; exports regenerated after the fix include the missing period.",
        ],
        errorIndex: 2,
        why: "The report says the fix was estimated on the 10th and shipped on the 17th: seven days, not eight. The note overstates the delay to the partners by a day. Plausible, close, wrong; trace every figure to the timeline.",
        material: INCIDENT_REPORT,
      },
    ],
    prove: [
      ...SHARED_PROVE[9],
      { kind: "choose", stem: "The note names the service account and the firewall address in the cause paragraph. What happens?", options: ["Leave them; they are accurate.", "Take them out: the brief said nothing technical, and both are restricted in the firm's data rules.", "Abbreviate them."], answer: 1, why: "Accurate and restricted are different questions. The brief's constraint and the firm's rules both say out." },
    ],
  },
};
