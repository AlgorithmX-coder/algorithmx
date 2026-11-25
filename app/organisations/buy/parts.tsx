/* Shared words for the organisations buy and thanks pages (Order Desk skin). */

export const ORG_FOOT_LEFT = (
  <>Questions about places: <a href="mailto:schools@algorithmx.co.uk">schools@algorithmx.co.uk</a></>
);
export const ORG_FOOT_RIGHT = "AlgorithmX · For organisations";

/* The three steps after paying, as the buy page has always listed them. */
export function OrgSteps() {
  return (
    <div className="odk-steps">
      <div className="odk-step">
        <div className="n">01</div>
        <b>You get an email</b>
        <span>It lands within a minute of paying and sets up your account.</span>
      </div>
      <div className="odk-step">
        <div className="n">02</div>
        <b>Make your groups</b>
        <span>Name a group, pick its course, and paste in your register of first names.</span>
      </div>
      <div className="odk-step">
        <div className="n">03</div>
        <b>They sign in and play</b>
        <span>
          Each one gets a login card with the group code on it. No email address, no password to
          remember.
        </span>
      </div>
    </div>
  );
}
