"use client";

/**
 * Print the sheet.
 *
 * A one-line client component because window.print() needs the browser, and
 * the page it sits on is a server component that reads a class out of the
 * database. Everything else here stays on the server.
 *
 * Ctrl+P does the same job, and the browser's own print dialog is still the
 * one that appears. This exists because a teacher with thirty children
 * waiting should not have to know that.
 */
export default function PrintButton() {
  return (
    <button type="button" className="axbtn go" onClick={() => window.print()}>
      Print these cards
    </button>
  );
}
