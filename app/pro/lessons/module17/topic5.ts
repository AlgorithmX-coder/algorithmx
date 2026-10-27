import type { TopicManifest } from "../../learn/types";
import { AuditEvidenceLab } from "../../learn/conceptLabs";

/* Module 17 - Topic 5: audits and evidence. Case: the independent audit
 * and certification process (e.g. ISO 27001 audits) that verifies
 * controls really exist and work through evidence, the mechanism that
 * keeps security honest. Public record: established audit / certification
 * practice. */
const topic5: TopicManifest = {
  id: "m17t5",
  weekLabel: "Module 17",
  act: "Act 4 - Get hired",
  title: "Audits & evidence",
  role: "Audits are how an organisation proves, to itself, to customers, to regulators, that its security is real, not just claimed. Understanding what an audit checks and what counts as evidence is central to GRC, and audit-related roles are a common, accessible entry point.",
  minutes: 15,
  promise: "Learn how audits keep security honest by demanding evidence, not claims, and what makes good evidence, your small-business risk assessment awaits.",
  brief: "In this lesson, we'll close the GRC module with audits: the independent checks that verify controls really exist and work, through evidence rather than assurances. We'll see what an audit is, why 'prove it' is its guiding principle, and what counts as good evidence. Audit and assessment work is also a common way into GRC. Then we'll see how the audit process keeps security honest, and you'll pull the module together into a small-business risk assessment.",

  learn: [
    {
      heading: "Audits: trust, but verify",
      body: [
        "An audit is an independent check that an organisation's controls really exist and work as claimed. Its guiding principle is simple and powerful: prove it. An auditor does not take 'yes, we do that' at face value; they ask for evidence that the control is genuinely in place and operating. This is exactly the antidote to the 'policy on paper' trap from earlier: audits exist to catch the gap between what is documented and what is real.",
        "Audits can be internal (the organisation checking itself) or external (an independent party, for certification like ISO 27001, or for a customer or regulator). Either way, the discipline is the same: verify through evidence. For GRC, audits are both a tool (to find and fix gaps) and a deliverable (certification, compliance). And crucially, audit and assessment roles are a common, accessible entry into the field, often suiting methodical, detail-oriented people from non-technical backgrounds.",
      ],
      examples: [
        "An audit independently checks that controls really exist and work: 'prove it'.",
        "Internal (self-check) or external (certification, customer, regulator).",
        "Audit and assessment roles are a common, accessible way into GRC.",
      ],
      analogy: {
        plain: "A safety inspector does not just read your fire-safety policy; they check the extinguishers are charged and the exits open. Audits verify reality, not paperwork.",
        realTerm: "audit",
      },
    },
    {
      heading: "What counts as evidence",
      body: [
        "Because audits run on proof, understanding evidence is essential. Good audit evidence is verifiable and concrete: logs and configuration showing a control is enforced, dated records of a review actually being done, tool reports confirming systems meet a standard. What does not count is verbal assurance ('trust us, we do that'), a policy document that is never followed, or claims with nothing to back them. Evidence must be something an independent person can examine and believe.",
        "This 'show me the evidence' mindset is one of the most valuable habits in GRC, and in security generally. It guards against false assurance, keeps controls honest (a control that must produce evidence is a control someone maintains), and makes an organisation's security demonstrable to outsiders. Learning to ask 'what is the evidence this actually works?' is a skill that serves you throughout a security career, not just in audits.",
      ],
      examples: [
        "Good evidence: logs, configuration, dated review records, tool reports, verifiable.",
        "Not evidence: verbal assurance, an unfollowed policy, unbacked claims.",
        "Evidence must be examinable and believable by an independent person.",
      ],
    },
    {
      heading: "How audits keep security honest, and continually improving",
      body: [
        "Audits do more than certify; they drive improvement. By systematically checking controls against a standard and demanding evidence, audits surface gaps, the controls that are weak, missing, or exist only on paper, which then become a prioritised list of things to fix. A good audit is not a box-ticking ordeal but a health check that makes the organisation genuinely more secure, and it recurs, so improvement is ongoing.",
        "This closes the GRC loop: policies and standards set what should be true, controls make it true, and audits verify it is true and find where it is not, feeding back into improvement. It is how an organisation moves from 'we think we are secure' to 'we can demonstrate we are, and we know our gaps'. That honest, evidence-based, continually-improving posture is the goal of GRC, and understanding it, and being able to do the assessment work, is exactly what makes GRC a strong, accessible career for a thoughtful beginner.",
      ],
      examples: [
        "Audits surface gaps, which become a prioritised list of fixes.",
        "A good audit is a health check that genuinely improves security, and it recurs.",
        "The loop: policies set it, controls make it true, audits verify and improve it.",
      ],
      analogy: {
        plain: "A regular health check-up does not just certify you are well; it catches problems early and tells you what to work on. Audits do that for an organisation's security.",
        realTerm: "audit-driven improvement",
      },
    },
  ],

  glossary: [
    { term: "audit", definition: "An independent check that controls really exist and work as claimed, verified through evidence; its principle is 'prove it'." },
    { term: "audit evidence", definition: "Verifiable, concrete proof a control works (logs, configuration, dated records, tool reports), not verbal assurance or unfollowed policies." },
    { term: "internal vs external audit", definition: "Internal audits are self-checks; external audits are by an independent party, e.g. for certification, a customer or a regulator." },
    { term: "finding", definition: "A gap an audit identifies between what is required and what is real; findings become a prioritised list of improvements." },
  ],

  seeHeading: "How 'prove it' keeps security honest",

  cases: [
    {
      org: "The audit & certification process",
      year: "established",
      headline: "Independent audits verify security is real, through evidence, not claims",
      whatHappened: "Across the industry, independent audit and certification processes (such as ISO 27001 audits) keep organisational security honest by demanding evidence. Rather than accept that controls are in place, auditors require verifiable proof, logs, configurations, dated records, tool outputs, that each control genuinely exists and operates. This 'prove it' discipline catches the gap between documented and actual security, drives organisations to fix the gaps found, and gives customers and regulators credible assurance. It is the mechanism that turns 'we take security seriously' into something demonstrable and trustworthy.",
      theMissedMeasure: "The audit process IS the measure: evidence-based verification that controls work, recurring so improvement is continual. It is the antidote to false assurance and the 'policy on paper' trap, and the mechanism that makes certification (and the trust it unlocks) meaningful.",
      theCost: "Here the value is honesty and trust: audits convert claimed security into demonstrated security, surface real gaps for fixing, and give the credible assurance that underpins certification and commercial relationships, the constructive culmination of GRC.",
      control: "secure-configuration",
      impact: ["audits verify controls through evidence, not claims", "catch the gap between documented and real security", "drive fixes and give credible assurance"],
      source: "Public record; established audit and certification practice (e.g. ISO 27001).",
      brandColor: "#1b5e9c",
      news: { headline: "Audits and evidence: how 'prove it' keeps organisational security honest", outlet: "Audit / certification practice (established)", date: "established" },
    },
  ],

  lab: {
    title: "Good evidence, or not?",
    intro: "Nothing to install and nothing leaves this page. For each, decide: is it good audit evidence that a control works, or not real evidence?",
    prompts: [
      "Good evidence is verifiable and concrete: logs, configuration, dated records, tool reports.",
      "Verbal assurance, unfollowed policies and unbacked claims are not evidence.",
      "'Prove it' is the auditor's, and the good GRC professional's, mindset.",
    ],
    component: AuditEvidenceLab,
  },

  check: {
    explain: {
      prompt: "Explain what an audit is and its guiding principle, what counts as good evidence, and how audits keep security honest and improving.",
      modelAnswer: "An audit is an independent check that an organisation's controls really exist and work as claimed, and its guiding principle is 'prove it': an auditor does not accept 'yes, we do that' at face value but requires evidence that each control is genuinely in place and operating, which is the antidote to the 'policy on paper' trap. Good evidence is verifiable and concrete, logs and configuration showing a control is enforced, dated records of a review actually being done, tool reports confirming a standard is met, while verbal assurance, an unfollowed policy, or unbacked claims do not count; evidence must be something an independent person can examine and believe. Audits keep security honest and improving because by systematically checking controls against a standard and demanding evidence, they surface the gaps, controls that are weak, missing or exist only on paper, which become a prioritised list of fixes, and because audits recur, that improvement is ongoing. This closes the GRC loop: policies and standards set what should be true, controls make it true, and audits verify it is true and find where it is not, moving an organisation from 'we think we are secure' to 'we can demonstrate we are, and we know our gaps'.",
    },
    quiz: [
      {
        q: "What is the guiding principle of an audit?",
        options: [
          "Accept management's assurances, since they understand their own systems best of all",
          "Check that every required policy has at least been written down and signed off",
          "Identify who should be held responsible when a control eventually fails or is bypassed",
          "'Prove it': require evidence that controls genuinely exist and work, not just claims",
          "Trust a control if it is backed by a clearly written and approved policy",
        ],
        answer: 3,
        reasons: [
          "An auditor does not take assurances at face value. The whole point is to verify independently, with evidence, rather than trust claims.",
          "A written, signed policy is not proof the control works. 'Prove it' asks for evidence of the control operating, not just documents.",
          "Apportioning blame is not an audit's guiding principle. Its job is to verify, through evidence, that controls genuinely exist and work.",
          "Right. Audits verify reality through evidence, catching the gap between documented and actual security.",
          "A policy behind a control is a start, not the proof. The principle is to see evidence the control actually operates, not just that it is documented.",
        ],
      },
      {
        q: "Which is good audit evidence that a control works?",
        options: [
          "Logs and configuration records showing the control is actually being enforced",
          "A written policy document stating that the control is required to be in place",
          "An email from the team promising the control will be switched on next quarter",
          "A vendor brochure describing what the security tool is designed to be able to do",
          "A senior manager's verbal confirmation that the control is definitely working well",
        ],
        answer: 0,
        reasons: [
          "Right. Verifiable, concrete records are evidence that a control is genuinely operating. Verbal assurance and unfollowed policies are not.",
          "A policy requires the control; it does not prove the control is running. That is the 'policy on paper' gap audits exist to catch.",
          "A promise about the future is not evidence that the control works now. Evidence must show the control operating, not a plan to enable it.",
          "A brochure shows what a tool can do, not that you have it switched on and enforced. That is marketing, not audit evidence.",
          "Verbal confirmation is exactly what 'prove it' refuses to accept. An auditor needs records they can examine, not someone's say-so.",
        ],
      },
      {
        q: "How do audits keep security improving?",
        options: [
          "They remove the need for controls altogether once a certificate has been issued",
          "They freeze the security setup so that nothing can change after certification is granted",
          "They surface gaps as findings that become a prioritised list of fixes, and they recur, so improvement is ongoing",
          "They hand all of the organisation's security decisions over to the external auditor",
          "They reward teams with a certificate rather than pointing out any weaknesses",
        ],
        answer: 2,
        reasons: [
          "Certification does not remove the need for controls; the controls are what keep you secure. Audits check those controls, they do not replace them.",
          "Audits do not freeze anything. They surface gaps to fix and recur over time, so security keeps changing for the better.",
          "Right. A good audit is a recurring health check that drives genuine, continual improvement, closing the GRC loop.",
          "Auditors verify and advise; they do not take over the organisation's security decisions. Responsibility stays with the organisation.",
          "A good audit does more than hand out a certificate: it points out the gaps (findings) so they can be fixed, which is what drives improvement.",
        ],
      },
    ],
  },

  wrap: {
    headline: "You finished Module 17: you understand GRC, the accessible career lane, and how audits and evidence keep security honest.",
    takeaways: [
      "An audit independently verifies controls work, on the principle 'prove it', catching the paper-versus-real gap.",
      "Good evidence is verifiable and concrete (logs, records, tool reports); verbal assurance and unfollowed policies are not.",
      "Audits surface gaps and recur, driving continual improvement, and audit roles are an accessible GRC entry point.",
    ],
    project: {
      name: "Write a small-business risk assessment",
      blurb: "Pull the whole module together: for a small business (real or imagined), write a short risk assessment, list its main cyber risks, rate each by likelihood and impact, and recommend a treatment (reduce/transfer/avoid/accept) and a control for the top few. This is your Act 4 GRC portfolio piece, and exactly the kind of practical deliverable a GRC employer wants to see you can produce.",
    },
    ethicsNote: "Audits and assessments are conducted honestly and independently, with evidence, respecting confidentiality and the law. GRC's integrity depends on 'prove it', never box-ticking or false assurance. Next, Module 19 turns to resilience: surviving the bad day.",
  },
};

export default topic5;
