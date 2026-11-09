"use client";

import { CopyPasteLab, MouseLab, SaveFindLab, TypeTasksLab, TypingLab, WindowsLab } from "../learn/basics";
import type { LabProps, ModuleManifest } from "../learn/types";

/* Module 0: Your computer, your way. For someone who has mostly used a
 * phone. The owner kept this module on purpose (2026-11-09: "Mouse and
 * keyboard, yeah, absolutely"). Skippable for anyone who already uses a
 * computer, as the course map says.
 *
 * House copy rules: UK English (UK keyboard: @ is Shift and the key with
 * ' on it), plain words, no em-dashes, balanced quiz options. */

function KeyboardLab(p: LabProps) {
  return (
    <TypeTasksLab
      {...p}
      tasks={[
        { prompt: "Type your first name, starting with a capital letter. Hold Shift while you press the first letter.", hint: "For example: Dave. Hold Shift, press D, let go, then type the rest.", ok: (v) => /^[A-Z][a-z'-]+$/.test(v.trim()) },
        { prompt: "This word has a typo: an extra o. Click at the very end of the word, then press Backspace once, so it says Hello.", start: "Helloo", hint: "Backspace deletes the letter to the left of the flashing line.", ok: (v) => v === "Hello" },
        { prompt: "Type this email address exactly: dave.morris@northfield.co.uk", hint: "For the @, hold Shift and press the key with ' and @ on it, next to Enter on most UK keyboards.", ok: (v) => v.trim().toLowerCase() === "dave.morris@northfield.co.uk" },
        { prompt: "Type this phone number, with the spaces: 01632 960 418", hint: "The space bar is the long key at the bottom.", ok: (v) => v.trim() === "01632 960 418" },
      ]}
    />
  );
}

const m0: ModuleManifest = {
  id: "m0",
  number: 0,
  title: "Your computer, your way",
  intro: "If you have mostly used a phone, a computer can feel awkward at first. In six short lessons you will get comfortable with the mouse, the keyboard, windows, copy and paste, saving files and typing. Already use a computer every day? You can skip this module.",
  outcomes: [
    "Click, double-click and drag with a mouse",
    "Use the keys that matter, including capitals and @",
    "Open, switch between and close windows",
    "Copy, paste and undo",
    "Save a file where you can find it again",
    "Know your typing speed and how to improve it",
  ],
  topics: [
    {
      id: "m0t1",
      title: "The mouse: click, double-click, drag",
      minutes: 7,
      brief: "The mouse moves the arrow on the screen, and its buttons do the pressing. In this lesson you will learn the three moves you will use all day.",
      learn: [
        {
          heading: "Holding the mouse",
          body: [
            "Rest your hand on the mouse with your first finger on the left button. Slide it on the desk and the arrow on the screen moves with it.",
            "Run out of room? Lift the mouse, put it back in the middle, and carry on. The arrow stays where it was.",
          ],
          tip: "On a laptop, the flat pad below the keys works the same way. Slide one finger to move, tap to click.",
        },
        {
          heading: "Click",
          body: ["A click is one quick press of the left button. It is how you press buttons and choose things, like a tap on your phone."],
          good: [{ text: "Point at the button, then one press of the left button." }],
        },
        {
          heading: "Double-click",
          body: ["A double-click is two quick clicks without moving the mouse. It opens files and folders.", "One click just selects them, which is why sometimes \"nothing happens\"."],
          tip: "If double-clicking is hard at first, click once to select, then press Enter. It does the same thing.",
        },
        {
          heading: "Drag, and the right button",
          body: [
            "To drag, press and hold the left button on something, move the mouse, then let go. You use it to move files into folders.",
            "The right button opens a short menu of things you can do, like Copy and Paste. If you are stuck, a right-click often shows you the way.",
          ],
        },
      ],
      tryIt: { title: "Click, double-click and drag", intro: "Three quick parts. Take your time: there is no clock.", Lab: MouseLab },
      check: [
        {
          q: "You click a folder once and nothing opens. Why?",
          options: ["The folder is broken", "One click only selects it", "The mouse needs charging"],
          answer: 1,
          reasons: ["Nothing is wrong with it. It just needs opening.", "Selecting is one click. Opening is a double-click, or a click then Enter.", "If the arrow moves, the mouse is working fine."],
        },
        {
          q: "The mouse reaches the edge of the mouse mat. What do you do?",
          options: ["Lift it and put it back in the middle", "Push the mouse mat further across", "Shake the mouse to reset the arrow"],
          answer: 0,
          reasons: ["The arrow stays put while the mouse is lifted.", "You would run out of desk soon after.", "Shaking it only moves the arrow about."],
        },
        {
          q: "Which button opens a menu of things you can do?",
          options: ["The left button, pressed once", "The left button, held down", "The right button"],
          answer: 2,
          reasons: ["One left click presses or selects.", "Holding the left button down is for dragging.", "A right-click shows options like Copy and Paste."],
        },
      ],
      takeaways: ["One click to press or select.", "Double-click to open.", "Press, hold and move to drag. Right-click for a menu."],
    },
    {
      id: "m0t2",
      title: "The keyboard and the keys that matter",
      minutes: 8,
      brief: "A computer keyboard has more keys than your phone shows, but you only need a handful of them. In this lesson you will meet them and use them.",
      learn: [
        {
          heading: "Capital letters: Shift",
          body: ["Hold Shift (the key with an up arrow) while you press a letter to get a capital. Let go and the next letters are small again.", "Shift also gives you the top symbol on keys with two, like ! or ?."],
          tip: "Caps Lock makes every letter a capital until you press it again. If everything you type is in capitals, check it is off.",
        },
        {
          heading: "Enter, Backspace and Delete",
          body: [
            "Enter starts a new line in an email, or says \"go\" in a box.",
            "Backspace deletes the letter to the left of the flashing line. Delete removes the one to the right.",
          ],
        },
        {
          heading: "The @ sign and the space bar",
          body: [
            "Every email address has an @. On most UK keyboards, hold Shift and press the key with ' and @ on it, next to Enter.",
            "The long key at the bottom is the space bar. One press for one space.",
          ],
          good: [{ text: "dave.morris@northfield.co.uk" }],
        },
        {
          heading: "Tab and the arrow keys",
          body: ["Tab jumps to the next box on a form, so you do not need the mouse. The arrow keys move the flashing line left, right, up and down."],
        },
      ],
      tryIt: { title: "Use the keys", intro: "Four short typing tasks. The box turns green when it is right.", Lab: KeyboardLab },
      check: [
        {
          q: "How do you type one capital letter?",
          options: ["Press Caps Lock, then the letter", "Hold Shift and press the letter", "Press the letter twice"],
          answer: 1,
          reasons: ["Caps Lock leaves every letter after it in capitals, until you turn it off.", "Shift gives one capital, then you are back to small letters.", "That just types the letter twice."],
        },
        {
          q: "You typed \"Thanx\". Which key removes the x?",
          options: ["Enter", "Space bar", "Backspace"],
          answer: 2,
          reasons: ["Enter starts a new line.", "Space adds a space.", "Backspace deletes the letter to the left of the flashing line."],
        },
        {
          q: "Where is @ on most UK keyboards?",
          options: ["Shift and the ' key, near Enter", "Shift and the number 2, at the top", "On its own key, by the space bar"],
          answer: 0,
          reasons: ["That is the UK layout.", "That is where it is on American keyboards, so it trips people up.", "There is no @ key of its own on a UK keyboard."],
        },
      ],
      takeaways: ["Shift for one capital, Caps Lock for all of them.", "Backspace deletes to the left.", "@ is Shift and the ' key on a UK keyboard."],
    },
    {
      id: "m0t3",
      title: "Windows: open, close, switch",
      minutes: 7,
      brief: "Every program opens in its own window, and you will often have several open at once. In this lesson you will learn to move between them.",
      learn: [
        {
          heading: "The taskbar",
          body: ["The strip along the bottom of the screen is the taskbar. It shows your programs. Click one to open it, or to bring it to the front."],
        },
        {
          heading: "The three buttons at the top right",
          body: ["Every window has three small buttons in its top right corner."],
          good: [
            { text: "Line: minimise", note: "Hides the window. It is still open: click it on the taskbar to bring it back." },
            { text: "Square: maximise", note: "Makes the window fill the screen. Click again to shrink it back." },
            { text: "X: close", note: "Closes the window. If you had not saved, it asks first." },
          ],
        },
        {
          heading: "Switching between windows",
          body: ["Click a program on the taskbar to jump to it. Or click any part of a window you can see to bring it to the front."],
          tip: "On the keyboard, hold Alt and press Tab to flip between open windows.",
        },
        {
          heading: "Minimise is not close",
          body: ["A minimised window is only hidden. A closed one is gone until you open it again. If something disappears, look on the taskbar before you panic."],
        },
      ],
      tryIt: { title: "Work the windows", intro: "Follow each step on the pretend desktop below.", Lab: WindowsLab },
      check: [
        {
          q: "You minimised Excel. Where has it gone?",
          options: ["It has been closed and lost", "It is on the taskbar, still open", "It has moved to the desktop"],
          answer: 1,
          reasons: ["Minimise only hides it. Nothing is lost.", "Click it on the taskbar to bring it back.", "It is not on the desktop, just tucked away on the taskbar."],
        },
        {
          q: "Which button makes a window fill the whole screen?",
          options: ["The X", "The line", "The square"],
          answer: 2,
          reasons: ["The X closes the window.", "The line hides it.", "The square maximises it."],
        },
        {
          q: "Outlook is behind Excel. How do you get to it?",
          options: ["Click Outlook on the taskbar", "Close Excel first, then look for it", "Restart the computer and open it"],
          answer: 0,
          reasons: ["The taskbar brings any open program to the front.", "There is no need to close anything.", "Far too much: one click does it."],
        },
      ],
      takeaways: ["The taskbar shows your programs: click to open or switch.", "Line hides, square fills the screen, X closes.", "Minimised is still open. Look on the taskbar."],
    },
    {
      id: "m0t4",
      title: "Copy, paste and undo",
      minutes: 7,
      brief: "Copy and paste saves typing and stops typos. Undo takes back a mistake. In this lesson you will use all three, the keyboard way and the mouse way.",
      learn: [
        {
          heading: "Select first",
          body: ["Before you can copy something, select it. Press and hold just before the first word, drag to the end, and let go. It turns blue."],
          tip: "Double-click a single word to select just that word.",
        },
        {
          heading: "Copy and paste",
          body: ["Copy: hold Ctrl and press C. Then click where you want it, and paste: hold Ctrl and press V.", "Prefer the mouse? Right-click the selected words and choose Copy, then right-click where you want them and choose Paste."],
          good: [{ text: "Ctrl + C to copy" }, { text: "Ctrl + V to paste" }],
        },
        {
          heading: "Undo: your safety net",
          body: ["Made a mistake? Hold Ctrl and press Z. It takes back your last change. Press it again to go back further."],
          good: [{ text: "Ctrl + Z to undo" }],
          tip: "Undo works in almost every program: email, Excel, Word. When something goes wrong, try Ctrl + Z first.",
        },
        {
          heading: "Why it matters at work",
          body: ["Order numbers, email addresses and phone numbers are easy to mistype. Copy them from where they already are, and they come out exactly right."],
        },
      ],
      tryIt: { title: "Copy, paste, then undo", intro: "Two short parts. You can use the keyboard or the right-click menu.", Lab: CopyPasteLab },
      check: [
        {
          q: "Which keys copy what you have selected?",
          options: ["Ctrl and V", "Ctrl and C", "Ctrl and Z"],
          answer: 1,
          reasons: ["Ctrl and V pastes.", "C for copy.", "Ctrl and Z undoes."],
        },
        {
          q: "You deleted a whole paragraph by mistake. What do you try first?",
          options: ["Type it all again", "Close without saving", "Ctrl and Z"],
          answer: 2,
          reasons: ["Undo would bring it back in a second.", "You might lose everything else you did too.", "Undo takes back the last change."],
        },
        {
          q: "Why copy an order number instead of typing it?",
          options: ["It comes out exactly right", "Typing it is not allowed", "It makes the email shorter"],
          answer: 0,
          reasons: ["No typos, so the right order gets checked.", "Typing is fine, it is just easier to get wrong.", "It is the same length either way."],
        },
      ],
      takeaways: ["Select first, then Ctrl + C to copy and Ctrl + V to paste.", "Right-click works too.", "Ctrl + Z undoes your last change."],
    },
    {
      id: "m0t5",
      title: "Saving and finding a file",
      minutes: 8,
      brief: "Work is only useful if you can find it again. In this lesson you will save a file in the right folder with a clear name, then find another one.",
      learn: [
        {
          heading: "Files and folders",
          body: ["A file is one piece of work: a timesheet, an invoice, a letter. A folder holds files, like a drawer in a filing cabinet. Folders can hold other folders."],
        },
        {
          heading: "Save As",
          body: ["The first time you save something new, the computer asks where to put it and what to call it. That is the Save As box.", "Pick the folder first, then type the name, then press Save."],
          tip: "Ctrl + S saves your work. Press it often, so a crash never costs you more than a minute.",
        },
        {
          heading: "A name you can find again",
          body: ["Say what it is and when. Leave the computer's own name, like Book1 or Document3, and you will never find it again."],
          good: [{ text: "Timesheet 14-11-2026" }, { text: "Invoice 4417 Brightline" }],
          bad: [{ text: "Book1" }, { text: "new new FINAL (2)" }],
        },
        {
          heading: "Finding it later",
          body: ["Open File Explorer, the yellow folder on the taskbar. Double-click folders to look inside. Or type part of the name in the search box at the top."],
        },
      ],
      tryIt: { title: "Save it, then find one", intro: "Save a timesheet in the right place, then find an invoice when your manager asks for it.", Lab: SaveFindLab },
      check: [
        {
          q: "Which file name will you find most easily next month?",
          options: ["Book1", "Timesheet 14-11-2026", "new new FINAL (2)"],
          answer: 1,
          reasons: ["Every new spreadsheet starts as Book1, so you will have lots of them.", "Says what it is and when.", "Says nothing about what it is or when, and \"final\" rarely is."],
        },
        {
          q: "What does Ctrl and S do?",
          options: ["Saves your work", "Sends an email", "Starts a search"],
          answer: 0,
          reasons: ["Press it often to keep your work safe.", "Sending is a separate button in your email program.", "Search has its own box. Ctrl and S is save."],
        },
        {
          q: "In the Save As box, what should you do first?",
          options: ["Press Save straight away", "Close it and hope", "Choose the right folder"],
          answer: 2,
          reasons: ["It would land wherever the computer chose, with its own name.", "Then nothing is saved at all.", "Pick the folder, then the name, then Save."],
        },
      ],
      takeaways: ["Folders are drawers, files are the papers inside.", "Choose the folder, then a clear name, then Save.", "Ctrl + S often. Names say what and when."],
    },
    {
      id: "m0t6",
      title: "Typing practice",
      minutes: 8,
      brief: "Most office jobs ask for steady typing. In this lesson you will type three real work sentences and see your speed and accuracy.",
      learn: [
        {
          heading: "Sit comfortably",
          body: ["Sit up with your feet flat and the screen at eye level. Rest your wrists lightly. Look at the screen, not your fingers, as much as you can."],
        },
        {
          heading: "Home keys",
          body: ["Rest your left fingers on A S D F and your right fingers on J K L ;. The F and J keys have a small bump so you can find them without looking.", "Each finger reaches for the keys nearest it, then comes back home."],
        },
        {
          heading: "Accuracy first, then speed",
          body: ["Mistakes cost more time than slow typing, because you have to find and fix them. Get it right, and speed comes with practice."],
          tip: "Ten minutes a day is worth more than an hour once a week.",
        },
        {
          heading: "What employers look for",
          body: ["Many admin jobs ask for about 30 to 40 words a minute, and some agencies give a short typing test. Most people get there in a few weeks of regular practice."],
        },
      ],
      tryIt: { title: "Type three work sentences", intro: "Type each sentence exactly, then press Enter. Your speed and accuracy show at the end.", Lab: TypingLab },
      check: [
        {
          q: "What matters most when you are learning to type?",
          options: ["Typing as fast as you can", "Getting it right", "Looking at your fingers"],
          answer: 1,
          reasons: ["Speed with mistakes means fixing them afterwards, which is slower.", "Accuracy first. Speed follows with practice.", "Try to look at the screen. It feels slow at first but pays off."],
        },
        {
          q: "Where do your fingers rest?",
          options: ["On the home keys: A S D F and J K L ;", "On the space bar, thumbs on the edge", "Anywhere comfortable, it does not matter"],
          answer: 0,
          reasons: ["The bumps on F and J help you find them without looking.", "Only your thumbs rest on the space bar.", "Home keys give every finger a short reach."],
        },
        {
          q: "What is a good way to improve your typing?",
          options: ["One long session a month", "Only typing when you have to", "A few minutes every day"],
          answer: 2,
          reasons: ["Long gaps let the habit fade.", "Practice outside work is what builds the speed.", "Little and often builds speed fastest."],
        },
      ],
      takeaways: ["Fingers on the home keys, eyes on the screen.", "Accuracy first, then speed.", "A few minutes a day gets most people to 30 to 40 words a minute."],
    },
  ],
};

export default m0;
