import type { ModuleManifest, TrackBlock } from "@/app/ai-cleared/engine/types";
import { everyDesk } from "./everyDesk";

/* Cyber Awareness, Module 4 · Malware, Devices & Working Remotely.
 * Modules 1 to 3 were about people, messages and sign-ins; this one is
 * about the machines. Learn: what malware and ransomware are, in plain
 * words, with two UK cases (the British Library, 2023; Synnovis, 2024);
 * the six ordinary doors malware uses; your devices (lock, update, only
 * approved software, personal devices); and working away from the office
 * (home and public Wi-Fi, screens and calls in public, travel, lost
 * devices). Practise: spot the risk in a café on a working afternoon,
 * then on your laptop screen, where some things only look risky. Prove:
 * five "what do you do next?" scenarios. Same for every desk.
 *
 * Every figure and case is taken from the published pages linked on its
 * card, checked on 9 November 2026, and phrased as reported. Every person,
 * firm and message in the practice and the scenarios is invented. Real
 * names appear only as the thing impersonated or as a neutral mention. */

const SOURCES = {
  survey: { label: "Cyber Security Breaches Survey 2025, GOV.UK, 10 April 2025", href: "https://www.gov.uk/government/statistics/cyber-security-breaches-survey-2025/cyber-security-breaches-survey-2025" },
  ncscMalware: { label: "NCSC: Mitigating malware and ransomware attacks", href: "https://www.ncsc.gov.uk/guidance/mitigating-malware-and-ransomware-attacks" },
  blReview: { label: "British Library, 8 March 2024: Learning lessons from the cyber-attack (its incident review)", href: "https://www.bl.uk/home/british-library-cyber-incident-review-8-march-2024.pdf" },
  nhsSynnovis: { label: "NHS England: Synnovis cyber incident", href: "https://www.england.nhs.uk/synnovis-cyber-incident/" },
  nhsUpdate: { label: "NHS England London, 26 September 2024: update on the clinical impact in south east London", href: "https://www.england.nhs.uk/london/2024/09/26/update-on-cyber-incident-clinical-impact-in-south-east-london-thursday-26-september-2024/" },
  cis: { label: "Center for Internet Security, 8 February 2024: fake browser updates in malware campaigns", href: "https://www.cisecurity.org/insights/blog/ctas-leveraging-fake-browser-updates-in-malware-campaigns" },
  msMacros: { label: "Microsoft Learn: Macros from the internet are blocked by default in Office", href: "https://learn.microsoft.com/en-us/microsoft-365-apps/security/internet-macros-blocked" },
  ncscDevices: { label: "NCSC small organisations guide: protecting your devices (reviewed July 2026)", href: "https://www.ncsc.gov.uk/collection/small-organisations-guide-to-cyber-security/protecting-your-devices" },
  ncscUpdates: { label: "NCSC: Install the latest software and app updates", href: "https://www.ncsc.gov.uk/collection/top-tips-for-staying-secure-online/install-the-latest-software-and-app-updates" },
  cyberEssentials: { label: "NCSC: Cyber Essentials requirements for IT infrastructure v3.3 (scope, and security update management)", href: "https://www.ncsc.gov.uk/files/cyber-essentials-requirements-for-it-infrastructure-v3-3.pdf" },
  ncscSmallBusiness: { label: "NCSC Small Business Guide (October 2020): USB drives, lost devices and Wi-Fi hotspots", href: "https://www.ncsc.gov.uk/files/NCSC_A5_Small_Business_Guide_v4_OCT20.pdf" },
  ncscConnecting: { label: "NCSC Exercise in a Box: Connecting securely, micro exercise", href: "https://www.ncsc.gov.uk/files/connecting-securely-micro-exercise.pdf" },
  ncscEndUsers: { label: "NCSC Device security guidance: Advising end users (reviewed May 2025)", href: "https://www.ncsc.gov.uk/collection/device-security-guidance/managing-deployed-devices/advising-end-users" },
  ncscMeetings: { label: "NCSC, 19 March 2026: How to secure your online meetings", href: "https://www.ncsc.gov.uk/guidance/how-to-secure-your-online-meetings" },
};

const BLOCK: TrackBlock = {
  practise: {
    kind: "scene",
    task: "A working afternoon in a café. Open each numbered spot, at your table and then on your screen, and decide: needs fixing, or fine as it is?",
    scene: "Some things only look risky. Every call shows why.",
    calls: { risk: "Needs fixing", fine: "Fine as it is" },
    views: [
      {
        label: "The café",
        art: "cafe",
        alt: "A café on a working afternoon. Your laptop is open on your table beside your coffee, a USB stick and your phone, while you queue at the counter. Two people sit at the next table.",
        spots: [
          {
            x: 37,
            y: 51,
            label: "Your laptop, open on the table",
            seen: "You have gone to the counter for a refill. Your laptop is open at your seat, signed in, with a client's file on screen. You will only be a couple of minutes, and your scarf is on the chair.",
            risk: true,
            why: "Anyone passing could read the file, or use your account as you, in less time than it takes to make a coffee. Lock the screen every time you step away, even for a minute: the Windows key and L, or Control, Command and Q on a Mac. In a café, better still, take it with you.",
          },
          {
            x: 59,
            y: 87,
            label: "A USB stick by your cup",
            seen: "You found it in the car park this morning. Its paper tag says Payroll 2026. You were going to plug it in to see whose it is, so you can give it back.",
            risk: true,
            why: "A stick nobody can account for is one of the oldest ways to get malware into a firm, and a tempting label is the bait: curiosity, from Module 1. The NCSC warns that one infected stick can do harm across a whole organisation. Do not plug it in anywhere, at work or at home. Hand it to {{firm.contact}}, who can deal with it safely.",
          },
          {
            x: 74,
            y: 76,
            label: "Your phone, face down",
            seen: "Locked with a PIN. Its hotspot is on, and your laptop is connected through it instead of the café Wi-Fi, as {{firm.name}}'s rules for working away from the office ask.",
            risk: false,
            why: "The NCSC's advice is to avoid unknown public hotspots for work and use your phone's own mobile connection, shared with the laptop, or a VPN. The phone is locked, so nobody can pick it up and use it. Always go by your own firm's rules on this.",
          },
          {
            x: 88,
            y: 61,
            label: "The next table, an arm's length away",
            seen: "Your 14:30 call with a client at Brackwater & Lune starts in five minutes. You plan to take it here, on speaker, so you can type notes about their year-end accounts as you talk.",
            risk: true,
            why: "Everyone at the next table would hear the client's name and their business, and could watch your screen as you type. The NCSC's advice is to be aware of your surroundings and stop people overlooking your screen. Move somewhere private, or use headphones and keep names and details out of it, or move the call.",
          },
        ],
      },
      {
        label: "Your screen",
        art: "laptop",
        alt: "Your laptop screen at 14:12: a news page in the browser covered by a pop-up, a download under way, a chat message, the firm's software app, a restart reminder, and the taskbar with a VPN shield by the clock.",
        spots: [
          {
            x: 54,
            y: 23,
            label: "A pop-up over the news page",
            seen: "You were reading a news site when the page went dark and this appeared: Browser out of date. Your browser may be unsafe until you update it. Update now.",
            risk: true,
            why: "Your browser updates itself, or IT updates it for you. It never asks through a pop-up on a website. Fake update prompts are a known way to deliver malware, even on websites you trust, because criminals break into real sites to show them: the download is the attack. Close the tab without clicking anything in it.",
          },
          {
            x: 64,
            y: 70,
            label: "A download in your browser",
            seen: "FreePDF Pro setup, half downloaded. A friend recommended it for merging PDFs, and it is free. Installing it only needs your normal login.",
            risk: true,
            why: "Software from outside what IT approves is a common way in for malware, and free tools found online are a favourite disguise. Even a genuine one may never get security updates. Cancel the download and ask IT: there is probably an approved tool that already does the job.",
          },
          {
            x: 93,
            y: 12,
            label: "A chat message from Leah",
            seen: "Leah Brennan, from your team: \"Nightmare, I left my work laptop on the train last night! Lost property might have it. I'll tell IT on Monday if it hasn't turned up.\"",
            risk: true,
            why: "The laptop holds Leah's email, files and saved sign-ins, and every hour it is missing is an hour someone else could try to get in. IT can lock or wipe it remotely and change her passwords, but only once they know. Reply and ask her to tell IT now, not on Monday. Module 8 covers exactly how to report.",
          },
          {
            x: 93,
            y: 41,
            label: "The firm's software app",
            seen: "{{firm.name}}'s own software app, where IT puts the tools you are allowed to install. It says one update is ready: a new version of the chat app.",
            risk: false,
            why: "This is the right place to get software at work: IT has approved it and keeps it updated. An update offered here comes from IT, not from a website. Install it when you can.",
          },
          {
            x: 93,
            y: 64,
            label: "A restart reminder",
            seen: "Restart needed to finish installing updates. You have pressed Later every day for three weeks, and the reminder now says: postponed 21 days.",
            risk: true,
            why: "Updates fix weaknesses that criminals use to break in, and until you restart they are not installed. Cyber Essentials, the government-backed scheme, expects the most serious fixes to be in place within 14 days of release; you are a week past that. Save your work and restart today, after this call at the latest.",
          },
          {
            x: 73,
            y: 88,
            label: "A shield on the taskbar",
            seen: "A green shield next to the clock: VPN, connected. It came on by itself when your laptop joined your phone's hotspot.",
            risk: false,
            why: "It is what you want to see. {{firm.name}}'s VPN encrypts your work traffic before it crosses whatever network you are on. If it ever shows disconnected while you are out, stop and sort that out before you carry on working.",
          },
        ],
      },
    ],
  },
  prove: [
    {
      kind: "choose",
      stem: "An email from a supplier you use has an invoice attached. When you open it, a bar says macros have been disabled and asks you to enable content to see the figures. What do you do next?",
      options: [
        "Close it without enabling anything, and send it to IT to check.",
        "Enable the content, since the supplier is one the firm works with.",
        "Enable it, then run a virus scan straight afterwards to be safe.",
      ],
      answer: 0,
      why: "Microsoft says macros are a common way for criminals to deliver malware and ransomware, which is why Office now blocks them in files from the internet. A real invoice almost never needs them, and the supplier's account may have been taken over. Leave them off and let IT look at the file. A scan afterwards is too late: the macro has already run.",
    },
    {
      kind: "choose",
      stem: "On the way home you realise your work laptop is still on the 18:10 train you got off ten minutes ago. It is locked with a password. What do you do next?",
      options: [
        "Ring lost property first, and tell IT tomorrow if it has not turned up.",
        "Tell IT straight away, then report it to the train's lost property.",
        "Leave it until the morning, as it is locked and nobody has your password.",
      ],
      answer: 1,
      why: "Speed matters. IT can lock or wipe a lost laptop remotely and protect everything it is signed in to, but only once they know. A screen lock slows a thief down; it does not make the laptop safe. Lost property can still help, after IT. Module 8 covers how to report.",
    },
    {
      kind: "choose",
      stem: "At a hotel for a client meeting, you need to send a draft tonight. The hotel Wi-Fi asks only for your room number, and the firm's VPN will not connect on it. What do you do next?",
      options: [
        "Send it on the hotel Wi-Fi anyway, as it asked for your room number.",
        "Send it from your personal email instead, which needs no VPN at all.",
        "Use your phone's hotspot if the firm allows it, or else ask IT for help.",
      ],
      answer: 2,
      why: "Anyone else staying can join the same hotel Wi-Fi, and you cannot easily tell who runs it. The NCSC's advice is to use your phone's mobile connection or a VPN for work, not a public hotspot. Sending client work from a personal account takes it outside the firm's protection altogether. If neither works, the draft can wait for IT.",
    },
    {
      kind: "choose",
      stem: "You would like to read work email on your own tablet at weekends. The email app on it lets you add your work account in two minutes. What do you do next?",
      options: [
        "Add it yourself, since the tablet is yours and the app is the official one.",
        "Check the firm's rules on personal devices, and ask IT before adding it.",
        "Set up a rule that forwards your work email to your personal address.",
      ],
      answer: 1,
      why: "Work data on a personal device is still the firm's data, and many firms have rules for it: a PIN, updates, a way to remove work data if the tablet is lost. Cyber Essentials counts personal devices that reach work email as part of the firm's systems. Ask {{firm.contact}} first. Forwarding work email to a personal address moves client data out of the firm altogether.",
    },
    {
      kind: "choose",
      stem: "A colleague offers you a copy of an expensive design app, already unlocked so it needs no licence. Half the team use it, he says. What do you do next?",
      options: [
        "Turn it down, and ask IT for the approved app or a proper licence.",
        "Install it, but only on your own laptop rather than on a work one.",
        "Install it, as the team uses it and the firm would only buy it anyway.",
      ],
      answer: 0,
      why: "Cracked software is a favourite hiding place for malware, and it never gets the security updates the real one does. Cyber Essentials expects software on devices used for work to be licensed and supported. If you need the tool, IT can get you a proper copy. Your own laptop is no safer, and it is still a way into anything you use it for.",
    },
  ],
};

export const AWARENESS_MODULE_4: ModuleManifest = {
  n: 4,
  slug: "malware-devices-and-working-remotely",
  title: "Malware, Devices & Working Remotely",
  minutes: 15,
  course: "cyber-awareness",
  promise: "Keep malware out: know the doors it uses, keep your devices locked and up to date, and work as safely in a café as at your desk.",
  passMark: 4,
  shuffleOptions: true,
  dock: [
    { label: "Your devices", lines: ["Walking away? Lock it: Windows key and L.", "Asked to restart for updates? Do it that day.", "Software only from IT, or the firm's own software app."] },
    { label: "Away from the office", lines: ["Public Wi-Fi: the firm's VPN, or your phone's hotspot if the firm says so.", "Check who can see your screen and hear your call."] },
    { label: "Lost a device? Found a stick?", lines: ["Tell {{firm.contact}} straight away. Speed matters more than the story.", "Never plug in a USB stick you cannot account for."] },
  ],
  learn: [
    {
      kind: "intro",
      eyebrow: "Module 4 of 8 · about 15 minutes",
      heading: "Malware needs a way in. Your devices are the doors.",
      lead: "Ransomware can stop a whole organisation in a morning, and it usually gets in through something ordinary: a file opened, a stick plugged in, an update put off, a laptop left open. This module is about those doors: how malware gets in, how to keep your devices locked and up to date, and how to work safely away from the office.",
      note: "The cases and figures come from published reports, linked on each card. Every person, firm and message in the practice is invented.",
      cta: "Show me what malware does",
    },
    {
      kind: "cards",
      eyebrow: "Learn · malware in plain words",
      heading: "Software that works for someone else. Tap each.",
      reveal: true,
      columns: 1,
      cards: [
        {
          title: "Malware",
          tag: "In plain words",
          tint: "I",
          body: "Any software built to do harm: to spy, to steal, to take control or to lock things up.",
          detail: "Viruses, spyware, remote control tools and ransomware are all malware. Most of it needs one thing from a person to get started: a file opened, a link followed, something installed or plugged in. The rest of this module is about those moments.",
        },
        {
          title: "Ransomware",
          tag: "The one that stops a firm",
          tint: "crit",
          body: "It locks up your files and systems, and the criminals demand money to give them back.",
          detail: "The NCSC describes ransomware as malware that stops you getting to your computer or the data on it: the data might be stolen, deleted or encrypted, and attackers also threaten to publish it if they are not paid. Its guidance says law enforcement does not encourage paying, and there is no guarantee that paying brings anything back. For a firm, that can mean no email, no files and no client systems.",
          sources: [SOURCES.ncscMalware],
        },
        {
          title: "UK businesses, 2025",
          tag: "UK government survey",
          tint: "I",
          body: "More businesses hit by ransomware, fewer with up-to-date protection.",
          detail: "The government's Cyber Security Breaches Survey 2025 found ransomware rose from under 0.5% of UK businesses in 2024 to 1% in 2025, an estimated 19,000 businesses. Over the same year, the share of businesses using up-to-date malware protection fell from 83% to 77%.",
          sources: [SOURCES.survey],
        },
      ],
    },
    {
      kind: "cards",
      eyebrow: "Learn · what it does to an organisation",
      heading: "Two UK ransomware attacks, as reported. Tap each.",
      lead: "One library, one supplier to NHS hospitals. Both are described in reports by the people who dealt with them.",
      reveal: true,
      columns: 1,
      cards: [
        {
          title: "The British Library, 2023",
          tag: "Culture · UK",
          tint: "crit",
          body: "Ransomware, staff and user data put up for auction, and services down for months.",
          detail: "The Library's own review says it found it had been hit by ransomware on 28 October 2023, in an attack claimed by the Rhysida gang. The first unauthorised access it detected was at a remote access server set up for partners and IT staff, which was not protected by multi-factor authentication, though the review says the exact way in cannot be known for certain. The attackers copied about 600GB of files, including personal data of users and staff; no ransom was paid, and the data was put up for auction, then dumped on the dark web. They also encrypted or destroyed much of the Library's servers, and a searchable online catalogue only came back on 15 January 2024. The review notes that newer security software stopped the encryption on its laptops and desktops, while older protection on its servers could not.",
          sources: [SOURCES.blReview],
        },
        {
          title: "Synnovis, 2024",
          tag: "Health · UK",
          tint: "crit",
          body: "A pathology provider hit, and London hospitals postponed thousands of appointments.",
          detail: "NHS England says that on 3 June 2024, Synnovis, a pathology services provider to the NHS, was hit by a ransomware attack that badly cut its capacity to process tests, with the greatest impact in south east London. By late September it reported 10,152 acute outpatient appointments and 1,710 elective procedures postponed at King's College Hospital and Guy's and St Thomas'. On 20 June the criminals published data they had stolen, and blood donors with O type blood were asked to book donations urgently.",
          sources: [SOURCES.nhsSynnovis, SOURCES.nhsUpdate],
        },
      ],
      note: "Neither began with anything exotic. The next screen is the ordinary doors malware uses, the British Library's among them.",
    },
    {
      kind: "cards",
      eyebrow: "Learn · how it gets in",
      heading: "Six ordinary doors. Tap each.",
      reveal: true,
      columns: 2,
      cards: [
        {
          title: "Attachments and downloads",
          tint: "warn",
          body: "A file you were not expecting, or a download from a site you do not know.",
          detail: "Most malware still arrives as a file someone opens. Module 2 covered the tells in the message; here the rule is about the file. If you did not expect it, do not open it until you have checked with the sender through a channel you already trust. And never install a program you downloaded yourself at work: that is IT's job.",
        },
        {
          title: "Fake update pop-ups",
          tint: "crit",
          body: "A website says your browser is out of date and offers an Update now button.",
          detail: "Researchers at the Center for Internet Security have described criminals breaking into ordinary websites so that visitors see a fake browser update, made to match the browser they use. The download is malware. Real browser updates come from the browser itself or from IT, never from a pop-up on a website. Close the tab.",
          sources: [SOURCES.cis],
        },
        {
          title: "Macros",
          tint: "warn",
          body: "A document that asks you to enable content, or enable macros, to see it.",
          detail: "Macros are small programs inside Office files. Microsoft says they are a common way for criminals to deliver malware and ransomware, which is why Office now blocks macros in files from the internet by default. If a document asks you to enable content to read it, do not. Ask IT.",
          sources: [SOURCES.msMacros],
        },
        {
          title: "Cracked or unapproved software",
          tint: "crit",
          body: "A free tool found online, or a paid one someone has unlocked.",
          detail: "Software that has not come through IT may carry malware, and it does not get security updates. The NCSC advises downloading apps only from official stores or websites, and Cyber Essentials expects software on work devices to be licensed and supported. Need a tool? Ask IT for the approved one.",
          sources: [SOURCES.ncscDevices, SOURCES.cyberEssentials],
        },
        {
          title: "Unknown USB sticks",
          tint: "warn",
          body: "A stick found in the car park, handed out at an event, or sent in the post.",
          detail: "The NCSC warns that it only takes one person plugging in an infected stick to do harm across a whole organisation, and advises firms to control how USB drives are used. Do not plug in a stick you cannot account for, at work or at home. Hand it to IT.",
          sources: [SOURCES.ncscSmallBusiness],
        },
        {
          title: "Remote access left open",
          tint: "crit",
          body: "A way into the network from outside, meant for IT or a supplier, without enough protection.",
          detail: "The NCSC lists exposed remote access services, and remote access devices that have not been patched, among the ways ransomware gets in. At the British Library, the review points to a remote access server for partners and IT staff that had no multi-factor authentication, the second step from Module 3. If you use remote access, use it only as IT set it up, and tell IT about any you know is no longer needed.",
          sources: [SOURCES.ncscMalware, SOURCES.blReview],
        },
      ],
      note: "Most of these doors only open if someone opens them. That is the good news: you can keep them shut.",
    },
    {
      kind: "cards",
      eyebrow: "Learn · your devices",
      heading: "Locked, up to date, and only what IT approved. Tap each.",
      reveal: true,
      columns: 2,
      cards: [
        {
          title: "Lock your screen",
          tint: "I",
          body: "Every time you walk away, even for a minute.",
          detail: "An unlocked laptop is your account with nobody watching it. Lock it with the Windows key and L, or Control, Command and Q on a Mac. On your phone, the NCSC recommends a PIN of at least six digits, or a strong password, and warns against guessable PINs. Set it to lock itself after a short time too.",
          sources: [SOURCES.ncscDevices],
        },
        {
          title: "Install updates promptly",
          tint: "crit",
          body: "When your laptop or phone asks to restart for updates, do it that day.",
          detail: "Updates fix bugs that criminals could use to break in, as the NCSC puts it, so a postponed update is a door left open. Cyber Essentials expects the most serious fixes to be installed within 14 days of release, yet the Cyber Security Breaches Survey 2025 found only 32% of businesses had a policy to apply security updates within 14 days. Turn on automatic updates where you can, and stop pressing Later.",
          sources: [SOURCES.ncscDevices, SOURCES.ncscUpdates, SOURCES.cyberEssentials, SOURCES.survey],
        },
        {
          title: "Only approved software",
          tint: "ok",
          body: "Everything you install at work comes through IT, or the firm's own software app.",
          detail: "IT checks software before approving it, keeps it updated, and knows it is there if something goes wrong. If you need a tool you do not have, ask {{firm.contact}}: there is often an approved one that already does the job.",
        },
        {
          title: "Personal devices and work data",
          tint: "warn",
          body: "Work email on your own phone or tablet brings that device under the firm's rules.",
          detail: "Cyber Essentials, the government-backed security scheme, counts personal devices that reach work email or files as part of the firm's systems, so they need the same protection. Every firm sets its own rules here. Follow {{firm.name}}'s, and if you are not sure what they are, ask {{firm.contact}} before you add a work account.",
          sources: [SOURCES.cyberEssentials],
        },
      ],
    },
    {
      kind: "cards",
      eyebrow: "Learn · working remotely",
      heading: "Home, café, train or hotel: the office comes with you. Tap each.",
      reveal: true,
      columns: 2,
      cards: [
        {
          title: "Home Wi-Fi",
          tint: "I",
          body: "Your router at home is now part of how you reach the firm.",
          detail: "The NCSC's advice is to change the router's default password to a strong one (three random words, from Module 3, works well) and to check it uses WPA2 encryption or newer. If you are not sure how, your internet provider's help pages will say.",
          sources: [SOURCES.ncscConnecting],
        },
        {
          title: "Public Wi-Fi",
          tint: "crit",
          body: "In a café, hotel or station, you cannot tell who runs the network.",
          detail: "The NCSC warns that on public Wi-Fi, others on the same network may be able to intercept your data, and that criminals set up fake hotspots with the same name as the real one or one very like it. Its advice is to use public Wi-Fi only for browsing, and a VPN, or your phone's own mobile connection, for anything to do with work. At {{firm.name}}, use the firm's VPN, or your phone's hotspot if the firm says so.",
          sources: [SOURCES.ncscConnecting, SOURCES.ncscSmallBusiness],
        },
        {
          title: "Screens and calls in public",
          tint: "warn",
          body: "Who can see your screen, and who can hear your call?",
          detail: "The NCSC advises staff to be aware of their surroundings and to stop people overlooking their screen; a privacy screen helps. For calls, it says to check your surroundings before you join. Use headphones, keep client names and details out of anything said in a café or on a train, and if it cannot wait, find somewhere private.",
          sources: [SOURCES.ncscEndUsers, SOURCES.ncscMeetings],
        },
        {
          title: "Travel",
          tint: "I",
          body: "Your laptop and phone go where you go.",
          detail: "Keep work devices with you: in your hand luggage, not in a checked bag or on show in a car. Lock them whenever you step away, in a hotel room as much as in a café. Taking a work device abroad? Ask {{firm.contact}} before you go: the firm may have rules for it.",
        },
        {
          title: "Lost or stolen",
          tint: "crit",
          body: "Tell IT straight away. Speed matters more than anything else.",
          detail: "A lost laptop or phone can still be signed in to your email and files. The NCSC advises firms to set devices up so they can be tracked, locked or wiped from afar, but IT can only do that once they know. Tell {{firm.contact}} the moment you realise, even if you think it might turn up. Module 8 covers how to report.",
          sources: [SOURCES.ncscSmallBusiness],
        },
      ],
      note: "Next: a working afternoon in a café. Look round, then look at your screen.",
    },
  ],
  tracks: everyDesk(BLOCK),
};
