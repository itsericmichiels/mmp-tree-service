"use client";
// components/EstimateForm.tsx
// The "Request a Free Estimate" form used across the site. Replaces the
// embedded GoHighLevel iframe: same questions, but rendered natively and
// submitted to lib/estimate-actions.ts, which emails the request via Resend.
//
// Validation runs here first (shared with the server via lib/estimate.ts)
// so visitors get instant feedback without losing what they typed; the
// server re-validates because client checks can be bypassed.
import { startTransition, useActionState, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { submitEstimateAction } from "@/lib/estimate-actions";
import {
  HONEYPOT_FIELD,
  INITIAL_ESTIMATE_STATE,
  SERVICE_OPTIONS,
  STARTED_AT_FIELD,
  STORM_OPTIONS,
  TIME_OPTIONS,
  parseEstimateForm,
  type EstimateField,
  type FieldErrors,
} from "@/lib/estimate";

const FIELD_ORDER: EstimateField[] = ["services", "storm", "date", "times", "address", "city", "phone"];

function todayLocalIso(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function EstimateForm() {
  const [state, formAction, pending] = useActionState(submitEstimateAction, INITIAL_ESTIMATE_STATE);
  const [clientErrors, setClientErrors] = useState<FieldErrors | null>(null);
  const startedAtRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);
  const uid = useId();
  const fid = (name: string) => `${uid}-${name}`;

  // Set after mount (not during render) so the server-rendered HTML and the
  // first client render match.
  useEffect(() => {
    if (startedAtRef.current) startedAtRef.current.value = String(Date.now());
    if (dateRef.current) dateRef.current.min = todayLocalIso();
  }, []);

  // The thank-you panel is much shorter than the form, so bring it into view.
  useEffect(() => {
    if (state.status === "success") doneRef.current?.scrollIntoView({ block: "center" });
  }, [state.status]);

  const errors: FieldErrors = clientErrors ?? (state.status === "invalid" ? state.errors : {});

  // Clear a field's error as soon as the visitor changes that field.
  function handleChange(event: React.FormEvent<HTMLFormElement>) {
    const name = (event.target as HTMLInputElement).name as EstimateField;
    if (!errors[name]) return;
    const remaining = { ...errors };
    delete remaining[name];
    setClientErrors(remaining);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("page", window.location.pathname);

    const result = parseEstimateForm(formData);
    if (!result.ok) {
      setClientErrors(result.errors);
      const first = FIELD_ORDER.find((field) => result.errors[field]);
      form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    setClientErrors(null);
    startTransition(() => formAction(formData));
  }

  const errorProps = (field: EstimateField) =>
    errors[field]
      ? { "aria-invalid": true as const, "aria-describedby": fid(`${field}-error`) }
      : {};

  const errorText = (field: EstimateField) =>
    errors[field] ? (
      <p className="estimate-form__error" id={fid(`${field}-error`)}>
        {errors[field]}
      </p>
    ) : null;

  if (state.status === "success") {
    return (
      <div className="estimate-panel" ref={doneRef}>
        <div className="estimate-form estimate-form--done" role="status">
          <h3 className="estimate-form__title">Thank you — we got your request!</h3>
          <p>
            We&apos;ll call you shortly to confirm your free estimate. If this is an
            emergency, please call us now at <a href="tel:4704030215">(470) 403-0215</a>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="estimate-panel">
      <form
        className="estimate-form"
        action={formAction}
        onSubmit={handleSubmit}
        onChange={handleChange}
        noValidate
        aria-labelledby={fid("title")}
      >
        <h3 className="estimate-form__title" id={fid("title")}>
          Request a Free Estimate
        </h3>
        <p className="estimate-form__intro">
          Fill out the form below, and we&apos;ll get back to you ASAP. If this is an
          emergency, please call us at <a href="tel:4704030215">(470) 403-0215</a>.
        </p>

        <fieldset className="estimate-form__group" {...errorProps("services")}>
          <legend>
            What service do you need? <span aria-hidden="true">*</span>
          </legend>
          <div className="estimate-form__choices estimate-form__choices--grid">
            {SERVICE_OPTIONS.map((option) => (
              <label key={option} className="estimate-form__choice">
                <input type="checkbox" name="services" value={option} />
                {option}
              </label>
            ))}
          </div>
          {errorText("services")}
        </fieldset>

        <fieldset className="estimate-form__group" {...errorProps("storm")}>
          <legend>
            Is this a storm-related job? <span aria-hidden="true">*</span>
          </legend>
          <div className="estimate-form__choices estimate-form__choices--inline">
            {STORM_OPTIONS.map((option) => (
              <label key={option} className="estimate-form__choice">
                <input type="radio" name="storm" value={option} />
                {option}
              </label>
            ))}
          </div>
          {errorText("storm")}
        </fieldset>

        <div className="form-field">
          <label htmlFor={fid("date")}>
            On what day would you like us to come and give you a free estimate?
          </label>
          <input ref={dateRef} id={fid("date")} type="date" name="date" {...errorProps("date")} />
          {errorText("date")}
        </div>

        <fieldset className="estimate-form__group" {...errorProps("times")}>
          <legend>
            At what time would you prefer us to come? <span aria-hidden="true">*</span>
          </legend>
          <div className="estimate-form__choices estimate-form__choices--chips">
            {TIME_OPTIONS.map((option) => (
              <label key={option} className="estimate-form__chip">
                <input type="checkbox" name="times" value={option} />
                <span>{option}</span>
              </label>
            ))}
          </div>
          {errorText("times")}
        </fieldset>

        <div className="form-field">
          <label htmlFor={fid("address")}>
            What is the address of your property? <span aria-hidden="true">*</span>
          </label>
          <input
            id={fid("address")}
            type="text"
            name="address"
            placeholder="Address"
            autoComplete="street-address"
            maxLength={200}
            {...errorProps("address")}
          />
          {errorText("address")}
        </div>

        <div className="form-field">
          <label htmlFor={fid("city")}>
            In what city is your property located? <span aria-hidden="true">*</span>
          </label>
          <input
            id={fid("city")}
            type="text"
            name="city"
            placeholder="City"
            autoComplete="address-level2"
            maxLength={100}
            {...errorProps("city")}
          />
          {errorText("city")}
        </div>

        <div className="form-field">
          <label htmlFor={fid("phone")}>
            At what number can we reach you? <span aria-hidden="true">*</span>
          </label>
          <input
            id={fid("phone")}
            type="tel"
            name="phone"
            placeholder="Phone"
            autoComplete="tel"
            inputMode="tel"
            maxLength={30}
            {...errorProps("phone")}
          />
          {errorText("phone")}
        </div>

        <label className="estimate-form__consent">
          <input type="checkbox" name="smsConsent" value="yes" />
          <span>
            By providing your phone number, you agree to receive text messages from MMP Tree
            Service LLC. Message and data rates may apply. Message frequency varies.
          </span>
        </label>

        {/* Spam traps: hidden from people and assistive tech, filled by bots. */}
        <div className="estimate-form__trap" aria-hidden="true">
          <label>
            Website
            <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <input ref={startedAtRef} type="hidden" name={STARTED_AT_FIELD} defaultValue="" />

        {state.status === "failed" && (
          <p className="estimate-form__alert" role="alert">
            Sorry — we couldn&apos;t send your request just now. Please call us at{" "}
            <a href="tel:4704030215">(470) 403-0215</a> and we&apos;ll get you scheduled.
          </p>
        )}

        <button type="submit" className="btn btn-orange btn-block" disabled={pending}>
          {pending ? "Sending…" : "Book My Free Estimate"}
        </button>

        <p className="form-note">
          <Link href="/terms#privacy-policy">Privacy Policy</Link> |{" "}
          <Link href="/terms">Terms of Service</Link>
        </p>
      </form>
    </div>
  );
}
