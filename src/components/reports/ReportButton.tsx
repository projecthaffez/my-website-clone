"use client";

import { useState, useTransition } from "react";
import { createReportAction } from "@/actions/report";

type ReportTargetType =
  | "USER"
  | "POST"
  | "COMMENT"
  | "GROUP"
  | "PAGE";

interface ReportButtonProps {
  targetType: ReportTargetType;
  targetId: string;
  label?: string;
}

const reasons = [
  "Spam",
  "Harassment",
  "Hate or abusive content",
  "Violence or dangerous content",
  "False or misleading information",
  "Inappropriate content",
  "Other",
];

export function ReportButton({
  targetType,
  targetId,
  label = "Report",
}: ReportButtonProps) {
  const [open, setOpen] =
    useState(false);

  const [reason, setReason] =
    useState("");

  const [details, setDetails] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [isPending, startTransition] =
    useTransition();

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (isPending) {
      return;
    }

    setError("");
    setMessage("");

    if (!reason) {
      setError(
        "Please select a reason.",
      );
      return;
    }

    startTransition(async () => {
      const result =
        await createReportAction({
          targetType,
          targetId,
          reason,
          details,
        });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setMessage(
        result.message ??
          "Report submitted successfully.",
      );

      setReason("");
      setDetails("");

      setTimeout(() => {
        setOpen(false);
        setMessage("");
      }, 1500);
    });
  }

  function handleClose() {
    if (isPending) {
      return;
    }

    setOpen(false);
    setReason("");
    setDetails("");
    setError("");
    setMessage("");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setError("");
          setMessage("");
        }}
        className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-400 transition hover:bg-white/10 hover:text-white"
      >
        {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-title"
            className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="report-title"
                  className="text-lg font-bold text-white"
                >
                  Report Content
                </h2>

                <p className="mt-1 text-sm leading-5 text-slate-500">
                  Help us understand what is
                  wrong with this content.
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                aria-label="Close report dialog"
                className="rounded-lg px-2 py-1 text-xl text-slate-500 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-5"
            >
              <div>
                <label
                  htmlFor="report-reason"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Reason
                </label>

                <select
                  id="report-reason"
                  value={reason}
                  onChange={(event) => {
                    setReason(
                      event.target.value,
                    );
                    setError("");
                  }}
                  disabled={isPending}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">
                    Select a reason
                  </option>

                  {reasons.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div>
                <label
                  htmlFor="report-details"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Additional details
                  <span className="ml-1 text-xs text-slate-600">
                    Optional
                  </span>
                </label>

                <textarea
                  id="report-details"
                  value={details}
                  onChange={(event) =>
                    setDetails(
                      event.target.value,
                    )
                  }
                  maxLength={1000}
                  rows={4}
                  disabled={isPending}
                  placeholder="Tell us more about the issue..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <p className="mt-1 text-right text-xs text-slate-600">
                  {details.length}/1000
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                >
                  {error}
                </div>
              )}

              {message && (
                <div
                  role="status"
                  className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
                >
                  {message}
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isPending}
                  className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    isPending ||
                    !reason
                  }
                  className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPending
                    ? "Submitting..."
                    : "Submit Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}