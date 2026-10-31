// lib/estimate-actions.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { submitEstimateAction } from "./estimate-actions";
import { INITIAL_ESTIMATE_STATE } from "./estimate";

function validForm(extra: Array<[string, string]> = []): FormData {
  const data = new FormData();
  for (const [name, value] of [
    ["services", "Tree Removal"],
    ["storm", "Yes"],
    ["times", "1 pm"],
    ["address", "123 Oak St"],
    ["city", "Canton"],
    ["phone", "(470) 403-0215"],
    ...extra,
  ] as Array<[string, string]>) {
    data.append(name, value);
  }
  return data;
}

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("RESEND_API_KEY", "re_test_key");
  vi.stubEnv("ESTIMATE_TO_EMAIL", "");
  vi.stubEnv("ESTIMATE_FROM_EMAIL", "");
  fetchMock.mockResolvedValue(new Response(JSON.stringify({ id: "email_123" }), { status: 200 }));
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  fetchMock.mockReset();
});

describe("submitEstimateAction", () => {
  it("emails a valid request through Resend to both default inboxes", async () => {
    const state = await submitEstimateAction(INITIAL_ESTIMATE_STATE, validForm());

    expect(state).toEqual({ status: "success" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect(init.headers.Authorization).toBe("Bearer re_test_key");
    const body = JSON.parse(init.body);
    expect(body.to).toEqual(["itsericmichiels@gmail.com", "mmptreeservicellc@gmail.com"]);
    expect(body.from).toBe("MMP Tree Service Website <estimates@mmptreeservice.com>");
    expect(body.subject).toBe("[STORM/EMERGENCY] New estimate request — Canton — Tree Removal");
    expect(body.text).toContain("Phone: (470) 403-0215");
    expect(body.html).toContain("Call (470) 403-0215");
  });

  it("uses ESTIMATE_TO_EMAIL and ESTIMATE_FROM_EMAIL when set", async () => {
    vi.stubEnv("ESTIMATE_TO_EMAIL", "a@example.com, b@example.com");
    vi.stubEnv("ESTIMATE_FROM_EMAIL", "Site <leads@example.com>");

    await submitEstimateAction(INITIAL_ESTIMATE_STATE, validForm());

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.to).toEqual(["a@example.com", "b@example.com"]);
    expect(body.from).toBe("Site <leads@example.com>");
  });

  it("returns field errors and sends nothing for an incomplete request", async () => {
    const state = await submitEstimateAction(INITIAL_ESTIMATE_STATE, new FormData());

    expect(state.status).toBe("invalid");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports failure (not success) when Resend rejects the email", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ message: "The domain is not verified" }), { status: 403 })
    );

    const state = await submitEstimateAction(INITIAL_ESTIMATE_STATE, validForm());

    expect(state).toEqual({ status: "failed" });
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("domain is not verified"));
  });

  it("reports failure when the API key is missing", async () => {
    vi.stubEnv("RESEND_API_KEY", "");

    const state = await submitEstimateAction(INITIAL_ESTIMATE_STATE, validForm());

    expect(state).toEqual({ status: "failed" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports failure when the network call throws", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));

    const state = await submitEstimateAction(INITIAL_ESTIMATE_STATE, validForm());

    expect(state).toEqual({ status: "failed" });
  });

  it("silently drops submissions that fill the honeypot", async () => {
    const state = await submitEstimateAction(
      INITIAL_ESTIMATE_STATE,
      validForm([["website", "http://spam.example"]])
    );

    expect(state).toEqual({ status: "success" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("silently drops submissions made too fast to be human", async () => {
    const state = await submitEstimateAction(
      INITIAL_ESTIMATE_STATE,
      validForm([["startedAt", String(Date.now() - 500)]])
    );

    expect(state).toEqual({ status: "success" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("accepts a normal-speed submission", async () => {
    const state = await submitEstimateAction(
      INITIAL_ESTIMATE_STATE,
      validForm([["startedAt", String(Date.now() - 60_000)]])
    );

    expect(state).toEqual({ status: "success" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
