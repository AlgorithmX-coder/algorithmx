import type { Metadata } from "next";
import CorporateSubpage from "../CorporateSubpage";

/**
 * /corporate/eu-ai-act - the AI literacy duty in Article 4 of the EU AI Act,
 * in plain English for a UK firm, and how a training register answers it.
 * The reading is dated on the page; check it at each refresh of the course.
 */
export const metadata: Metadata = {
  title: "EU AI Act Article 4: the AI literacy duty for firms | AI Cleared by AlgorithmX",
  description:
    "Since February 2025, firms that deploy AI have had a duty to ensure their staff are AI literate. What Article 4 asks, whether it reaches a UK firm, what counts as evidence, and how AI Cleared answers it.",
  alternates: { canonical: "https://algorithmx.io/corporate/eu-ai-act" },
  openGraph: {
    title: "EU AI Act Article 4: the AI literacy duty, in plain English",
    description: "What the duty asks of a firm that uses Copilot, ChatGPT, Gemini or Claude, and what evidence looks like.",
    url: "https://algorithmx.io/corporate/eu-ai-act",
    siteName: "AlgorithmX",
    type: "article",
  },
};

export default function EuAiActPage() {
  return (
    <CorporateSubpage
      eyebrow="// Regulation · EU AI Act, Article 4"
      title={<>The AI literacy duty, <span className="corp-sub-grad">in plain English.</span></>}
      lede="Since 2 February 2025, firms that deploy AI systems have had a duty under Article 4 of the EU AI Act to make sure their staff have a sufficient level of AI literacy. Here is what that asks of a UK firm that uses Copilot, ChatGPT, Gemini or Claude, and what evidence of meeting it looks like."
      asOf="26 September 2026"
      sections={[
        {
          heading: "What Article 4 says",
          body: (
            <>
              <p>The Article is one sentence long. Providers and deployers of AI systems must take measures to ensure, to their best extent, a sufficient level of AI literacy of their staff and other persons dealing with the operation and use of AI systems on their behalf. It asks them to take into account those people&rsquo;s technical knowledge, experience, education and training, the context the AI systems are used in, and the people the systems are used on.</p>
              <p>Three words carry the weight. <strong>Deployer</strong> means any organisation using an AI system under its own authority, which includes a firm whose staff use a general purpose assistant for work. <strong>Sufficient</strong> is relative to the role and the risk, so a partner drafting advice and a receptionist summarising a call are not held to the same bar. <strong>Measures</strong> means something you did, on purpose, that you can show.</p>
            </>
          ),
        },
        {
          heading: "Does it reach a UK firm?",
          body: (
            <>
              <p>The Act applies to deployers established in the EU, and to providers and deployers outside the EU where the output of the AI system is used in the EU. A UK firm with EU clients, EU offices, or staff based in an EU member state is likely to be within scope for the work that touches them.</p>
              <p>Where it does not bite directly, it arrives another way. EU clients and EU-headquartered groups are starting to ask their suppliers for evidence of AI literacy measures in the same questionnaires that already ask about Cyber Essentials and data protection training. The duty on them becomes a question to you.</p>
            </>
          ),
        },
        {
          heading: "What sufficient looks like",
          body: (
            <>
              <p>The Act does not prescribe a course, an hour count or a certificate. The European Commission&rsquo;s guidance describes a proportionate approach: a general understanding for everyone who uses AI at work, more for people whose role or sector carries more risk, adjusted for the tools actually in use, and a record kept of what was done.</p>
              <ul>
                <li>A baseline for all staff: what the tools do with what they are given, what may and may not go in, and how to check what comes out.</li>
                <li>Role-specific depth where the risk is higher: finance, HR, legal, anyone handling personal or client data.</li>
                <li>Content matched to the actual tools, refreshed when those tools or their terms change.</li>
                <li>A record of who was trained, on what, and when.</li>
              </ul>
            </>
          ),
        },
        {
          heading: "When it started, and when it is enforced",
          body: (
            <>
              <p>The duty has applied since 2 February 2025, ahead of most of the Act. Supervision of it by national market surveillance authorities begins on 2 August 2026, and penalties for breaches of Article 4 are set by each member state rather than by the Act itself. In practice the earliest consequence for most firms is contractual: a client who asks for evidence and does not get it.</p>
            </>
          ),
        },
        {
          heading: "What counts as evidence",
          body: (
            <>
              <p>An auditor, a client&rsquo;s procurement team or a regulator will ask for the same four things.</p>
              <ul>
                <li>A written AI use policy that names the approved tools and the rules for data.</li>
                <li>A training register: each person, the content they completed, the date and the result.</li>
                <li>Proof the content fits the tools and roles in the firm, not a generic slide deck.</li>
                <li>A refresh cadence, so the record is current rather than a one-off from the year the duty began.</li>
              </ul>
            </>
          ),
        },
      ]}
      maps={[
        "A baseline for everyone: five core modules covering what the tools do with data, the four data classes, the firm's approved tools, verifying output, and shadow AI.",
        "Depth by role: eight tracks with scenarios and practice data from that role's own desk.",
        "Content matched to the tools: every vendor fact carries the date it was verified, and the course refreshes as the tools change.",
        "The register: who completed what, when, with scores, exportable for a client questionnaire or an audit, and a certificate per person and per firm.",
        "The policy: a starter AI use policy written from your own profile answers, free, on the AI Cleared page.",
      ]}
    />
  );
}
