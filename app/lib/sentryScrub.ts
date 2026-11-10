/*
 * Sentry privacy scrub, shared by the client, server and edge bootstraps.
 *
 * On @sentry/nextjs 10.x the server SDK attaches the incoming request to
 * every event: body (up to 10 KB by default), cookies, headers and the
 * query string. Only the IP address waits on `sendDefaultPii`. An uncaught
 * error in a practice-chat route would therefore send the learner's prompt
 * to Sentry, which contradicts "Practice chats are never stored".
 *
 * The server config stops the body being read in the first place
 * (httpIntegration maxIncomingRequestBodySize "none", requestDataIntegration
 * include.data false). This function is the second line: it runs as
 * beforeSend / beforeSendTransaction and removes whatever request data
 * survived, so a future SDK default cannot quietly put it back.
 *
 * It never drops an event. Error reporting keeps working; only the
 * learner's words, their cookies and their credentials are taken out.
 */

/** Routes where a learner's own words travel in the request. */
const PRIVATE_TEXT_ROUTES = [
  "/api/ai-cleared/reply",
  "/api/ai-cleared/grade",
  "/api/ai-fluent/reply",
  "/api/ai-fluent/grade",
  "/api/pro/tutor",
  "/api/pro/summarise",
  "/api/ops/eval",
  "/api/desk/office",
];

/** Headers that carry a session or a credential. Compared lower-case. */
const SECRET_HEADERS = new Set([
  "cookie",
  "set-cookie",
  "authorization",
  "proxy-authorization",
  "x-api-key",
]);

/** Span attributes that hold only the query string. */
const QUERY_ONLY_ATTRS = ["url.query", "http.query"];
/**
 * Span and breadcrumb attributes that hold a URL or target which may end
 * in a query. ("url" is the fetch / http breadcrumb's key.)
 */
const URL_ATTRS = ["url.full", "http.url", "http.target", "url"];

type Attributes = Record<string, unknown>;

/** The parts of a Sentry event this scrub touches. */
export type ScrubbableEvent = {
  request?: {
    url?: string;
    data?: unknown;
    cookies?: unknown;
    query_string?: unknown;
    headers?: Record<string, string>;
  };
  transaction?: string;
  contexts?: Record<string, unknown>;
  spans?: Array<{ data?: Attributes }>;
  breadcrumbs?: Array<{ data?: Attributes }>;
};

/** True when the URL, path or transaction name points at a private-text route. */
export function isPrivateTextRoute(value: unknown): boolean {
  if (typeof value !== "string" || value === "") return false;
  return PRIVATE_TEXT_ROUTES.some((route) => {
    const at = value.indexOf(route);
    if (at === -1) return false;
    // "/api/pro/tutor" must not match "/api/pro/tutorial".
    const next = value.charAt(at + route.length);
    return next === "" || next === "?" || next === "/" || next === "#" || next === " ";
  });
}

function stripQuery(url: string): string {
  const cut = url.search(/[?#]/);
  return cut === -1 ? url : url.slice(0, cut);
}

function scrubQueryAttributes(data: Attributes | undefined, force: boolean): void {
  if (!data) return;
  const onPrivateRoute =
    force || URL_ATTRS.some((key) => isPrivateTextRoute(data[key]));
  if (!onPrivateRoute) return;
  for (const key of QUERY_ONLY_ATTRS) delete data[key];
  for (const key of URL_ATTRS) {
    const value = data[key];
    if (typeof value === "string") data[key] = stripQuery(value);
  }
}

/**
 * Remove request bodies, cookies, credential headers, and (on the
 * private-text routes) query strings from a Sentry event. Mutates and
 * returns the same event, so it can be passed straight to beforeSend.
 */
export function scrubSentryEvent<T extends ScrubbableEvent>(event: T): T {
  const contexts = event.contexts as
    | { nextjs?: { request_path?: unknown }; trace?: { data?: Attributes } }
    | undefined;

  const request = event.request;
  const onPrivateRoute =
    isPrivateTextRoute(request?.url) ||
    isPrivateTextRoute(event.transaction) ||
    isPrivateTextRoute(contexts?.nextjs?.request_path);

  if (request) {
    delete request.data;
    delete request.cookies;

    if (request.headers) {
      for (const name of Object.keys(request.headers)) {
        if (SECRET_HEADERS.has(name.toLowerCase())) delete request.headers[name];
      }
    }

    if (onPrivateRoute) {
      delete request.query_string;
      if (typeof request.url === "string") request.url = stripQuery(request.url);
    }
  }

  scrubQueryAttributes(contexts?.trace?.data, onPrivateRoute);
  for (const span of event.spans ?? []) scrubQueryAttributes(span.data, onPrivateRoute);
  // A breadcrumb describes some other request (a fetch from the browser, an
  // outgoing call from the server), so it is judged by its own URL alone.
  for (const crumb of event.breadcrumbs ?? []) scrubQueryAttributes(crumb.data, false);

  return event;
}
