import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { isStaffUser } from "@/app/lib/aiClearedStaff";
import { K } from "./adminTokens";

/* /admin: the staff-only view of every customer - schools, firms and
 * individuals, one portal, three tabs. One flat permission tier: any
 * staff user (role "staff", or PLATFORM_STAFF_EMAILS) sees and does
 * everything here, same gate as /ai-cleared/ops. Every page underneath
 * still re-checks staff status itself - a page is a public endpoint
 * whatever renders around it. */
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/admin-login?callbackUrl=%2Fadmin");
  if (!(await isStaffUser(session.user.id))) {
    return (
      <div className="admin-gate">
        <p>This area is for AlgorithmX staff.</p>
        <Link href="/">Back to the site</Link>
        <style>{`
          .admin-gate { min-height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; background: ${K.ground}; color: ${K.body}; font-family: ${K.sans}; }
          .admin-gate a { color: ${K.accentInk}; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <header className="admin-top">
        <span className="admin-brand">AlgorithmX &middot; <i>Admin</i></span>
        <nav className="admin-tabs" aria-label="Admin sections">
          <Link href="/admin/schools" className="admin-tab">Schools</Link>
          <Link href="/admin/firms" className="admin-tab">Firms</Link>
          <Link href="/admin/individuals" className="admin-tab">Individuals</Link>
        </nav>
        <span className="admin-who">{session.user.email}</span>
      </header>
      <main className="admin-main">{children}</main>
      <style>{`
        .admin-shell { min-height: 100vh; background: ${K.ground}; color: ${K.body}; font-family: ${K.sans}; }
        .admin-top { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; padding: 16px 24px; border-bottom: 1px solid ${K.edgeSoft}; background: ${K.glassStrong}; }
        .admin-brand { font-family: ${K.mono}; font-size: 13px; letter-spacing: 0.06em; color: ${K.ink}; }
        .admin-brand i { font-style: normal; color: ${K.accentInk}; }
        .admin-tabs { display: flex; gap: 8px; }
        .admin-tab { font-size: 14px; font-weight: 600; color: ${K.muted}; text-decoration: none; padding: 7px 14px; border-radius: 999px; }
        .admin-tab:hover { color: ${K.ink}; background: ${K.sunk}; }
        .admin-who { margin-left: auto; font-size: 13px; color: ${K.faint}; }
        .admin-main { padding: 20px 24px 60px; max-width: 1200px; margin: 0 auto; }
      `}</style>
    </div>
  );
}
