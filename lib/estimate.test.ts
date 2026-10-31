// lib/estimate.test.ts
import { describe, it, expect } from "vitest";
import { buildEstimateEmail, formatPhone, parseEstimateForm, type EstimateRequest } from "./estimate";

function form(entries: Array<[string, string]>): FormData {
  const data = new FormData();
  for (const [name, value] of entries) data.append(name, value);
  return data;
}

const VALID: Array<[string, string]> = [
  ["services", "Tree Removal"],
  ["services", "Fencing"],
  ["storm", "No"],
  ["date", "2026-11-12"],
  ["times", "10 am"],
  ["times", "3 pm"],
  ["address", "  123 Oak St  "],
  ["city", "Canton"],
  ["phone", "470-403-0215"],
  ["smsConsent", "yes"],
  ["page", "/tree-removal"],
];

describe("parseEstimateForm", () => {
  it("accepts a complete request and trims text", () => {
    const result = parseEstimateForm(form(VALID));
    expect(result).toEqual({
      ok: true,
      data: {
        services: ["Tree Removal", "Fencing"],
        storm: "No",
        date: "2026-11-12",
        times: ["10 am", "3 pm"],
        address: "123 Oak St",
        city: "Canton",
        phone: "470-403-0215",
        smsConsent: true,
        page: "/tree-removal",
      },
    });
  });

  it("allows the preferred day to be left blank, and SMS consent unchecked", () => {
    const entries = VALID.filter(([name]) => name !== "date" && name !== "smsConsent");
    const result = parseEstimateForm(form(entries));
    expect(result.ok && result.data.date).toBe("");
    expect(result.ok && result.data.smsConsent).toBe(false);
  });

  it("reports every missing required field", () => {
    const result = parseEstimateForm(new FormData());
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(Object.keys(result.errors).sort()).toEqual(
      ["address", "city", "phone", "services", "storm", "times"].sort()
    );
  });

  it("drops options that aren't on the form", () => {
    const result = parseEstimateForm(
      form([...VALID.filter(([n]) => n !== "services"), ["services", "<script>Hack</script>"]])
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.services).toBeDefined();
  });

  it("rejects a storm answer other than Yes/No", () => {
    const result = parseEstimateForm(form([...VALID.filter(([n]) => n !== "storm"), ["storm", "Maybe"]]));
    expect(!result.ok && result.errors.storm).toBeTruthy();
  });

  it("rejects impossible dates", () => {
    const result = parseEstimateForm(form([...VALID.filter(([n]) => n !== "date"), ["date", "2026-02-30"]]));
    expect(!result.ok && result.errors.date).toBeTruthy();
  });

  it.each([
    ["470403021", false],
    ["(470) 403-0215", true],
    ["+1 470 403 0215", true],
    ["24704030215", false],
    ["470403021512", false],
  ])("phone %s valid=%s", (phone, valid) => {
    const result = parseEstimateForm(form([...VALID.filter(([n]) => n !== "phone"), ["phone", phone]]));
    expect(result.ok).toBe(valid);
  });
});

describe("formatPhone", () => {
  it("formats 10- and 11-digit US numbers", () => {
    expect(formatPhone("4704030215")).toBe("(470) 403-0215");
    expect(formatPhone("+1 470.403.0215")).toBe("(470) 403-0215");
  });
});

describe("buildEstimateEmail", () => {
  const request: EstimateRequest = {
    services: ["Tree Trimming"],
    storm: "No",
    date: "",
    times: ["8 am"],
    address: "1 <b>Main</b> St",
    city: "Marietta",
    phone: "4704030215",
    smsConsent: false,
    page: "/contact",
  };
  const at = new Date("2026-10-31T14:05:00Z");

  it("puts city and service in the subject", () => {
    expect(buildEstimateEmail(request, at).subject).toBe(
      "New estimate request — Marietta — Tree Trimming"
    );
  });

  it("flags storm and emergency jobs in the subject", () => {
    expect(buildEstimateEmail({ ...request, storm: "Yes" }, at).subject).toMatch(/^\[STORM\/EMERGENCY\]/);
    expect(
      buildEstimateEmail({ ...request, services: ["24/7 Emergency Service"] }, at).subject
    ).toMatch(/^\[STORM\/EMERGENCY\]/);
  });

  it("includes every answer in the text body", () => {
    const { text } = buildEstimateEmail(request, at);
    expect(text).toContain("Service(s): Tree Trimming");
    expect(text).toContain("Storm-related: No");
    expect(text).toContain("Preferred day: No preference");
    expect(text).toContain("Preferred time: 8 am");
    expect(text).toContain("Address: 1 <b>Main</b> St");
    expect(text).toContain("Phone: (470) 403-0215");
    expect(text).toContain("OK to text: No");
    expect(text).toContain("Sent from page: /contact");
    expect(text).toContain("Saturday, October 31, 2026 at 10:05 AM (Eastern)");
  });

  it("escapes visitor input in the HTML body and links the phone number", () => {
    const { html } = buildEstimateEmail(request, at);
    expect(html).toContain("1 &lt;b&gt;Main&lt;/b&gt; St");
    expect(html).not.toContain("<b>Main</b>");
    expect(html).toContain('href="tel:+14704030215"');
  });

  it("shows the preferred day as a readable date", () => {
    const { text } = buildEstimateEmail({ ...request, date: "2026-11-12" }, at);
    expect(text).toContain("Preferred day: Thursday, November 12, 2026");
  });
});
