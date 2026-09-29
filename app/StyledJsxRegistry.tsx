"use client";

import { useState } from "react";
import { useServerInsertedHTML } from "next/navigation";
import { StyleRegistry, createStyleRegistry } from "styled-jsx";

/**
 * Server-renders the styled-jsx rules, so the page arrives styled.
 *
 * Without this the App Router renders the MARKUP of a styled-jsx component
 * on the server but not its <style>. The elements arrive wearing classes
 * like jsx-7e42d1c1 that nothing defines, and stay unstyled until
 * JavaScript hydrates and injects the rules.
 *
 * Measured on the live homepage before this existed: 336 elements carried
 * a styled-jsx class, across 15 distinct classes, and NONE of the 15 were
 * defined in either render-blocking stylesheet or anywhere else in the
 * document. The whole landing painted unstyled and then snapped, which is
 * what the owner saw as the accreditation logos flashing at full size.
 *
 * The App Router does not do this automatically for any CSS-in-JS library:
 * it is a documented three-part opt-in (registry, useServerInsertedHTML,
 * client wrapper at the root). See node_modules/next/dist/docs/01-app/
 * 02-guides/css-in-js.md. Requires styled-jsx >= 5.1.0; we are on 5.1.6.
 *
 * useServerInsertedHTML places the collected rules BEFORE the content that
 * uses them, which is the whole point: rules that arrive after their markup
 * cannot prevent a flash.
 */
export default function StyledJsxRegistry({ children }: { children: React.ReactNode }) {
  /* Lazy initial state, so the registry is created once per render and not
     rebuilt on every re-render. */
  const [jsxStyleRegistry] = useState(() => createStyleRegistry());

  useServerInsertedHTML(() => {
    const styles = jsxStyleRegistry.styles();
    jsxStyleRegistry.flush();
    return <>{styles}</>;
  });

  return <StyleRegistry registry={jsxStyleRegistry}>{children}</StyleRegistry>;
}
