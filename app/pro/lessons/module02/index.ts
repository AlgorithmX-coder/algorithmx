import type { WeekManifest } from "../../learn/types";
import topic1 from "./topic1";
import topic2 from "./topic2";
import topic3 from "./topic3";
import topic4 from "./topic4";
import topic5 from "./topic5";

/* Module 2 - How the internet actually works. The plumbing attackers use
 * (Security+ Domain 3; Network+ foundations), taught through five real
 * outages and attacks and hands-on flow labs. No jargon before it is
 * defined; every piece ties back to the three-stage flow the module
 * builds: the lookup, the journey, the destination. */
const module02: WeekManifest = {
  id: "module-02",
  weekLabel: "Module 2",
  act: "Act 1 - Foundations you can touch",
  title: "How the internet actually works",
  intro: "The plumbing every attacker uses, explained without jargon. Across five short topics you will follow a message's real journey, learn how names become addresses, see what the padlock does and does not protect, make sense of ports and protocols, and finish with a single map that places any network attack where it belongs. Each idea is taught through a real outage or breach.",
  role: "This is the network foundation every certificate assumes (Security+ Domain 3; Network+ basics). Every log you will read and every attack you will investigate happens somewhere on the flow this module teaches.",
  outcomes: [
    "Picture the journey of a packet from your device to a server and back",
    "Explain how DNS turns a name into an address, and why it is a prime target",
    "Say precisely what HTTPS and the padlock protect, and what they do not",
    "Read the common ports and protocols, and spot a dangerous open door",
    "Place any network attack on the lookup / journey / destination map",
  ],
  topics: [topic1, topic2, topic3, topic4, topic5],
};

export default module02;
