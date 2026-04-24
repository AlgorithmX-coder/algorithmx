import type { WeekContent } from "./types";

export const WEEK_6: WeekContent = {
  weekNumber: 6,
  title: "Gaming Safety: Play It Safe",
  topic: "gaming-safety",
  badgeName: "Safe Gamer",
  badgeIcon: "🎮",

  introCutscene: [
    { text: "CYBER HEROES ACADEMY\nWEEK 6: GAMING SAFETY", bg: "normal", duration: 3000 },
    { character: "both", characterMood: "excited", text: "Week 6, Cyber Hero! This one's about something we ALL love — gaming.", sound: "lessonStart", duration: 5000 },
    { character: "raccoon", characterMood: "idle", text: "\"Hey kid, nice loadout! Share your account and I'll give you a LEGENDARY skin. It'll be our secret.\"", bg: "danger", textColour: "#fca5a5", sound: "bossRoar", duration: 5500 },
    { character: "adam", characterMood: "worried", text: "The Hacker Raccoon is lurking in game lobbies now — pretending to be a teammate to trick kids.", bg: "danger", duration: 5500 },
    { character: "layla", characterMood: "thinking", text: "Games are AMAZING. But the chat and lobby can be the sneakiest place for scams, bullies, and strangers.", duration: 5500 },
    { character: "adam", characterMood: "thumbsup", text: "Gaming friends you've never met ARE still strangers. Your username, voice, and info still matter.", duration: 5500 },
    { character: "layla", characterMood: "excited", text: "This week: play hard, have fun, AND stay safe. Let's become Safe Gamers!", sound: "select", duration: 5000 },
    { text: "GG — GAME ON, SAFELY! 🎮", bg: "normal", sound: "confetti", duration: 2000 },
  ],

  screens: [
    { type: "video", videoPlaceholder: "Week 6: Gaming Safety intro video" },
    {
      type: "mission",
      objectives: [
        "Stay safe in game chats and voice lobbies",
        "Spot gaming scams and in-game manipulation",
        "Know how to report toxic players and get help",
      ],
    },
    {
      type: "info",
      title: "Game Chats Aren't Always Friendly",
      content:
        "Game chat is where most of the danger hides. Voice chat, text chat, party chat, DMs — all of these are places strangers try to get close to kids. Nice-sounding teammates can still be strangers.",
      bullets: [
        "Anyone you haven't met IRL is still a stranger, no matter how many games you've played together",
        "Voice chat can't tell you someone's real age",
        "Private party chats are harder for moderators to see",
        "Links shared in chat can be scams",
        "Your mic can reveal more about you than you'd think — background, location, family members",
      ],
    },
    {
      type: "cyberScanner",
      items: [
        { text: "A teammate says 'Add me as a friend so we can play later'", isStrong: false, explanation: "Gaming friends you haven't met IRL are still strangers — ask a parent first" },
        { text: "Your actual friend from school asking to team up", isStrong: true, explanation: "Someone you know in real life — safe to play with" },
        { text: "A stranger offers free skins if you share your password", isStrong: false, explanation: "Free stuff for passwords = classic gaming scam" },
        { text: "Your older sibling playing co-op with you", isStrong: true, explanation: "Family — safe" },
        { text: "A random player asking what school you go to", isStrong: false, explanation: "Personal info in game chat = red flag" },
        { text: "Using voice chat with your cousin", isStrong: true, explanation: "Known family member — safe" },
        { text: "A 'Roblox mod' in DMs asking for your login", isStrong: false, explanation: "Real mods NEVER ask for login info" },
        { text: "A team member saying 'good game, well played!'", isStrong: true, explanation: "Normal sportsmanship — safe" },
        { text: "'Meet me in this private server, just us two'", isStrong: false, explanation: "Private/isolated chats with strangers are unsafe" },
        { text: "Parents setting up parental controls on your console", isStrong: true, explanation: "Safety feature — very helpful" },
      ],
    },
    {
      type: "info",
      title: "Gaming Scam Playbook",
      content:
        "Scammers targeting gamers use a few classic tricks. Once you know them, they're easy to spot:",
      bullets: [
        "'Free currency' (Robux, V-Bucks) in exchange for your login",
        "Fake 'giveaway' websites asking for your account details",
        "Item duplication or 'glitch' tricks that actually just steal your items",
        "Fake 'mods' or 'staff' in DMs demanding your password",
        "Links to 'cheats' or 'hacks' that install malware",
      ],
    },
    {
      type: "spamBlaster",
      emails: [
        { sender: "RobloxOfficial_Free", subject: "🎁 FREE 10,000 ROBUX — CLAIM NOW", isPhishing: true, clue: "Fake Roblox account offering free currency = scam" },
        { sender: "Best Friend Jamie", subject: "Wanna play Fortnite after homework?", isPhishing: false, clue: "" },
        { sender: "FortniteGiveaway", subject: "You WON free V-Bucks! Login here!", isPhishing: true, clue: "Random V-Bucks giveaways for your login = scam" },
        { sender: "Dad", subject: "Screen time's almost up — one more game!", isPhishing: false, clue: "" },
        { sender: "MinecraftMod_007", subject: "I'm a real mod. Send your password to verify.", isPhishing: true, clue: "Real mods never ask for passwords — scam" },
        { sender: "Older Cousin", subject: "Voice chat tonight? I have a new game for us", isPhishing: false, clue: "" },
        { sender: "Legendary Skin Dealer", subject: "Share account — get rare skin free!", isPhishing: true, clue: "Account trading for items is banned — it's a scam" },
        { sender: "School Gaming Club", subject: "Meeting Thursday lunch in the IT room", isPhishing: false, clue: "" },
        { sender: "CheatCodes4Real", subject: "Download our aimbot — totally safe!", isPhishing: true, clue: "Cheats are usually malware + will ban your account" },
        { sender: "Mum", subject: "Dinner in 15 mins — save the game!", isPhishing: false, clue: "" },
      ],
    },
    {
      type: "chooseYourPath",
      scenarios: [
        {
          setup: "A teammate in a game says 'You play really well! DM me on Discord and I'll teach you pro tricks.' What do you do?",
          choices: [
            { text: "DM them — free coaching!", isSafe: false, consequence: "Moving from a moderated game to private DMs is how strangers isolate kids. You just stepped off the game's safety net." },
            { text: "Say thanks but no thanks, and tell a parent", isSafe: true, consequence: "Smart move. Compliment-based invites to private chats are a classic tactic. You stayed safe." },
          ],
        },
        {
          setup: "Someone offers to give you a legendary skin in exchange for your Roblox password. They say 'it's safe, I'm a mod.' What do you do?",
          choices: [
            { text: "Share the password — legendary skin!", isSafe: false, consequence: "You just lost your account. Real mods NEVER ask for passwords. Everything you owned is gone." },
            { text: "Refuse and report the player", isSafe: true, consequence: "Perfect. Real staff have their own tools — they never need your password. You saved your account." },
          ],
        },
        {
          setup: "A gaming 'friend' you've only met in games invites you to join a private Discord server for 'kids only — no adults allowed.' What do you do?",
          choices: [
            { text: "Join — sounds fun and exclusive", isSafe: false, consequence: "Unmoderated 'kids-only' servers are exactly where predators look for targets. You just walked into danger." },
            { text: "Decline and tell a parent about the invitation", isSafe: true, consequence: "Excellent. Anyone who insists 'no adults' is hiding something. Parental moderation is protection, not a limitation." },
          ],
        },
        {
          setup: "A player starts insulting you in voice chat, saying really mean things. What's the best response?",
          choices: [
            { text: "Shout back louder — don't let them win", isSafe: false, consequence: "You got pulled into their toxic game. You ended up tired, upset, and the match ruined for everyone." },
            { text: "Mute, report, leave the lobby — and tell a parent if it was nasty", isSafe: true, consequence: "Textbook response. Mute kills their power, report hurts their account, and leaving keeps YOUR day good." },
          ],
        },
      ],
    },
    {
      type: "memoryMatch",
      pairs: [
        { term: "Toxic Player", match: "Someone being mean or abusive in chat", colour: "#ef4444" },
        { term: "Mute", match: "Stops you hearing a player's voice", colour: "#60a5fa" },
        { term: "Report", match: "Tells the game's team about bad behaviour", colour: "#fbbf24" },
        { term: "PEGI Rating", match: "Tells you the minimum age for a game", colour: "#8b5cf6" },
        { term: "In-Game Purchase", match: "Real money spent inside a game", colour: "#34d399" },
        { term: "Parental Controls", match: "Settings adults use to keep gaming safe", colour: "#a78bfa" },
      ],
    },
    {
      type: "info",
      title: "Safe Gaming Habits",
      content:
        "Five rules that keep gaming fun AND safe. Make them a habit and you can enjoy every game worry-free:",
      bullets: [
        "Keep your username generic — no real name, birth year, or location clues",
        "Never share passwords or account info with ANYONE, even 'mods' or teammates",
        "Use voice chat only with people you know IRL (or with a parent's OK)",
        "Ask before any purchase — real money is involved, always check",
        "Tell a trusted adult if anything in game chat makes you feel off",
      ],
    },
    {
      type: "protectTheData",
      items: [
        { text: "Your password", isPrivate: true },
        { text: "Your favourite game", isPrivate: false },
        { text: "Your real first name", isPrivate: true },
        { text: "Your favourite game character", isPrivate: false },
        { text: "Your school name", isPrivate: true },
        { text: "Your game skill level", isPrivate: false },
        { text: "Your home address", isPrivate: true },
        { text: "Your favourite map", isPrivate: false },
        { text: "Your parent's credit card", isPrivate: true },
        { text: "The hobbies you enjoy", isPrivate: false },
        { text: "Your face (via camera)", isPrivate: true },
        { text: "Your gamer level/rank", isPrivate: false },
      ],
    },
    {
      type: "firewallBuilder",
      goodBlocks: [
        "Mute toxic players",
        "Report abusive chat",
        "Ask parent before purchases",
        "Use generic usernames",
        "Keep mic muted with strangers",
        "Play age-appropriate games",
        "Use parental controls",
        "Tell adults about weird messages",
      ],
      badBlocks: [
        "Share passwords for free skins",
        "Join private stranger servers",
        "Send voice clips to strangers",
        "Click random 'cheat' links",
      ],
    },
    {
      type: "cyberMaze",
      questions: [
        { question: "A gaming friend you've never met in real life is...", answers: ["Still a stranger", "A best friend", "Safe", "Family"], correctIndex: 0 },
        { question: "Real game moderators ask for your password when?", answers: ["NEVER", "On weekends", "If you win something", "During updates"], correctIndex: 0 },
        { question: "What's the first thing to do about a toxic player?", answers: ["Mute and report them", "Yell back louder", "Give up", "Share their behaviour online"], correctIndex: 0 },
        { question: "In-game purchases use what?", answers: ["Real money", "Imagination only", "Game tokens worth nothing", "Free coins"], correctIndex: 0 },
        { question: "PEGI ratings tell you...", answers: ["The minimum age a game is suitable for", "The price", "How many players", "How long it takes"], correctIndex: 0 },
      ],
    },
    { type: "bossBattle" },
    { type: "completion" },
  ],

  bossQuestions: {
    easy: [
      { question: "Someone you meet in a game is...", answers: ["A stranger, even if they seem nice", "An automatic best friend", "Always safe", "Always toxic"], correctIndex: 0, explanation: "Gaming friends you haven't met in real life are still strangers" },
      { question: "Should you share your password for free in-game items?", answers: ["Yes — it's a great deal", "Never — it's always a scam", "Only on birthdays", "Only for legendary items"], correctIndex: 1, explanation: "Real game companies never offer free items for your password" },
      { question: "A toxic player is saying mean things. First action?", answers: ["Argue back", "Mute them", "Quit gaming forever", "Share their username everywhere"], correctIndex: 1, explanation: "Mute them first — it takes away their power to upset you" },
      { question: "After muting a toxic player you should...", answers: ["Forget it happened", "Report them to the game team", "Friend them", "Copy their behaviour"], correctIndex: 1, explanation: "Reporting them helps protect other players too" },
      { question: "Who sets parental controls?", answers: ["A trusted adult", "You, secretly", "The game company randomly", "Your teachers"], correctIndex: 0, explanation: "Parental controls are set up by a parent or carer to help you stay safe" },
      { question: "PEGI 7 means a game is suitable for...", answers: ["Ages 7 and up", "7 minutes of gameplay only", "7 players max", "Only on Sundays"], correctIndex: 0, explanation: "PEGI ratings tell you the minimum age a game is designed for" },
      { question: "Best username for gaming?", answers: ["YourName2016London", "Something generic that doesn't reveal your identity", "Your real full name", "Your home address"], correctIndex: 1, explanation: "Usernames can leak info — keep yours generic" },
      { question: "In-game purchases use...", answers: ["Free magic", "Real money that parents have to pay", "Made-up currency only", "Nothing"], correctIndex: 1, explanation: "Even if it's called 'V-Bucks' or 'Robux', real money is involved — always ask a parent" },
      { question: "A 'skin' is...", answers: ["A cosmetic look for your character", "A real skin", "A scam always", "A type of hacker"], correctIndex: 0, explanation: "Skins are visual customisations. Buying them uses real money" },
      { question: "Voice chat with strangers should only happen when...", answers: ["Never", "After asking a parent", "You know them IRL or a parent says OK", "During a full moon"], correctIndex: 2, explanation: "Voice chat reveals a LOT — only use it with people you know or with parent approval" },
    ],
    medium: [
      { question: "A 'giveaway' account offers free skins if you follow a link. What's happening?", answers: ["Generous player", "Phishing scam — the link steals your login", "Official partnership", "Random kindness"], correctIndex: 1, explanation: "Fake giveaways are the #1 way gamers get their accounts stolen" },
      { question: "Why is it risky to play on public unmoderated servers?", answers: ["The graphics are worse", "Strangers and toxic players aren't controlled, and there's no safety team", "They're always offline", "They need more money"], correctIndex: 1, explanation: "Without moderation, bad actors can harass or scam without consequences" },
      { question: "A 'duping glitch' offering to duplicate your items usually...", answers: ["Works great", "Tricks you into giving items away to a scammer", "Costs money", "Is illegal in the UK"], correctIndex: 1, explanation: "Dupe glitches are scams — the 'glitch' just transfers your items to the scammer" },
      { question: "Why might a stranger ask 'how old are you?' in a game?", answers: ["Friendly chat", "To target younger players specifically, or fake their own age", "For a survey", "Nothing — it's normal"], correctIndex: 1, explanation: "Age questions in game chat can be used to target kids specifically — avoid answering personal questions" },
      { question: "What is 'swatting'?", answers: ["A baseball move", "Calling emergency services on a gamer's home as a prank — a dangerous crime", "A type of tournament", "A new multiplayer mode"], correctIndex: 1, explanation: "Swatting is a serious crime — it's why sharing your address is so dangerous even in game chat" },
      { question: "A teammate insists you install their 'custom game mod' they sent. You should...", answers: ["Install it — teammates help each other", "Never install mods from strangers — they can be malware", "Install only on weekends", "Ask what it does and then install"], correctIndex: 1, explanation: "Random mods can contain viruses or account-stealers — only install from official sources" },
      { question: "In-game chat can reveal your location if...", answers: ["Your mic picks up background noise like family, pets, or nearby sounds", "You say 'hi'", "You play too long", "Your character wears blue"], correctIndex: 0, explanation: "Your voice, background noises, and accent all give away clues to who and where you are" },
      { question: "The safest way to add new gaming friends is...", answers: ["Accept every request", "Only add real-life friends or ask a parent before adding new people", "Only on weekends", "Never play with anyone"], correctIndex: 1, explanation: "Treat friends-list like your real friend group — only people you actually know or trusted-adult-approved" },
      { question: "A game asks for your email AND password on a third-party website to 'verify' you. What should you do?", answers: ["Fill it in", "Never enter login info on any site that's not the official game's site", "Use fake info", "Share with a friend first"], correctIndex: 1, explanation: "Only enter credentials on the official game's real website or app" },
      { question: "If parental controls feel 'annoying' the purpose is...", answers: ["To ruin your fun", "To protect you while you learn to spot risks yourself", "Random punishment", "No reason"], correctIndex: 1, explanation: "Parental controls are training wheels — they help keep you safe until you've got the skills down" },
    ],
    hard: [
      { question: "'Toxic positivity' in gaming means...", answers: ["Being too nice", "Dismissing real issues with '😊 just ignore them' without actually helping", "A type of skin", "A purple poison"], correctIndex: 1, explanation: "Telling someone to 'just ignore' bullying doesn't help — real support means listening and getting adult help" },
      { question: "Why is 'cross-platform play' a safety concern?", answers: ["It's slower", "Your friends list and chat can span multiple platforms — which means more points where strangers can contact you", "It doesn't work", "It's illegal"], correctIndex: 1, explanation: "Cross-play is great for fun but means safety settings need to be checked on EVERY platform you play on" },
      { question: "An influencer announces a 'Robux giveaway' and asks for your username. What's likely happening?", answers: ["Real giveaway", "Impersonator account — legit creators rarely need your username for giveaways and never your password", "A charity drive", "Microsoft partnership"], correctIndex: 1, explanation: "Fake influencer accounts are rampant. If unsure, check the creator's verified official channel for details" },
      { question: "A mod says they'll 'restore' your banned account if you give them access. What's really going on?", answers: ["Helpful mod", "Scammer posing as staff — they'll steal the account or extort you", "Normal recovery process", "A test from the game team"], correctIndex: 1, explanation: "Real account recovery goes through the official game's support portal, never through DMs" },
      { question: "Which gaming behaviour is a warning sign of grooming?", answers: ["Someone gifting in-game items and slowly moving chat to private platforms", "Someone being polite in voice chat", "A teammate saying GG", "A player asking for your build"], correctIndex: 0, explanation: "Grooming online often starts with generosity and moves to isolation — gifts + private chat is a red flag pattern" },
      { question: "You see a younger player being harassed in chat by a group. Your best response as an upstander?", answers: ["Say nothing — not your problem", "Report the group, tell the younger player to report too, and tell a trusted adult what happened", "Attack the group yourself", "Leave the game"], correctIndex: 1, explanation: "Upstander behaviour is powerful — reporting + supporting the target + telling an adult is the full response" },
      { question: "A teammate asks you to 'boost' their rank by giving them control of your account for a few hours. What's the risk?", answers: ["Only a ban risk", "Your account could be stolen, password changed, purchases made, and you'd still be banned for account sharing", "No risk", "Just a small ban"], correctIndex: 1, explanation: "Account sharing is against terms of service AND puts everything you own at risk — never share logins" },
      { question: "'Dark patterns' in games include...", answers: ["All characters wearing black", "Designs that trick you into buying things (fake urgency, confusing confirms, 'limited time!' timers)", "Nighttime game modes", "Stealth games only"], correctIndex: 1, explanation: "Games sometimes use manipulation tactics — the same ones scammers use. Always pause before a purchase" },
      { question: "Why do some games let kids chat without moderation filters?", answers: ["To save server costs — which means YOU have to be the safety team yourself", "Because kids don't need protecting", "Accidentally", "It's a premium feature"], correctIndex: 0, explanation: "Not every game invests in moderation. On those games, your own judgement and parental controls do the work" },
      { question: "The single best habit for lifetime gaming safety is...", answers: ["Never play online", "Treat every new online contact as a stranger until proven trusted IRL", "Only play single-player", "Never use a mic"], correctIndex: 1, explanation: "The core mental model: new online contact = stranger. Friendship is earned by real-life verification, not by hours played together" },
    ],
  },

  reactions: {
    0: { adam: { mood: "excited", message: "Week 6 — gaming week!" }, layla: null },
    1: { adam: null, layla: { mood: "curious", message: "Let's play safer, smarter, stronger." } },
    2: { adam: { mood: "thinking", message: "Game chat can hide surprises. Stay sharp." }, layla: null },
    3: { adam: null, layla: { mood: "excited", message: "Spot the stranger in the lobby!" } },
    4: { adam: { mood: "worried", message: "Five classic gaming scams. Know them all." }, layla: null },
    5: { adam: null, layla: { mood: "thumbsup", message: "Zap the scam emails targeting gamers!" } },
    6: { adam: { mood: "thinking", message: "Which choice keeps you safe AND still having fun?" }, layla: null },
    7: { adam: null, layla: { mood: "curious", message: "Match up the gaming safety terms!" } },
    8: { adam: { mood: "thumbsup", message: "Five habits that keep every game safe." }, layla: null },
    9: { adam: null, layla: { mood: "excited", message: "Private data stays private — even in the lobby." } },
    10: { adam: { mood: "excited", message: "Build the gamer firewall!" }, layla: null },
    11: { adam: null, layla: { mood: "thinking", message: "Navigate the maze — every gate is gaming safety." } },
    12: { adam: { mood: "excited", message: "Final boss! You've got this, Safe Gamer!" }, layla: null },
    13: { adam: null, layla: { mood: "thumbsup", message: "Safe Gamer unlocked. Now go have fun out there." } },
  },
};
