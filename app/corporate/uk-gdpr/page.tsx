import type { Metadata } from "next";
import CorporateSubpage from "../CorporateSubpage";

/**
 * /corporate/uk-gdpr - what UK GDPR and the ICO already expect when staff use
 * AI tools, and why Cyber Essentials does not cover it. Dated on the page.
 */
export const metadata: Metadata = {
  title: "UK GDPR and the ICO: what applies when staff use AI tools | AI Cleared by AlgorithmX",
  description:
    "The UK has no AI literacy statute yet. It has UK GDPR, and the ICO treats client or employee data pasted into an unapproved AI tool the way it treats any other loss of control over personal data. What applies, what a breach looks like, and what evidence the ICO asks for.",
  alternates: { canonical: "https://algorithmx.io/corporate/uk-gdpr" },
  openGraph: {
    title: "UK GDPR and the ICO: what applies when staff use AI tools",
    description: "The duties that already apply to a UK firm whose staff use Copilot, ChatGPT, Gemini or Claude.",
    url: "https://algorithmx.io/corporate/uk-gdpr",
    siteName: "AlgorithmX",
    type: "article",
  },
};

export default function UkGdprPage() {
  return (
    <CorporateSubpage
      eyebrow="// Regulation · UK GDPR and the ICO"
      title={<>What the ICO expects <span className="corp-sub-grad">when staff use AI.</span></>}
      lede="The UK has no AI literacy statute yet. It does have UK GDPR, and the Information Commissioner's Office treats client or employee data pasted into an unapproved AI tool the way it treats any other loss of control over personal data. These are the duties that already apply to a firm whose staff use Copilot, ChatGPT, Gemini or Claude."
      asOf="26 September 2026"
      sections={[
        {
          heading: "The duties that already apply",
          body: (
            <>
              <p>Three parts of UK GDPR do the work, and none of them mention AI, because they do not need to.</p>
              <ul>
                <li><strong>Article 5(1)(f), integrity and confidentiality.</strong> Personal data must be processed in a way that ensures appropriate security, including protection against unauthorised or unlawful processing. A client&rsquo;s details typed into a personal chatbot account are being processed by whoever runs that account.</li>
                <li><strong>Article 32, security of processing.</strong> The firm must put in place appropriate technical and organisational measures. The ICO has been consistent for years that staff training is an organisational measure, and that a policy nobody has been trained on is not one.</li>
                <li><strong>Article 39(1)(b), the DPO&rsquo;s tasks.</strong> Where a firm has a data protection officer, awareness-raising and training of the staff involved in processing is written into their job.</li>
              </ul>
            </>
          ),
        },
        {
          heading: "When a paste becomes a breach",
          body: (
            <>
              <p>A personal data breach is a breach of security leading to the accidental or unlawful destruction, loss, alteration, unauthorised disclosure of, or access to, personal data. Pasting a client&rsquo;s name and circumstances into a tool that the firm has not assessed, on an account the firm does not control, can meet that definition, whether or not anyone at the tool&rsquo;s vendor ever reads it.</p>
              <p>Under Article 33 a breach must be reported to the ICO within 72 hours of the firm becoming aware of it, unless it is unlikely to result in a risk to the people concerned. Either way the firm has to record it, with its assessment of why it did or did not report. That record is only possible if the member of staff tells someone the same day, which is why the reporting route is a training matter rather than a paperwork one.</p>
            </>
          ),
        },
        {
          heading: "What the ICO has said about generative AI",
          body: (
            <>
              <p>The ICO&rsquo;s guidance on AI and data protection, and its consultation series on generative AI, put the emphasis in the same three places: a lawful basis for any personal data that goes into a tool, purpose limitation so that data collected for one thing is not fed into another, and keeping personal data out of tools that were never assessed for it. The ICO expects a firm to know which tools its staff use, and to be able to show that the people using them understand the rules.</p>
            </>
          ),
        },
        {
          heading: "Cyber Essentials does not cover this",
          body: (
            <>
              <p>Cyber Essentials is about five technical controls: firewalls, secure configuration, access control, malware protection and patching. It is the right certification to hold, and it says nothing about what a member of staff types into a chat window. A firm can be fully certified and still lose a client&rsquo;s file through a prompt. The gap between the two is exactly what AI training closes.</p>
            </>
          ),
        },
        {
          heading: "The evidence the ICO asks for",
          body: (
            <>
              <p>When the ICO looks at a firm after an incident, the questions are practical.</p>
              <ul>
                <li>Was there a policy that named the approved tools and the rules for personal data?</li>
                <li>Were staff trained on it, and when? Is there a register?</li>
                <li>Had the tools in use been assessed for personal data before staff used them?</li>
                <li>Was the incident spotted, reported internally and recorded promptly?</li>
              </ul>
              <p>A firm that can answer all four with documents is in a very different position from one that can only say it told people to be careful.</p>
            </>
          ),
        },
      ]}
      maps={[
        "The policy: a starter AI use policy that names the approved tools, the four data classes and the reporting route, written from your own answers.",
        "The training: five modules every member of staff completes, including what each tool does with data and what to do the moment something goes wrong, with the firm's own contact on screen.",
        "The register: who completed what and when, with scores, exportable for the ICO, an insurer or a client.",
        "The habit: the paste test, practised against a live AI on invented data, so the rule is a reflex rather than a page in a handbook.",
      ]}
    />
  );
}
