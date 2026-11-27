import DeadEnd from "@/app/components/dead-end/DeadEnd";
import AskedPath from "@/app/components/dead-end/AskedPath";

/**
 * 404: the owner-approved round 8 dead end (landing lab r8-state.html?s=404),
 * in the light Hologram house. A red "404" chip, the address that missed,
 * and four ways back in: home, schools, firms and sign in. The words are the
 * approved round 7 rewrite that replaced the old "AlgorithmX OS" copy.
 */
export default function NotFound() {
  return (
    <DeadEnd
      lockup="ax"
      back={{ href: "/", label: "Back to home" }}
      err
      eyebrow="404 · Page not found"
      title="This page isn’t here"
      asked={<AskedPath />}
      glyph="404"
      ways={[
        { href: "/", icon: "home", tint: "10,112,133", title: "Home", sub: "Every course, for every age" },
        { href: "/schools", icon: "cap", tint: "180,83,9", title: "Schools", sub: "Courses and licences for your pupils" },
        { href: "/corporate", icon: "case", tint: "79,70,229", title: "Firms", sub: "Training for your whole team" },
        { href: "/login", icon: "signin", tint: "165,17,127", title: "Sign in", sub: "Back to your course" },
      ]}
      foot={
        <>
          Think this link should work? Tell us at <a href="mailto:support@algorithmx.co.uk">support@algorithmx.co.uk</a>
        </>
      }
    >
      <p>The link may be old, or the address has a typo. Pick a way back in.</p>
    </DeadEnd>
  );
}
