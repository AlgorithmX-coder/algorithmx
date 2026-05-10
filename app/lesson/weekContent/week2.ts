import type { WeekContent } from "./types";

/**
 * Data-driven port of Week 2. The legacy bespoke player at
 * app/lesson/week2/Week2Player.tsx still exists and is untouched - this file
 * feeds the new /lesson/2 dynamic route. Where Week2Player had custom UI
 * (chat simulator, phone call game, flip-tile info, poster-spot, masterplan
 * cards), we've mapped each to the closest standard screen type and kept
 * the original tone and content.
 */
export const WEEK_2: WeekContent = {
  weekNumber: 2,
  title: "Private Information: The Privacy Guardian",
  topic: "private-info",
  badgeName: "Privacy Guardian",
  badgeIcon: "🔒",

  // Extracted verbatim from WEEK2_INTRO in storyContent.ts
  introCutscene: [
    { text: "CYBER HEROES ACADEMY\nWEEK 2: PRIVATE INFORMATION", bg: "normal", duration: 3000 },
    { character: "both", characterMood: "excited", text: "Welcome back, Cyber Hero! Great to see you again!", sound: "lessonStart", duration: 4500 },
    { character: "layla", characterMood: "worried", text: "We've got a new problem. Hacker Raccoon is back - and this time he's after something REALLY dangerous...", bg: "danger", duration: 5500 },
    { character: "raccoon", characterMood: "idle", text: "\"Forget passwords - I want your NAME, your ADDRESS, your SCHOOL! Tell me EVERYTHING!\"", textColour: "#c084fc", sound: "bossRoar", shake: true, duration: 5500 },
    { character: "adam", characterMood: "worried", text: "Your private information is super valuable. If the wrong person gets it, they could find you, trick you, or pretend to be you!", duration: 5500 },
    { character: "layla", characterMood: "excited", text: "But don't worry! Today we're going to learn EXACTLY what's safe to share and what must stay secret!", duration: 5500 },
    { character: "adam", characterMood: "thumbsup", text: "And at the end - another Boss Battle against Hacker Raccoon! Let's do this!", sound: "select", duration: 5000 },
    { text: "LET'S GO! 🚀", bg: "normal", sound: "confetti", duration: 2000 },
  ],

  screens: [
    // Screen 0: intro video
    { type: "video", videoPlaceholder: "Week 2: Private Information intro video" },

    // Screen 1: mission briefing
    {
      type: "mission",
      objectives: [
        "Learn which information is PRIVATE and which is SAFE to share",
        "Spot the tricks Hacker Raccoon uses to steal private info",
        "Know exactly what to do when someone asks for something personal",
      ],
    },

    // Screen 2: Flip-tiles info - what's private vs safe (from legacy FLIP TILES)
    {
      type: "info",
      title: "Private vs Safe to Share",
      content:
        "Some information is SAFE to share - it's about your opinions or hobbies, nothing that identifies you. Other information is PRIVATE - if strangers get it, they could find you, contact you, or pretend to be you. Let's learn the difference!",
      bullets: [
        "PRIVATE: Full name, home address, school name, phone number, password, birthday",
        "PRIVATE: Photos of you in uniform, your schedule, your parent's work details",
        "SAFE: Favourite colour, favourite game, favourite food",
        "SAFE: Your hobbies, your favourite film, your age range (\"I'm a kid\")",
        "Rule of thumb: would a stranger learn who or where you are from it? If yes - PRIVATE",
      ],
    },

    // Screen 3: Poster danger (from legacy POSTER FIX - 7 dangers on a mock poster)
    {
      type: "info",
      title: "Spot the Dangers on a Poster",
      content:
        "Someone made a 'Play With Me!' poster online. Can you spot the things they should NEVER share publicly? Seven red flags:",
      bullets: [
        "Their FULL NAME - only first name is ever needed online",
        "Their HOME ADDRESS - never put this anywhere public",
        "Their SCHOOL NAME - a stranger could find them weekdays",
        "Their PHONE NUMBER - lets strangers contact directly",
        "A photo in school UNIFORM - identifies exactly where they go",
        "The exact DATE they're home alone - a scary pattern",
        "An ACCOUNT SET TO PUBLIC - everyone can see everything",
      ],
    },

    // Screen 4: Classify quiz → ProtectTheData (expanded from CLASSIFY_QS to 12 items)
    {
      type: "protectTheData",
      items: [
        { text: "Your favourite colour", isPrivate: false },
        { text: "Your home address", isPrivate: true },
        { text: "Your mum's phone number", isPrivate: true },
        { text: "What games you like playing", isPrivate: false },
        { text: "Your password for school", isPrivate: true },
        { text: "Your full name", isPrivate: true },
        { text: "Your favourite animal", isPrivate: false },
        { text: "Your school name", isPrivate: true },
        { text: "Your favourite subject", isPrivate: false },
        { text: "Your birthday (exact date)", isPrivate: true },
        { text: "Your age range (\"I'm a kid\")", isPrivate: false },
        { text: "Your house door number", isPrivate: true },
      ],
    },

    // Screen 5: Chat Simulation (from CHAT_ROUNDS) → ChooseYourPath - picked safest vs most dangerous option per round
    {
      type: "chooseYourPath",
      scenarios: [
        {
          setup: "Someone in a chat says: \"Hey! You seem cool! What's your name? 😊\"",
          choices: [
            { text: "I'm Adam Johnson from London!", isSafe: false, consequence: "You just revealed your full name AND city. A stranger can now search for you online." },
            { text: "I don't share my name with strangers", isSafe: true, consequence: "Perfect. A polite refusal is always fine - real friends don't mind." },
          ],
        },
        {
          setup: "\"What school do you go to? Maybe we go to the same one!\"",
          choices: [
            { text: "St Mary's Primary on Oak Lane!", isSafe: false, consequence: "Now a stranger knows exactly where you are every weekday. Dangerous." },
            { text: "I'd rather not say", isSafe: true, consequence: "Nice work. Your school is one of the most sensitive pieces of info you can share." },
          ],
        },
        {
          setup: "\"Want to meet up after school? We could play football! ⚽\"",
          choices: [
            { text: "Sure! I finish at 3:30!", isSafe: false, consequence: "NEVER meet an online stranger, and never share your schedule. Classic red flag." },
            { text: "I never meet people from the internet", isSafe: true, consequence: "Exactly right. Online friends you've never met are still strangers." },
          ],
        },
        {
          setup: "\"Can you send me a photo? I want to see what you look like!\"",
          choices: [
            { text: "Sure, here's a selfie!", isSafe: false, consequence: "Strangers can use your photo to impersonate you or find out where you go." },
            { text: "No, I don't send photos to people online", isSafe: true, consequence: "Good judgement. Photos reveal more than you'd expect." },
          ],
        },
        {
          setup: "\"What's your address? I'll send you a gaming code! 🎮\"",
          choices: [
            { text: "42 Elm Street, London", isSafe: false, consequence: "Huge red flag. No legit 'gaming code' needs your home address - ever." },
            { text: "I'm going to block you now", isSafe: true, consequence: "Perfect response. Address requests = block, report, tell a trusted adult." },
          ],
        },
      ],
    },

    // Screen 6: Intel Report info - why this matters
    {
      type: "info",
      title: "Why Private Info Matters So Much",
      content:
        "When strangers know your private info, they can do things you wouldn't believe. Real cases happen EVERY day - and most start with one piece of info that seemed harmless.",
      bullets: [
        "Impersonation - pretending to be you online to trick friends and family",
        "Fraud - using your name or address to order things under your name",
        "Location tracking - piecing clues together to find you in real life",
        "Social engineering - using info about you to trick grown-ups in your family",
        "Identity building - slowly collecting enough to open fake accounts in your name",
      ],
    },

    // Screen 7: Profile Detective info - from PROFILE_DANGERS
    {
      type: "info",
      title: "Profile Detective: 7 Red Flags",
      content:
        "Someone's social media profile has SEVEN things wrong with it. A detective eye spots each one - can you?",
      bullets: [
        "Birth year in the username (helps strangers guess security questions)",
        "Full name in the bio (surnames belong offline)",
        "School name in the bio (reveals your weekday location)",
        "Home address mentioned anywhere (never, ever public)",
        "A photo showing school uniform (uniforms identify your school)",
        "A photo showing the house number (door numbers = find-me clues)",
        "Account set to PUBLIC (anyone in the world can see everything you post)",
      ],
    },

    // Screen 8: Context sorting (CONTEXT_ROUNDS) → ChooseYourPath - same info, different context
    {
      type: "chooseYourPath",
      scenarios: [
        {
          setup: "Your FULL NAME - a stranger in an online game asks for it, while your teacher asks for it on the first day of school. Which is SAFE to share?",
          choices: [
            { text: "The stranger in the game", isSafe: false, consequence: "Strangers in games don't need your full name. Teachers do - only share with people you know in real life." },
            { text: "Your teacher on the first day", isSafe: true, consequence: "Right! Teachers need your name. Strangers online don't." },
          ],
        },
        {
          setup: "Your HOME ADDRESS - someone in a chatroom asks, and a delivery person asks while your parent is there. Which is SAFE?",
          choices: [
            { text: "The chatroom stranger", isSafe: false, consequence: "NEVER share your address with online strangers - no matter how friendly they seem." },
            { text: "The delivery person (parent present)", isSafe: true, consequence: "Exactly. Addresses only ever get shared with trusted adults present." },
          ],
        },
        {
          setup: "Your BIRTHDAY - your friend asks to invite you to a party, and a website pop-up asks to 'verify your age.' Which is SAFE?",
          choices: [
            { text: "The website pop-up", isSafe: false, consequence: "Pop-ups don't need real birthdays - that's often data harvesting. Friends asking for parties is fine." },
            { text: "Your friend planning a party", isSafe: true, consequence: "Right! Real friends = safe. Random websites = check with an adult first." },
          ],
        },
        {
          setup: "A PHOTO OF YOU - an online friend you've never met asks for one, and your parent takes a family photo. Which is SAFE?",
          choices: [
            { text: "The online friend you've never met", isSafe: false, consequence: "Online-only friends are still strangers. Photos should only go to people you know in person." },
            { text: "Your parent's family photo", isSafe: true, consequence: "Exactly. Family photos = fine. Stranger requests = never." },
          ],
        },
        {
          setup: "Your PASSWORD - your best friend asks, and your parent asks. Which is SAFE?",
          choices: [
            { text: "Your best friend", isSafe: false, consequence: "Even best friends shouldn't know your password. Their account could get hacked and take yours with it." },
            { text: "Your parent (for safety)", isSafe: true, consequence: "Right. Only parents - no one else, ever." },
          ],
        },
      ],
    },

    // Screen 9: Information Chain info - DOMINO effect
    {
      type: "info",
      title: "The Information Chain",
      content:
        "Sharing one piece of private info might seem harmless. But strangers CONNECT the dots - each piece adds to the puzzle. Here's how a single slip becomes something serious:",
      bullets: [
        "You tell someone your SCHOOL NAME online",
        "They now know WHERE you go every weekday",
        "They can FIND your school on a map",
        "They know WHEN you arrive and leave",
        "A stranger could find you in real life",
        "This is why even ONE piece of private info matters",
      ],
    },

    // Screen 10: Raccoon frustration info - the flip side
    {
      type: "info",
      title: "Raccoon's Nightmare",
      content:
        "When you DON'T share private info, Hacker Raccoon is stuck. He tries and tries - and gets nothing. Every time you refuse, you defeat him.",
      bullets: [
        "Home Address: he's got nothing",
        "School Name: completely secret",
        "Phone Number: not a single digit",
        "Password: triple locked",
        "Photos: nothing useful",
        "Every 'no' you say is a win",
      ],
    },

    // Screen 11: Speed Sort (SPEED_SORT_ITEMS → ProtectTheData with all 15 items)
    {
      type: "protectTheData",
      items: [
        { text: "Your favourite food", isPrivate: false },
        { text: "Your home address", isPrivate: true },
        { text: "Your favourite game", isPrivate: false },
        { text: "Your mum's phone number", isPrivate: true },
        { text: "Your pet's name", isPrivate: false },
        { text: "Your password", isPrivate: true },
        { text: "Your favourite colour", isPrivate: false },
        { text: "Your school name", isPrivate: true },
        { text: "What music you like", isPrivate: false },
        { text: "Your dad's email address", isPrivate: true },
        { text: "Your favourite YouTuber", isPrivate: false },
        { text: "Your house door number", isPrivate: true },
      ],
    },

    // Screen 12: Phone rounds (PHONE_ROUNDS → ChooseYourPath - safest vs most dangerous option per round)
    {
      type: "chooseYourPath",
      scenarios: [
        {
          setup: "\"Hi! I'm from your internet company. Can you tell me your mum's full name and home address so I can fix a problem with your WiFi?\" - Unknown Number",
          choices: [
            { text: "Sure! Her name is...", isSafe: false, consequence: "Never give info to unknown callers. Real support doesn't work like this." },
            { text: "No. I'm hanging up now.", isSafe: true, consequence: "Perfect. You don't owe strangers any information - hang up and tell a parent." },
          ],
        },
        {
          setup: "\"Congratulations! You've won a FREE PlayStation! We just need your full name, age, and address to send it to you!\" - Competition Hotline",
          choices: [
            { text: "Wow! My name is Adam and I live at...", isSafe: false, consequence: "Real prizes don't cold-call asking for info. Classic scam - never respond." },
            { text: "This sounds like a scam - goodbye.", isSafe: true, consequence: "Exactly right. Real prizes don't phone kids demanding personal details." },
          ],
        },
        {
          setup: "\"Hello, this is the school office. We need to update your emergency contact details. Can you give us your parent's phone number?\"",
          choices: [
            { text: "It's 07712...", isSafe: false, consequence: "Even a 'real-sounding' caller could be fake. Always verify first." },
            { text: "I'll ask my parent to call you back", isSafe: true, consequence: "Smart! Verifying through parents is the right move, even if the caller seems legit." },
          ],
        },
        {
          setup: "\"Hey it's Jake! I got a new phone. What's your address? I want to come round to play!\"",
          choices: [
            { text: "Sure it's 42 Elm Street!", isSafe: false, consequence: "How do you know it's really Jake? Always verify identity - a new number is a red flag." },
            { text: "I'll ask my mum to call your mum", isSafe: true, consequence: "Perfect! Verifying through parents is the foolproof way." },
          ],
        },
      ],
    },

    // Screen 13: Shield Questions (SHIELD_QS → CyberMaze)
    {
      type: "cyberMaze",
      questions: [
        { question: "A stranger online asks where you live. You should...", answers: ["Ignore or block them", "Tell them your city only", "Give them your address", "Say just your postcode"], correctIndex: 0 },
        { question: "Your friend wants to post a photo of you online. You should...", answers: ["Make sure you're both happy with it first", "Let them post anything", "Ask them not to post anything ever", "Post a different one yourself"], correctIndex: 0 },
        { question: "A website asks for your real name to play a free game. You should...", answers: ["Use a nickname instead", "Type your full real name", "Use your parent's name", "Use your sibling's name"], correctIndex: 0 },
        { question: "You get an email saying you won a prize. You should...", answers: ["Tell a parent and don't click", "Click the link to claim it", "Forward it to friends", "Reply asking for proof"], correctIndex: 0 },
        { question: "Someone at school asks for your password to 'help you'. You should...", answers: ["Never share except with parents", "Share it, they're being nice", "Only share if they're your best friend", "Share just the first half"], correctIndex: 0 },
      ],
    },

    // Screen 14: Masterplan info
    {
      type: "info",
      title: "Hacker Raccoon's Masterplan - FAILED",
      content:
        "Hacker Raccoon thought he'd collect enough info to impersonate every kid. But thanks to Privacy Guardians like you, his plan crumbled. Six key pieces - not one of them obtained.",
      bullets: [
        "FULL NAMES: only first names shared",
        "HOME ADDRESSES: never publicly shared",
        "SCHOOLS: kept private",
        "PHONE NUMBERS: not a single digit leaked",
        "PASSWORDS: triple-locked",
        "IDENTIFYING PHOTOS: nothing useful shared",
      ],
    },

    // Screen 15: Boss Battle
    { type: "bossBattle" },

    // Screen 16: Completion
    { type: "completion" },
  ],

  // 30 boss questions - derived from VAULT_ATTACKS + expanded scenarios
  bossQuestions: {
    easy: [
      { question: "Which of these is PRIVATE information?", answers: ["Your home address", "Your favourite colour", "Your favourite game", "Your favourite animal"], correctIndex: 0, explanation: "Your home address could let strangers find you - always private" },
      { question: "Which is SAFE to share online?", answers: ["Your favourite colour", "Your full name", "Your home address", "Your phone number"], correctIndex: 0, explanation: "Preferences like favourite colours don't identify you or help strangers find you" },
      { question: "Should you share your phone number with a stranger?", answers: ["Never", "Yes if they're nice", "Only on their birthday", "Only in private chat"], correctIndex: 0, explanation: "Phone numbers let strangers contact you directly - never share" },
      { question: "Which is PRIVATE?", answers: ["Your school name", "Your favourite subject", "Your favourite teacher's nickname", "Your house colour"], correctIndex: 0, explanation: "Your school name tells strangers where you are every weekday - keep it private" },
      { question: "Who is allowed to know your password?", answers: ["Only you and your parents", "Your best friend", "Your whole class", "Anyone who asks nicely"], correctIndex: 0, explanation: "Passwords stay between you and your parents - nobody else, ever" },
      { question: "A picture of you in your school uniform is...", answers: ["Private", "Safe to post anywhere", "Only risky on Fridays", "Harmless"], correctIndex: 0, explanation: "Uniforms identify specific schools - keep photos of them private" },
      { question: "Which is SAFE to post?", answers: ["What you ate for lunch", "Your home address", "Your phone number", "Your school ID"], correctIndex: 0, explanation: "What you ate is a preference - it can't help a stranger find you" },
      { question: "Your exact birthday is...", answers: ["Private", "Always safe", "Only private on weekdays", "Only private if you're younger than 10"], correctIndex: 0, explanation: "Exact birthdays are used to verify identities - keep them private" },
      { question: "Your favourite YouTuber is...", answers: ["Safe to share", "Always private", "Only private online", "A security risk"], correctIndex: 0, explanation: "A preference is safe to share - it's not identifying info" },
      { question: "A pop-up asks for your home address for a 'free game.' You should...", answers: ["Close it - no real game needs your address", "Fill it in for the free game", "Give a fake address and still claim the game", "Ask them why they need it first"], correctIndex: 0, explanation: "No legitimate free game needs your home address - close the pop-up and tell a parent" },
    ],
    medium: [
      { question: "A website asks for your birthday to 'verify your age.' Is this safe?", answers: ["Check with a parent first", "Yes - it's just verification", "Only if the site has a lock icon", "Only if it's a school site"], correctIndex: 0, explanation: "Age verification can be a data-harvesting trick - always check with a parent before giving out your birthday" },
      { question: "Why is your school name considered PRIVATE?", answers: ["It helps strangers find where you are every weekday", "It's copyrighted", "Schools are all different", "Because it has letters"], correctIndex: 0, explanation: "Knowing your school gives a stranger a specific location and schedule - very risky" },
      { question: "A stranger online says 'I'm from your school too - what's your form room?' You should...", answers: ["Refuse and report them - real classmates can ask in person", "Tell them quickly", "Give them the wrong room on purpose", "Test them with a fake name"], correctIndex: 0, explanation: "Real classmates can ask you in person - online strangers claiming to be 'from your school' is a classic trick" },
      { question: "An app asks for permission to access your CAMERA, MICROPHONE, CONTACTS, and LOCATION - but it's a calculator. You should...", answers: ["Deny - a calculator doesn't need those", "Allow - the app must need them", "Allow only camera and mic", "Install a different calculator"], correctIndex: 0, explanation: "If an app's requested permissions don't match what it does, don't install it" },
      { question: "Photo metadata can include...", answers: ["GPS location where it was taken", "The photographer's mood", "Nothing important", "How many likes it will get"], correctIndex: 0, explanation: "Phone photos often embed GPS coordinates - be careful about posting them publicly" },
      { question: "Why are 'fun personality quizzes' sometimes risky?", answers: ["They ask for security-question answers like pet's name or birthday", "They're too hard", "They're boring", "They run too slowly"], correctIndex: 0, explanation: "Many quizzes are data-harvesting - the questions match account-recovery security questions" },
      { question: "A caller says they're from your internet company and asks for your parent's address. You should...", answers: ["Hang up and tell a parent", "Answer them - they sound official", "Give just your postcode", "Ask them for their employee ID first"], correctIndex: 0, explanation: "Real support companies don't cold-call kids asking for parent info. Hang up and tell an adult" },
      { question: "The safest way to share your age online is...", answers: ["\"I'm a kid\" or an age range", "Your full birthday", "Your year of birth", "Your star sign"], correctIndex: 0, explanation: "Vague age ranges don't identify you - exact birthdays do" },
      { question: "A 'free' online quiz at the end says 'give your full name, birthday, and pet's name for your result.' Why is this risky?", answers: ["These are common security-question answers", "The results aren't accurate anyway", "Quizzes are illegal", "Quizzes make websites slow"], correctIndex: 0, explanation: "That combo is exactly what hackers need to impersonate you or access accounts" },
      { question: "You see a classmate share a photo showing your school in the background. You should...", answers: ["Ask them to take it down", "Share it too", "Post more photos like it", "Tell them it's fine"], correctIndex: 0, explanation: "Even accidentally revealing your school can be dangerous - ask to have it removed" },
    ],
    hard: [
      { question: "Your friend posts a photo of you in your school uniform without asking. What should you do?", answers: ["Ask them to take it down and tell an adult if they don't", "Leave it - they're your friend", "Post an embarrassing photo of them back", "Share the same photo with more people"], correctIndex: 0, explanation: "Always ask a friend to remove photos that reveal private info about you - and tell an adult if they won't" },
      { question: "A quiz app wants access to your CONTACTS 'to find friends.' Why is this risky?", answers: ["It collects everyone's phone numbers - not just yours", "Contacts never work on apps", "It uses too much battery", "Nothing risky about it"], correctIndex: 0, explanation: "Contacts permissions collect data on everyone you know, not just you. Classic overreach" },
      { question: "A stranger messages saying they go to your school and knows your teacher's name. What's actually happening?", answers: ["They researched publicly available info to sound credible", "They must go to your school", "They must be a teacher", "Teacher names are secret so they're lying"], correctIndex: 0, explanation: "Teacher names are often on school websites. Scammers research to sound legitimate" },
      { question: "Your photo is posted on a public account. Later, you delete it. Can strangers still see it?", answers: ["Yes - screenshots and caches may already exist", "No - deleting removes it everywhere", "Only on leap years", "Only if they saved it first"], correctIndex: 0, explanation: "Anything public on the internet is essentially permanent - assume it can't be undone" },
      { question: "Someone in a game says they're a 'Roblox employee' and offers Robux for your account login. What's actually happening?", answers: ["It's a scam - real staff never ask for logins", "It's the real deal", "It works for VIP accounts only", "It's only a scam at weekends"], correctIndex: 0, explanation: "No game company employee ever asks for your password or login credentials" },
      { question: "Your school posts a class photo on their public social media. This is risky because...", answers: ["Strangers can identify students and the school from public posts", "Class photos drain batteries", "Photos are always bad", "Schools shouldn't have social media"], correctIndex: 0, explanation: "Public school posts can expose students to strangers - ask parents to check privacy settings with schools" },
      { question: "A 'support agent' video-calls saying they need to see your screen to fix something. What should you do?", answers: ["Refuse and get a parent - real support doesn't demand screen access to kids", "Share your screen", "Let them control your device briefly", "Give your password over video call"], correctIndex: 0, explanation: "Remote access gives someone complete control over your device - never give this to anyone without a parent present" },
      { question: "You accidentally tell an online 'friend' your school. You realise it's risky. What's the right move?", answers: ["Tell a trusted adult immediately - they can help", "Say nothing and hope for the best", "Block the friend and forget it", "Change schools"], correctIndex: 0, explanation: "Mistakes happen. The sooner a trusted adult knows, the faster things can be handled safely" },
      { question: "Why is posting 'home alone today!' particularly risky?", answers: ["It tells strangers your location AND your vulnerability at once", "It's a spoiler", "It's just a phrase", "Nothing risky"], correctIndex: 0, explanation: "Status posts about being alone are among the riskiest things - never share your availability publicly" },
      { question: "The single best rule of online privacy is...", answers: ["Share the minimum - ask if a stranger needs this to find me", "Share everything - they'll find it anyway", "Never go online", "Use emojis instead of words"], correctIndex: 0, explanation: "Default to less. Before you share, ask: 'Does this help a stranger identify or find me?' If yes, don't share" },
    ],
  },

  // Extracted from WEEK2_REACTIONS in characterReactions.ts - speaker's {mood, message};
  // the silent character = null so they use their idle pose.
  reactions: {
    0: { adam: { mood: "excited", message: "Welcome back, cadet! This week we're learning how to protect private info!" }, layla: null },
    1: { adam: null, layla: { mood: "curious", message: "New mission! Something online needs your help - let's go!" } },
    2: { adam: { mood: "thinking", message: "What counts as private information? Tap each tile to find out..." }, layla: null },
    3: { adam: null, layla: { mood: "curious", message: "Not everything online should be shared. Let's keep looking!" } },
    4: { adam: { mood: "worried", message: "Spot something risky on this poster - can you find all the dangers?" }, layla: null },
    5: { adam: null, layla: { mood: "thumbsup", message: "Nice work! You're becoming a privacy pro!" } },
    6: { adam: { mood: "thinking", message: "Think carefully - what should you share, and what should you keep secret?" }, layla: null },
    7: { adam: null, layla: { mood: "worried", message: "A stranger is chatting with you. Choose your answers carefully!" } },
    8: { adam: { mood: "thumbsup", message: "You handled that brilliantly! Safety first, always." }, layla: null },
    9: { adam: null, layla: { mood: "curious", message: "Let's explore what happens when private info gets out..." } },
    10: { adam: { mood: "worried", message: "Uh-oh - this post is sharing way too much. Can you fix it?" }, layla: null },
    11: { adam: null, layla: { mood: "thinking", message: "Time to test your knowledge with a quick quiz!" } },
    12: { adam: { mood: "excited", message: "You're almost a Privacy Guardian! Keep going!" }, layla: null },
    13: { adam: null, layla: { mood: "worried", message: "Careful - this message looks like a trick. Can you tell why?" } },
    14: { adam: { mood: "thumbsup", message: "Excellent detective work! You spotted the danger." }, layla: null },
    15: { adam: null, layla: { mood: "excited", message: "Final mission! Use everything you've learned." } },
    16: { adam: { mood: "thumbsup", message: "Amazing! You protected your private info like a true Guardian." }, layla: null },
  },
};
