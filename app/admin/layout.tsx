import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/app/lib/auth";
import { isStaffUser } from "@/app/lib/aiClearedStaff";
import BrandCube from "@/app/components/BrandCube";
import AdminNav from "./AdminNav";
import AdminCrumb from "./AdminCrumb";
import LiveRefresh from "./RefreshButton";
import Wordmark from "./Wordmark";
import { SignOutIcon } from "./icons";
import "./admin.css";

/* /admin: the staff-only management console - schools, organisations,
 * firms and individuals, one portal. One flat permission tier: any staff
 * user (role "staff", or PLATFORM_STAFF_EMAILS) sees and does everything
 * here, same gate as /ai-cleared/ops. Every page underneath still
 * re-checks staff status itself - a page is a public endpoint whatever
 * renders around it. Styling lives in ./admin.css, shared by every page
 * under here and by /admin-login. */
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/admin-login?callbackUrl=%2Fadmin");
  if (!(await isStaffUser(session.user.id))) {
    return (
      <div className="admin-ui admin-gate">
        <BrandCube size={44} />
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

  const email = session.user.email ?? "";
  const initial = (session.user.name ?? email).trim().charAt(0).toUpperCase() || "A";

  return (
    <div className="admin-ui">
      <div className="admin-shell">
        <aside className="admin-side">
          <Link href="/admin" className="admin-brand" aria-label="AlgorithmX admin, overview">
            <BrandCube size={30} />
            <Wordmark />
          </Link>
          <AdminNav />
          <div className="admin-account">
            <div className="admin-account-row">
              <span className="admin-avatar" aria-hidden="true">{initial}</span>
              <span className="admin-who"><small>Signed in</small>{email}</span>
            </div>
            <form action={handleSignOut}>
              <button type="submit" className="admin-signout">
                <SignOutIcon /> <span>Sign out</span>
              </button>
            </form>
          </div>
        </aside>
        <div className="admin-body">
          <header className="admin-topbar">
            <AdminCrumb />
            <div className="admin-right">
              <LiveRefresh />
            </div>
          </header>
          <main className="admin-main">{children}</main>
        </div>
      </div>
    </div>
  );
}
