import { redirect } from "next/navigation";

/**
 * /cyberstart-pro — legacy URL. The Cyber Pro landing now lives at /pro;
 * this permanently sends the old URL there so existing links still work.
 * (The DB product slug is still "cyberstart-pro"; only the route moved.)
 */
export default function CyberStartProRedirect() {
  redirect("/pro");
}
