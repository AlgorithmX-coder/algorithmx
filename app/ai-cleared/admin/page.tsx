import { redirect } from "next/navigation";

/* The firm admin console moved to the Cyber Secured portal, where one
 * register covers every course. Old links and bookmarks land there. */
export default function AdminPage() {
  redirect("/cyber-secured/admin");
}
