import { afterEach, describe, expect, it } from "vitest";
import { apiKeyStatus, safeErrorMessage } from "./anthropicClient";

describe("the Anthropic key guard", () => {
  afterEach(() => {
    delete process.env.ANTHROPIC_API_KEY;
  });

  it("knows a missing key", () => {
    expect(apiKeyStatus()).toBe("missing");
    process.env.ANTHROPIC_API_KEY = "   ";
    expect(apiKeyStatus()).toBe("missing");
  });

  it("accepts a bare key, with surrounding whitespace", () => {
    process.env.ANTHROPIC_API_KEY = "sk-ant-api03-abcdefghijklmnopqrstuvwxyz0123456789_-ABC\n";
    expect(apiKeyStatus()).toBe("ok");
  });

  it("rejects the Console's cURL example pasted whole", () => {
    process.env.ANTHROPIC_API_KEY = 'curl https://api.anthropic.com/v1/messages --header "x-api-key: sk-ant-api03-abcdefghijklmnopqrstuvwxyz0123456789" --data {}';
    expect(apiKeyStatus()).toBe("malformed");
  });

  it("scrubs a key out of an error before it is logged", () => {
    const msg = safeErrorMessage(new TypeError('Headers.append: "x-api-key: sk-ant-api03-abcdefghijklmnopqrstuvwxyz0123456789" is an invalid header value.'));
    expect(msg).not.toContain("abcdefghijklmnop");
    expect(msg).toContain("sk-ant-[redacted]");
    expect(msg.length).toBeLessThanOrEqual(200);
  });
});
