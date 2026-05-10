import type { WeekContent } from "./types";

export const WEEK_5: WeekContent = {
  weekNumber: 5,
  title: "Cyberbullying: Stand Up, Speak Out",
  topic: "cyberbullying",
  badgeName: "Anti-Bully Champion",
  badgeIcon: "💪",

  introCutscene: [
    { text: "CYBER HEROES ACADEMY\nWEEK 5: CYBERBULLYING", bg: "normal", duration: 3000 },
    { character: "both", characterMood: "excited", text: "Welcome back, Cyber Hero. This week is about kindness - and standing up for it.", sound: "lessonStart", duration: 5000 },
    { character: "raccoon", characterMood: "idle", text: "\"Haha! Nobody likes you! Just logout already - you're terrible at this game!\"", bg: "danger", textColour: "#fca5a5", sound: "bossRoar", duration: 5500 },
    { character: "layla", characterMood: "worried", text: "The Hacker Raccoon is sending mean messages to kids to make them feel sad and small. That's cyberbullying.", bg: "danger", duration: 5500 },
    { character: "adam", characterMood: "thinking", text: "Cyberbullying is when someone uses the internet to hurt, tease, or embarrass someone else on purpose.", duration: 5500 },
    { character: "layla", characterMood: "excited", text: "The good news? WE can stop it. Together. Kids standing up for kids is the most powerful defence.", duration: 5500 },
    { character: "adam", characterMood: "thumbsup", text: "Today we learn: what cyberbullying looks like, how to help a friend, and how to speak out safely. Let's go!", sound: "select", duration: 5000 },
    { text: "STAND UP. SPEAK OUT. 💪", bg: "normal", sound: "confetti", duration: 2000 },
  ],

  screens: [
    { type: "video", videoPlaceholder: "Week 5: Cyberbullying intro video" },
    {
      type: "mission",
      objectives: [
        "Understand what cyberbullying is (and isn't)",
        "Know how to respond if you or a friend is targeted",
        "Learn how to be an upstander, not a bystander",
      ],
    },
    {
      type: "info",
      title: "What Is Cyberbullying?",
      content:
        "Cyberbullying is when someone uses the internet - games, chats, social media - to hurt another person ON PURPOSE, more than once, or in a way that feels really unfair. It's different from a one-off joke between friends.",
      bullets: [
        "Sending mean or nasty messages",
        "Leaving someone out of group chats on purpose",
        "Sharing embarrassing photos or videos of someone",
        "Making fake accounts to fool or hurt people",
        "Spreading rumours or lies online",
      ],
    },
    {
      type: "cyberScanner",
      items: [
        { text: "'You're so bad at this game, just uninstall.'", isStrong: false, explanation: "Mean and personal - cyberbullying" },
        { text: "'Good game! Well played!'", isStrong: true, explanation: "Positive sportsmanship - kindness" },
        { text: "Making a fake account to tease someone", isStrong: false, explanation: "Fake accounts to harm someone = cyberbullying" },
        { text: "Sharing a funny meme that everyone enjoys", isStrong: true, explanation: "Shared joy, not targeted - kindness" },
        { text: "Creating a group chat to exclude one kid", isStrong: false, explanation: "Intentional exclusion is a form of bullying" },
        { text: "Inviting a classmate to a party", isStrong: true, explanation: "Inclusive and kind" },
        { text: "Posting an embarrassing photo of a friend without asking", isStrong: false, explanation: "Sharing private photos without consent = cyberbullying" },
        { text: "Congratulating someone on their school project", isStrong: true, explanation: "Building others up - kindness" },
        { text: "Pile-on comments under someone's post calling them names", isStrong: false, explanation: "Piling on is cyberbullying even if you only add one comment" },
        { text: "Defending a friend who's being picked on", isStrong: true, explanation: "Being an upstander - kindness" },
      ],
    },
    {
      type: "info",
      title: "Joke vs. Bullying",
      content:
        "Not every mean-sounding comment is bullying. There's a real difference. Here's how to tell:",
      bullets: [
        "A joke: everyone (including the target) laughs and nobody feels bad",
        "Bullying: one person feels hurt, scared, or ashamed - and asks for it to stop",
        "A joke that keeps going when someone's asked you to stop = bullying",
        "Pattern matters - one-off argument vs. repeated targeting",
        "Power matters - a group ganging up on one person is never just a joke",
      ],
    },
    {
      type: "chooseYourPath",
      scenarios: [
        {
          setup: "Your friend shows you mean messages someone sent them. They look upset. What do you do?",
          choices: [
            { text: "Tell them to toughen up - it's just words", isSafe: false, consequence: "Words hurt. Your friend felt even more alone. Dismissing how someone feels makes cyberbullying worse." },
            { text: "Listen, save the messages as proof, and help them tell a trusted adult", isSafe: true, consequence: "You just became an upstander. Listening + saving proof + getting adult help is the gold-standard response." },
          ],
        },
        {
          setup: "A group chat starts making fun of a classmate who isn't in the chat. What do you do?",
          choices: [
            { text: "Laugh along - you don't want to be the next target", isSafe: false, consequence: "Silence looks like agreement. The pile-on grew. Later, you felt terrible about going along with it." },
            { text: "Leave the chat, speak up privately, and tell an adult", isSafe: true, consequence: "Exactly right. You don't have to battle it alone - leaving, reporting, and telling a trusted adult is powerful." },
          ],
        },
        {
          setup: "Someone created a fake account pretending to be you, posting embarrassing things. What do you do?",
          choices: [
            { text: "Try to get revenge by posting mean things back", isSafe: false, consequence: "Now you've made things worse and you could get in trouble too. Revenge never solves bullying." },
            { text: "Screenshot, report the fake account, and tell a parent + teacher", isSafe: true, consequence: "Perfect. Evidence + reporting + adult help is the path that actually gets fake accounts shut down." },
          ],
        },
        {
          setup: "You accidentally said something that hurt a friend online. They message you saying they're upset. What do you do?",
          choices: [
            { text: "Block them - they're overreacting", isSafe: false, consequence: "Blocking someone you hurt makes it worse. Friendships fall apart when apologies don't happen." },
            { text: "Apologise sincerely and ask how to make it right", isSafe: true, consequence: "Being a Cyber Hero means owning mistakes. Genuine apologies build stronger friendships." },
          ],
        },
      ],
    },
    {
      type: "memoryMatch",
      pairs: [
        { term: "Cyberbullying", match: "Using the internet to hurt someone on purpose", colour: "#ef4444" },
        { term: "Upstander", match: "Someone who speaks up for the person being hurt", colour: "#34d399" },
        { term: "Bystander", match: "Someone who sees bullying but stays silent", colour: "#f59e0b" },
        { term: "Block", match: "Stop someone contacting you on an app", colour: "#60a5fa" },
        { term: "Screenshot", match: "Saves evidence of mean messages", colour: "#a78bfa" },
        { term: "Trusted Adult", match: "Parent, teacher, coach - who can help", colour: "#fbbf24" },
      ],
    },
    {
      type: "info",
      title: "Save. Block. Report. Tell.",
      content:
        "If you or a friend is being cyberbullied, follow these four steps in order. This is how you take back control:",
      bullets: [
        "SAVE - screenshot mean messages as evidence (don't just delete)",
        "BLOCK - use the block button so they can't contact you",
        "REPORT - use the app/game's report feature to flag the behaviour",
        "TELL - a trusted adult: parent, teacher, older sibling, coach",
      ],
    },
    {
      type: "protectTheData",
      items: [
        { text: "Your home address", isPrivate: true },
        { text: "Favourite ice cream flavour", isPrivate: false },
        { text: "Passwords to any account", isPrivate: true },
        { text: "Your favourite book", isPrivate: false },
        { text: "Photos that could embarrass you", isPrivate: true },
        { text: "Your favourite colour", isPrivate: false },
        { text: "Your parent's work details", isPrivate: true },
        { text: "Hobby you enjoy", isPrivate: false },
        { text: "Your school schedule", isPrivate: true },
        { text: "Favourite cartoon", isPrivate: false },
        { text: "Your phone number", isPrivate: true },
        { text: "Favourite sport", isPrivate: false },
      ],
    },
    {
      type: "firewallBuilder",
      goodBlocks: [
        "Be kind online",
        "Screenshot mean messages",
        "Block bullies",
        "Report to the app",
        "Tell a trusted adult",
        "Support friends being bullied",
        "Check in on a quiet classmate",
        "Speak up against pile-ons",
      ],
      badBlocks: [
        "Join in to pile on",
        "Share embarrassing photos",
        "Spread rumours online",
        "Make fake accounts to hurt",
      ],
    },
    {
      type: "spamBlaster",
      emails: [
        { sender: "Mean Classmate", subject: "Everyone thinks you're weird", isPhishing: true, clue: "Targeted personal attack - cyberbullying" },
        { sender: "Nice Friend Ella", subject: "Wanna hang out after school?", isPhishing: false, clue: "" },
        { sender: "Anonymous", subject: "Nobody likes you. Go away.", isPhishing: true, clue: "Anonymous cruel messages = cyberbullying" },
        { sender: "Coach", subject: "Training Thursday at 4pm", isPhishing: false, clue: "" },
        { sender: "Group Chat Leader", subject: "You're not invited to the sleepover", isPhishing: true, clue: "Deliberate exclusion messaging is bullying" },
        { sender: "Mum", subject: "Remember to take your jumper, it's cold!", isPhishing: false, clue: "" },
        { sender: "Fake You", subject: "I'm you. I posted embarrassing things.", isPhishing: true, clue: "Fake accounts impersonating you = cyberbullying" },
        { sender: "Teacher", subject: "Nice work on your poster!", isPhishing: false, clue: "" },
        { sender: "Pile-On Crew", subject: "We're all laughing at you online", isPhishing: true, clue: "Coordinated group harassment = bullying" },
        { sender: "Best Friend Jay", subject: "Minecraft later?", isPhishing: false, clue: "" },
      ],
    },
    {
      type: "cyberMaze",
      questions: [
        { question: "What's the difference between a joke and bullying?", answers: ["A joke stops when asked; bullying continues", "Jokes are funnier", "Bullying is spelt differently", "There's no difference"], correctIndex: 0 },
        { question: "If you see someone being cyberbullied you should be a...", answers: ["Upstander - speak up safely", "Bystander - stay silent", "Critic", "Copy-paste"], correctIndex: 0 },
        { question: "First step if YOU are cyberbullied?", answers: ["Save (screenshot) evidence", "Fight back with your own mean words", "Hide forever", "Delete everything so there's no proof"], correctIndex: 0 },
        { question: "A 'pile-on' means...", answers: ["Many people ganging up online on one person", "Stacking books", "A group hug", "A winter coat"], correctIndex: 0 },
        { question: "Who should you tell first?", answers: ["A trusted adult", "The bully's parents directly", "Nobody", "An influencer"], correctIndex: 0 },
      ],
    },
    { type: "bossBattle" },
    { type: "completion" },
  ],

  bossQuestions: {
    easy: [
      { question: "What is cyberbullying?", answers: ["Using the internet to hurt someone on purpose", "Playing a game online", "Typing fast", "Posting a selfie"], correctIndex: 0, explanation: "Cyberbullying = using the internet to deliberately hurt or upset someone" },
      { question: "If someone sends you mean messages you should...", answers: ["Save, block, report, tell an adult", "Reply with meaner messages", "Pretend it didn't happen", "Change your username"], correctIndex: 0, explanation: "Save evidence, block them, report them, and tell a trusted adult" },
      { question: "An upstander is...", answers: ["Someone who stays standing", "Someone who speaks up for the person being hurt", "A type of chair", "A dance move"], correctIndex: 1, explanation: "Upstanders step up and help - they don't just watch" },
      { question: "A bystander is...", answers: ["Someone who sees bullying but stays silent", "A school subject", "A type of game", "A fast runner"], correctIndex: 0, explanation: "Bystanders see what's happening but don't help - silence enables bullying" },
      { question: "Your friend shows you mean DMs they're getting. You should...", answers: ["Tell them to toughen up", "Listen and help them get adult help", "Block them yourself", "Send mean messages back"], correctIndex: 1, explanation: "Listening and helping them get support is the best thing you can do" },
      { question: "Spreading rumours online is...", answers: ["Funny", "A form of cyberbullying", "OK if they're true", "Normal"], correctIndex: 1, explanation: "Rumours hurt real people - spreading them is bullying" },
      { question: "Making a fake account to tease someone is...", answers: ["A funny prank", "Cyberbullying - never OK", "Helping them", "Digital art"], correctIndex: 1, explanation: "Fake accounts used to hurt someone are cyberbullying, even if you think it's funny" },
      { question: "Should you screenshot mean messages before deleting?", answers: ["Yes - as evidence", "No - delete everything fast", "Only if they're very mean", "Never take screenshots"], correctIndex: 0, explanation: "Screenshots help adults and apps take action - always save evidence first" },
      { question: "Being left out of a group chat on purpose is...", answers: ["Exclusion - a form of bullying", "Random", "A digital privacy right", "A system error"], correctIndex: 0, explanation: "Intentional exclusion is a form of social cyberbullying" },
      { question: "If you accidentally hurt someone online you should...", answers: ["Apologise sincerely", "Pretend nothing happened", "Block them", "Double down"], correctIndex: 0, explanation: "Being a Cyber Hero means owning mistakes and making things right" },
    ],
    medium: [
      { question: "Which is the RIGHT order for responding to cyberbullying?", answers: ["Save → Block → Report → Tell", "Tell → Block → Save → Report", "Block → Tell → Save → Report", "Report → Save → Tell → Block"], correctIndex: 0, explanation: "Save evidence first, then block so it stops, then report, then tell a trusted adult" },
      { question: "Why is 'pile-on' harassment particularly harmful?", answers: ["It's not, one person's OK", "Many people attacking one person makes it impossible to escape", "It's good exercise", "It creates new friendships"], correctIndex: 1, explanation: "When a crowd targets one person, it overwhelms them - this is why joining in even briefly matters" },
      { question: "'Trolling' is when someone...", answers: ["Posts fishing photos", "Says deliberately mean or provocative things to upset people", "Fishes under a bridge", "Types very slowly"], correctIndex: 1, explanation: "Trolls post to get reactions - don't feed them, block and report instead" },
      { question: "What's the best response to a cyberbully's message?", answers: ["A clever comeback", "No response - block and report without engaging", "A long explanation", "Share it with everyone"], correctIndex: 1, explanation: "Don't give bullies the reaction they want - block and report instead" },
      { question: "Which is a sign someone may be being cyberbullied?", answers: ["They're suddenly quiet or upset after going online", "They play more video games", "They eat more snacks", "They say 'LOL' a lot"], correctIndex: 0, explanation: "Sudden mood changes after using devices can be a warning sign - check in on them" },
      { question: "What should you do if you're cyberbullied on a game?", answers: ["Use the in-game report tool AND tell an adult", "Leave the game forever", "Play it off in chat", "Nothing - it's just a game"], correctIndex: 0, explanation: "Games have report tools AND you should always tell a trusted adult" },
      { question: "'Doxxing' is when someone...", answers: ["Shares private info about you online to hurt you", "Draws a picture of you", "Adds you to a document", "Sends you homework"], correctIndex: 0, explanation: "Doxxing = sharing someone's personal info publicly to cause them harm - very serious" },
      { question: "A classmate makes a 'joke' account mocking another student. This is...", answers: ["A joke", "Cyberbullying - tell a teacher", "Free speech", "A trend"], correctIndex: 1, explanation: "Mock accounts that target specific people are bullying, even if the creator claims it's a joke" },
      { question: "If you're worried about a friend online you can...", answers: ["Ignore it, they'll work it out", "Check in with them privately and offer to help tell an adult", "Post about it publicly", "Spread what's happening"], correctIndex: 1, explanation: "Private check-ins help - public posts about it can make things worse" },
      { question: "Why is cyberbullying often harder than face-to-face bullying?", answers: ["It follows you home on your phone 24/7", "It's always funny", "It's less serious", "It doesn't exist"], correctIndex: 0, explanation: "Cyberbullying can reach kids anywhere, anytime - which is why adult help is so important" },
    ],
    hard: [
      { question: "What's the difference between 'bullying' and 'conflict'?", answers: ["Bullying is repeated, intentional, and involves a power imbalance; conflict is a one-off disagreement between equals", "Nothing - they're the same", "Bullying is online only", "Conflict is worse"], correctIndex: 0, explanation: "Bullying = pattern + intent + power imbalance. Conflict = equals having a one-off disagreement" },
      { question: "You're anonymous in a game and see someone typing mean things. Why is it tempting to join in?", answers: ["Anonymity reduces personal accountability - it's easier to be cruel when you feel invisible", "It's not tempting at all", "Because it's fun", "Because they deserve it"], correctIndex: 0, explanation: "The 'online disinhibition effect' - anonymity tricks people into being crueller than they'd ever be face-to-face" },
      { question: "A friend tells you someone is cyberbullying them but begs you not to tell an adult. What do you do?", answers: ["Keep the secret to protect the friendship", "Explain that this is too serious and help them tell an adult together", "Confront the bully yourself", "Block the bully on their behalf"], correctIndex: 1, explanation: "Some secrets are too big for kids to carry alone. A real friend helps get adult help, together" },
      { question: "The term 'cancel culture' is often confused with bullying because...", answers: ["Criticising someone's actions is different from targeting them as a person, but both can snowball online", "They're identical", "It's not confused at all", "Cancel culture isn't real"], correctIndex: 0, explanation: "Accountability is healthy; pile-on harassment isn't. Watch for pattern + cruelty + targeting" },
      { question: "Deepfakes can be used for cyberbullying by...", answers: ["Creating fake images or videos of someone doing or saying things they never did", "Helping people swim underwater", "Improving selfies", "Nothing - deepfakes aren't real yet"], correctIndex: 0, explanation: "AI deepfakes can create believable fake content - this is a growing form of serious cyberbullying" },
      { question: "If a bullying account keeps coming back after you report it, you should...", answers: ["Keep reporting each new account AND document patterns so adults can escalate", "Give up - the app won't help", "Make your own accounts back", "Move countries"], correctIndex: 0, explanation: "Repeated targeting is serious - patterns + documentation help police or platforms take larger action" },
      { question: "'Online disinhibition effect' means...", answers: ["People act more extreme online than face-to-face because they feel anonymous and distant", "Wifi runs faster at night", "Internet makes you tired", "People type slower online"], correctIndex: 0, explanation: "The distance of the screen can make both kindness AND cruelty more extreme - know the effect and counter it" },
      { question: "Why is screenshotting bullying evidence BEFORE blocking important?", answers: ["Once you block, some apps hide conversation history - you lose proof", "It's not important", "Screenshots count as credit", "It's quicker"], correctIndex: 0, explanation: "Platforms need evidence to act. Block AFTER you've saved what was said" },
      { question: "A classmate experiences bullying but the bully is a 'popular' kid. Why is this harder?", answers: ["Power imbalance makes it risky to speak up - which is exactly why you need adult help", "It's not harder", "Popular kids can't bully", "Popular kids always get in trouble anyway"], correctIndex: 0, explanation: "Social power makes bullying harder to confront alone - that's why trusted adults matter so much" },
      { question: "The single most powerful response to cyberbullying a whole community can take is...", answers: ["Creating a culture where bystanders become upstanders - small kindnesses from many people", "Turning off the internet", "Calling lawyers", "Banning all games"], correctIndex: 0, explanation: "Research shows: when many peers speak up (even briefly), bullying drops dramatically. Every small upstander moment matters" },
    ],
  },

  reactions: {
    0: { adam: { mood: "excited", message: "Week 5 - this one matters a lot." }, layla: null },
    1: { adam: null, layla: { mood: "curious", message: "Let's learn how to stop cyberbullying together." } },
    2: { adam: { mood: "thinking", message: "Cyberbullying: repeated, intentional, hurtful." }, layla: null },
    3: { adam: null, layla: { mood: "excited", message: "Spot the kindness vs the cruelty!" } },
    4: { adam: { mood: "thinking", message: "A joke stops when asked. Bullying doesn't." }, layla: null },
    5: { adam: null, layla: { mood: "thumbsup", message: "Standing up for others is what Cyber Heroes do." } },
    6: { adam: { mood: "curious", message: "Match the cyberbullying terms!" }, layla: null },
    7: { adam: null, layla: { mood: "thumbsup", message: "Save. Block. Report. Tell. Memorise it!" } },
    8: { adam: { mood: "excited", message: "Private info stays private - even from bullies." }, layla: null },
    9: { adam: null, layla: { mood: "excited", message: "Build the kindness firewall!" } },
    10: { adam: { mood: "worried", message: "Spot the mean messages and block them." }, layla: null },
    11: { adam: null, layla: { mood: "thinking", message: "Answer each gate about kindness." } },
    12: { adam: { mood: "excited", message: "Boss battle! Let's beat the meanness." }, layla: null },
    13: { adam: null, layla: { mood: "thumbsup", message: "Anti-Bully Champion unlocked. Keep standing up." } },
  },
};
