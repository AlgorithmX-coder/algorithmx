import { Nunito } from "next/font/google";
import "./pack.css";

/**
 * The teacher packs run on two faces: Fredoka for anything the class reads off
 * the board, Nunito for everything the teacher reads. `/schools/layout.tsx`
 * already serves Fredoka as `--font-fredoka`, so this adds the other one and
 * the stylesheet asks for both by variable.
 *
 * Naming the faces directly in CSS would send the browser off to fetch them and
 * flash unstyled text, which on a projector in front of a class is the one
 * place it really shows.
 *
 * `pack.css` is imported here rather than in the component because Next keeps a
 * route level stylesheet loaded after you navigate away. Every selector in it
 * is scoped under `.axtp` for exactly that reason, so a sheet that outlives the
 * route matches nothing and costs nothing.
 */
const nunito = Nunito({
  variable: "--font-nunito",
  weight: ["600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

export default function TeachLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={nunito.variable} style={{ display: "contents" }}>
      {children}
    </div>
  );
}
