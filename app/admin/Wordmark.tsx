/* The ALGORITHMX wordmark with the X lit in brand cyan, plus a small tag
 * underneath ("Admin" in the console, "Staff access" on the sign-in).
 * Sits next to BrandCube wherever the brand appears. No hooks, so it
 * renders on either side. */
export default function Wordmark({ tag = "Admin" }: { tag?: string }) {
  return (
    <span className="admin-wordmark">
      <span className="admin-wordmark-main">ALGORITHM<b>X</b></span>
      <span className="admin-badge">{tag}</span>
    </span>
  );
}
