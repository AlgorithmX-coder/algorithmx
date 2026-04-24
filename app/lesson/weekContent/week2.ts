import type { WeekContent } from "./types";

/**
 * Data-driven port of Week 2. The legacy bespoke player at
 * app/lesson/week2/Week2Player.tsx still exists and is unchanged — this file
 * feeds the new /lesson/2 dynamic route. Custom legacy screens (chat sim,
 * phone call, masterplan, vault battle) that don't map cleanly to ScreenDef
 * types are represented here as `info` screens.
 */
export const WEEK_2: WeekContent = {
  weekNumber: 2,
  title: "Private Information: Your Secrets Are Yours",
  topic: "private-info",
  badgeName: "Info Agent",
  badgeIcon: "🕶️",

  introCutscene: [
    { text: "CYBER HEROES ACADEMY\nWEEK 2: PRIVATE INFO", bg: "normal", duration: 3000 },
    { character: "both", characterMood: "excited", text: "Welcome back, Agent. Ready for Mission 2?", sound: "lessonStart", duration: 4500 },
    { character: "raccoon", characterMood: "idle", text: "\"Tell me your address, phone number, and school. We can be friends!\"", bg: "danger", textColour: "#c084fc", sound: "bossRoar", duration: 5000 },
    { character: "layla", characterMood: "worried", text: "The Hacker Raccoon is trying to trick kids into sharing PRIVATE info. That's how a lot of attacks start.", bg: "danger", duration: 5500 },
    { character: "adam", characterMood: "thinking", text: "Some info is SAFE to share — your favourite colour, your hobby. Some info is PRIVATE — your address, your phone number.", duration: 5500 },
    { character: "layla", characterMood: "excited", text: "Today we'll learn EXACTLY what stays private and what's fine to share. Let's go!", sound: "select", duration: 5000 },
    { text: "CLASSIFY EVERYTHING! 🕶️", bg: "normal", sound: "confetti", duration: 2000 },
  ],

  screens: [
    { type: "video", videoPlaceholder: "Week 2: Private Info intro video" },
    {
      type: "mission",
      objectives: [
        "Tell the difference between SAFE-to-share and PRIVATE info",
        "Learn how the Raccoon uses private info to target kids",
        "Know what to do when a stranger asks for info",
      ],
    },
    {
      type: "info",
      title: "What Counts as Private?",
      content:
        "Private info is ANY information that points to who you are, where you live, or how to contact you. Scammers and strangers piece these clues together like a puzzle.",
      bullets: [
        "Full name",
        "Home address",
        "Phone number",
        "School name",
        "Birthday (the exact date)",
        "Photos showing your uniform, school, or home",
      ],
    },
    {
      type: "cyberScanner",
      items: [
        { text: "Your favourite colour", isStrong: true, explanation: "Safe to share — nothing about you can be found from this" },
        { text: "Your school name", isStrong: false, explanation: "PRIVATE — tells strangers where you are every weekday" },
        { text: "Your favourite film", isStrong: true, explanation: "Safe — opinion, not ID info" },
        { text: "Your phone number", isStrong: false, explanation: "PRIVATE — strangers can contact you directly" },
        { text: "Your favourite video game", isStrong: true, explanation: "Safe — a hobby, not a clue to find you" },
        { text: "Your home address", isStrong: false, explanation: "PRIVATE — one of the most sensitive things" },
        { text: "Your favourite food", isStrong: true, explanation: "Safe — a preference" },
        { text: "A photo showing your uniform", isStrong: false, explanation: "PRIVATE — uniforms identify your school" },
        { text: "Your age range ('I'm a kid')", isStrong: true, explanation: "Safe — vague enough that no one can pinpoint you" },
        { text: "Your full name", isStrong: false, explanation: "PRIVATE — full names let strangers find your profiles" },
      ],
    },
    {
      type: "protectTheData",
      items: [
        { text: "Your full name", isPrivate: true },
        { text: "Your home address", isPrivate: true },
        { text: "Your school name", isPrivate: true },
        { text: "Your phone number", isPrivate: true },
        { text: "Your password", isPrivate: true },
        { text: "Your birthday", isPrivate: true },
        { text: "Favourite colour", isPrivate: false },
        { text: "Favourite game", isPrivate: false },
        { text: "Favourite animal", isPrivate: false },
        { text: '"I\'m a kid"', isPrivate: false },
        { text: "Favourite food", isPrivate: false },
        { text: "Favourite subject", isPrivate: false },
      ],
    },
    {
      type: "info",
      title: "The Rule of Puzzle Pieces",
      content:
        "One piece of private info can seem harmless. But strangers collect MANY pieces and put them together like a puzzle — until they know exactly who you are.",
      bullets: [
        "Your first name (common)",
        "+ Your school",
        "+ Your approximate age",
        "+ A photo of the playground",
        "= Strangers can find you in person",
      ],
    },
    {
      type: "chooseYourPath",
      scenarios: [
        {
          setup: "Someone on a game chat says 'What school do you go to? I live near there!'",
          choices: [
            { text: "Tell them the school name", isSafe: false, consequence: "Now the stranger knows where to find you in person every weekday. That's unsafe." },
            { text: "Don't share and leave the chat", isSafe: true, consequence: "Smart. Never share your school with online strangers." },
          ],
        },
        {
          setup: "A form on a game site asks for your full address for a 'free' gift.",
          choices: [
            { text: "Fill it in to get the gift", isSafe: false, consequence: "The 'gift' was a scam. Now strangers know where you live." },
            { text: "Close the form and tell a parent", isSafe: true, consequence: "Perfect! Real gifts never need your home address from a pop-up." },
          ],
        },
        {
          setup: "A new online friend asks for a photo of you in your school uniform.",
          choices: [
            { text: "Send it — they're friendly", isSafe: false, consequence: "The photo shows your school badge. A stranger could find you now." },
            { text: "Say no and tell an adult", isSafe: true, consequence: "Great! Photos can give away way more than you'd expect." },
          ],
        },
        {
          setup: "Someone messages saying: 'I'm from your school, what's your phone number?'",
          choices: [
            { text: "Share it — they go to your school", isSafe: false, consequence: "They might not really go to your school. Now they can contact you directly." },
            { text: "Ask them in person at school instead", isSafe: true, consequence: "Smart! If they really go to your school, they can ask in person." },
          ],
        },
      ],
    },
    {
      type: "memoryMatch",
      pairs: [
        { term: "Home Address", match: "Private — never share online", colour: "#ef4444" },
        { term: "Full Name", match: "Private — don't give to strangers", colour: "#f97316" },
        { term: "Password", match: "Only for YOU and parents", colour: "#a855f7" },
        { term: "Favourite Colour", match: "Safe to share", colour: "#34d399" },
        { term: "Age Range", match: '"I\'m a kid" is OK', colour: "#60a5fa" },
        { term: "School Name", match: "Private — helps strangers find you", colour: "#f472b6" },
      ],
    },
    {
      type: "spamBlaster",
      emails: [
        { sender: "Survey for Kids", subject: "Quick quiz! Name, birthday, school — win a prize!", isPhishing: true, clue: "Quizzes collecting private info = data harvesting" },
        { sender: "Best Friend", subject: "Pool party Saturday 2pm!", isPhishing: false, clue: "" },
        { sender: "Free Gift Team", subject: "Enter your address to get your free game!", isPhishing: true, clue: "Real giveaways never need your home address" },
        { sender: "Nan", subject: "Sending love and a card soon xx", isPhishing: false, clue: "" },
        { sender: "Online Friend?", subject: "What's your school? We might be neighbours!", isPhishing: true, clue: "Stranger asking for your school = red flag" },
        { sender: "Mum", subject: "Left your PE kit — picking it up for you", isPhishing: false, clue: "" },
        { sender: "Account Check", subject: "Confirm your full name and date of birth", isPhishing: true, clue: "Real services don't need DOB re-confirmations" },
        { sender: "Cousin", subject: "Minecraft Saturday? 👀", isPhishing: false, clue: "" },
        { sender: "Fun Quiz 2024", subject: "Which school do you go to? Find your pop quiz match!", isPhishing: true, clue: "Classic data harvesting quiz" },
        { sender: "Dad", subject: "Back late tonight — pizza in the fridge", isPhishing: false, clue: "" },
      ],
    },
    {
      type: "firewallBuilder",
      goodBlocks: [
        "Never share your address",
        "Check privacy settings",
        "Keep school name private",
        "Ask a parent before filling forms",
        "Use general age ranges only",
        "Never share photos with strangers",
        "Report suspicious info requests",
        "Log out of shared devices",
      ],
      badBlocks: [
        "Fill in every online form",
        "Share birthday for discounts",
        "Post school pics in uniform",
        "Share your phone number",
      ],
    },
    {
      type: "cyberMaze",
      questions: [
        { question: "A stranger asks your full name. You...", answers: ["Don't share; tell an adult", "Give it to be polite", "Give half of it", "Give a fake name then chat"], correctIndex: 0 },
        { question: "Private info includes:", answers: ["Address, phone, school, password", "Favourite colour", "Favourite food", "Your avatar"], correctIndex: 0 },
        { question: "A pop-up asks for your birthday for a 'prize'. You...", answers: ["Close the pop-up and tell a parent", "Enter your real birthday", "Enter a fake one and claim", "Share with a friend"], correctIndex: 0 },
        { question: "The safest way to share your age online is...", answers: ['"I\'m a kid"', "Your exact birthday", "The year you were born", "Your school grade"], correctIndex: 0 },
        { question: "A stranger wants to video chat. You...", answers: ["Say no and tell an adult", "Say yes for just a minute", "Turn off camera and talk", "Let them call you"], correctIndex: 0 },
      ],
    },
    { type: "bossBattle" },
    { type: "completion" },
  ],

  bossQuestions: {
    easy: [
      { question: "What is private info?", answers: ["Info that could identify or locate you", "Your favourite game", "Jokes you like", "Opinions"], correctIndex: 0, explanation: "Private info points to who you are and where you are" },
      { question: "Which is SAFE to share?", answers: ["Favourite colour", "Home address", "Password", "School name"], correctIndex: 0, explanation: "Opinions and preferences are safe; IDs and locations are private" },
      { question: "Which is PRIVATE?", answers: ["Your phone number", "Favourite film", "Favourite colour", "Your hobby"], correctIndex: 0, explanation: "Contact info is always private" },
      { question: "Someone asks for your address online. You...", answers: ["Never share it", "Only share half", "Give it to be polite", "Post it publicly"], correctIndex: 0, explanation: "Your home address is one of the most sensitive pieces of info" },
      { question: "Your school name is...", answers: ["Private", "Public", "Safe to share", "Required by sites"], correctIndex: 0, explanation: "School name gives strangers a weekday location for you — keep private" },
      { question: "A stranger wants to know your exact birthday. You...", answers: ["Refuse — say 'I'm a kid'", "Share it — kids love birthdays", "Give just the day", "Give your birth year"], correctIndex: 0, explanation: "Exact birthdates are used for identity verification — keep private" },
      { question: "A selfie in your school uniform can reveal...", answers: ["Your school", "Your height only", "Nothing", "Your mood"], correctIndex: 0, explanation: "Uniforms identify specific schools — be careful about posting them publicly" },
      { question: "Is it safe to share your favourite hobby?", answers: ["Yes", "No", "Only on weekends", "Only with strangers"], correctIndex: 0, explanation: "Hobbies are preferences, not identifying info" },
      { question: "Your full name is...", answers: ["Private", "Fine to post", "Meaningless", "Required online"], correctIndex: 0, explanation: "Full names let strangers find your profiles and life" },
      { question: "A site asks for your address for a 'free prize'. You...", answers: ["Close it", "Enter it", "Give a fake nearby address", "Ask them why"], correctIndex: 0, explanation: "Real prizes don't need your home address from a pop-up" },
    ],
    medium: [
      { question: "The 'puzzle pieces' problem means...", answers: ["Lots of small private facts add up to identify you", "Jigsaws are unsafe", "Games are dangerous", "Puzzles are banned"], correctIndex: 0, explanation: "Strangers collect small pieces over time — each one seems harmless alone" },
      { question: "A 'privacy setting' does what?", answers: ["Controls who sees your posts and info", "Makes your account faster", "Changes your password", "Adds emojis"], correctIndex: 0, explanation: "Privacy settings let you limit who sees your posts — check them on every app" },
      { question: "Why check privacy settings on a new app?", answers: ["Defaults usually favour the app, not you", "They're decorative", "They're required by law", "They play music"], correctIndex: 0, explanation: "Most apps default to public or shared — always tighten them when you sign up" },
      { question: "A quiz asks 'What's your first pet's name?' Why is this risky?", answers: ["It's a common security question answer", "Pets are private", "Pets are dangerous", "Quizzes are illegal"], correctIndex: 0, explanation: "Security questions are often used for account recovery — don't give their answers away" },
      { question: "Metadata on a photo can include...", answers: ["GPS location and time", "The caption only", "The photographer's mood", "The photo's colour palette"], correctIndex: 0, explanation: "Photos embed hidden data — strip metadata before sharing sensitive shots" },
      { question: "Your parent's name + your school is enough for a stranger to...", answers: ["Find and contact your family", "Nothing", "Win a quiz", "Hack your phone"], correctIndex: 0, explanation: "Combine parent + school and a stranger can find you — layer protection with privacy" },
      { question: "Public Wi-Fi without a VPN can leak...", answers: ["What you browse to anyone on the network", "Nothing ever", "Your dreams", "Song lyrics"], correctIndex: 0, explanation: "Public Wi-Fi is unsafe — use a VPN or your phone's data for sensitive stuff" },
      { question: "'Opt out' means...", answers: ["Choose NOT to share data", "Choose to share all data", "Opt for surprises", "Turn off opinions"], correctIndex: 0, explanation: "Opt out = say no. Always look for opt-out buttons on data-collecting sites" },
      { question: "Deleting a post from your account means...", answers: ["Copies may still exist in screenshots and backups", "It's gone from the whole internet", "Only the caption is gone", "The photo becomes public"], correctIndex: 0, explanation: "Deletion on your account isn't deletion everywhere — assume stuff online is permanent" },
      { question: "Your 'digital shadow' is...", answers: ["All the info others collect about you without you knowing", "A photo filter", "An avatar", "A video game"], correctIndex: 0, explanation: "Every app, ad, and cookie builds a profile of you — your digital shadow" },
    ],
    hard: [
      { question: "Why is your school name particularly risky to share?", answers: ["It narrows your location to a weekday-predictable place and you", "It's copyrighted", "It's illegal", "It's too long"], correctIndex: 0, explanation: "School = a specific place you are on a specific schedule. Dangerous combo" },
      { question: "A website's 'data broker' is...", answers: ["A company that buys and sells personal info", "A stock trader", "A bank employee", "A schoolteacher"], correctIndex: 0, explanation: "Data brokers profile people from public + purchased info — another reason to share less" },
      { question: "Why is GPS metadata on photos especially risky for kids?", answers: ["A photo from 'home' can reveal exact address to anyone who sees it", "It makes photos heavy", "It uses too much battery", "It's a bug"], correctIndex: 0, explanation: "Phone photos often embed GPS coordinates — strip location on phones before posting sensitive shots" },
      { question: "You post 'first day of Year 6!' with a uniform photo. What did you just share?", answers: ["Your age, school, and what you look like", "Nothing", "Only a photo", "Only a comment"], correctIndex: 0, explanation: "That one post revealed age (~10), school (uniform), and your face — three puzzle pieces" },
      { question: "'Social engineering' exploits...", answers: ["People's trust and emotions, not computer bugs", "Only old computers", "Only games", "Nothing"], correctIndex: 0, explanation: "Scammers manipulate feelings (fear, excitement, trust) — not code — to get info" },
      { question: "Why are 'loyalty cards' a privacy concern?", answers: ["They track every purchase you make", "They're magnetic", "They're made of plastic", "They have colours"], correctIndex: 0, explanation: "Loyalty programs build detailed buying profiles — that's why they're 'free'" },
      { question: "Your IP address reveals...", answers: ["Your approximate location and your internet provider", "Your birth date", "Your favourite game", "Your address to the exact house"], correctIndex: 0, explanation: "IP = rough city-level location. Use a VPN for sensitive stuff" },
      { question: "Oversharing 'I'm home alone today' is risky because...", answers: ["It tells strangers your location AND your vulnerability at once", "It's a spoiler", "It's nothing", "It's only a phrase"], correctIndex: 0, explanation: "Status posts about being alone are among the riskiest things to share publicly" },
      { question: "The 'right to be forgotten' means...", answers: ["You can ask some companies to delete your data about you", "Everyone forgets your birthday", "You can delete the internet", "You can delete school"], correctIndex: 0, explanation: "In many countries you can request data removal — worth knowing, though not automatic" },
      { question: "The core rule of online privacy is...", answers: ["Share the minimum — would a stranger need this to find me?", "Share everything — they'll find it anyway", "Share only on Mondays", "Share only photos"], correctIndex: 0, explanation: "Default to less — ask 'does this help a stranger find me?' before sharing anything" },
    ],
  },

  reactions: {
    0: { adam: { mood: "excited", message: "Welcome to Week 2 — Private Info!" }, layla: null },
    1: { adam: null, layla: { mood: "curious", message: "Mission briefing time." } },
    2: { adam: { mood: "thinking", message: "Private info points to YOU — keep it safe." }, layla: null },
    3: { adam: null, layla: { mood: "excited", message: "Scan each piece of info!" } },
    4: { adam: { mood: "excited", message: "Move the shield to block private data." }, layla: null },
    5: { adam: null, layla: { mood: "thinking", message: "Puzzle pieces add up fast." } },
    6: { adam: { mood: "curious", message: "Which door keeps you safe?" }, layla: null },
    7: { adam: null, layla: { mood: "curious", message: "Match up the privacy terms!" } },
    8: { adam: { mood: "worried", message: "Zap the data-harvesting emails!" }, layla: null },
    9: { adam: null, layla: { mood: "excited", message: "Build the privacy firewall!" } },
    10: { adam: { mood: "thinking", message: "Answer each gate about privacy." }, layla: null },
    11: { adam: null, layla: { mood: "excited", message: "Boss battle — beat the Raccoon's info harvest!" } },
    12: { adam: { mood: "excited", message: "Final challenge, Agent!" }, layla: null },
    13: { adam: null, layla: { mood: "thumbsup", message: "Info Agent unlocked. You're unstoppable." } },
  },
};
