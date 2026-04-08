"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const DotLottieReact = dynamic(
  () => import("@lottiefiles/dotlottie-react").then((m) => ({ default: m.DotLottieReact })),
  { ssr: false }
);

// ─── DATA ────────────────────────────────────────────────────────────────────

const PASSWORDS_8 = [
  { id:"q1", text:"Tr0phy$tar99",  isStrong:true,  bg:"#dbeafe", border:"#60a5fa", color:"#1e40af" },
  { id:"q2", text:"MyD0g&Runs!",   isStrong:true,  bg:"#ede9fe", border:"#a78bfa", color:"#5b21b6" },
  { id:"q3", text:"C@tLov3r2024",  isStrong:true,  bg:"#fce7f3", border:"#f9a8d4", color:"#9d174d" },
  { id:"q4", text:"Sup3r$h!eld7",  isStrong:true,  bg:"#dcfce7", border:"#4ade80", color:"#166534" },
  { id:"q5", text:"password",      isStrong:false, bg:"#ffedd5", border:"#fdba74", color:"#9a3412" },
  { id:"q6", text:"123456",        isStrong:false, bg:"#fee2e2", border:"#fca5a5", color:"#991b1b" },
  { id:"q7", text:"abcabc",        isStrong:false, bg:"#fef9c3", border:"#fde047", color:"#713f12" },
  { id:"q8", text:"iloveyou",      isStrong:false, bg:"#fdf4ff", border:"#d8b4fe", color:"#6b21a8" },
];

const GB_EXAMPLES = [
  { pw:"password",      isGood:false, why:"It's the #1 most-guessed password in the world! Hackers try it first 😱" },
  { pw:"123456",        isGood:false, why:"Just counting up — a hacker can crack this in under a second! 🙈" },
  { pw:"Tr0phy$tar99",  isGood:true,  why:"Capital letter + mixed letters + number + symbol = fortress! 💪" },
  { pw:"iloveyou",      isGood:false, why:"Too many people use this — it's on every hacker's list! 🚫" },
  { pw:"MyD0g&Runs!",   isGood:true,  why:"Easy to remember but almost impossible to guess. Perfect! 🌟" },
  { pw:"Sup3r$h!eld7",  isGood:true,  why:"Long, mixed, and super strong — this one is a fortress! 🏰" },
];

const RECIPE = [
  { label:"UPPERCASE letters", example:"A, B, C…", icon:"🅰️",  color:"#3b82f6" },
  { label:"lowercase letters",  example:"a, b, c…", icon:"🔡",  color:"#8b5cf6" },
  { label:"Numbers",            example:"1, 2, 3…", icon:"🔢",  color:"#ec4899" },
  { label:"Special symbols",    example:"@ # $ !",  icon:"✨",  color:"#f59e0b" },
  { label:"Make it LONG",       example:"8+ chars", icon:"📏",  color:"#10b981" },
];

const BUILDER_OPTIONS = [
  ["A","B","C","D","E","F","G","H"],
  ["cat","dog","sun","star","moon","fish","bird","hero"],
  ["1","7","3","9","42","99","007","2024"],
  ["@","#","$","!","&","*","?","%"],
];
const BUILDER_LABELS = ["A CAPITAL LETTER","A SECRET WORD","A NUMBER","A SYMBOL"];

const WHY_SCENARIOS = [
  { emoji:"🎮", bad:"Oh no! A hacker got into your game account — all your coins are GONE! 😢", good:"With a strong password your game account stays LOCKED and safe! 🔒✨" },
  { emoji:"📸", bad:"A stranger is looking at ALL your private photos! 😱",                    good:"A strong password keeps your photos private and yours alone! 🔒✨" },
  { emoji:"💬", bad:"Someone is reading all your secret messages! 😨",                         good:"A strong password keeps every message safe and secret! 🔒✨" },
];

const RULES = [
  { icon:"🤫", title:"NEVER share your password",           desc:"Not even with your best friend — it's YOUR secret." },
  { icon:"🔑", title:"Use DIFFERENT passwords everywhere",   desc:"One password per app and website. Never reuse!" },
  { icon:"🚫", title:"Never use your real name or birthday", desc:"Hackers try names and birthdays first!" },
  { icon:"📏", title:"Make it at least 8 characters",        desc:"The longer the password, the harder to crack." },
  { icon:"👨‍👩‍👧", title:"Tell a grown-up if something feels wrong", desc:"Always tell a trusted adult if you're worried online." },
];

const RULES_QUIZ = [
  { ruleIdx:0, opts:[RULES[0].title,"Use the same password for everything","Write it on sticky notes"], correct:0 },
  { ruleIdx:2, opts:["Use your pet's name","Your favourite colour","Never use your real name or birthday!"], correct:2 },
  { ruleIdx:4, opts:["Tell your classmates","Keep quiet and say nothing","Tell a grown-up if something feels wrong"], correct:2 },
];

const PHISH = [
  { bg:"#fefce8", border:"#fde047", title:"🎉 YOU WON AN iPHONE!", text:"Click here and enter your password to claim your prize NOW!", isScam:true,  reason:"Real prizes NEVER need your password. This is a fake trick to steal it!" },
  { bg:"#fff1f2", border:"#fca5a5", title:"⚠️ URGENT: Account Hacked!",   text:"Enter your password RIGHT NOW to stop the hacker before it's too late!", isScam:true,  reason:"Real websites never send scary pop-ups asking for your password!" },
  { bg:"#eff6ff", border:"#93c5fd", title:"💬 Sam sent you a message!",    text:"\"Hey! Did you see this funny video? 😂\"",                              isScam:false, reason:"This looks like a normal message — no password needed! But always check it's really from your friend." },
];

const WYD = [
  { emoji:"🎮", situation:"Your friend asks for your game password to help you level up",  opts:["Share it 🤝","Politely say no 🙅","Tell a grown-up 👨‍👩‍👧"], correct:1, why:"Passwords are private — even from best friends! A true friend will understand." },
  { emoji:"📝", situation:"You find your password written on a sticky note in class",       opts:["Leave it there 🤷","Throw it away safely 🗑️","Show everyone 👀"],     correct:1, why:"Written passwords can be found by anyone! Keep them in your memory." },
  { emoji:"🌐", situation:"A website asks you to create a new password",                    opts:["Use 'password123' 😴","Use your birthday 🎂","Create a strong one! 💪"],correct:2, why:"Always make a strong password with letters, numbers, and symbols!" },
  { emoji:"😨", situation:"You think someone else knows your password",                     opts:["Ignore it 🙈","Change it right away! 🔄","Use the same one 🤷"],       correct:1, why:"Change your password IMMEDIATELY if you think someone knows it!" },
];

const TYPING_PWS = ["Tr0phy$tar","C@tLov3r2!","Sup3r$afe!"];

const DECODE_PHRASE = "STAY SAFE";
const DECODE_ENCODED = Array.from(DECODE_PHRASE).map(c => c === " " ? null : c.charCodeAt(0) - 64);

const BOSS_QUIZ = [
  { q:"What makes a password STRONG?",                  opts:["Your pet's name","Mix of letters, numbers & symbols 💪","Just numbers","Your birthday"],   correct:1 },
  { q:"Should you share your password with friends?",    opts:["Yes always!","Only best friends","No, NEVER! 🙅","Only on weekends"],                      correct:2 },
  { q:"Which is the STRONGEST password?",                opts:["password123","abcabc","R@inb0w$2024! 🌈","111111"],                                        correct:2 },
  { q:"Someone online asks for your password…",          opts:["Give it if they seem nice","Never give it! 🚫","Give a hint","Ask a friend first"],        correct:1 },
  { q:"How long should a good password be?",             opts:["3 characters","5 characters","At least 8 characters! 📏","1 character"],                   correct:2 },
  { q:"Which of these is a BAD password?",               opts:["Tr0phy$tar99","C@tLov3r!","123456 ❌","Sup3r$tar"],                                        correct:2 },
  { q:"You think someone knows your password. You…",     opts:["Ignore it","Change it immediately! 🔄","Tell nobody","Use the same one"],                  correct:1 },
  { q:"Should you use the same password everywhere?",    opts:["Yes, it's easier!","No, use different ones! 🔑","Only for games","Only for school"],       correct:1 },
  { q:"What is 'phishing'?",                             opts:["A fun sport 🎣","A trick to steal passwords!","A computer game","A type of fish"],         correct:1 },
  { q:"If something feels wrong online, you tell…",      opts:["Nobody","Your pet 🐱","A trusted grown-up! 👨‍👩‍👧","The internet"],                             correct:2 },
];

const ACHIEVEMENTS = [
  "You know what a password IS",
  "You know WHY passwords are important",
  "You can build a STRONG password",
  "You can spot WEAK passwords",
  "You know the 5 Password Rules",
  "You can spot PHISHING scams",
  "You know what to do in tricky situations",
];

const OPTION_COLORS = [
  { bg:"#dbeafe", border:"#60a5fa", color:"#1e40af" },
  { bg:"#ede9fe", border:"#a78bfa", color:"#5b21b6" },
  { bg:"#fce7f3", border:"#f9a8d4", color:"#9d174d" },
  { bg:"#fef9c3", border:"#fde047", color:"#713f12" },
];

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const GRAD   = "linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)";
const SPRING = "cubic-bezier(0.34,1.56,0.64,1)";
const TOTAL  = 15;

// ─── CSS ─────────────────────────────────────────────────────────────────────

const CSS = `
  @keyframes bobble   {0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-14px) rotate(2deg)}}
  @keyframes floatUp  {0%,100%{transform:translateY(0)}50%{transform:translateY(-18px)}}
  @keyframes popIn    {0%{opacity:0;transform:scale(0.4) rotate(-8deg)}70%{transform:scale(1.1) rotate(2deg)}100%{opacity:1;transform:scale(1) rotate(0)}}
  @keyframes slideInR {from{opacity:0;transform:translateX(70px) scale(0.97)}to{opacity:1;transform:translateX(0) scale(1)}}
  @keyframes slideOutL{from{opacity:1;transform:translateX(0) scale(1)}to{opacity:0;transform:translateX(-70px) scale(0.97)}}
  @keyframes slideUp  {from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
  @keyframes shake    {0%,100%{transform:translateX(0) rotate(0)}20%{transform:translateX(-10px) rotate(-4deg)}40%{transform:translateX(10px) rotate(4deg)}60%{transform:translateX(-7px) rotate(-2deg)}80%{transform:translateX(7px) rotate(2deg)}}
  @keyframes celebrate{0%{transform:scale(1)}30%{transform:scale(1.25) rotate(-5deg)}60%{transform:scale(1.2) rotate(5deg)}100%{transform:scale(1) rotate(0)}}
  @keyframes sparkOut {0%{opacity:1;transform:rotate(var(--r)) translateX(0) scale(1)}100%{opacity:0;transform:rotate(var(--r)) translateX(52px) scale(0.4)}}
  @keyframes confetti {0%{transform:translateY(-20px) rotate(0deg);opacity:1}100%{transform:translateY(110vh) rotate(720deg);opacity:0}}
  @keyframes bounceIn {0%{opacity:0;transform:scale(0.2) rotate(-15deg)}55%{transform:scale(1.15) rotate(4deg);opacity:1}78%{transform:scale(0.95) rotate(-2deg)}100%{transform:scale(1) rotate(0)}}
  @keyframes wiggle   {0%,100%{transform:rotate(-10deg)}50%{transform:rotate(10deg)}}
  @keyframes countBig {0%{opacity:0;transform:scale(0.2)}40%{opacity:1;transform:scale(1.3)}70%{transform:scale(0.9)}100%{transform:scale(1)}}
  @keyframes tickIn   {0%{opacity:0;transform:scale(0) rotate(-45deg)}60%{transform:scale(1.3) rotate(5deg);opacity:1}100%{transform:scale(1) rotate(0)}}
  @keyframes flipCard {0%{transform:rotateY(90deg) scale(0.8);opacity:0}100%{transform:rotateY(0) scale(1);opacity:1}}
  @keyframes pulseDot {0%,100%{opacity:1}50%{opacity:0}}
  @keyframes raccoonHit{0%,100%{transform:translateX(0)}25%{transform:translateX(-10px)}75%{transform:translateX(10px)}}
  @keyframes raccoonRun{from{transform:translateX(0) rotate(0)}to{transform:translateX(150%) rotate(30deg)}}
  @keyframes glowRing {0%,100%{box-shadow:0 0 0 0 rgba(139,92,246,0.4)}50%{box-shadow:0 0 0 12px rgba(139,92,246,0)}}
  .slide-in  {animation:slideInR  0.45s ${SPRING} both}
  .slide-out {animation:slideOutL 0.25s ease-in  forwards}
`;

// ─── BYTEBOT ─────────────────────────────────────────────────────────────────

type ByteMood = "happy" | "excited" | "wave" | "chef" | "worried";

function ByteBot({ mood = "happy", size = 90 }: { mood?: ByteMood; size?: number }) {
  const ex = mood === "excited", wo = mood === "worried";
  return (
    <div style={{
      width: size, height: size * 1.5,
      animation: ex ? `celebrate 0.7s ${SPRING} infinite alternate` : `bobble 2.2s ease-in-out infinite`,
      display:"inline-flex", flexDirection:"column", alignItems:"center", flexShrink: 0,
    }}>
      {mood === "chef" && (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:2 }}>
          <div style={{ width:size*0.42, height:size*0.18, background:"white", borderRadius:"50% 50% 0 0", border:"2px solid #cbd5e1" }} />
          <div style={{ width:size*0.54, height:size*0.06, background:"white", border:"2px solid #cbd5e1", borderRadius:4 }} />
        </div>
      )}
      <svg viewBox="0 0 110 145" width={size} height={size * (mood === "chef" ? 0.72 : 0.82)}>
        <defs>
          <linearGradient id="byteG" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={wo ? "#f472b6" : "#60a5fa"} />
            <stop offset="100%" stopColor={wo ? "#ec4899" : "#2563eb"} />
          </linearGradient>
        </defs>
        {/* Legs */}
        <rect x="32" y="108" width="18" height="30" rx="9" fill="#2563eb"/>
        <rect x="60" y="108" width="18" height="30" rx="9" fill="#2563eb"/>
        {/* Arms */}
        <rect x="2" y="55" width="14" height="34" rx="7" fill="#3b82f6" transform="rotate(15 9 55)"/>
        <rect x="94" y="55" width="14" height="34" rx="7" fill="#3b82f6"
          transform={mood === "wave" ? "rotate(-55 101 55)" : "rotate(-15 101 55)"}
          style={mood === "wave" ? { animation:"wiggle 0.5s ease-in-out infinite", transformOrigin:"101px 55px" } : undefined}/>
        {/* Shield body */}
        <path d="M55 8 L102 25 L102 70 Q102 100 55 115 Q8 100 8 70 L8 25 Z" fill="url(#byteG)"/>
        <ellipse cx="35" cy="36" rx="14" ry="8" fill="rgba(255,255,255,0.25)" transform="rotate(-20 35 36)"/>
        {/* Eyes */}
        <circle cx="38" cy="56" r="11" fill="white"/>
        <circle cx="72" cy="56" r="11" fill="white"/>
        <circle cx={ex?40:39} cy={ex?54:57} r="6.5" fill="#1e3a8a"/>
        <circle cx={ex?74:73} cy={ex?54:57} r="6.5" fill="#1e3a8a"/>
        <circle cx="41" cy="52" r="2.5" fill="white"/>
        <circle cx="75" cy="52" r="2.5" fill="white"/>
        {/* Mouth */}
        {wo
          ? <path d="M38 76 Q55 70 72 76" fill="none" stroke="white" strokeWidth="4.5" strokeLinecap="round"/>
          : ex
          ? <path d="M33 74 Q55 90 77 74" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round"/>
          : <path d="M36 75 Q55 88 74 75" fill="none" stroke="white" strokeWidth="4.5" strokeLinecap="round"/>}
        {/* Blush */}
        <ellipse cx="24" cy="68" rx="9" ry="5" fill="rgba(255,182,193,0.4)"/>
        <ellipse cx="86" cy="68" rx="9" ry="5" fill="rgba(255,182,193,0.4)"/>
      </svg>
      <div style={{ display:"flex", gap:8, marginTop: -size * 0.06 }}>
        {[0,1].map(i=>(
          <div key={i} style={{ width:size*0.15, height:size*0.24, background:"#2563eb", borderRadius:size*0.075,
            border:"2px solid #1d4ed8", animation:`bobble ${1.8+i*0.2}s ease-in-out infinite ${i*0.1}s` }}/>
        ))}
      </div>
    </div>
  );
}

function ByteSays({ mood="happy", children }: { mood?: ByteMood; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 mb-5" style={{ animation:`slideUp 0.5s ${SPRING} both` }}>
      <ByteBot mood={mood} size={72}/>
      <div className="bg-white rounded-2xl px-4 py-3 shadow-md border-2 border-blue-100 flex-1">
        <p className="font-semibold text-gray-700 text-sm leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function FloatingBubbles() {
  const bs = [[100,"8%","4%",null,"#bfdbfe","9s","0s"],[70,"20%",null,"6%","#e9d5ff","11s","1s"],
    [55,"58%","7%",null,"#fbcfe8","8s","2s"],[85,"40%",null,"9%","#bbf7d0","12s","0.5s"],
    [45,"78%","56%",null,"#fef08a","7s","3s"],[110,"10%","46%",null,"#a5f3fc","14s","1.5s"]] as const;
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{zIndex:0}}>
      {bs.map(([size,top,left,right,color,dur,delay],i)=>(
        <div key={i} className="absolute rounded-full opacity-25"
          style={{width:size,height:size,top,left:left??undefined,right:right??undefined,
            backgroundColor:color,animation:`floatUp ${dur} ease-in-out infinite ${delay}`}}/>
      ))}
    </div>
  );
}

function Confetti() {
  const [items, setItems] = useState<{id:number;x:number;color:string;delay:string;dur:string;size:number;shape:string}[]>([]);
  useEffect(()=>{
    const colors=["#ff6b6b","#4ecdc4","#45b7d1","#fbbf24","#a78bfa","#f472b6","#34d399","#f59e0b","#60a5fa","#fb7185"];
    const shapes=["●","■","▲","★","♦","❋","◆"];
    setItems(Array.from({length:90},(_,i)=>({id:i,x:Math.random()*100,color:colors[i%colors.length],
      delay:(Math.random()*3).toFixed(2),dur:(2+Math.random()*3).toFixed(2),
      size:8+Math.floor(Math.random()*10),shape:shapes[i%shapes.length]})));
  },[]);
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{zIndex:60}}>
      {items.map(p=>(
        <div key={p.id} className="absolute top-0 font-black select-none"
          style={{left:`${p.x}%`,color:p.color,fontSize:p.size,
            animation:`confetti ${p.dur}s linear ${p.delay}s infinite`}}>{p.shape}</div>
      ))}
    </div>
  );
}

function ProgressBar({step}:{step:number}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-4 bg-white rounded-full overflow-hidden border border-purple-100 shadow-inner">
        <div className="h-full rounded-full" style={{
          width:`${(step/(TOTAL-1))*100}%`,background:GRAD,
          transition:`width 0.8s ${SPRING}`}}/>
      </div>
      <span className="text-xs font-black text-purple-500 shrink-0">{step+1}/{TOTAL}</span>
    </div>
  );
}

function StepDots({step}:{step:number}) {
  return (
    <div className="flex gap-1 justify-center">
      {Array.from({length:TOTAL},(_,i)=>(
        <div key={i} className="rounded-full transition-all duration-500"
          style={{width:i===step?20:7,height:7,background:i<=step?GRAD:"#e9d5ff"}}/>
      ))}
    </div>
  );
}

function Typewriter({text,delay=0,speed=42}:{text:string;delay?:number;speed?:number}) {
  const [shown,setShown]=useState("");const [done,setDone]=useState(false);
  useEffect(()=>{setShown("");setDone(false);let i=0;
    const s=setTimeout(()=>{
      const iv=setInterval(()=>{i++;setShown(text.slice(0,i));if(i>=text.length){clearInterval(iv);setDone(true);}},speed);
      return ()=>clearInterval(iv);},delay);return ()=>clearTimeout(s);
  },[text,delay,speed]);
  return <span>{shown}{!done&&<span style={{display:"inline-block",width:2,height:"1em",background:"currentColor",verticalAlign:"middle",marginLeft:2,animation:"pulseDot 0.8s ease-in-out infinite"}}/>}</span>;
}

function SparkleBurst({x,y}:{x:number;y:number}) {
  const emojis=["⭐","✨","🌟","💫","⚡","🎉","✦","★"];
  return (
    <div className="fixed pointer-events-none" style={{left:x-40,top:y-40,zIndex:55}}>
      {emojis.map((s,i)=>(
        <div key={i} className="absolute font-black" style={{fontSize:18+(i%3)*6,
          "--r":`${i*45}deg`,animation:`sparkOut 0.75s ease-out ${i*50}ms both`} as React.CSSProperties}>{s}</div>
      ))}
    </div>
  );
}

function StrengthMeter({filled}:{filled:number}) {
  const labels=["","Weak 😬","Fair 😐","Good 😊","STRONG 💪","SUPER STRONG! 🔥"];
  const colors=["#e5e7eb","#ef4444","#f97316","#eab308","#22c55e","url(#smg)"];
  return (
    <div>
      <div className="flex justify-between text-sm font-black mb-1">
        <span className="text-gray-500">Password Strength</span>
        <span style={{color:filled>=4?"#22c55e":filled>=2?"#f97316":"#ef4444"}}>{labels[filled]}</span>
      </div>
      <div className="h-5 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
        <svg height="0" width="0" style={{position:"absolute"}}><defs>
          <linearGradient id="smg" x1="0%"><stop offset="0%" stopColor="#22c55e"/><stop offset="50%" stopColor="#3b82f6"/><stop offset="100%" stopColor="#ec4899"/></linearGradient>
        </defs></svg>
        <div className="h-full rounded-full transition-all" style={{
          width:`${(filled/4)*100}%`,background:filled>=4?"linear-gradient(90deg,#22c55e,#3b82f6,#ec4899)":colors[filled]||"#e5e7eb",
          transition:`width 0.6s ${SPRING}`}}/>
      </div>
    </div>
  );
}

// ─── LOTTIE WITH CSS FALLBACKS ────────────────────────────────────────────────

function ShieldIllustration() {
  return (
    <div style={{width:220,height:220,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <svg viewBox="0 0 120 140" width="180" height="180" style={{animation:`bobble 2s ease-in-out infinite`,filter:"drop-shadow(0 8px 24px rgba(139,92,246,0.35))"}}>
        <defs><linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#3b82f6"/><stop offset="50%" stopColor="#8b5cf6"/><stop offset="100%" stopColor="#ec4899"/></linearGradient></defs>
        <path d="M60 8 L108 28 L108 72 Q108 110 60 130 Q12 110 12 72 L12 28 Z" fill="url(#sg)"/>
        <path d="M60 18 L100 35 L100 72 Q100 104 60 122 Q20 104 20 72 L20 35 Z" fill="rgba(255,255,255,0.15)"/>
        <rect x="46" y="70" width="28" height="22" rx="4" fill="white" opacity="0.9"/>
        <path d="M50 70 L50 62 Q50 52 60 52 Q70 52 70 62 L70 70" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.9"/>
        <circle cx="60" cy="81" r="4" fill="url(#sg)"/>
        <text x="22" y="38" fontSize="12" fill="rgba(255,255,255,0.7)" style={{animation:"bobble 2s ease-in-out infinite"}}>✦</text>
        <text x="88" y="44" fontSize="10" fill="rgba(255,255,255,0.6)">✦</text>
      </svg>
    </div>
  );
}

function LockIllustration() {
  return (
    <div style={{width:180,height:180,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <svg viewBox="0 0 100 120" width="140" height="140" style={{animation:`bobble 2.5s ease-in-out infinite 0.3s`,filter:"drop-shadow(0 6px 18px rgba(59,130,246,0.4))"}}>
        <defs><linearGradient id="lg" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#60a5fa"/><stop offset="100%" stopColor="#3b82f6"/></linearGradient></defs>
        <path d="M32 50 L32 32 Q32 12 50 12 Q68 12 68 32 L68 50" fill="none" stroke="#3b82f6" strokeWidth="10" strokeLinecap="round"/>
        <rect x="14" y="50" width="72" height="58" rx="12" fill="url(#lg)"/>
        <circle cx="38" cy="72" r="6" fill="white"/><circle cx="62" cy="72" r="6" fill="white"/>
        <circle cx="40" cy="71" r="3.5" fill="#1e3a8a"/><circle cx="64" cy="71" r="3.5" fill="#1e3a8a"/>
        <path d="M38 84 Q50 92 62 84" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
        <circle cx="50" cy="96" r="4" fill="rgba(0,0,60,0.35)"/>
        <rect x="47.5" y="97" width="5" height="7" rx="1" fill="rgba(0,0,60,0.35)"/>
      </svg>
    </div>
  );
}

function TrophyIllustration() {
  return (
    <div style={{width:220,height:220,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <svg viewBox="0 0 120 130" width="180" height="180" style={{animation:`bobble 1.8s ease-in-out infinite`,filter:"drop-shadow(0 0 28px rgba(251,191,36,0.6))"}}>
        <defs><linearGradient id="tg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#fde047"/><stop offset="100%" stopColor="#f59e0b"/></linearGradient></defs>
        <path d="M30 18 L90 18 L80 72 Q78 84 60 84 Q42 84 40 72 Z" fill="url(#tg)"/>
        <path d="M30 18 Q10 18 10 38 Q10 58 30 58" fill="none" stroke="url(#tg)" strokeWidth="8" strokeLinecap="round"/>
        <path d="M90 18 Q110 18 110 38 Q110 58 90 58" fill="none" stroke="url(#tg)" strokeWidth="8" strokeLinecap="round"/>
        <rect x="52" y="84" width="16" height="22" rx="3" fill="#f59e0b"/>
        <rect x="36" y="106" width="48" height="12" rx="6" fill="url(#tg)"/>
        <text x="50" y="60" fontSize="26" textAnchor="middle" fill="rgba(255,255,255,0.85)">★</text>
        <text x="12" y="25" fontSize="14" fill="#fbbf24" style={{animation:"bobble 2s ease-in-out infinite"}}>✦</text>
        <text x="96" y="30" fontSize="12" fill="#fbbf24">✦</text>
        <text x="18" y="70" fontSize="10" fill="#fbbf24">✦</text>
        <text x="100" y="68" fontSize="11" fill="#fbbf24">✦</text>
      </svg>
    </div>
  );
}

function LottieOrFallback({src,fallback,width=220,height=220}:{src:string;fallback:React.ReactNode;width?:number;height?:number}) {
  const [failed,setFailed]=useState(false);
  if(failed) return <>{fallback}</>;
  return <DotLottieReact src={src} loop autoplay style={{width,height}} onError={()=>setFailed(true)}/>;
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function LessonGame({userName,moduleId}:{userName:string;moduleId:string}) {
  // Navigation
  const [screen,setScreen]=useState(0);
  const [animClass,setAnimClass]=useState("slide-in");

  // S0: Countdown
  const [countPhase,setCountPhase]=useState(0);
  const screenRef=useRef(0);
  useEffect(()=>{screenRef.current=screen;},[screen]);

  // S1: Interactive objects
  const [clickedObjs,setClickedObjs]=useState<Set<string>>(new Set());

  // S2: Why scenarios
  const [whyIdx,setWhyIdx]=useState(0);
  const [whyShowGood,setWhyShowGood]=useState(false);

  // S3: Recipe
  const [recipePhase,setRecipePhase]=useState(0);

  // S4: Builder
  const [builderSlots,setBuilderSlots]=useState([0,0,0,0]);
  const [builderActive,setBuilderActive]=useState(0);

  // S5: Good/Bad
  const [gbIdx,setGbIdx]=useState(0);
  const [gbRevealed,setGbRevealed]=useState(false);

  // S6: Drag & Drop
  const [placed8,setPlaced8]=useState<Set<string>>(new Set());
  const [dragging,setDragging]=useState<string|null>(null);
  const [dragX,setDragX]=useState(0);
  const [dragY,setDragY]=useState(0);
  const [shaking,setShaking]=useState<string|null>(null);
  const [sparklePos,setSparklePos]=useState<{x:number;y:number}|null>(null);
  const [wrongMsg,setWrongMsg]=useState(false);
  const [drag8Started,setDrag8Started]=useState(false);
  const [drag8Time,setDrag8Time]=useState(60);
  const [drag8Done,setDrag8Done]=useState(false);
  const [sortingStars,setSortingStars]=useState(0);
  const dragOffset=useRef({x:0,y:0});
  const cardDims=useRef({w:0,h:0});
  const strongRef=useRef<HTMLDivElement>(null);
  const weakRef=useRef<HTMLDivElement>(null);
  const drag8TimerRef=useRef<ReturnType<typeof setInterval>|null>(null);
  const drag8TimeRef=useRef(60);

  // S7: Rules
  const [rulesQuizMode,setRulesQuizMode]=useState(false);
  const [rulesQIdx,setRulesQIdx]=useState(0);
  const [rulesQSel,setRulesQSel]=useState<number|null>(null);
  const [rulesScore,setRulesScore]=useState(0);
  const [rulesQClass,setRulesQClass]=useState("slide-in");

  // S8: Phishing
  const [phishIdx,setPhishIdx]=useState(0);
  const [phishAnswer,setPhishAnswer]=useState<boolean|null>(null);

  // S9: Scenarios
  const [wydIdx,setWydIdx]=useState(0);
  const [wydSel,setWydSel]=useState<number|null>(null);
  const [wydScore,setWydScore]=useState(0);

  // S10: Typing
  const [typingPwIdx,setTypingPwIdx]=useState(0);
  const [typingInput,setTypingInput]=useState("");
  const [typingAllDone,setTypingAllDone]=useState(false);

  // S11: Decoder
  const [decRevealed,setDecRevealed]=useState<Set<number>>(new Set());

  // S12: Boss Quiz
  const [bossQIdx,setBossQIdx]=useState(0);
  const [bossQClass,setBossQClass]=useState("slide-in");
  const [bossSel,setBossSel]=useState<number|null>(null);
  const [bossFeedback,setBossFeedback]=useState<boolean|null>(null);
  const [bossScore,setBossScore]=useState(0);
  const [raccoonHealth,setRaccoonHealth]=useState(100);
  const [bossDone,setBossDone]=useState(false);

  // S13: Summary
  const [achievePhase,setAchievePhase]=useState(0);

  // Completion
  const progressPosted=useRef(false);

  // ── useEffects ────────────────────────────────────────────────────────────

  // Drag timer
  useEffect(()=>{
    if(!drag8Started||drag8Done) return;
    drag8TimerRef.current=setInterval(()=>setDrag8Time(t=>Math.max(0,t-1)),1000);
    return ()=>{if(drag8TimerRef.current) clearInterval(drag8TimerRef.current);};
  },[drag8Started,drag8Done]);

  // Keep time ref in sync
  useEffect(()=>{drag8TimeRef.current=drag8Time;},[drag8Time]);

  // Detect all 8 sorted
  useEffect(()=>{
    if(placed8.size===8&&!drag8Done&&screen===6){
      setDrag8Done(true);
      if(drag8TimerRef.current) clearInterval(drag8TimerRef.current);
      const elapsed=60-drag8TimeRef.current;
      setSortingStars(elapsed<30?3:elapsed<45?2:1);
    }
  },[placed8.size,drag8Done,screen]);

  // Achievement auto-advance
  useEffect(()=>{
    if(screen!==13||achievePhase>=ACHIEVEMENTS.length) return;
    const t=setTimeout(()=>setAchievePhase(p=>p+1),650);
    return ()=>clearTimeout(t);
  },[screen,achievePhase]);

  // Progress API on completion screen
  useEffect(()=>{
    if(screen===14&&moduleId&&!progressPosted.current){
      progressPosted.current=true;
      fetch("/api/progress",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({moduleId})}).catch(console.error);
    }
  },[screen,moduleId]);

  // Global pointer handlers (drag)
  useEffect(()=>{
    const move=(e:PointerEvent)=>{setDragX(e.clientX-dragOffset.current.x);setDragY(e.clientY-dragOffset.current.y);};
    const up=(e:PointerEvent)=>{
      if(!dragging) return;
      const {clientX:cx,clientY:cy}=e;
      const sR=strongRef.current?.getBoundingClientRect();
      const wR=weakRef.current?.getBoundingClientRect();
      let bucket:"strong"|"weak"|null=null;
      if(sR&&cx>=sR.left&&cx<=sR.right&&cy>=sR.top&&cy<=sR.bottom) bucket="strong";
      else if(wR&&cx>=wR.left&&cx<=wR.right&&cy>=wR.top&&cy<=wR.bottom) bucket="weak";
      if(bucket){
        const card=PASSWORDS_8.find(p=>p.id===dragging);
        if(card){
          const ok=(card.isStrong&&bucket==="strong")||(!card.isStrong&&bucket==="weak");
          if(ok){
            setPlaced8(prev=>new Set([...prev,dragging!]));
            setSparklePos({x:cx,y:cy});
            setTimeout(()=>setSparklePos(null),900);
          } else {
            setShaking(dragging);setWrongMsg(true);
            setTimeout(()=>{setShaking(null);setWrongMsg(false);},900);
          }
        }
      }
      setDragging(null);
    };
    window.addEventListener("pointermove",move);
    window.addEventListener("pointerup",up);
    return ()=>{window.removeEventListener("pointermove",move);window.removeEventListener("pointerup",up);};
  },[dragging]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const onPointerDown=(e:React.PointerEvent<HTMLDivElement>,id:string)=>{
    e.preventDefault();
    const rect=e.currentTarget.getBoundingClientRect();
    dragOffset.current={x:e.clientX-rect.left,y:e.clientY-rect.top};
    cardDims.current={w:rect.width,h:rect.height};
    setDragX(rect.left);setDragY(rect.top);setDragging(id);
    if(!drag8Started) setDrag8Started(true);
  };

  const startCountdown=()=>{
    setCountPhase(1);
    setTimeout(()=>setCountPhase(2),900);
    setTimeout(()=>setCountPhase(3),1800);
    setTimeout(()=>setCountPhase(4),2700);
    setTimeout(()=>{if(screenRef.current===0) navigate(1);},3400);
  };

  const handleBossAnswer=(idx:number)=>{
    if(bossSel!==null) return;
    setBossSel(idx);
    const correct=BOSS_QUIZ[bossQIdx].correct===idx;
    setBossFeedback(correct);
    if(correct){setBossScore(s=>s+1);setRaccoonHealth(h=>Math.max(0,h-10));}
    setTimeout(()=>{
      if(bossQIdx<BOSS_QUIZ.length-1){
        setBossQClass("slide-out");
        setTimeout(()=>{setBossQIdx(q=>q+1);setBossSel(null);setBossFeedback(null);setBossQClass("slide-in");},260);
      } else {setBossDone(true);}
    },1800);
  };

  const handleRulesQ=(idx:number)=>{
    if(rulesQSel!==null) return;
    setRulesQSel(idx);
    const correct=RULES_QUIZ[rulesQIdx].correct===idx;
    if(correct) setRulesScore(s=>s+1);
    setTimeout(()=>{
      if(rulesQIdx<RULES_QUIZ.length-1){
        setRulesQClass("slide-out");
        setTimeout(()=>{setRulesQIdx(q=>q+1);setRulesQSel(null);setRulesQClass("slide-in");},260);
      } else {setRulesQuizMode(false);navigate(8);}
    },1600);
  };

  const navigate=(to:number)=>{
    if(to===0) setCountPhase(0);
    if(to===1) setClickedObjs(new Set());
    if(to===2){setWhyIdx(0);setWhyShowGood(false);}
    if(to===3) setRecipePhase(0);
    if(to===4){setBuilderSlots([0,0,0,0]);setBuilderActive(0);}
    if(to===5){setGbIdx(0);setGbRevealed(false);}
    if(to===6){setPlaced8(new Set());setDrag8Started(false);setDrag8Time(60);setDrag8Done(false);drag8TimeRef.current=60;if(drag8TimerRef.current) clearInterval(drag8TimerRef.current);}
    if(to===7){setRulesQuizMode(false);setRulesQIdx(0);setRulesQSel(null);setRulesScore(0);setRulesQClass("slide-in");}
    if(to===8){setPhishIdx(0);setPhishAnswer(null);}
    if(to===9){setWydIdx(0);setWydSel(null);setWydScore(0);}
    if(to===10){setTypingPwIdx(0);setTypingInput("");setTypingAllDone(false);}
    if(to===11) setDecRevealed(new Set());
    if(to===12){setBossQIdx(0);setBossSel(null);setBossFeedback(null);setBossScore(0);setRaccoonHealth(100);setBossDone(false);setBossQClass("slide-in");}
    if(to===13) setAchievePhase(0);
    setAnimClass("slide-out");
    setTimeout(()=>{setScreen(to);setAnimClass("slide-in");},260);
  };

  // ── Derived ───────────────────────────────────────────────────────────────

  const draggingCard=dragging?PASSWORDS_8.find(p=>p.id===dragging):null;
  const unplaced8=PASSWORDS_8.filter(p=>!placed8.has(p.id)&&p.id!==dragging);
  const allSorted8=placed8.size===PASSWORDS_8.length;
  const typingTarget=TYPING_PWS[typingPwIdx];
  const isTypingCorrect=typingInput===typingTarget;
  const decDone=decRevealed.size===DECODE_PHRASE.replace(/ /g,"").length;
  const today=new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});

  const btn=(onClick:()=>void,label:React.ReactNode,extra?:React.CSSProperties)=>(
    <button onClick={onClick}
      onMouseEnter={e=>(e.currentTarget.style.transform="scale(1.06)")}
      onMouseLeave={e=>(e.currentTarget.style.transform="scale(1)")}
      style={{background:GRAD,color:"#fff",fontWeight:900,fontSize:17,padding:"13px 34px",borderRadius:20,
        border:"none",cursor:"pointer",boxShadow:"0 8px 32px rgba(139,92,246,0.3)",
        transition:"transform 0.2s",minHeight:54,...extra}}>
      {label}
    </button>
  );

  // ── Screens ───────────────────────────────────────────────────────────────

  const renderScreen=()=>{
    switch(screen){

      // ── 0: WELCOME ────────────────────────────────────────────────────────
      case 0: return (
        <div className="flex flex-col items-center text-center gap-6 py-4 pb-10">
          <div style={{animation:`popIn 0.7s ${SPRING} both`}}>
            <LottieOrFallback src="https://lottie.host/2bc21a86-f53e-4365-b4f7-4e246bc103c0/VaRsNMmOGn.lottie"
              fallback={<ShieldIllustration/>} width={200} height={200}/>
          </div>

          {countPhase===0 && <>
            <div style={{animation:`popIn 0.7s ${SPRING} 0.15s both`}}>
              <h1 className="text-4xl sm:text-5xl font-black"
                style={{background:GRAD,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
                What is a Password?
              </h1>
              <p className="text-gray-500 font-bold mt-1 text-lg">Cyber Heroes Academy · Week 1</p>
            </div>
            <div className="bg-white rounded-3xl px-6 py-5 shadow-xl border-2 border-purple-100 max-w-sm w-full"
              style={{animation:`slideUp 0.6s ${SPRING} 0.3s both`}}>
              <div className="flex items-start gap-3 mb-3">
                <ByteBot mood="wave" size={64}/>
                <div className="text-left">
                  <p className="font-black text-purple-700 text-base mb-1">Hi! I&apos;m Byte, your Cyber Hero guide! 🛡️</p>
                  <p className="font-semibold text-gray-600 text-sm leading-relaxed">
                    Today we&apos;re going on a <strong className="text-blue-600">PASSWORD ADVENTURE</strong>! Ready, <span className="text-purple-600 font-black">{userName}</span>?
                  </p>
                </div>
              </div>
            </div>
            {btn(startCountdown,"Let's Start! 🚀",{animation:`slideUp 0.6s ${SPRING} 0.5s both`})}
          </>}

          {countPhase>0 && countPhase<5 && (
            <div key={countPhase} className="flex flex-col items-center gap-4"
              style={{animation:`countBig 0.8s ${SPRING} both`}}>
              <div className="font-black" style={{
                fontSize:countPhase===4?60:100,
                background:countPhase===4?"#22c55e":GRAD,
                WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
                {countPhase===1?"3":countPhase===2?"2":countPhase===3?"1":"LET'S GO! 🚀"}
              </div>
            </div>
          )}
        </div>
      );

      // ── 1: WHAT IS A PASSWORD? ────────────────────────────────────────────
      case 1: return (
        <div className="flex flex-col gap-5 pb-10">
          <div className="text-center" style={{animation:`slideUp 0.5s ${SPRING} both`}}>
            <h2 className="text-3xl font-black" style={{background:GRAD,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
              What IS a Password? 🔐
            </h2>
          </div>
          <ByteSays mood="happy">
            Have you ever had a <strong>secret diary with a lock</strong>? Or a treasure chest only YOU can open? Tap on each item below and I&apos;ll show you something cool!
          </ByteSays>

          <div className="flex gap-4 sm:gap-8 justify-center flex-wrap" style={{animation:`slideUp 0.5s ${SPRING} 0.1s both`}}>
            {[{id:"diary",emoji:"📔",label:"Secret Diary"},{id:"chest",emoji:"🏺",label:"Treasure Chest"},{id:"phone",emoji:"📱",label:"Your Phone"}].map(obj=>(
              <div key={obj.id} onClick={()=>setClickedObjs(s=>new Set([...s,obj.id]))}
                className="flex flex-col items-center cursor-pointer select-none"
                style={{animation:clickedObjs.has(obj.id)?`celebrate 0.5s ${SPRING} both`:undefined}}>
                <div className="relative">
                  <span style={{fontSize:70}}>{obj.emoji}</span>
                  {clickedObjs.has(obj.id)&&(
                    <div className="absolute -top-2 -right-2 text-3xl" style={{animation:`popIn 0.4s ${SPRING} both`}}>🔒</div>
                  )}
                </div>
                <span className="font-bold text-gray-600 text-sm mt-1">{obj.label}</span>
                {clickedObjs.has(obj.id)&&<span className="text-xs font-black text-green-600 mt-0.5">Protected! ✓</span>}
              </div>
            ))}
          </div>

          {clickedObjs.size>0&&(
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-4 border-2 border-blue-100 shadow-sm"
              style={{animation:`bounceIn 0.6s ${SPRING} both`}}>
              <p className="font-bold text-gray-700 text-base leading-relaxed">
                🔐 A password is your <strong className="text-blue-600">secret magic key</strong> for the internet!
                Just like a lock on your diary keeps your secrets safe, a password keeps your digital stuff <strong className="text-purple-600">safe from strangers</strong>.
              </p>
            </div>
          )}

          <div className="bg-yellow-50 rounded-3xl p-4 border-2 border-yellow-200" style={{animation:`slideUp 0.5s ${SPRING} 0.3s both`}}>
            <p className="text-yellow-800 font-bold text-sm">
              💡 <strong>Fun fact!</strong> The very first computer password was invented in <strong>1961</strong> at MIT! Even back then, people needed to keep their stuff secret! 🖥️
            </p>
          </div>

          {clickedObjs.size===3&&(
            <div className="flex justify-center" style={{animation:`bounceIn 0.6s ${SPRING} both`}}>
              {btn(()=>navigate(2),"Great! What's next? ➡️")}
            </div>
          )}
          {clickedObjs.size<3&&<p className="text-center text-gray-400 font-bold text-sm">Tap all {3-clickedObjs.size} item{3-clickedObjs.size!==1?"s":""} to continue!</p>}
        </div>
      );

      // ── 2: WHY DO WE NEED PASSWORDS? ─────────────────────────────────────
      case 2: return (
        <div className="flex flex-col gap-5 pb-10">
          <div className="text-center" style={{animation:`slideUp 0.5s ${SPRING} both`}}>
            <h2 className="text-3xl font-black" style={{background:GRAD,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
              Why Do We Need Passwords? 🤔
            </h2>
          </div>
          <ByteSays mood="worried">
            Without a password, <strong>ANYONE could get into your stuff!</strong> Let me show you what could go wrong… then see how passwords save the day!
          </ByteSays>

          <div className="bg-white rounded-3xl p-5 shadow-xl border-2 border-purple-100" style={{animation:`slideUp 0.5s ${SPRING} 0.1s both`}}>
            <div className="flex items-center gap-3 mb-4">
              <span style={{fontSize:52}}>{WHY_SCENARIOS[whyIdx].emoji}</span>
              <div>
                <div className="text-xs font-black text-purple-400 uppercase tracking-wider">Scenario {whyIdx+1} of 3</div>
                <div className="flex gap-1.5 mt-1">
                  {[0,1,2].map(i=><div key={i} className="h-2 w-12 rounded-full" style={{background:i<=whyIdx?GRAD:"#e9d5ff"}}/>)}
                </div>
              </div>
            </div>

            <div className="rounded-2xl p-4 mb-4 border-2 min-h-[72px] flex items-center"
              style={{background:whyShowGood?"#f0fdf4":"#fff1f2",borderColor:whyShowGood?"#4ade80":"#fca5a5",
                transition:"all 0.5s",animation:whyShowGood?`celebrate 0.5s ${SPRING} both`:undefined}}>
              <p className="font-bold text-base leading-relaxed" style={{color:whyShowGood?"#166534":"#991b1b"}}>
                {whyShowGood?WHY_SCENARIOS[whyIdx].good:WHY_SCENARIOS[whyIdx].bad}
              </p>
            </div>

            <div className="flex gap-3 flex-wrap">
              {!whyShowGood&&(
                <button onClick={()=>setWhyShowGood(true)}
                  className="px-5 py-3 rounded-2xl font-black text-white text-sm border-none cursor-pointer"
                  style={{background:"linear-gradient(135deg,#22c55e,#16a34a)",boxShadow:"0 4px 16px rgba(34,197,94,0.3)"}}>
                  Add a Password! 🔒
                </button>
              )}
              {whyShowGood&&(
                whyIdx<2
                  ? <button onClick={()=>{setWhyIdx(i=>i+1);setWhyShowGood(false);}}
                      className="px-5 py-3 rounded-2xl font-black text-white text-sm border-none cursor-pointer"
                      style={{background:GRAD,boxShadow:"0 4px 16px rgba(139,92,246,0.3)"}}>
                      Next Scenario ➡️
                    </button>
                  : btn(()=>navigate(3),"I understand! Let's go! 🚀")
              )}
            </div>
          </div>
        </div>
      );

      // ── 3: THE PASSWORD RECIPE ────────────────────────────────────────────
      case 3: return (
        <div className="flex flex-col gap-5 pb-10">
          <div className="text-center" style={{animation:`slideUp 0.5s ${SPRING} both`}}>
            <h2 className="text-3xl font-black" style={{background:GRAD,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
              The Password Recipe! 👨‍🍳
            </h2>
          </div>
          <ByteSays mood="chef">
            Put on your chef&apos;s hat! Let&apos;s cook up a <strong>SUPER STRONG password</strong>. Click each ingredient to add it to the mix!
          </ByteSays>

          <div className="bg-white rounded-3xl p-5 shadow-xl border-2 border-orange-100" style={{animation:`slideUp 0.5s ${SPRING} 0.1s both`}}>
            <div className="text-center mb-4">
              <span className="text-2xl font-black text-orange-600">🍳 Super Strong Password Recipe</span>
            </div>
            <div className="space-y-3">
              {RECIPE.map((ing,i)=>(
                <div key={i} className="flex items-center gap-3 rounded-2xl p-3 border-2 transition-all duration-500"
                  style={{opacity:i<recipePhase?1:0.25,borderColor:i<recipePhase?ing.color:"#e5e7eb",
                    background:i<recipePhase?`${ing.color}15`:"#f9fafb",
                    animation:i===recipePhase-1?`celebrate 0.5s ${SPRING} both`:undefined}}>
                  <span style={{fontSize:32}}>{ing.icon}</span>
                  <div>
                    <div className="font-black text-sm" style={{color:ing.color}}>{ing.label}</div>
                    <div className="text-xs font-bold text-gray-500">{ing.example}</div>
                  </div>
                  {i<recipePhase&&<span className="ml-auto text-green-500 font-black text-lg">✓</span>}
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-center">
              {recipePhase<RECIPE.length
                ? <button onClick={()=>setRecipePhase(p=>p+1)}
                    className="px-6 py-3 rounded-2xl font-black text-white text-sm border-none cursor-pointer"
                    style={{background:`linear-gradient(135deg,${RECIPE[recipePhase].color},#8b5cf6)`,boxShadow:`0 4px 16px ${RECIPE[recipePhase].color}50`}}>
                    Add {RECIPE[recipePhase].label}! ➕
                  </button>
                : btn(()=>navigate(4),"🎉 Mix them all! Let's build one →")}
            </div>
          </div>
        </div>
      );

      // ── 4: BUILD A PASSWORD ───────────────────────────────────────────────
      case 4: {
        const opts=BUILDER_OPTIONS[builderActive<4?builderActive:0];
        const builtPw=builderActive>0
          ?`${BUILDER_OPTIONS[0][builderSlots[0]]}${BUILDER_OPTIONS[1][builderSlots[1]]}${BUILDER_OPTIONS[2][builderSlots[2]]}${builderActive>3?BUILDER_OPTIONS[3][builderSlots[3]]:""}`
          :"";
        return (
          <div className="flex flex-col gap-5 pb-10">
            <div className="text-center" style={{animation:`slideUp 0.5s ${SPRING} both`}}>
              <h2 className="text-3xl font-black" style={{background:GRAD,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
                Build Your Password! 🏗️
              </h2>
            </div>
            <ByteSays mood="excited">
              Let&apos;s build a SUPER STRONG password together, step by step! Spin each slot and lock in your choice! 🎰
            </ByteSays>

            {/* Slots progress */}
            <div className="bg-white rounded-3xl p-5 shadow-xl border-2 border-blue-100" style={{animation:`slideUp 0.5s ${SPRING} 0.1s both`}}>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[0,1,2,3].map(i=>(
                  <div key={i} className="rounded-2xl border-2 p-3 text-center transition-all"
                    style={{borderColor:i<builderActive?"#4ade80":i===builderActive?"#8b5cf6":"#e5e7eb",
                      background:i<builderActive?"#f0fdf4":i===builderActive?"#fdf4ff":"#f9fafb"}}>
                    <div className="text-xs font-black mb-1" style={{color:i<builderActive?"#16a34a":i===builderActive?"#8b5cf6":"#9ca3af"}}>
                      {BUILDER_LABELS[i].split(" ")[1]||BUILDER_LABELS[i]}
                    </div>
                    <div className="text-base font-black" style={{color:i<builderActive?"#166534":i===builderActive?"#5b21b6":"#d1d5db"}}>
                      {i<builderActive?BUILDER_OPTIONS[i][builderSlots[i]]:i===builderActive?"?":"•"}
                    </div>
                  </div>
                ))}
              </div>

              {/* Built password display */}
              {builtPw&&(
                <div className="text-center mb-4 py-3 rounded-2xl" style={{background:"#f0f4ff"}}>
                  <div className="text-xs font-black text-purple-400 uppercase tracking-wider mb-1">Your Password So Far</div>
                  <div className="text-2xl font-black" style={{fontFamily:"monospace",color:"#1e40af"}}>{builtPw}</div>
                </div>
              )}
              <StrengthMeter filled={Math.min(builderActive,4)}/>

              {/* Slot spinner */}
              {builderActive<4&&(
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <div className="text-center font-black text-purple-600 mb-3">{BUILDER_LABELS[builderActive]}</div>
                  <div className="flex flex-wrap gap-2 justify-center mb-3">
                    {opts.map((opt,i)=>(
                      <button key={i} onClick={()=>setBuilderSlots(prev=>{const n=[...prev];n[builderActive]=i;return n;})}
                        className="px-4 py-2 rounded-xl border-2 font-black text-sm transition-all cursor-pointer"
                        style={{borderColor:builderSlots[builderActive]===i?"#8b5cf6":"#e5e7eb",
                          background:builderSlots[builderActive]===i?"#ede9fe":"white",
                          color:builderSlots[builderActive]===i?"#5b21b6":"#6b7280",
                          transform:builderSlots[builderActive]===i?"scale(1.1)":"scale(1)"}}>
                        {opt}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-center">
                    <button onClick={()=>setBuilderActive(a=>a+1)}
                      className="px-6 py-3 rounded-2xl font-black text-white text-sm border-none cursor-pointer"
                      style={{background:"linear-gradient(135deg,#8b5cf6,#ec4899)",boxShadow:"0 4px 16px rgba(139,92,246,0.3)"}}>
                      Lock it in! ✓
                    </button>
                  </div>
                </div>
              )}

              {builderActive>=4&&(
                <div className="mt-4 text-center" style={{animation:`bounceIn 0.6s ${SPRING} both`}}>
                  <div className="text-xl font-black text-green-600 mb-2">🎉 AMAZING! You built a SUPER STRONG password!</div>
                  <div className="text-2xl font-black mb-4" style={{fontFamily:"monospace",background:GRAD,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>{builtPw}</div>
                  {btn(()=>navigate(5),"See Good vs Bad Passwords ➡️")}
                </div>
              )}
            </div>
          </div>
        );
      }

      // ── 5: GOOD VS BAD ────────────────────────────────────────────────────
      case 5: {
        const ex=GB_EXAMPLES[gbIdx];
        return (
          <div className="flex flex-col gap-5 pb-10">
            <div className="text-center" style={{animation:`slideUp 0.5s ${SPRING} both`}}>
              <h2 className="text-3xl font-black" style={{background:GRAD,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
                Good vs Bad Passwords! 🔍
              </h2>
              <p className="text-gray-500 font-bold mt-1 text-sm">Example {gbIdx+1} of {GB_EXAMPLES.length}</p>
            </div>
            <ByteSays mood="happy">
              Let&apos;s look at some real passwords! Can you guess if each one is <strong className="text-green-600">GOOD</strong> or <strong className="text-red-500">BAD</strong> before I reveal the answer?
            </ByteSays>

            <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-purple-100 flex flex-col items-center gap-4"
              style={{animation:`slideUp 0.5s ${SPRING} 0.1s both`}}>
              <div className="text-2xl font-black" style={{fontFamily:"monospace",letterSpacing:"0.1em",color:"#1e40af"}}>{ex.pw}</div>
              <div className="flex gap-3">
                {!gbRevealed&&<>
                  <button onClick={()=>setGbRevealed(true)} className="px-5 py-2.5 rounded-xl font-black text-sm text-white border-none cursor-pointer" style={{background:"linear-gradient(135deg,#22c55e,#16a34a)"}}>GOOD ✅</button>
                  <button onClick={()=>setGbRevealed(true)} className="px-5 py-2.5 rounded-xl font-black text-sm text-white border-none cursor-pointer" style={{background:"linear-gradient(135deg,#ef4444,#dc2626)"}}>BAD ❌</button>
                </>}
              </div>
              {gbRevealed&&(
                <div className="w-full" style={{animation:`bounceIn 0.5s ${SPRING} both`}}>
                  <div className="rounded-2xl p-4 border-2 text-center mb-4"
                    style={{background:ex.isGood?"#f0fdf4":"#fff1f2",borderColor:ex.isGood?"#4ade80":"#fca5a5"}}>
                    <div className="text-3xl mb-1">{ex.isGood?"✅":"❌"}</div>
                    <div className="font-black text-lg mb-1" style={{color:ex.isGood?"#166534":"#991b1b"}}>{ex.isGood?"GOOD Password! 💪":"BAD Password! 😬"}</div>
                    <div className="font-semibold text-sm" style={{color:ex.isGood?"#15803d":"#b91c1c"}}>{ex.why}</div>
                  </div>
                  {gbIdx<GB_EXAMPLES.length-1
                    ?<button onClick={()=>{setGbIdx(i=>i+1);setGbRevealed(false);}} className="w-full py-3 rounded-2xl font-black text-white text-sm border-none cursor-pointer" style={{background:GRAD}}>Next Example ➡️</button>
                    :btn(()=>navigate(6),"Time to sort passwords! 🎮",{width:"100%"})}
                </div>
              )}
            </div>

            {/* Mini split preview */}
            <div className="grid grid-cols-2 gap-3" style={{animation:`slideUp 0.5s ${SPRING} 0.2s both`}}>
              <div className="rounded-2xl p-3 border-2 border-green-200 bg-green-50">
                <div className="text-center font-black text-green-700 text-sm mb-2">GOOD ✅</div>
                {GB_EXAMPLES.filter((_,i)=>i<gbIdx&&GB_EXAMPLES[i].isGood).map((e,i)=>(
                  <div key={i} className="text-xs font-bold text-green-600 bg-white rounded-lg px-2 py-1 mb-1">{e.pw}</div>
                ))}
              </div>
              <div className="rounded-2xl p-3 border-2 border-red-200 bg-red-50">
                <div className="text-center font-black text-red-600 text-sm mb-2">BAD ❌</div>
                {GB_EXAMPLES.filter((_,i)=>i<gbIdx&&!GB_EXAMPLES[i].isGood).map((e,i)=>(
                  <div key={i} className="text-xs font-bold text-red-500 bg-white rounded-lg px-2 py-1 mb-1">{e.pw}</div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      // ── 6: DRAG & DROP ────────────────────────────────────────────────────
      case 6: return (
        <div className="flex flex-col gap-4 pb-10">
          <div className="text-center" style={{animation:`slideUp 0.5s ${SPRING} both`}}>
            <h2 className="text-3xl font-black" style={{background:GRAD,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
              Sort the Passwords! 🎮
            </h2>
            <p className="text-gray-500 font-bold mt-1 text-sm">Drag each one to the right bucket!</p>
          </div>

          {/* Stats bar */}
          <div className="flex items-center justify-between gap-4 flex-wrap" style={{animation:`slideUp 0.5s ${SPRING} 0.1s both`}}>
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow border-2 border-yellow-200">
              <span className="font-black text-gray-700 text-sm">{placed8.size}/8 sorted</span>
              {Array.from({length:placed8.size},(_,i)=><span key={i} className="text-yellow-400 text-sm">⭐</span>)}
            </div>
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow border-2"
              style={{borderColor:drag8Time<15?"#fca5a5":"#a5f3fc"}}>
              <span style={{fontSize:18}}>⏱️</span>
              <span className="font-black text-sm" style={{color:drag8Time<15?"#dc2626":"#0891b2"}}>{drag8Time}s</span>
            </div>
          </div>

          {/* Encouragement messages */}
          {placed8.size>0&&placed8.size<8&&!drag8Done&&(
            <div className="text-center font-black text-purple-600 text-sm" style={{animation:`popIn 0.4s ${SPRING} both`}}>
              {placed8.size<3?"Great start! 🚀":placed8.size<6?"You're on fire! 🔥":"Almost there! 💪"}
            </div>
          )}
          {wrongMsg&&<div className="text-center text-orange-500 font-black text-sm" style={{animation:`popIn 0.4s ${SPRING} both`}}>Oops! Try the other bucket 🙈</div>}

          {/* Unplaced cards */}
          {!drag8Done&&(
            <div className="flex flex-wrap gap-2 justify-center min-h-[60px]" style={{animation:`slideUp 0.5s ${SPRING} 0.15s both`}}>
              {unplaced8.map(card=>(
                <div key={card.id} className="px-4 py-2.5 rounded-2xl border-2 font-black text-sm select-none cursor-grab active:cursor-grabbing"
                  style={{backgroundColor:card.bg,borderColor:card.border,color:card.color,
                    touchAction:"none",userSelect:"none",boxShadow:"0 4px 12px rgba(0,0,0,0.10)",
                    animation:shaking===card.id?"shake 0.7s cubic-bezier(0.36,0.07,0.19,0.97) both":undefined}}
                  onPointerDown={e=>onPointerDown(e,card.id)}>
                  {card.text}
                </div>
              ))}
            </div>
          )}

          {/* Buckets */}
          <div className="grid grid-cols-2 gap-3" style={{animation:`slideUp 0.5s ${SPRING} 0.2s both`}}>
            <div ref={strongRef} className="rounded-3xl border-4 border-dashed p-3 min-h-[150px] transition-all"
              style={{borderColor:"#4ade80",background:"#f0fdf4",boxShadow:dragging?"0 0 0 4px rgba(74,222,128,0.25)":undefined}}>
              <div className="text-center mb-2"><span style={{fontSize:32}}>💪</span><div className="font-black text-green-700">Strong</div></div>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {PASSWORDS_8.filter(p=>placed8.has(p.id)&&p.isStrong).map(c=>(
                  <div key={c.id} className="px-2 py-1 rounded-xl border-2 font-bold text-xs"
                    style={{backgroundColor:c.bg,borderColor:c.border,color:c.color,animation:`celebrate 0.6s ${SPRING} both`}}>
                    {c.text} ✓
                  </div>
                ))}
              </div>
            </div>
            <div ref={weakRef} className="rounded-3xl border-4 border-dashed p-3 min-h-[150px] transition-all"
              style={{borderColor:"#f87171",background:"#fff1f2",boxShadow:dragging?"0 0 0 4px rgba(248,113,113,0.25)":undefined}}>
              <div className="text-center mb-2"><span style={{fontSize:32}}>😬</span><div className="font-black text-red-600">Weak</div></div>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {PASSWORDS_8.filter(p=>placed8.has(p.id)&&!p.isStrong).map(c=>(
                  <div key={c.id} className="px-2 py-1 rounded-xl border-2 font-bold text-xs"
                    style={{backgroundColor:c.bg,borderColor:c.border,color:c.color,animation:`celebrate 0.6s ${SPRING} both`}}>
                    {c.text} ✓
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Timer ran out */}
          {drag8Time===0&&!drag8Done&&(
            <div className="text-center" style={{animation:`bounceIn 0.6s ${SPRING} both`}}>
              <p className="text-orange-500 font-black text-lg mb-3">⏰ Time&apos;s up! Great try! Let&apos;s go again!</p>
              {btn(()=>navigate(6),"Try Again! 🔄")}
            </div>
          )}

          {/* All sorted! */}
          {allSorted8&&drag8Done&&(
            <div className="flex flex-col items-center gap-3" style={{animation:`bounceIn 0.7s ${SPRING} both`}}>
              <p className="text-green-600 font-black text-xl">🎉 AMAZING! All sorted in {60-drag8TimeRef.current}s!</p>
              <div className="flex gap-2">{Array.from({length:sortingStars},(_,i)=><span key={i} style={{fontSize:36,animation:`popIn 0.5s ${SPRING} ${i*120}ms both`}}>⭐</span>)}</div>
              {btn(()=>navigate(7),"Learn the Password Rules! ➡️")}
            </div>
          )}

          {/* Drag overlay */}
          {draggingCard&&(
            <div className="fixed pointer-events-none z-50 rounded-2xl border-2 px-4 py-2.5 font-black text-sm"
              style={{left:dragX,top:dragY,width:cardDims.current.w,height:cardDims.current.h,
                backgroundColor:draggingCard.bg,borderColor:draggingCard.border,color:draggingCard.color,
                transform:"rotate(6deg) scale(1.1)",filter:"drop-shadow(0 20px 28px rgba(0,0,0,0.25))",touchAction:"none"}}>
              {draggingCard.text}
            </div>
          )}
          {sparklePos&&<SparkleBurst x={sparklePos.x} y={sparklePos.y}/>}
        </div>
      );

      // ── 7: PASSWORD RULES ─────────────────────────────────────────────────
      case 7: return (
        <div className="flex flex-col gap-5 pb-10">
          <div className="text-center" style={{animation:`slideUp 0.5s ${SPRING} both`}}>
            <h2 className="text-3xl font-black" style={{background:GRAD,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
              {rulesQuizMode?"Mini Quiz Time! 🧠":"The 5 Password Rules! 📜"}
            </h2>
          </div>

          {!rulesQuizMode&&<>
            <ByteSays mood="happy">
              Every Cyber Hero knows these <strong>5 Golden Rules</strong>! Read them carefully — there&apos;ll be a quick quiz after! 😉
            </ByteSays>
            <div className="space-y-3" style={{animation:`slideUp 0.5s ${SPRING} 0.1s both`}}>
              {RULES.map((rule,i)=>(
                <div key={i} className="bg-white rounded-2xl p-4 border-2 border-purple-100 shadow-sm flex items-start gap-3"
                  style={{animation:`slideUp 0.5s ${SPRING} ${i*120}ms both`}}>
                  <span style={{fontSize:32}}>{rule.icon}</span>
                  <div>
                    <div className="font-black text-gray-800 text-sm">{rule.title}</div>
                    <div className="text-xs font-semibold text-gray-500 mt-0.5">{rule.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center" style={{animation:`slideUp 0.5s ${SPRING} 0.8s both`}}>
              {btn(()=>setRulesQuizMode(true),"I know the rules! Quiz me! 🎯")}
            </div>
          </>}

          {rulesQuizMode&&(
            <div key={rulesQIdx} className={rulesQClass}>
              <ByteSays mood="excited">
                Question {rulesQIdx+1} of {RULES_QUIZ.length}: Which rule matches this icon?
              </ByteSays>
              <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-purple-100">
                <div className="text-center text-6xl mb-4" style={{animation:`bobble 2s ease-in-out infinite`}}>
                  {RULES[RULES_QUIZ[rulesQIdx].ruleIdx].icon}
                </div>
                <div className="space-y-2.5">
                  {RULES_QUIZ[rulesQIdx].opts.map((opt,i)=>{
                    const sel=rulesQSel===i;
                    const isRight=RULES_QUIZ[rulesQIdx].correct===i;
                    let bg="#f9fafb",border="#e5e7eb",color="#374151";
                    if(rulesQSel!==null){if(isRight){bg="#dcfce7";border="#4ade80";color="#166534";}else if(sel){bg="#fee2e2";border="#f87171";color="#991b1b";}}
                    return (
                      <button key={i} onClick={()=>handleRulesQ(i)} disabled={rulesQSel!==null}
                        className="w-full text-left rounded-2xl border-2 p-3.5 font-bold text-sm transition-all duration-300 cursor-pointer"
                        style={{backgroundColor:bg,borderColor:border,color,
                          animation:sel&&rulesQSel!==null&&isRight?`celebrate 0.6s ${SPRING} both`:undefined}}>
                        {opt}{isRight&&rulesQSel!==null&&" ✓"}
                      </button>
                    );
                  })}
                </div>
                {rulesQSel!==null&&(
                  <div className="mt-3 text-center font-black text-lg" style={{
                    color:RULES_QUIZ[rulesQIdx].correct===rulesQSel?"#16a34a":"#c2410c",
                    animation:`bounceIn 0.5s ${SPRING} both`}}>
                    {RULES_QUIZ[rulesQIdx].correct===rulesQSel?"🎉 Correct! Well done!":"Good try! The green one is right!"}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      );

      // ── 8: SPOT THE PHISHING ──────────────────────────────────────────────
      case 8: {
        const p=PHISH[phishIdx];
        return (
          <div className="flex flex-col gap-5 pb-10">
            <div className="text-center" style={{animation:`slideUp 0.5s ${SPRING} both`}}>
              <h2 className="text-3xl font-black" style={{background:GRAD,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
                Spot the Phishing! 🎣
              </h2>
              <p className="text-gray-500 font-bold mt-1 text-sm">Pop-up {phishIdx+1} of {PHISH.length}</p>
            </div>
            <ByteSays mood="worried">
              Sometimes bad guys try to <strong>TRICK you</strong> into giving your password! These are called <strong className="text-red-500">phishing scams</strong>. Can you spot them?
            </ByteSays>

            {/* Fake popup */}
            <div className="rounded-3xl border-4 p-5 shadow-2xl" style={{background:p.bg,borderColor:p.border,animation:`slideUp 0.5s ${SPRING} 0.1s both`}}>
              <div className="font-black text-gray-800 text-lg mb-2">{p.title}</div>
              <p className="text-gray-700 font-semibold text-sm leading-relaxed mb-4">{p.text}</p>
              {phishAnswer===null&&(
                <div className="flex gap-3">
                  <button onClick={()=>setPhishAnswer(true)}
                    className="flex-1 py-3 rounded-2xl font-black text-white text-sm border-none cursor-pointer"
                    style={{background:"linear-gradient(135deg,#ef4444,#dc2626)",boxShadow:"0 4px 16px rgba(239,68,68,0.3)"}}>
                    🚫 SCAM!
                  </button>
                  <button onClick={()=>setPhishAnswer(false)}
                    className="flex-1 py-3 rounded-2xl font-black text-white text-sm border-none cursor-pointer"
                    style={{background:"linear-gradient(135deg,#22c55e,#16a34a)",boxShadow:"0 4px 16px rgba(34,197,94,0.3)"}}>
                    ✅ Real!
                  </button>
                </div>
              )}
            </div>

            {/* Feedback */}
            {phishAnswer!==null&&(
              <div className="bg-white rounded-3xl p-5 shadow-xl border-2 flex flex-col gap-3"
                style={{borderColor:phishAnswer===p.isScam?"#4ade80":"#f87171",animation:`bounceIn 0.5s ${SPRING} both`}}>
                <div className="text-2xl font-black text-center">{phishAnswer===p.isScam?"🎉 Correct!":"Not quite!"}</div>
                <div className="font-semibold text-gray-700 text-sm">{p.reason}</div>
                {phishIdx<PHISH.length-1
                  ?<button onClick={()=>{setPhishIdx(i=>i+1);setPhishAnswer(null);}} className="py-3 rounded-2xl font-black text-white text-sm border-none cursor-pointer" style={{background:GRAD}}>Next Pop-up ➡️</button>
                  :btn(()=>navigate(9),"Great work! Next up ➡️")}
              </div>
            )}

            {phishIdx===PHISH.length-1&&phishAnswer===null&&(
              <div className="bg-blue-50 rounded-2xl p-4 border-2 border-blue-100">
                <p className="text-blue-700 font-black text-sm text-center">
                  💡 Remember: Real websites NEVER ask for your password in pop-up boxes!
                </p>
              </div>
            )}
          </div>
        );
      }

      // ── 9: WHAT WOULD YOU DO? ─────────────────────────────────────────────
      case 9: {
        const s=WYD[wydIdx];
        return (
          <div className="flex flex-col gap-5 pb-10">
            <div className="text-center" style={{animation:`slideUp 0.5s ${SPRING} both`}}>
              <h2 className="text-3xl font-black" style={{background:GRAD,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
                What Would YOU Do? 🤔
              </h2>
              <p className="text-gray-500 font-bold mt-1 text-sm">Scenario {wydIdx+1} of {WYD.length}</p>
            </div>
            <ByteSays mood="wave">
              Let&apos;s test your Cyber Hero skills! What&apos;s the BEST thing to do in each situation?
            </ByteSays>

            <div key={wydIdx} className="bg-white rounded-3xl p-5 shadow-xl border-2 border-purple-100" style={{animation:`slideInR 0.4s ${SPRING} both`}}>
              <div className="flex items-center gap-3 mb-4">
                <span style={{fontSize:52}}>{s.emoji}</span>
                <p className="font-bold text-gray-700 text-base leading-snug">{s.situation}</p>
              </div>

              <div className="space-y-2.5 mb-3">
                {s.opts.map((opt,i)=>{
                  const sel=wydSel===i;
                  const isRight=s.correct===i;
                  let bg="#f9fafb",border="#e5e7eb",color="#374151";
                  if(wydSel!==null){if(isRight){bg="#dcfce7";border="#4ade80";color="#166534";}else if(sel){bg="#fee2e2";border="#f87171";color="#991b1b";}}
                  return (
                    <button key={i} onClick={()=>{if(wydSel!==null) return;setWydSel(i);if(isRight) setWydScore(sc=>sc+1);}} disabled={wydSel!==null}
                      className="w-full text-left rounded-2xl border-2 p-4 font-bold text-base transition-all duration-300 cursor-pointer min-h-[52px]"
                      style={{backgroundColor:bg,borderColor:border,color,animation:sel&&wydSel!==null&&isRight?`celebrate 0.6s ${SPRING} both`:undefined}}>
                      {opt}{isRight&&wydSel!==null&&" ✓"}
                    </button>
                  );
                })}
              </div>

              {wydSel!==null&&(
                <div className="rounded-2xl p-4 border-2 mb-4"
                  style={{background:s.correct===wydSel?"#f0fdf4":"#fff7ed",borderColor:s.correct===wydSel?"#4ade80":"#fed7aa",
                    animation:`bounceIn 0.5s ${SPRING} both`}}>
                  <div className="font-black text-lg mb-1">{s.correct===wydSel?"🎉 Perfect Cyber Hero choice!":"Good try — here's the best answer:"}</div>
                  <div className="font-semibold text-sm text-gray-600">{s.why}</div>
                </div>
              )}

              {wydSel!==null&&(
                wydIdx<WYD.length-1
                  ?<button onClick={()=>{setWydIdx(i=>i+1);setWydSel(null);}} className="w-full py-3 rounded-2xl font-black text-white text-sm border-none cursor-pointer" style={{background:GRAD}}>Next Scenario ➡️</button>
                  :btn(()=>navigate(10),"Awesome! Typing Challenge ➡️",{width:"100%"})
              )}
            </div>

            <div className="flex justify-center">
              <div className="bg-white rounded-full px-5 py-2 shadow border-2 border-yellow-100 font-black text-sm text-yellow-600">
                Score: {wydScore}/{WYD.length} ⭐
              </div>
            </div>
          </div>
        );
      }

      // ── 10: TYPING CHALLENGE ─────────────────────────────────────────────
      case 10: {
        const target=TYPING_PWS[typingPwIdx];
        return (
          <div className="flex flex-col gap-5 pb-10">
            <div className="text-center" style={{animation:`slideUp 0.5s ${SPRING} both`}}>
              <h2 className="text-3xl font-black" style={{background:GRAD,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
                Typing Challenge! ⌨️
              </h2>
              <p className="text-gray-500 font-bold mt-1 text-sm">Password {typingPwIdx+1} of {TYPING_PWS.length}</p>
            </div>
            <ByteSays mood="excited">
              Can you type this <strong>strong password</strong> exactly right? Each character lights up green when correct!
            </ByteSays>

            {!typingAllDone?(
              <div className="bg-white rounded-3xl p-5 shadow-xl border-2 border-blue-100" style={{animation:`slideUp 0.5s ${SPRING} 0.1s both`}}>
                <div className="text-center mb-4">
                  <div className="text-xs font-black text-blue-400 uppercase tracking-wider mb-2">Type this password:</div>
                  <div className="text-2xl font-black" style={{fontFamily:"monospace",color:"#1e40af",letterSpacing:"0.1em"}}>{target}</div>
                </div>

                {/* Character boxes */}
                <div className="flex gap-1.5 flex-wrap justify-center mb-4">
                  {Array.from(target).map((char,i)=>{
                    const typed=typingInput[i];
                    const status=!typed?"empty":typed===char?"correct":"wrong";
                    return (
                      <div key={i} className="w-9 h-9 rounded-lg border-2 font-black text-sm flex items-center justify-center transition-all duration-200"
                        style={{fontFamily:"monospace",
                          backgroundColor:status==="correct"?"#dcfce7":status==="wrong"?"#fee2e2":"#f9fafb",
                          borderColor:status==="correct"?"#4ade80":status==="wrong"?"#f87171":"#e5e7eb",
                          color:status==="correct"?"#166534":status==="wrong"?"#991b1b":"#9ca3af",
                          transform:status==="correct"?"scale(1.1)":"scale(1)"}}>
                        {typed||char}
                      </div>
                    );
                  })}
                </div>

                <input type="text" value={typingInput}
                  onChange={e=>{const v=e.target.value;if(v.length<=target.length) setTypingInput(v);}}
                  autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
                  placeholder="Type the password here..."
                  className="w-full text-center rounded-2xl border-2 border-purple-200 bg-purple-50 px-4 py-3 font-black text-base focus:outline-none focus:border-purple-400"
                  style={{fontFamily:"monospace"}}/>

                {isTypingCorrect&&(
                  <div className="mt-4 text-center" style={{animation:`bounceIn 0.5s ${SPRING} both`}}>
                    <div className="text-xl font-black text-green-600 mb-3">🎉 Perfect! You typed it exactly right!</div>
                    {typingPwIdx<TYPING_PWS.length-1
                      ?<button onClick={()=>{setTypingPwIdx(p=>p+1);setTypingInput("");}} className="px-6 py-3 rounded-2xl font-black text-white text-sm border-none cursor-pointer" style={{background:GRAD}}>Nice! Next Password ➡️</button>
                      :<button onClick={()=>setTypingAllDone(true)} className="px-6 py-3 rounded-2xl font-black text-white text-sm border-none cursor-pointer" style={{background:GRAD}}>All Done! 🎉</button>}
                  </div>
                )}
              </div>
            ):(
              <div className="flex flex-col items-center gap-4" style={{animation:`bounceIn 0.7s ${SPRING} both`}}>
                <div style={{fontSize:80,animation:`bobble 1.5s ease-in-out infinite`}}>⌨️</div>
                <p className="text-2xl font-black text-green-600">You can type strong passwords like a PRO!</p>
                {btn(()=>navigate(11),"Decoder Puzzle! 🔍 ➡️")}
              </div>
            )}
          </div>
        );
      }

      // ── 11: DECODER PUZZLE ────────────────────────────────────────────────
      case 11: {
        const nonSpaceTotal=DECODE_PHRASE.replace(/ /g,"").length;
        return (
          <div className="flex flex-col gap-5 pb-10">
            <div className="text-center" style={{animation:`slideUp 0.5s ${SPRING} both`}}>
              <h2 className="text-3xl font-black" style={{background:GRAD,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
                Password Decoder! 🕵️
              </h2>
            </div>
            <ByteSays mood="happy">
              I&apos;ve hidden a secret message! Each number stands for a letter (A=1, B=2, C=3…). <strong>Tap each tile</strong> to decode the message!
            </ByteSays>

            <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-purple-100 flex flex-col items-center gap-4"
              style={{animation:`slideUp 0.5s ${SPRING} 0.1s both`}}>
              <div className="text-sm font-black text-purple-400 uppercase tracking-wider">A=1, B=2, C=3… Z=26</div>

              {/* Decoder tiles */}
              <div className="flex gap-2 flex-wrap justify-center">
                {Array.from(DECODE_PHRASE).map((char,i)=>{
                  if(char===" ") return <div key={i} style={{width:16}}/>;
                  const encoded=DECODE_ENCODED[i];
                  const revealed=decRevealed.has(i);
                  return (
                    <div key={i} onClick={()=>!revealed&&setDecRevealed(s=>new Set([...s,i]))}
                      className="w-12 h-14 rounded-2xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer"
                      style={{backgroundColor:revealed?"#dcfce7":"#ede9fe",borderColor:revealed?"#4ade80":"#a78bfa",
                        animation:revealed?`flipCard 0.5s ${SPRING} both`:undefined,
                        transform:revealed?"scale(1.05)":"scale(1)"}}>
                      {revealed
                        ?<span className="text-xl font-black text-green-700">{char}</span>
                        :<span className="text-lg font-black text-purple-600">{encoded}</span>}
                    </div>
                  );
                })}
              </div>

              <div className="text-sm text-gray-500 font-bold">{decRevealed.size}/{nonSpaceTotal} letters revealed</div>

              {decDone&&(
                <div className="text-center" style={{animation:`bounceIn 0.6s ${SPRING} both`}}>
                  <div className="text-xl font-black text-green-600 mb-2">🎉 You decoded it! "{DECODE_PHRASE}"</div>
                  <div className="text-sm font-bold text-gray-500 mb-4">That&apos;s your password motto — remember it!</div>
                  {btn(()=>navigate(12),"Final Boss Challenge! 🦝 ➡️")}
                </div>
              )}
            </div>
          </div>
        );
      }

      // ── 12: BOSS QUIZ ────────────────────────────────────────────────────
      case 12: return (
        <div className="flex flex-col gap-4 pb-10">
          <div className="text-center" style={{animation:`slideUp 0.5s ${SPRING} both`}}>
            <h2 className="text-3xl font-black" style={{background:GRAD,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
              {bossDone?"You Did It! 🏆":"Final Boss Challenge! 🦝"}
            </h2>
          </div>

          {!bossDone?(
            <>
              {/* Raccoon + health bar */}
              <div className="bg-white rounded-3xl p-4 shadow-xl border-2 border-red-100" style={{animation:`slideUp 0.5s ${SPRING} 0.1s both`}}>
                <div className="flex items-center gap-4">
                  <div style={{fontSize:56,animation:raccoonHealth===0?"raccoonRun 1s forwards":bossFeedback===true?`raccoonHit 0.4s ease-in-out`:undefined}}>🦝</div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm font-black mb-1">
                      <span className="text-red-600">Hacker Raccoon</span>
                      <span className="text-red-600">{raccoonHealth}% HP</span>
                    </div>
                    <div className="h-5 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{width:`${raccoonHealth}%`,background:raccoonHealth>50?"linear-gradient(90deg,#ef4444,#f97316)":"linear-gradient(90deg,#f97316,#fbbf24)",
                          transition:`width 0.7s ${SPRING}`}}/>
                    </div>
                    <div className="text-xs text-gray-500 font-bold mt-1">Answer correctly to reduce HP! Each correct = -10%</div>
                  </div>
                </div>
              </div>

              {/* Score + progress */}
              <div className="flex items-center justify-between">
                <div className="bg-white rounded-full px-4 py-2 shadow border-2 border-blue-100 font-black text-sm text-blue-600">
                  Q{bossQIdx+1}/10 — Score: {bossScore}
                </div>
                <div className="flex gap-1">
                  {Array.from({length:10},(_,i)=>(
                    <div key={i} className="w-5 h-5 rounded-full border-2 transition-all"
                      style={{borderColor:i<bossQIdx?i<bossScore?"#4ade80":"#f87171":"#e5e7eb",
                        background:i<bossQIdx?i<bossScore?"#dcfce7":"#fee2e2":"white"}}/>
                  ))}
                </div>
              </div>

              {/* Question */}
              <div key={bossQIdx} className={bossQClass}>
                <div className="bg-white rounded-3xl p-5 shadow-xl border-2 border-purple-100">
                  <div className="font-black text-xl text-gray-800 mb-4 leading-snug">{BOSS_QUIZ[bossQIdx].q}</div>
                  <div className="space-y-2.5">
                    {BOSS_QUIZ[bossQIdx].opts.map((opt,i)=>{
                      const sel=bossSel===i,isRight=BOSS_QUIZ[bossQIdx].correct===i;
                      const col=OPTION_COLORS[i];
                      let bg=col.bg,border=col.border,color=col.color;
                      if(bossSel!==null){if(isRight){bg="#dcfce7";border="#4ade80";color="#166534";}else if(sel){bg="#fee2e2";border="#f87171";color="#991b1b";}}
                      return (
                        <button key={i} onClick={()=>handleBossAnswer(i)} disabled={bossSel!==null}
                          className="w-full text-left rounded-2xl border-2 p-4 font-bold text-base transition-all duration-300 cursor-pointer min-h-[52px]"
                          style={{backgroundColor:bg,borderColor:border,color,
                            animation:sel&&bossSel!==null&&isRight?`celebrate 0.6s ${SPRING} both`:undefined}}>
                          {["A)","B)","C)","D)"][i]} {opt}{isRight&&bossSel!==null&&" ✓"}
                        </button>
                      );
                    })}
                  </div>
                  {bossFeedback!==null&&(
                    <div className="mt-3 text-center font-black text-lg" style={{color:bossFeedback?"#16a34a":"#c2410c",animation:`bounceIn 0.5s ${SPRING} both`}}>
                      {bossFeedback?"💥 Hit! Raccoon lost 10% HP!":"Keep trying — next one! 💪"}
                    </div>
                  )}
                </div>
              </div>
            </>
          ):(
            <div className="flex flex-col items-center gap-5 text-center" style={{animation:`bounceIn 0.7s ${SPRING} both`}}>
              <div style={{fontSize:80}}>🦝💨</div>
              <p className="text-2xl font-black text-gray-700">The Hacker Raccoon ran away!</p>
              <p className="text-lg font-bold text-gray-500">You got <span className="font-black text-purple-600">{bossScore}/10</span> correct!</p>
              <div className="flex gap-2">
                {Array.from({length:3},(_,i)=>(
                  <span key={i} style={{fontSize:44,animation:`popIn 0.5s ${SPRING} ${i*150}ms both`}}>
                    {i<(bossScore>=8?3:bossScore>=6?2:1)?"⭐":"☆"}
                  </span>
                ))}
              </div>
              {btn(()=>navigate(13),"See What You've Learned! ➡️")}
            </div>
          )}
        </div>
      );

      // ── 13: SUMMARY ──────────────────────────────────────────────────────
      case 13: return (
        <div className="flex flex-col gap-5 pb-10">
          <div className="text-center" style={{animation:`slideUp 0.5s ${SPRING} both`}}>
            <h2 className="text-3xl font-black" style={{background:GRAD,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
              Look How Much You Learned! 🌟
            </h2>
          </div>
          <ByteSays mood="excited">
            You&apos;ve learned SO MUCH today! You are a <strong>real Cyber Hero</strong> now! Check out everything you can do:
          </ByteSays>

          <div className="space-y-3" style={{animation:`slideUp 0.5s ${SPRING} 0.1s both`}}>
            {ACHIEVEMENTS.map((ach,i)=>(
              <div key={i} className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-md border-2"
                style={{borderColor:i<achievePhase?"#4ade80":"#e5e7eb",opacity:i<achievePhase?1:0.2,
                  transition:"all 0.4s",animation:i===achievePhase-1?`tickIn 0.5s ${SPRING} both`:undefined}}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-500"
                  style={{background:i<achievePhase?GRAD:"#f3f4f6"}}>
                  <span className="text-white font-black text-sm">{i<achievePhase?"✓":i+1}</span>
                </div>
                <span className="font-bold text-gray-700 text-sm">{ach}</span>
                {i<achievePhase&&<span className="ml-auto text-lg" style={{animation:`popIn 0.4s ${SPRING} ${i*80}ms both`}}>⭐</span>}
              </div>
            ))}
          </div>

          {achievePhase>=ACHIEVEMENTS.length&&(
            <div className="flex flex-col items-center gap-3" style={{animation:`bounceIn 0.7s ${SPRING} both`}}>
              <p className="text-xl font-black text-purple-600">You&apos;ve earned them ALL! 🏆</p>
              {btn(()=>navigate(14),"Collect Your Certificate! 🎓 ➡️")}
            </div>
          )}
        </div>
      );

      // ── 14: GRADUATION ───────────────────────────────────────────────────
      case 14: return (
        <div className="flex flex-col items-center text-center gap-6 pb-10">
          <Confetti/>
          <div style={{animation:`popIn 0.7s ${SPRING} both`}}>
            <LottieOrFallback src="https://lottie.host/bc596350-72a0-4d10-9b44-f5f3a9cab499/YpBOmMONra.lottie"
              fallback={<TrophyIllustration/>} width={200} height={200}/>
          </div>

          <div style={{animation:`bounceIn 0.7s ${SPRING} 0.2s both`}}>
            <h2 className="text-4xl sm:text-5xl font-black leading-tight" style={{background:GRAD,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>🎉 CONGRATULATIONS! 🎉</h2>
            <p className="text-2xl font-black text-gray-700 mt-2">Week 1 Complete! You&apos;re a Cyber Hero! 🦸</p>
          </div>

          {/* Scores */}
          <div className="flex gap-3 flex-wrap justify-center" style={{animation:`slideUp 0.5s ${SPRING} 0.3s both`}}>
            <div className="bg-white rounded-2xl px-5 py-3 shadow border-2 border-blue-100">
              <div className="text-xs font-black text-blue-400 uppercase">Boss Quiz</div>
              <div className="text-2xl font-black text-blue-600">{bossScore}/10 ⭐</div>
            </div>
            <div className="bg-white rounded-2xl px-5 py-3 shadow border-2 border-yellow-100">
              <div className="text-xs font-black text-yellow-500 uppercase">Sorting Speed</div>
              <div className="text-2xl font-black text-yellow-600">{Array.from({length:sortingStars>0?sortingStars:1},()=>"⭐").join("")}</div>
            </div>
            <div className="bg-white rounded-2xl px-5 py-3 shadow border-2 border-green-100">
              <div className="text-xs font-black text-green-500 uppercase">Scenarios</div>
              <div className="text-2xl font-black text-green-600">{wydScore}/{WYD.length} ⭐</div>
            </div>
          </div>

          {/* Certificate */}
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border-4 relative"
            style={{borderColor:"#8b5cf6",background:"linear-gradient(135deg,#fefce8,#f0f4ff)",
              animation:`popIn 0.7s ${SPRING} 0.5s both`,boxShadow:"0 0 60px rgba(139,92,246,0.2)"}}>
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-lg"
              style={{background:"linear-gradient(135deg,#fbbf24,#f59e0b)"}}>⭐</div>
            <div className="text-xs font-black text-purple-400 uppercase tracking-widest mb-3">Certificate of Achievement</div>
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{background:GRAD}}>
                <span className="font-black text-white text-lg">AX</span>
              </div>
            </div>
            <div style={{fontSize:48,animation:`bobble 2s ease-in-out infinite`}}>🛡️</div>
            <div className="text-xl font-black text-purple-700 mt-1">{userName}</div>
            <div className="text-2xl font-black" style={{background:GRAD,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>CYBER HERO</div>
            <div className="text-sm font-bold text-gray-600 mt-2">Has completed:</div>
            <div className="text-base font-black text-gray-800">What is a Password? 🔐</div>
            <div className="text-xs text-gray-400 font-bold border-t border-gray-100 pt-3 mt-3">
              AlgorithmX Cyber Heroes Academy<br/>Awarded: {today}
            </div>
            <div className="flex justify-center gap-1 mt-2">
              {Array.from({length:5},(_,i)=>(
                <span key={i} className="text-xl" style={{animation:`popIn 0.4s ${SPRING} ${i*100}ms both`,color:i<Math.ceil(bossScore/2)?"#fbbf24":"#d1d5db"}}>★</span>
              ))}
            </div>
          </div>

          <a href="/dashboard" onMouseEnter={e=>(e.currentTarget.style.transform="scale(1.06)")}
            onMouseLeave={e=>(e.currentTarget.style.transform="scale(1)")}
            style={{background:GRAD,color:"#fff",fontWeight:900,fontSize:17,padding:"13px 34px",borderRadius:20,
              border:"none",cursor:"pointer",boxShadow:"0 8px 32px rgba(139,92,246,0.3)",
              transition:"transform 0.2s",minHeight:54,textDecoration:"none",display:"inline-block",
              animation:`slideUp 0.5s ${SPRING} 0.9s both`}}>
            Back to Dashboard 🏠
          </a>
        </div>
      );

      default: return null;
    }
  };

  // ── RENDER ────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{CSS}</style>
      <FloatingBubbles/>
      <div className="min-h-screen bg-[#f0f4ff] relative" style={{zIndex:1}}>
        <header className="sticky top-0 z-40 border-b border-purple-100 shadow-sm"
          style={{background:"rgba(255,255,255,0.88)",backdropFilter:"blur(20px)"}}>
          <div className="max-w-2xl mx-auto px-5 py-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <a href="/dashboard" className="font-black text-sm transition"
                style={{color:"#8b5cf6",textDecoration:"none"}}>← Dashboard</a>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow" style={{background:GRAD}}>
                  <span className="text-xs font-black text-white">AX</span>
                </div>
                <span className="font-black text-gray-700 text-sm hidden sm:block">Week 1 · What is a Password?</span>
              </div>
            </div>
            <ProgressBar step={screen}/>
            <StepDots step={screen}/>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-5 pt-8">
          <div key={screen} className={animClass}>{renderScreen()}</div>
        </main>
      </div>
    </>
  );
}
