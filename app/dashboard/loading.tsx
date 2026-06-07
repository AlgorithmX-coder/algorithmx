/**
 * Loading UI for the /dashboard segment.
 *
 * The dashboard is a server component that runs auth + entitlement +
 * profile reads before it renders, then pulls in the heavy animated /
 * atmospheric chunks. Without a loading boundary, a client navigation
 * from /welcome ("Let's Start!") shows nothing until all of that
 * resolves — which reads as a dead click. This streams an instant,
 * on-brand loading state instead.
 *
 * Note (Next 16): loading.js gives fallback UI but does not by itself
 * guarantee instant navigation — see the `unstable_instant` route
 * export in node_modules/next/dist/docs if we ever need that.
 */
export default function DashboardLoading() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 22,
        background:
          "radial-gradient(ellipse at 50% -10%, #1d1f4d 0%, #0f1530 35%, #080a16 70%, #04050d 100%)",
        color: "#e8edff",
        fontFamily: "'Nunito', system-ui, sans-serif",
      }}
    >
      <style>{`@keyframes dashLoadSpin { to { transform: rotate(360deg); } }`}</style>
      <span
        aria-hidden
        style={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          border: "3px solid rgba(0,229,255,0.18)",
          borderTopColor: "#00e5ff",
          boxShadow: "0 0 24px rgba(124,92,255,0.35)",
          animation: "dashLoadSpin 0.8s linear infinite",
        }}
      />
      <p
        role="status"
        style={{ fontSize: 15, fontWeight: 700, letterSpacing: 0.3, color: "rgba(125,240,255,0.75)" }}
      >
        Loading your academy…
      </p>
    </div>
  );
}
