import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { isStaffUser } from "@/app/lib/aiClearedStaff";
import CubeMark from "@/app/components/CubeMark";
import AdminNav from "./AdminNav";
import "./admin.css";

/* /admin: the staff-only view of every customer - schools, firms and
 * individuals, one portal, three tabs. One flat permission tier: any
 * staff user (role "staff", or PLATFORM_STAFF_EMAILS) sees and does
 * everything here, same gate as /ai-cleared/ops. Every page underneath
 * still re-checks staff status itself - a page is a public endpoint
 * whatever renders around it. Styling lives in ./admin.css, shared by
 * every page under here and by /admin-login. */
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/admin-login?callbackUrl=%2Fadmin");
  if (!(await isStaffUser(session.user.id))) {
    return (
      <div className="admin-ui admin-gate">
        <p className="admin-gate-who">Signed in as {session.user.email}</p>
        <p>This area is for AlgorithmX staff.</p>
        <Link href="/">Back to the site</Link>
      </div>
    );
  }

  return (
    <div className="admin-ui">
      <header className="admin-top">
        <span className="admin-brand"><CubeMark size={20} color="#0a7085" code /> AlgorithmX &middot; <i>Admin</i></span>
        <AdminNav />
        <span className="admin-who">{session.user.email}</span>
      </header>
      <main className="admin-main">{children}</main>
    </div>
  );
}
