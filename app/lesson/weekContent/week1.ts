import type { WeekContent } from "./types";

/**
 * Data-driven port of Week 1. The legacy bespoke player at
 * app/lesson/LessonPlayer.tsx still exists and is unchanged — this file is
 * consumed by the new /lesson/[week] dynamic route. Some of the legacy
 * screens (shield-drag simulator, password-builder slots, phishing-explainer
 * cards, golden-rules tap-to-reveal) don't map cleanly to the ScreenDef
 * union, so they've been replaced by equivalent `info` screens here.
 */
export const WEEK_1: WeekContent = {
  weekNumber: 1,
  title: "Passwords: The Secret Code",
  topic: "passwords",
  badgeName: "Password Protector",
  badgeIcon: "🔐",

  introCutscene: [
    { text: "CYBER HEROES ACADEMY\nWEEK 1: PASSWORDS", bg: "normal", duration: 3000 },
    { character: "both", characterMood: "excited", text: "Welcome, Cyber Hero! Ready for Mission 1?", sound: "lessonStart", duration: 4500 },
    { character: "raccoon", characterMood: "idle", text: "\"Haha! Your password is 'password123'? Too easy — I'm in!\"", bg: "danger", textColour: "#c084fc", sound: "bossRoar", duration: 5000 },
    { character: "adam", characterMood: "worried", text: "The Hacker Raccoon is cracking weak passwords! We need to teach kids how to make them STRONG.", bg: "danger", duration: 5000 },
    { character: "layla", characterMood: "thinking", text: "A strong password mixes letters, numbers, and symbols — and it's long enough to slow down any hacker.", duration: 5000 },
    { character: "adam", characterMood: "thumbsup", text: "Today we'll build passwords the Raccoon can't crack. Let's go!", sound: "select", duration: 5000 },
    { text: "MISSION START! 🔐", bg: "normal", sound: "confetti", duration: 2000 },
  ],

  screens: [
    { type: "video", videoPlaceholder: "Week 1: Passwords intro video" },
    {
      type: "mission",
      objectives: [
        "Understand what a password is (and isn't)",
        "Learn the rules of a STRONG password",
        "Spot weak passwords a hacker could crack",
      ],
    },
    {
      type: "info",
      title: "What Is a Password?",
      content:
        "A password is a secret code that only YOU know. It proves to the computer that it's really you trying to log in. The stronger the code, the harder the Hacker Raccoon has to work.",
      bullets: [
        "Keep it secret — even from friends",
        "Longer is stronger (8+ characters)",
        "Mix uppercase, lowercase, numbers, and symbols",
        "Don't use your name, birthday, or 'password'",
      ],
    },
    {
      type: "cyberScanner",
      items: [
        { text: "password123", isStrong: false, explanation: "Too common and predictable" },
        { text: "Tr0pic4l$unR1se!", isStrong: true, explanation: "Mix of upper, lower, numbers, and symbols" },
        { text: "qwerty", isStrong: false, explanation: "Keyboard pattern — easy to guess" },
        { text: "MyN@me1sJ0hn!", isStrong: true, explanation: "Good length with mixed characters" },
        { text: "ilovecats", isStrong: false, explanation: "Common phrase, no numbers or symbols" },
        { text: "G4m3r#Pr0!", isStrong: true, explanation: "Short but has all character types" },
        { text: "123456789", isStrong: false, explanation: "Just numbers in order" },
        { text: "Cyb3r$h13ld_2024!", isStrong: true, explanation: "Long, random, all character types" },
        { text: "football", isStrong: false, explanation: "Dictionary word, easy to crack" },
        { text: "X#9kL2$mP!", isStrong: true, explanation: "Random characters, very strong" },
      ],
    },
    { type: "passwordLab" },
    { type: "crackTheCode" },
    {
      type: "conveyorBelt",
      items: [
        { text: "Dragon2020", category: "weak" },
        { text: "Tr0pic4l$un!", category: "strong" },
        { text: "bluesky", category: "weak" },
        { text: "R0ckst@r_2024", category: "strong" },
        { text: "letmein", category: "weak" },
        { text: "G4l@xy_Qu3st!", category: "strong" },
        { text: "myname123", category: "weak" },
        { text: "X#7kP$mL2!", category: "strong" },
      ],
    },
    {
      type: "info",
      title: "The 5 Golden Rules",
      content: "Follow these and the Hacker Raccoon can never get in:",
      bullets: [
        "Keep it SECRET — never share passwords",
        "Make it LONG — 8 characters or more",
        "Make it MIXED — letters, numbers, symbols",
        "Make it UNIQUE — different for every account",
        "NEVER use your name, birthday, or 'password'",
      ],
    },
    {
      type: "memoryMatch",
      pairs: [
        { term: "Password", match: "Your secret code to prove it's you", colour: "#60a5fa" },
        { term: "Strong", match: "Long, mixed, hard to guess", colour: "#34d399" },
        { term: "Weak", match: "Short, common, easy to guess", colour: "#ef4444" },
        { term: "Unique", match: "Different for every account", colour: "#8b5cf6" },
        { term: "Password Manager", match: "App that remembers passwords safely", colour: "#fbbf24" },
        { term: "2FA", match: "A second check to prove it's you", colour: "#f97316" },
      ],
    },
    {
      type: "spamBlaster",
      emails: [
        { sender: "Prize Central", subject: "YOU WON A FREE iPHONE!", isPhishing: true, clue: "Too good to be true" },
        { sender: "Sam", subject: "Funny video from school!", isPhishing: false, clue: "" },
        { sender: "Security Team", subject: "URGENT: Enter your password NOW!", isPhishing: true, clue: "Real services never ask for passwords by email" },
        { sender: "School Admin", subject: "Reminder: PE kit tomorrow", isPhishing: false, clue: "" },
        { sender: "V-Bucks Giveaway", subject: "FREE 10,000 V-BUCKS!", isPhishing: true, clue: "Free currency scams" },
        { sender: "Mrs Johnson", subject: "Homework reminder for Monday", isPhishing: false, clue: "" },
        { sender: "Your School", subject: "Your school needs your password", isPhishing: true, clue: "Schools never ask for passwords via email" },
        { sender: "Grandma", subject: "Happy birthday next week!", isPhishing: false, clue: "" },
        { sender: "Lucky Visitor", subject: "You are our 1,000,000th visitor!", isPhishing: true, clue: "No website tracks visitors this way" },
        { sender: "Account Security", subject: "Verify your account or it will be DELETED", isPhishing: true, clue: "Scare tactics = phishing" },
      ],
    },
    {
      type: "chooseYourPath",
      scenarios: [
        {
          setup: "Your best friend asks you to share your Roblox password so they can help you get items. What do you do?",
          choices: [
            { text: "Share it — they're my best friend", isSafe: false, consequence: "Even best friends shouldn't know your password. Accounts get hacked that way." },
            { text: "Say no — passwords are secret", isSafe: true, consequence: "Perfect! Your password is YOUR secret. Nobody else needs to know it except your parents." },
          ],
        },
        {
          setup: "A pop-up says your account is hacked and you must enter your password on this page RIGHT NOW. What do you do?",
          choices: [
            { text: "Enter it quickly — sounds urgent!", isSafe: false, consequence: "That was a scam. You just gave your password to a hacker." },
            { text: "Close it and tell a parent", isSafe: true, consequence: "Great thinking! Real companies don't demand passwords via pop-ups." },
          ],
        },
      ],
    },
    {
      type: "cyberMaze",
      questions: [
        { question: "What makes a password STRONG?", answers: ["Mix of letters, numbers, symbols, 8+ long", "Your birthday", "The word 'password'", "One letter"], correctIndex: 0 },
        { question: "Who should know your password?", answers: ["Only you (and a parent for safety)", "Your best friend", "Everyone in your class", "Everyone who asks"], correctIndex: 0 },
        { question: "A good password does NOT include...", answers: ["Your name or birthday", "Numbers", "Symbols", "Uppercase letters"], correctIndex: 0 },
        { question: "2FA adds...", answers: ["A second check to prove it's you", "A second password", "Two usernames", "Double-clicks"], correctIndex: 0 },
        { question: "Where should you STORE passwords?", answers: ["In a password manager", "On a sticky note", "In a text to a friend", "The same note for every account"], correctIndex: 0 },
      ],
    },
    { type: "bossBattle" },
    { type: "completion" },
  ],

  bossQuestions: {
    easy: [
      { question: "What is a password?", answers: ["A secret code to prove it's you", "A type of game", "A song lyric", "A school subject"], correctIndex: 0, explanation: "A password is your secret code to log in" },
      { question: "Which is STRONGER?", answers: ["Tr0pic4l$unR1se!", "password", "12345", "yourname"], correctIndex: 0, explanation: "Mix of uppercase, lowercase, numbers, and symbols — and long" },
      { question: "Should you share your password with a friend?", answers: ["Yes", "Never", "Only on weekends", "Only at school"], correctIndex: 1, explanation: "Passwords are always secret, even from friends" },
      { question: "A password should be at least...", answers: ["8 characters long", "3 letters", "1 number", "Your name"], correctIndex: 0, explanation: "8+ characters is the minimum for a strong password" },
      { question: "Which is the WEAKEST password?", answers: ["password123", "G4m3r#Pr0!", "X#9kL2$mP!", "Cyb3r$h13ld_2024!"], correctIndex: 0, explanation: "'password' is literally the worst password — everyone tries it first" },
      { question: "What does 2FA stand for?", answers: ["Two-Factor Authentication", "Two Free Apples", "Too Fast Again", "Total Fun Adventure"], correctIndex: 0, explanation: "Two-Factor Authentication — a second check to prove it's you" },
      { question: "A password manager...", answers: ["Remembers your passwords safely", "Tells your friends your password", "Makes weaker passwords", "Only works offline"], correctIndex: 0, explanation: "Password managers keep all your passwords encrypted and safe" },
      { question: "Using the same password for everything is...", answers: ["Safer — easier to remember", "Risky — one hack unlocks them all", "Normal", "Required"], correctIndex: 1, explanation: "If one account is hacked, EVERY account is — always use unique passwords" },
      { question: "The Hacker Raccoon tries to guess your password using...", answers: ["Common words and dates", "Telepathy", "Luck", "Cats"], correctIndex: 0, explanation: "Hackers use lists of common passwords and dates — don't use them!" },
      { question: "Your password should NOT be...", answers: ["Something the Raccoon could guess", "A random mix", "Long", "Unique"], correctIndex: 0, explanation: "Anything a hacker could easily guess (name, birthday, 'password') is weak" },
    ],
    medium: [
      { question: "Why shouldn't you write your password on a sticky note?", answers: ["Anyone who sees it can use it", "The ink fades", "Paper is bad", "Stickies are too small"], correctIndex: 0, explanation: "Written passwords are visible to anyone nearby — use a password manager instead" },
      { question: "If your friend guesses your password, you should...", answers: ["Change it immediately", "Keep using it", "Let them log in for you", "Share it with more people"], correctIndex: 0, explanation: "Once a password is known by someone else, change it right away" },
      { question: "A password manager needs ONE strong password (the 'master') because...", answers: ["It unlocks all your other passwords, so it must be extra strong", "It saves time", "It looks cooler", "It's required by law"], correctIndex: 0, explanation: "Your master password is the key to everything — make it strong and unique" },
      { question: "Why is 'Tropical$unR1se!' stronger than 'TropicalSunrise'?", answers: ["Mixed case + numbers + symbols = harder to crack", "It's longer", "It's shorter", "It's the same"], correctIndex: 0, explanation: "Character variety makes passwords exponentially harder to crack" },
      { question: "2FA using your phone means...", answers: ["You need both your password AND a code sent to your phone", "Your phone IS your password", "You don't need a password", "Your phone picks the password"], correctIndex: 0, explanation: "Two-factor means two checks — password + phone code is a classic combo" },
      { question: "Which stops a hacker trying thousands of guesses per second?", answers: ["Long random passwords", "Short common passwords", "Your nickname", "Nothing stops them"], correctIndex: 0, explanation: "Every extra character makes brute-force attacks take exponentially longer" },
      { question: "A 'passphrase' like 'correct-horse-battery-staple' works because...", answers: ["It's long + random words = hard to crack but easy to remember", "It's funny", "It uses dashes", "It has animals"], correctIndex: 0, explanation: "Random-word passphrases are both strong AND memorable" },
      { question: "Why should your email password be especially strong?", answers: ["Your email can reset all your other accounts", "Emails cost more", "It's a legal rule", "It's the default"], correctIndex: 0, explanation: "Your email is the 'master key' — hacking it usually lets hackers reset every other account" },
      { question: "If a website is hacked and your password is leaked, you should...", answers: ["Change it on that site AND anywhere else you used it", "Do nothing", "Only change it on that site", "Delete the internet"], correctIndex: 0, explanation: "Change it everywhere it's been reused — this is why unique passwords matter" },
      { question: "A 'keylogger' is malware that...", answers: ["Records everything you type including passwords", "Locks your keys", "Plays music", "Changes your wallpaper"], correctIndex: 0, explanation: "Keyloggers steal passwords as you type — one reason to keep your computer updated and scanned" },
    ],
    hard: [
      { question: "Why do some sites force you to change passwords every 90 days?", answers: ["If a password has leaked without you knowing, a change limits the damage — though unique long passwords + 2FA are now considered more important", "It's a legal requirement", "It speeds up the site", "For fun"], correctIndex: 0, explanation: "Periodic rotation used to be standard. Modern guidance is: unique strong passwords + 2FA matter more" },
      { question: "A 'brute force attack' is when a hacker...", answers: ["Tries every possible password combination until one works", "Uses physical force", "Guesses once", "Asks nicely"], correctIndex: 0, explanation: "Computers can try millions of password combinations per second — that's why length matters" },
      { question: "A 'dictionary attack' tries...", answers: ["Every word in the dictionary as a password", "Spelling lessons", "Dictionary pages", "Random letters"], correctIndex: 0, explanation: "Common words fall in seconds — never use single dictionary words" },
      { question: "Why is a 6-character password insecure even if 'random'?", answers: ["Modern computers can try all 6-character combinations in seconds", "6 is an unlucky number", "It's too long", "It needs emoji"], correctIndex: 0, explanation: "Length is the single biggest factor — at least 8 characters is the safe minimum" },
      { question: "'Salting' a password hash means...", answers: ["Adding random extra data before hashing, so identical passwords look different in storage", "Using sea salt", "Making it tasty", "Nothing technical"], correctIndex: 0, explanation: "Salt protects databases — even if two users pick the same password, their stored hashes differ" },
      { question: "A password stored as a 'hash' means...", answers: ["A scrambled version that can't easily be reversed back to the password", "Written on paper", "In a fridge", "Sent by post"], correctIndex: 0, explanation: "Hashes are one-way scrambles — even the website can't see your actual password" },
      { question: "If a site stores passwords in 'plaintext' it means...", answers: ["Passwords are stored as-is — a huge security risk", "They're printed out", "Plain black and white", "Only letters, no numbers"], correctIndex: 0, explanation: "Plaintext storage is how big leaks happen — avoid sites that show you your own password in an email" },
      { question: "Why is reusing passwords catastrophic once one site is breached?", answers: ["Hackers test leaked password + username combos on every major site (credential stuffing)", "It's not catastrophic", "It slows down websites", "Nothing special"], correctIndex: 0, explanation: "Credential stuffing is huge — one breach + password reuse = many breached accounts" },
      { question: "A 'passkey' is a newer alternative to passwords that...", answers: ["Uses your device's biometrics or a cryptographic key instead of a typed password", "Is just a longer password", "Requires a physical key", "Doesn't exist"], correctIndex: 0, explanation: "Passkeys use public-key cryptography + your device — they can't be phished" },
      { question: "The strongest single habit for password safety is...", answers: ["Use a password manager + 2FA on every account that supports it", "Memorise one super password", "Never go online", "Only use your pet's name"], correctIndex: 0, explanation: "Password manager = unique strong passwords everywhere. 2FA = hackers can't get in even if they steal one" },
    ],
  },

  reactions: {
    0: { adam: { mood: "excited", message: "Welcome back to Week 1!" }, layla: null },
    1: { adam: null, layla: { mood: "curious", message: "Let's learn what makes a password strong." } },
    2: { adam: { mood: "thinking", message: "Passwords are your secret code." }, layla: null },
    3: { adam: null, layla: { mood: "excited", message: "Scan each password!" } },
    4: { adam: { mood: "excited", message: "Let's brew a super-strong password!" }, layla: null },
    5: { adam: null, layla: { mood: "thinking", message: "Crack the code with all 4 rings." } },
    6: { adam: { mood: "excited", message: "Sort them fast on the belt!" }, layla: null },
    7: { adam: null, layla: { mood: "thumbsup", message: "The 5 Golden Rules — memorise them!" } },
    8: { adam: { mood: "curious", message: "Match the password concepts." }, layla: null },
    9: { adam: null, layla: { mood: "worried", message: "Zap the phishing emails!" } },
    10: { adam: { mood: "thinking", message: "Pick the safe door." }, layla: null },
    11: { adam: null, layla: { mood: "excited", message: "Navigate the maze!" } },
    12: { adam: { mood: "excited", message: "Boss battle — let's beat the Raccoon!" }, layla: null },
    13: { adam: null, layla: { mood: "thumbsup", message: "Password Protector badge earned!" } },
  },
};
