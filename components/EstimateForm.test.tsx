// components/EstimateForm.test.tsx
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const submitEstimateAction = vi.fn();
vi.mock("@/lib/estimate-actions", () => ({
  submitEstimateAction: (...args: unknown[]) => submitEstimateAction(...args),
}));

import { EstimateForm } from "./EstimateForm";

function fillValid() {
  fireEvent.click(screen.getByLabelText("Tree Removal"));
  fireEvent.click(screen.getByLabelText("No"));
  fireEvent.click(screen.getByLabelText("10 am"));
  fireEvent.change(screen.getByLabelText(/address of your property/i), {
    target: { value: "123 Oak St" },
  });
  fireEvent.change(screen.getByLabelText(/what city/i), { target: { value: "Canton" } });
  fireEvent.change(screen.getByLabelText(/what number/i), { target: { value: "4704030215" } });
}

const submit = () => fireEvent.click(screen.getByRole("button", { name: /book my free estimate/i }));

beforeEach(() => {
  submitEstimateAction.mockReset();
  // jsdom doesn't implement scrolling.
  Element.prototype.scrollIntoView = vi.fn();
});

describe("EstimateForm", () => {
  it("asks the same questions as the old form", () => {
    render(<EstimateForm />);
    expect(screen.getByRole("heading", { name: /request a free estimate/i })).toBeInTheDocument();
    for (const service of [
      "Tree Removal",
      "Tree Trimming",
      "Landscape Design",
      "Lawn Service",
      "24/7 Emergency Service",
      "Fencing",
      "Other",
    ]) {
      expect(screen.getByLabelText(service)).toHaveAttribute("type", "checkbox");
    }
    expect(screen.getByRole("group", { name: /storm-related/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/what day/i)).toHaveAttribute("type", "date");
    for (const time of ["8 am", "10 am", "1 pm", "3 pm", "5 pm or later"]) {
      expect(screen.getByLabelText(time)).toBeInTheDocument();
    }
    expect(screen.getByLabelText(/what number/i)).toHaveAttribute("type", "tel");
    expect(screen.getByLabelText(/receive text messages/i)).not.toBeChecked();
    expect(document.querySelector("iframe")).toBeNull();
  });

  it("shows errors and does not submit when required answers are missing", () => {
    render(<EstimateForm />);
    submit();

    expect(screen.getByText("Please choose at least one service.")).toBeInTheDocument();
    expect(screen.getByText("Please enter a 10-digit phone number.")).toBeInTheDocument();
    expect(screen.getByLabelText(/what number/i)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Tree Removal")).toHaveFocus();
    expect(submitEstimateAction).not.toHaveBeenCalled();
  });

  it("clears a field's error once the visitor fixes it", () => {
    render(<EstimateForm />);
    submit();
    expect(screen.getByText("Please enter the city.")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/what city/i), { target: { value: "Canton" } });

    expect(screen.queryByText("Please enter the city.")).toBeNull();
    expect(screen.getByLabelText(/what city/i)).not.toHaveAttribute("aria-invalid");
    expect(screen.getByText("Please enter the property address.")).toBeInTheDocument();
  });

  it("keeps what the visitor typed after a validation error", () => {
    render(<EstimateForm />);
    fireEvent.change(screen.getByLabelText(/what city/i), { target: { value: "Canton" } });
    submit();
    expect(screen.getByLabelText(/what city/i)).toHaveValue("Canton");
  });

  it("submits a complete request and thanks the visitor", async () => {
    submitEstimateAction.mockResolvedValue({ status: "success" });
    render(<EstimateForm />);
    fillValid();
    submit();

    await screen.findByText(/we got your request/i);
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    const formData = submitEstimateAction.mock.calls[0][1] as FormData;
    expect(formData.getAll("services")).toEqual(["Tree Removal"]);
    expect(formData.get("city")).toBe("Canton");
    expect(formData.get("page")).toBe("/");
  });

  it("tells the visitor to call when the email could not be sent", async () => {
    submitEstimateAction.mockResolvedValue({ status: "failed" });
    render(<EstimateForm />);
    fillValid();
    submit();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/couldn.t send your request/i);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /book my free estimate/i })).toBeEnabled()
    );
    expect(screen.getByLabelText(/what city/i)).toHaveValue("Canton");
  });
});
