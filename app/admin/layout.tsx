import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/app/lib/auth";
import { isStaffUser } from "@/app/lib/aiClearedStaff";
import CubeMark from "@/app/components/CubeMark";
import AdminNav from "./AdminNav";
import RefreshButton from "./RefreshButton";
import { SignOutIcon } from "./icons";
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

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/admin-login" });
  }

  return (
    <div className="admin-ui">
      <header className="admin-top">
        <Link href="/admin" className="admin-brand">
          <CubeMark size={26} color="#0a7085" code />
          <span className="admin-wordmark">
            <span className="admin-wordmark-main">ALGORITHM</span>
            <span className="admin-wordmark-x">X</span>
          </span>
          <span className="admin-badge">Admin</span>
        </Link>
        <AdminNav />
        <div className="admin-right">
          <RefreshButton />
          <span className="admin-who">{session.user.email}</span>
          <form action={handleSignOut}>
            <button type="submit" className="admin-signout">
              <SignOutIcon /> Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="admin-main">{children}</main>
    </div>
  );
}
