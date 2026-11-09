import type { ModuleManifest, TrackBlock } from "@/app/ai-cleared/engine/types";
import { everyDesk } from "./everyDesk";

/* Cyber Awareness, Module 7 · AI-Powered Scams & Deepfakes. Module 6 was
 * the call-back for payments; this one is the same habit against a voice
 * or a face that has been copied. Learn: six things AI has made cheap to
 * fake (voices, live video, documents and ID, perfect English, candidates,
 * support chats); four reported cases (WPP and Ferrari in 2024, both
 * stopped; the UK government's warning; the FBI on cloned voice messages);
 * why a call proves nothing on its own; and the five checks that beat any
 * fake. Practise: a week of incoming calls, voice and video, from people
 * the learner knows, each with an unusual request; at each turn the
 * learner picks a response and the caller reacts. Two of the five callers
 * are genuine, so the lesson is verify, never assume. Prove: five "what do
 * you do next?" scenarios. Same for every desk.
 *
 * Every figure and case is taken from the published pages linked on its
 * card, checked on 9 November 2026, and phrased as reported. Every person,
 * firm and number in the practice and the scenarios is invented: addresses
 * end in .example and phone numbers sit in Ofcom's drama ranges. Callers
 * are drawn (initials and shapes), never filmed or generated, and nothing
 * is heard: every call is a transcript. */

const SOURCES = {
  starling: { label: "Starling Bank, 18 September 2024: Safe Phrases campaign, with its survey of 3,010 UK adults", href: "https://www.starlingbank.com/news/starling-bank-launches-safe-phrases-campaign" },
  fbiGenAi: { label: "FBI Internet Crime Complaint Center, 3 December 2024: criminals use generative AI to facilitate financial fraud", href: "https://www.ic3.gov/PSA/2024/PSA241203" },
  fbiOfficials: { label: "FBI Internet Crime Complaint Center, 15 May 2025: senior US officials impersonated in malicious messaging campaign", href: "https://www.ic3.gov/PSA/2025/PSA250515" },
  fbiItWorkers: { label: "FBI Internet Crime Complaint Center, 23 January 2025: North Korean IT workers and AI in video interviews", href: "https://www.ic3.gov/PSA/2025/PSA250123" },
  dojItWorkers: { label: "US Department of Justice, 30 June 2025: coordinated actions against North Korean remote IT worker schemes", href: "https://www.justice.gov/opa/pr/justice-department-announces-coordinated-nationwide-actions-combat-north-korean-remote" },
  knowbe4: { label: "KnowBe4, 23 July 2024: how a North Korean fake IT worker tried to infiltrate us", href: "https://blog.knowbe4.com/how-a-north-korean-fake-it-worker-tried-to-infiltrate-us" },
  guardianWpp: { label: "The Guardian, 10 May 2024: the deepfake attempt on WPP's chief executive", href: "https://www.theguardian.com/technology/article/2024/may/10/ceo-wpp-deepfake-scam" },
  fortuneFerrari: { label: "Fortune, reporting Bloomberg, 27 July 2024: the deepfake attempt on Ferrari's chief executive", href: "https://fortune.com/europe/2024/07/27/ferrari-deepfake-attempt-scammer-security-question-ceo-benedetto-vigna-cybersecurity-ai/" },
  stopThinkFraud: { label: "Stop! Think Fraud (UK government): protect your business", href: "https://stopthinkfraud.campaign.gov.uk/protecting-your-business" },
  policeScotland: { label: "Police Scotland: voice cloning scams", href: "https://www.scotland.police.uk/advice/scams-and-frauds/voice-cloning-scams/" },
  ncscPhishing: { label: "NCSC: Phishing attacks, defending your organisation (verifying important requests)", href: "https://www.ncsc.gov.uk/guidance/phishing" },
};

const BLOCK: TrackBlock = {
  practise: {
    kind: "calls",
    task: "Five calls reach you this week at {{firm.name}}, from people you know, and each asks for something unusual. Answer each one, read what the caller says, and choose what you do at each turn. Some callers are genuine.",
    scene: "{{firm.name}}'s rule: for any unusual request by phone or video, you may ask the challenge phrase your team agreed in person, ask a question only the real person would know, or say \"I'll call you back on your usual number\".",
    calls: [
      {
        kind: "voice",
        time: "Mon 09:10",
        doing: "You have just sat down with a coffee and opened your inbox.",
        caller: "Dev Sharma",
        role: "IT Service Desk",
        shown: "IT Service Desk · 01632 960100 · in your contacts",
        opening: [
          "Morning, it's Dev on the service desk. Sorry to jump on you first thing.",
          "We've had an alert that your authenticator is out of sync, so I'm resetting it now. You'll get a text with a link in a second. Tap it, register the app again, and read me the six-digit code it shows so I can confirm it's linked.",
        ],
        turns: [
          {
            options: [
              {
                label: "Ask something only Dev would know",
                say: "Before I do anything: what did you fix on my laptop last week?",
                reply: "Last week? Honestly, I do dozens a day, I can't remember. Look, that link expires in five minutes.",
                grade: "best",
                why: "Good: a question that is not online and not in an email. He could not answer it, and went straight to a deadline instead.",
                next: 1,
              },
              {
                label: "Go along with it",
                say: "OK, the text's here. The code is 482 913.",
                reply: "Perfect, that's you sorted. Have a good day.",
                then: "The link registered the caller's phone as your second factor. From now on, your sign-in prompts go to him.",
                grade: "wrong",
                why: "A real service desk never needs the code your phone shows: Module 3's rule. The voice sounded like Dev and the desk's number was on your screen, but a voice can be copied and caller ID can be faked. Hang up and ring the desk yourself.",
              },
              {
                label: "Ask for it as a ticket",
                say: "Can you log it as a ticket and send it to me through the IT portal?",
                reply: "The portal's down this morning, that's why I'm ringing. Just do the link, it takes a second.",
                grade: "ok",
                why: "Asking for it through the firm's own system is sensible, and a real desk would do it. But he had an excuse ready, so this alone does not settle it. It still needs a check he cannot control.",
                next: 1,
              },
              {
                label: "Call the service desk back",
                say: "I'll hang up and call the service desk myself, on the number on the intranet.",
                reply: "There's no need, I'm literally on the desk now. If that link expires I'll have to lock your account.",
                then: "You hang up anyway and dial 01632 960100 from the intranet. The desk has no alert on your account, and Dev is on leave this week. They ask you to tell {{firm.contact}}.",
                grade: "best",
                why: "The number on your screen can be faked, so dial it yourself from somewhere you trust. The threat to lock your account was pressure. The real desk had no alert at all.",
              },
            ],
          },
          {
            options: [
              {
                label: "Give him the code",
                say: "Fine, sorry. The code is 482 913.",
                then: "The link registered the caller's phone as your second factor. From now on, your sign-in prompts go to him.",
                grade: "wrong",
                why: "A deadline and a threat to lock your account are pressure, not proof. A real service desk never needs the code your phone shows. End the call and ring the desk on a number you already hold.",
              },
              {
                label: "Say no and leave it there",
                say: "I'll leave it for now, thanks. I'll speak to IT later.",
                reply: "Your call. Don't say I didn't warn you.",
                then: "He rings off. Your account is safe, but nobody at the firm knows someone is ringing staff as Dev.",
                grade: "ok",
                why: "Nothing given away, which matters most. But report it: {{firm.contact}} can warn everyone else before he rings them.",
              },
              {
                label: "Hang up and ring the desk yourself",
                say: "I'm going to hang up and ring the desk on the intranet number.",
                reply: "Fine. But if you're locked out by lunchtime, don't blame me.",
                then: "You dial 01632 960100 from the intranet. The desk has no alert on your account, and Dev is on leave this week. They ask you to tell {{firm.contact}}.",
                grade: "best",
                why: "A question he could not answer, then a threat: two tells. Dialling the desk yourself reaches the real one, whatever your screen showed.",
              },
            ],
          },
        ],
        genuine: false,
        truth: "It was not Dev. The voice was a copy and the desk's number on your screen was faked. Dev was on leave all week.",
      },
      {
        kind: "video",
        time: "Tue 15:30",
        doing: "You are drafting a report. A message from a new mobile number, signed Helen, says her phone has been stolen. A video call starts a minute later.",
        caller: "Helen Ashworth",
        role: "Managing Director",
        shown: "Video call · new account, not in your contacts",
        others: ["Tom Hale, Finance Director"],
        opening: [
          "Thanks for picking up. Tom's on as well. Sorry, the picture's a bit jumpy, I'm in the car.",
          "We're closing the Kestrel acquisition today and I need a deposit of £48,000 approved before four o'clock. Tom has signed it off, so it just needs you. It's confidential until it's announced, so please don't mention it to anyone else.",
        ],
        turns: [
          {
            options: [
              {
                label: "Ask for it by email",
                say: "Can you send me the request by email, so I have it in writing?",
                reply: "Of course. I'll send it from my personal email, the work one is on the stolen phone. But it needs doing in the next half hour.",
                grade: "ok",
                why: "Wanting it in writing is sensible, but an email from the same people proves no more than the call: it would come from an address you cannot check. Writing is a record, not a check.",
                next: 1,
              },
              {
                label: "Ask the challenge phrase",
                say: "Before I approve anything, Helen: what's our challenge phrase?",
                reply: "Honestly, now? I'm driving, I haven't got time for games. Tom, tell her it's fine.",
                then: "Tom's picture nods. His microphone stays muted.",
                grade: "best",
                why: "Exactly the right ask for an unusual request. The real Helen would say the phrase in two seconds. This one dodged it and passed you to someone who will not speak.",
                next: 1,
              },
              {
                label: "Approve it",
                say: "OK. Send me the details and I'll approve it.",
                reply: "Thank you. Tom will send them now. Keep this to yourself.",
                then: "£48,000 goes to an account criminals control. The real Helen finds out the next morning.",
                grade: "wrong",
                why: "Her face, her voice and Tom on the call felt like proof, but all three can be faked, and secrecy plus urgency is Module 6's stop sign. Nothing on a call proves who is on it. A check the caller cannot control does.",
              },
              {
                label: "Say you'll call her back",
                say: "I'll call you back on your usual mobile in two minutes.",
                reply: "My phone was stolen, that's why I'm on this account. Please, just stay on the call. We're running out of time.",
                grade: "best",
                why: "Note the ready-made excuse: a stolen phone is the story that stops you ringing the real number. That is exactly why you ring it.",
                next: 1,
              },
            ],
          },
          {
            options: [
              {
                label: "Approve it, since Tom agreed",
                say: "OK. If Tom's happy, I'll approve it.",
                then: "£48,000 goes to an account criminals control. Tom never said a word: his picture nodded, and stayed muted.",
                grade: "wrong",
                why: "Tom never spoke. A silent, nodding colleague is no more proof than a talking one, because a whole meeting can be faked. Secrecy plus urgency is the stop sign.",
              },
              {
                label: "End the call and ring Helen's usual number",
                say: "I'm going to end this call and ring your usual number, Helen.",
                reply: "If this deal falls through, I'll remember who held it up.",
                then: "You ring Helen's mobile from the firm directory. She answers at her desk upstairs: her phone was never stolen, she has been on no call, and there is no Kestrel deal. Tom is in a meeting downstairs. She asks you to tell {{firm.contact}}.",
                grade: "best",
                why: "Well held. Anger and blame are pressure, not proof. The number in the directory reached the real Helen in seconds.",
              },
              {
                label: "Leave the call and say nothing",
                say: "Sorry, I have to go. I'll speak to you later.",
                then: "You leave the call. Nothing is paid, but the same call may reach someone else in Finance next.",
                grade: "ok",
                why: "Nothing went out, which matters most. But tell {{firm.contact}}: someone is copying the managing director, and the next person might not hang up.",
              },
            ],
          },
        ],
        genuine: false,
        truth: "It was not Helen, and it was not Tom. Both pictures and Helen's voice were made from videos of them online. The real Helen had her phone all along, and there is no Kestrel deal.",
      },
      {
        kind: "video",
        time: "Wed 11:40",
        doing: "You are in the office. Helen is visiting a client in Leeds this week.",
        caller: "Helen Ashworth",
        role: "Managing Director",
        shown: "Video call · Helen's {{firm.name}} account",
        opening: [
          "Hi, have you got a minute? Sorry, the hotel Wi-Fi keeps freezing.",
          "The Hartley bid has to go in by six. We've brought in a freelance designer, Sam Okafor from Northbank Studio, and he needs the Hartley bid folder today. Can you share it with him? His address is sam@northbankstudio.example.",
        ],
        turns: [
          {
            options: [
              {
                label: "Call her back on her mobile",
                say: "I'll call you straight back on your mobile, just to check. Is that OK?",
                reply: "Of course, good idea. Ring me now.",
                then: "You ring Helen's mobile from the directory. She answers, carries on the same conversation, and confirms Sam and his address. You share the folder the usual way, as a guest with an end date.",
                grade: "best",
                why: "A genuine caller does not mind being checked, and this one welcomed it. The check took a minute, and the work went ahead the usual way.",
              },
              {
                label: "Share it now",
                say: "Sure, I'll share the folder with him straight away.",
                reply: "Thanks, you're a star.",
                then: "It was Helen, and nothing went wrong this time. But a client's bid went to an outsider on the strength of a call you had not checked.",
                grade: "wrong",
                why: "It turned out to be genuine, but you could not have known. The same call from a fake Helen would have handed a client's bid to a stranger. Check first, then share the usual way.",
              },
              {
                label: "Ask the challenge phrase",
                say: "Before I do, Helen: what's our challenge phrase?",
                reply: "Ha, fair enough. Blue heron.",
                then: "That is the phrase your team agreed in person. You share the folder the usual way, as a guest with an end date.",
                grade: "best",
                why: "She knew it at once and did not mind being asked. That is what a genuine caller sounds like when you check.",
              },
              {
                label: "Hang up and report a deepfake",
                say: "Sorry, this looks like a scam to me. I'm hanging up and reporting it.",
                reply: "What? Hang on, it's me...",
                then: "You hang up. {{firm.contact}} checks with Helen, who was genuine. The bid goes in late, after an hour of confusion.",
                grade: "wrong",
                why: "Assuming a call is fake is as much a guess as assuming it is real. The frozen picture proved nothing either way. Verify instead: a real Helen is happy to be checked, and the work goes ahead.",
              },
            ],
          },
        ],
        genuine: true,
        truth: "It really was Helen. The frozen picture was the hotel Wi-Fi. A genuine caller passes the check in a minute, which is why checking costs a real colleague almost nothing.",
      },
      {
        kind: "voice",
        time: "Thu 16:05",
        doing: "It is nearly home time. Marcus, a partner, is at a client dinner tonight.",
        caller: "Marcus Reid",
        role: "Partner",
        shown: "07700 900374 · not in your contacts",
        opening: [
          "Hi, it's Marcus. I'm on a colleague's phone, mine's died.",
          "Bit embarrassing: I promised the team at Carden Holdings a thank-you and forgot. Could you buy five £100 gift cards on your way home and text me the codes on this number? I'll pay you back tomorrow. Keep it quiet in the office, I'd rather it looked planned.",
        ],
        turns: [
          {
            options: [
              {
                label: "Ask him to email you",
                say: "Can you email me the request from your work account?",
                reply: "I can't get into email on this phone. It's only £500, and I'll pay you back first thing.",
                grade: "ok",
                why: "Asking for it through a work channel is sensible, but he had an excuse ready, so the question is still open.",
                next: 1,
              },
              {
                label: "Ring his usual mobile",
                say: "I'll ring you back on your usual mobile.",
                reply: "It's dead, I told you. That's why I'm on this one.",
                then: "You ring Marcus's usual mobile from the directory anyway. He answers at once, at the dinner: his phone is fine, and he has asked nobody for gift cards.",
                grade: "best",
                why: "His excuse was built to stop exactly this call, and the real Marcus answered it in seconds. A dead phone is the oldest story there is.",
              },
              {
                label: "Ask something only Marcus would know",
                say: "Of course, but first: where did the team have lunch last Friday?",
                reply: "Friday? Look, I'm walking into the dinner now. Can you just do this one thing for me?",
                grade: "best",
                why: "Good question: recent, personal and not online. He dodged it and pushed the clock instead. A real Marcus would have answered.",
                next: 1,
              },
              {
                label: "Buy the cards",
                say: "No problem. I'll pick them up and text you the codes.",
                reply: "Legend. Thank you.",
                then: "You spend £500. The codes are used within minutes, and Marcus has no idea what you mean in the morning.",
                grade: "wrong",
                why: "Gift card codes are as good as cash and almost impossible to get back. A partner's voice on a borrowed phone, secrecy, a favour: Module 6's gift card scam, with a copied voice on top.",
              },
            ],
          },
          {
            options: [
              {
                label: "Hang up and ring his usual mobile",
                say: "I'm going to hang up and ring your usual mobile, Marcus.",
                reply: "Wow. OK. Forget it, then.",
                then: "You ring Marcus's usual mobile from the directory. He answers at once, at the dinner: his phone is fine, and he has asked nobody for gift cards.",
                grade: "best",
                why: "\"Forget it, then\" is how an impostor gives up. The real Marcus answered his usual number in seconds.",
              },
              {
                label: "Buy them, it's only £500",
                say: "OK, fine. I'll get them on the way home.",
                then: "You spend £500. The codes are used within minutes, and Marcus has no idea what you mean in the morning.",
                grade: "wrong",
                why: "Small sums are chosen so that nobody checks. A dodged question and a borrowed phone were two tells. Ring the number you already hold.",
              },
              {
                label: "Say no and leave it there",
                say: "Sorry, I can't do that. Let's talk tomorrow.",
                reply: "Fine. Thanks for nothing.",
                then: "He rings off. Nothing is spent, but nobody else at the firm is warned.",
                grade: "ok",
                why: "Nothing spent, which matters most. But tell {{firm.contact}}: someone is copying a partner's voice, and the next colleague may say yes.",
              },
            ],
          },
        ],
        genuine: false,
        truth: "It was not Marcus. The voice was copied from a podcast he recorded for the firm, and his phone never died.",
      },
      {
        kind: "voice",
        time: "Fri 10:20",
        doing: "You are on a client call that has just finished.",
        caller: "Grace Mensah",
        role: "Head of IT",
        shown: "01632 960118 · Grace Mensah, in your contacts",
        opening: [
          "Hi, it's Grace in IT. Nothing to panic about, but your account came up in a breach alert this morning.",
          "I've forced a password reset. Next time you sign in through the usual portal it'll ask for a new password, then you'll register your authenticator again. I won't ask you for any code or password, and you can call the service desk to check this is me.",
        ],
        turns: [
          {
            options: [
              {
                label: "Refuse and report a fake",
                say: "This sounds like a scam. I'm not doing anything, and I'm reporting this call.",
                reply: "That's fine, report it. But please do the reset today.",
                then: "You do nothing. {{firm.contact}} confirms Grace was genuine, by which time your exposed account has stayed open for another day.",
                grade: "wrong",
                why: "Assuming fake is a guess, and here it left a real problem unfixed. She asked for nothing secret and invited a check. Verify, then act.",
              },
              {
                label: "Call the service desk back",
                say: "Thanks, Grace. I'll ring the service desk on the intranet number to check, then do it.",
                reply: "Yes, please do. Ask for me.",
                then: "You dial 01632 960100 from the intranet and are put through to Grace. Same alert, same advice. You reset your password and register your authenticator through the usual portal.",
                grade: "best",
                why: "A genuine caller asks for no secrets and is happy to be checked. You checked through a number you already hold, then acted the usual way.",
              },
              {
                label: "Do it while she waits",
                say: "OK, I'll sign in through the portal now and set a new password.",
                reply: "Great. Thanks for sorting it so quickly.",
                then: "It was Grace, and the reset went through the usual portal. No harm done.",
                grade: "ok",
                why: "It was real, and she asked for nothing secret, so no harm done. But a fake Grace would sound the same, so a one-minute call to the desk is still the habit.",
              },
            ],
          },
        ],
        genuine: true,
        truth: "It really was Grace. A genuine IT call asks for no code or password, uses the usual portal, and welcomes a call back to the desk. Compare Monday's fake Dev, who needed the code.",
      },
    ],
  },
  prove: [
    {
      kind: "choose",
      stem: "A voice message arrives from a new number. It is unmistakably your finance director's voice, asking you to pay a supplier today and not to call because she is in meetings. What do you do next?",
      options: [
        "Pay it, since the voice is clearly hers and the request is plain.",
        "Ring her on the number in the directory before doing anything.",
        "Reply to the message and ask her to confirm it is really her.",
      ],
      answer: 1,
      why: "A few seconds of audio can be enough to copy a voice, so the voice proves nothing, and a reply goes to whoever sent the message. A new number plus \"do not call\" is the pattern. Ring the number you already hold: a real director will answer or call back.",
    },
    {
      kind: "choose",
      stem: "On a video call, your managing director asks you to share a client's file with a new adviser. You ask the agreed challenge phrase. She laughs, says she has forgotten it, and asks you to just send it. What do you do next?",
      options: [
        "Send it, since she laughed it off and looks exactly like herself.",
        "Ask her an easier question instead, and send it if she gets it.",
        "End the call, then ring her usual number before sending anything.",
      ],
      answer: 2,
      why: "Forgetting the phrase and laughing it off is the dodge, and a face on a screen proves nothing. An easier question is one a criminal can answer from what is online. End the call and check on a number you already hold.",
    },
    {
      kind: "choose",
      stem: "Your IT manager rings: your account was in a breach alert. You say you will call back on the service desk number, and he says \"Good, please do.\" The desk puts you through to him. What do you do next?",
      options: [
        "Hang up again, since any voice on the phone could be a copy.",
        "Reset your password through the usual portal, as he advised.",
        "Report him to {{firm.contact}} as a likely deepfake caller.",
      ],
      answer: 1,
      why: "The check worked: you reached him through a number you already hold, and he was glad to be checked. Verify, then act. Treating every call as fake stops real work and leaves real problems unfixed.",
    },
    {
      kind: "choose",
      stem: "You are helping interview for a remote role. On video the candidate's face looks oddly smooth and his answers lag. HR's identity check is booked for after the offer. What do you do next?",
      options: [
        "Reject him on the spot and tell him you think he is a deepfake.",
        "Raise it with HR, and ask for the ID check before any offer.",
        "Carry on, since odd video is common and HR will check him later.",
      ],
      answer: 1,
      why: "Odd video proves nothing either way: it may be a bad connection, or the face-swapping the FBI says some fake IT workers have used in interviews. Do not accuse; ask for the identity check before any offer, access or laptop is sent.",
    },
    {
      kind: "choose",
      stem: "Searching for your bank's helpline, you click the top result. A chat window opens: a friendly assistant says your account is flagged and asks for your card details to unlock it. What do you do next?",
      options: [
        "Give the details, since the site came up top of your search.",
        "Ask the assistant to prove it is your bank before going on.",
        "Close it, and ring the number on the back of your card.",
      ],
      answer: 2,
      why: "The FBI warns that criminals put AI chatbots on fake websites. A chat you reached from a search is not your bank, and whatever it says to prove itself is part of the script. Use a route you already hold: the number on your card, or the app you already use.",
    },
  ],
};

export const AWARENESS_MODULE_7: ModuleManifest = {
  n: 7,
  slug: "ai-powered-scams-and-deepfakes",
  title: "AI-Powered Scams & Deepfakes",
  minutes: 15,
  course: "cyber-awareness",
  promise: "Beat a copied voice or face: know what AI makes easy to fake, and check any unusual request through a channel you already trust.",
  passMark: 4,
  shuffleOptions: true,
  dock: [
    { label: "Unusual request on a call?", lines: ["End the call, then ring a number you already hold.", "Or ask the challenge phrase, or a question only they would know."] },
    { label: "Proves nothing", lines: ["A familiar voice or face.", "The name and number on your screen.", "Inside knowledge, or others on the call."] },
    { label: "Was it a fake?", lines: ["Tell {{firm.contact}} straight away, so others are warned.", "Nobody is in trouble for checking."] },
  ],
  learn: [
    {
      kind: "intro",
      eyebrow: "Module 7 of 8 · about 15 minutes",
      heading: "It sounds like her. It looks like her. It may not be her.",
      lead: "AI lets criminals copy a voice, a face, a document or a writing style, quickly and cheaply. This module shows what has changed, why you cannot rely on spotting a fake by looking or listening, and the checks that work whatever the fake looks like. It is Module 6's call-back, against a harder test.",
      note: "The cases come from published reports, linked on each card. Every person, firm and number in the practice is invented, and every caller is drawn, never filmed: nothing in this module is a real or generated face or voice.",
      cta: "Show me what has changed",
    },
    {
      kind: "cards",
      eyebrow: "Learn · what AI changes for attackers",
      heading: "Six things that are now cheap to fake. Tap each.",
      reveal: true,
      columns: 2,
      cards: [
        {
          title: "Cloned voices",
          tint: "crit",
          body: "A few seconds of someone talking, from a video online, can be enough to copy their voice.",
          detail: "Starling Bank says a voice can be copied from as little as three seconds of audio, easily taken from a video someone has posted online. In a survey it commissioned in August 2024, 28% of UK adults said they had been targeted by an AI voice-cloning scam in the past year, and 46% had never heard of such scams. Anyone who speaks at events or posts videos has given away the raw material.",
          sources: [SOURCES.starling],
        },
        {
          title: "Live video calls",
          tint: "crit",
          body: "A face on a call that moves and talks like a colleague, in real time.",
          detail: "The FBI warned in December 2024 that criminals generate videos for real-time video chats with people posing as company executives, law enforcement or other authority figures. The next screen has two reported attempts on chief executives, and what stopped them.",
          sources: [SOURCES.fbiGenAi],
        },
        {
          title: "Fake documents and ID",
          tint: "warn",
          body: "A driving licence, a pass or a letter that looks right to the eye.",
          detail: "The same FBI warning says criminals generate fake identification documents, such as driving licences and credentials. A photo of an ID sent over chat proves little. What counts is a check the firm controls: a call to a number on file, or HR's own identity checks.",
          sources: [SOURCES.fbiGenAi],
        },
        {
          title: "Perfect, personal English",
          tint: "warn",
          body: "Messages with no spelling slips, written to you, by the thousand.",
          detail: "Module 2 covered how AI helps attackers write convincing lures. The FBI adds that criminals use AI translation to remove the grammar and spelling mistakes that once gave scams away. Good writing is no longer a sign that a message is genuine.",
          sources: [SOURCES.fbiGenAi],
        },
        {
          title: "Fake candidates",
          tint: "crit",
          body: "A remote hire, or a contractor, who is not who they say they are.",
          detail: "US authorities report that North Korean IT workers used stolen and fake identities to get remote jobs at more than 100 US companies, and the FBI says some have used AI and face-swapping in video interviews. The security firm KnowBe4 reported in July 2024 that it hired one after four video interviews and a background check that passed on a stolen identity. His photo was an AI-altered stock image, and his new work laptop immediately started loading malware. KnowBe4 says no data was lost.",
          sources: [SOURCES.dojItWorkers, SOURCES.fbiItWorkers, SOURCES.knowbe4],
        },
        {
          title: "Chatbots posing as support",
          tint: "warn",
          body: "A friendly help chat that is the scam itself.",
          detail: "The FBI says criminals put AI chatbots on fraudulent websites to get people to click malicious links. A chat that opens on a site you reached from an email or a search is not your bank's or your supplier's support. Reach support from the address you already use, or the number on the back of your card.",
          sources: [SOURCES.fbiGenAi],
        },
      ],
      note: "Using AI tools safely yourself is what AI Cleared covers. This module is the other side: AI in an attacker's hands.",
    },
    {
      kind: "cards",
      eyebrow: "Learn · reported cases",
      heading: "Two failed attempts, and two warnings. Tap each.",
      lead: "In both failed attempts, what stopped the fake was a check or an alert person, not a sharp eye.",
      reveal: true,
      columns: 1,
      cards: [
        {
          title: "WPP, 2024",
          tag: "Advertising",
          tint: "warn",
          body: "A fake chief executive in a Teams meeting, with a cloned voice.",
          detail: "The Guardian reported in May 2024 that fraudsters set up a WhatsApp account with a publicly available photo of WPP's chief executive, Mark Read, and used it to arrange a Microsoft Teams meeting that appeared to be with him and another senior executive. In the meeting they used a voice clone and YouTube footage, and typed as Read in the chat. They asked an agency leader to set up a new business, to get money and personal details. It failed. Read's warning to staff: \"Just because the account has my photo doesn't mean it's me.\"",
          sources: [SOURCES.guardianWpp],
        },
        {
          title: "Ferrari, 2024",
          tag: "Motor industry",
          tint: "ok",
          body: "One personal question ended a call in the chief executive's copied voice.",
          detail: "Bloomberg reported in July 2024 that a Ferrari executive got WhatsApp messages about a big confidential acquisition, from a number and profile picture that were not the chief executive's usual ones. A call followed in a convincing copy of Benedetto Vigna's voice, about a currency-hedge transaction. The executive noticed a slightly mechanical tone and asked which book Vigna had recommended to him a few days before. The call ended abruptly. Ferrari declined to comment.",
          sources: [SOURCES.fortuneFerrari],
        },
        {
          title: "The UK government's warning",
          tag: "Stop! Think Fraud",
          tint: "I",
          body: "Fake bosses now sometimes come with deepfake audio or video.",
          detail: "The UK government's Stop! Think Fraud campaign warns businesses that criminals impersonate senior executives, sometimes using deepfake audio or video, to pressure staff into making urgent payments. Its advice: confirm account details using a known phone number, never one given in the message, and verify with a trusted contact.",
          sources: [SOURCES.stopThinkFraud],
        },
        {
          title: "Copied voice messages, 2025",
          tag: "FBI",
          tint: "I",
          body: "AI voice messages posing as senior US officials, sent to the people they know.",
          detail: "In May 2025 the FBI warned that since April, criminals had been sending texts and AI-generated voice messages that impersonated senior US officials, aimed at their contacts, and that real and cloned voices can sound nearly identical. Its advice: if someone you know contacts you on a new platform or number, verify it through a channel you have already confirmed.",
          sources: [SOURCES.fbiOfficials],
        },
      ],
    },
    {
      kind: "toggles",
      eyebrow: "Learn · what a call really proves",
      heading: "It feels like proof. Flip each to see what it proves.",
      lead: "You cannot reliably spot a good fake by looking or listening. A glitch may give one away, but a good fake has none, and a real call on bad Wi-Fi glitches too. So the defence is a process, not your eyesight.",
      toggles: [
        { label: "Her voice, her accent, her way of talking", off: "Feels like: it is definitely her.", on: "Proves: someone had a few seconds of her voice. A talk or a video online is enough." },
        { label: "Her face on the video, moving and talking", off: "Feels like: you can see it is her.", on: "Proves: nothing on its own. Live video can be generated, and a real picture can freeze." },
        { label: "Her name and number on your screen", off: "Feels like: the phone knows who it is.", on: "Proves: little. Caller ID can be faked, and a display name is whatever someone typed in." },
        { label: "They know the deal, the client, your name", off: "Feels like: only an insider would know that.", on: "Proves: someone has read emails or done research. Module 6's mailbox takeovers knew everything." },
        { label: "Other people you know are on the call", off: "Feels like: they cannot all be fake.", on: "Proves: nothing. A whole meeting can be faked, as Module 1's Arup case showed." },
        { label: "A glitch, a delay, lips slightly out of time", off: "Feels like: that is the giveaway.", on: "Proves: a bad connection, perhaps. A good fake has no glitches; a real call from a hotel has plenty." },
      ],
      note: "The call itself is never the proof. What proves it is a check the caller cannot control.",
    },
    {
      kind: "cards",
      eyebrow: "Learn · the checks that work",
      heading: "Five checks that beat any fake. Tap each.",
      reveal: true,
      columns: 1,
      cards: [
        {
          title: "Call back on a number you already hold",
          tag: "The strongest check",
          tint: "ok",
          body: "End the call, then ring the person on the number in the directory, not the one that called you.",
          detail: "The NCSC advises checking important requests through a second type of communication, such as a phone call or in person. Police Scotland's advice on voice cloning is the same: call the person on their usual number to check it is really them. Dial it yourself; never call back the number on the screen, or one the caller gives you. A real colleague will not mind.",
          sources: [SOURCES.ncscPhishing, SOURCES.policeScotland],
        },
        {
          title: "A challenge phrase, agreed in advance",
          tag: "For unusual requests",
          tint: "ok",
          body: "A word or phrase only the real people know, set up face to face before anyone needs it.",
          detail: "The FBI advises families to create a secret word or phrase to verify each other, and Starling Bank's campaign suggests a safe phrase agreed with close family and friends. At work it suits the requests that should never come out of the blue: a payment, an MFA reset, access for someone new. Agree it in person, never write it in email or chat, and ask {{firm.contact}} whether {{firm.name}} has one.",
          sources: [SOURCES.fbiGenAi, SOURCES.starling],
        },
        {
          title: "A question only they would know",
          tint: "ok",
          body: "Something recent and personal that is not online and not in an email.",
          detail: "In the reported Ferrari attempt, the question was which book the chief executive had recommended a few days earlier. Pick something recent and shared, not a job title or a client's name, which a criminal may have read. A caller who dodges the question, gets angry or suddenly has to go has answered it.",
          sources: [SOURCES.fortuneFerrari],
        },
        {
          title: "Slow down",
          tint: "warn",
          body: "Urgency and secrecy are there to stop the check.",
          detail: "Module 6's stop sign applies to every voice and every face: secrecy plus urgency means stop. A genuine request survives a five-minute delay and a call back. Nobody at {{firm.name}} is in trouble for checking with a director, even when it really was them.",
        },
        {
          title: "The call is never the proof",
          tint: "crit",
          body: "Do not act inside the call. End it, check, then act through the usual process.",
          detail: "Whatever the request (a payment, a password or MFA reset, a file, gift cards), it goes through {{firm.name}}'s usual route after the check, never on the caller's word. If it was a fake, tell {{firm.contact}} straight away so others can be warned. Module 8 covers reporting in full.",
        },
      ],
      note: "Next: a week of calls. Some are genuine. Check before you act, and watch how each caller reacts.",
    },
  ],
  tracks: everyDesk(BLOCK),
};
