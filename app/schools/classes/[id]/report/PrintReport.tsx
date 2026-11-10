"use client";

/**
 * Print the report.
 *
 * window.print() needs the browser, and the page it sits on is a server
 * component that reads a class out of the database, so this is the one
 * client-side thing on it. Ctrl+P does the same job; a head of year holding
 * a printout should not have to know that.
 */
export default function PrintReport() {
  return (
    <button type="button" className="axbtn go" onClick={() => window.print()}>
      Print this report
    </button>
  );
}
