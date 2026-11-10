import { describe, expect, it } from "vitest";
import { isPrivateTextRoute, scrubSentryEvent, type ScrubbableEvent } from "./sentryScrub";

const PROMPT = "Summarise our client list for Acme Ltd, account 12345678";

function replyErrorEvent(): ScrubbableEvent & { exception: unknown; message?: string } {
  return {
    exception: { values: [{ type: "Error", value: "upstream timeout" }] },
    transaction: "POST /api/ai-cleared/reply",
    request: {
      url: "https://algorithmx.io/api/ai-cleared/reply?draft=" + encodeURIComponent(PROMPT),
      data: JSON.stringify({ message: PROMPT }),
      cookies: { site_auth: "v2", "authjs.session-token": "secret-session" },
      query_string: "draft=" + encodeURIComponent(PROMPT),
      headers: {
        Cookie: "site_auth=v2; authjs.session-token=secret-session",
        authorization: "Bearer abc",
        "content-type": "application/json",
        "user-agent": "Mozilla/5.0",
      },
    },
  };
}

describe("scrubSentryEvent", () => {
  it("removes the body, cookies and credential headers from an error event", () => {
    const event = scrubSentryEvent(replyErrorEvent());
    const serialised = JSON.stringify(event);

    expect(event.request?.data).toBeUndefined();
    expect(event.request?.cookies).toBeUndefined();
    expect(event.request?.headers).toEqual({
      "content-type": "application/json",
      "user-agent": "Mozilla/5.0",
    });
    expect(serialised).not.toContain("Acme");
    expect(serialised).not.toContain("secret-session");
    expect(serialised).not.toContain("Bearer");
  });

  it("strips the query string on a practice-chat route", () => {
    const event = scrubSentryEvent(replyErrorEvent());
    expect(event.request?.query_string).toBeUndefined();
    expect(event.request?.url).toBe("https://algorithmx.io/api/ai-cleared/reply");
  });

  it("keeps the error itself, so reporting still works", () => {
    const event = scrubSentryEvent(replyErrorEvent());
    expect(event).not.toBeNull();
    expect(event.exception).toEqual({ values: [{ type: "Error", value: "upstream timeout" }] });
    expect(event.transaction).toBe("POST /api/ai-cleared/reply");
    expect(event.request?.url).toContain("/api/ai-cleared/reply");
  });

  it("keeps the query string on ordinary routes, but still drops body and cookies", () => {
    const event = scrubSentryEvent({
      transaction: "GET /courses",
      request: {
        url: "https://algorithmx.io/courses?tab=ai",
        query_string: "tab=ai",
        data: "x",
        cookies: { a: "b" },
        headers: { cookie: "a=b" },
      },
    });
    expect(event.request?.query_string).toBe("tab=ai");
    expect(event.request?.url).toBe("https://algorithmx.io/courses?tab=ai");
    expect(event.request?.data).toBeUndefined();
    expect(event.request?.cookies).toBeUndefined();
    expect(event.request?.headers).toEqual({});
  });

  it("finds the route from the nextjs context when there is no URL", () => {
    const event = scrubSentryEvent({
      contexts: { nextjs: { request_path: "/api/ai-fluent/grade" } },
      request: { query_string: "q=secret" },
    });
    expect(event.request?.query_string).toBeUndefined();
  });

  it("strips query strings from transaction span data on practice routes", () => {
    const event = scrubSentryEvent({
      transaction: "GET /dashboard",
      contexts: {
        trace: { data: { "url.full": "https://algorithmx.io/dashboard?x=1", "url.query": "?x=1" } },
      },
      spans: [
        {
          data: {
            "http.target": "/api/ai-fluent/reply?prompt=hello",
            "url.query": "?prompt=hello",
          },
        },
        { data: { "url.full": "https://api.anthropic.com/v1/messages" } },
      ],
    });
    // The page's own query survives: it is not a practice route.
    expect(event.contexts?.trace).toEqual({
      data: { "url.full": "https://algorithmx.io/dashboard?x=1", "url.query": "?x=1" },
    });
    expect(event.spans?.[0].data).toEqual({ "http.target": "/api/ai-fluent/reply" });
    expect(event.spans?.[1].data).toEqual({ "url.full": "https://api.anthropic.com/v1/messages" });
  });

  it("strips the query from a breadcrumb that called a practice route", () => {
    const event = scrubSentryEvent({
      transaction: "GET /ai-fluent/module/2",
      breadcrumbs: [
        {
          data: {
            url: "http://localhost:3000/api/ai-fluent/reply",
            "http.method": "POST",
            "http.query": "?draft=secret",
          },
        },
        { data: { url: "/api/ai-cleared/grade?answer=secret", method: "POST" } },
        { data: { url: "/api/courses?tab=ai", method: "GET" } },
      ],
    });
    expect(event.breadcrumbs?.[0].data).toEqual({
      url: "http://localhost:3000/api/ai-fluent/reply",
      "http.method": "POST",
    });
    expect(event.breadcrumbs?.[1].data).toEqual({ url: "/api/ai-cleared/grade", method: "POST" });
    expect(event.breadcrumbs?.[2].data).toEqual({ url: "/api/courses?tab=ai", method: "GET" });
  });

  it("passes an event with no request straight through", () => {
    const event = { message: "hello" } as ScrubbableEvent & { message: string };
    expect(scrubSentryEvent(event)).toEqual({ message: "hello" });
  });
});

describe("isPrivateTextRoute", () => {
  it("matches each practice route, with or without a query or method prefix", () => {
    for (const route of [
      "/api/ai-cleared/reply",
      "/api/ai-cleared/grade",
      "/api/ai-fluent/reply",
      "/api/ai-fluent/grade",
      "/api/pro/tutor",
      "/api/pro/summarise",
      "/api/ops/eval",
    ]) {
      expect(isPrivateTextRoute(route)).toBe(true);
      expect(isPrivateTextRoute(`POST ${route}`)).toBe(true);
      expect(isPrivateTextRoute(`https://algorithmx.io${route}?a=b`)).toBe(true);
    }
  });

  it("does not match lookalikes or other routes", () => {
    expect(isPrivateTextRoute("/api/pro/tutorial")).toBe(false);
    expect(isPrivateTextRoute("/api/pro/progress")).toBe(false);
    expect(isPrivateTextRoute("/corporate")).toBe(false);
    expect(isPrivateTextRoute(undefined)).toBe(false);
    expect(isPrivateTextRoute(42)).toBe(false);
  });
});
