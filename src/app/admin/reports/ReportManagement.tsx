"use client";

import { useState, useTransition } from "react";
import {
  deleteReportAction,
  updateReportStatusAction,
} from "@/actions/adminReport";

interface Report {
  id: string;
  targetType:
    | "USER"
    | "POST"
    | "COMMENT"
    | "GROUP"
    | "PAGE";
  targetId: string;
  reason: string;
  details: string | null;
  status:
    | "PENDING"
    | "REVIEWED"
    | "DISMISSED"
    | "RESOLVED";
  createdAt: Date;
  updatedAt: Date;

  reporter: {
    id: string;
    username: string;
    name: string;
    avatarUrl: string | null;
  };
}

interface ReportManagementProps {
  initialReports: Report[];
}

const statusClasses: Record<
  Report["status"],
  string
> = {
  PENDING:
    "bg-amber-500/10 text-amber-400 border-amber-500/20",
  REVIEWED:
    "bg-blue-500/10 text-blue-400 border-blue-500/20",
  DISMISSED:
    "bg-slate-500/10 text-slate-400 border-slate-500/20",
  RESOLVED:
    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

const targetClasses: Record<
  Report["targetType"],
  string
> = {
  USER: "User",
  POST: "Post",
  COMMENT: "Comment",
  GROUP: "Group",
  PAGE: "Page",
};

export function ReportManagement({
  initialReports,
}: ReportManagementProps) {
  const [reports, setReports] =
    useState(initialReports);

  const [filter, setFilter] = useState<
    "ALL" | Report["status"]
  >("ALL");

  const [isPending, startTransition] =
    useTransition();

  const [error, setError] = useState("");

  const filteredReports =
    filter === "ALL"
      ? reports
      : reports.filter(
          (report) =>
            report.status === filter,
        );

  function updateStatus(
    reportId: string,
    status: Report["status"],
  ) {
    if (isPending) {
      return;
    }

    setError("");

    const previousReports = reports;

    setReports((current) =>
      current.map((report) =>
        report.id === reportId
          ? {
              ...report,
              status,
              updatedAt: new Date(),
            }
          : report,
      ),
    );

    startTransition(async () => {
      const result =
        await updateReportStatusAction(
          reportId,
          status,
        );

      if (!result.success) {
        setReports(previousReports);
        setError(result.error);
      }
    });
  }

  function deleteReport(
    reportId: string,
  ) {
    if (isPending) {
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to permanently delete this report?",
      );

    if (!confirmed) {
      return;
    }

    setError("");

    const previousReports = reports;

    setReports((current) =>
      current.filter(
        (report) =>
          report.id !== reportId,
      ),
    );

    startTransition(async () => {
      const result =
        await deleteReportAction(
          reportId,
        );

      if (!result.success) {
        setReports(previousReports);
        setError(result.error);
      }
    });
  }

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="rounded-2xl border border-white/10 bg-slate-900 p-4">
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              ["ALL", "All"],
              ["PENDING", "Pending"],
              ["REVIEWED", "Reviewed"],
              ["RESOLVED", "Resolved"],
              ["DISMISSED", "Dismissed"],
            ] as const
          ).map(
            ([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() =>
                  setFilter(value)
                }
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  filter === value
                    ? "bg-blue-600 text-white"
                    : "border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {label}
              </button>
            ),
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Reports */}
      {filteredReports.length ===
      0 ? (
        <div className="rounded-2xl border border-white/10 bg-slate-900 p-12 text-center">
          <div className="text-4xl">
            ✓
          </div>

          <h3 className="mt-4 text-lg font-semibold">
            No reports found
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            There are no reports matching
            the selected filter.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map(
            (report) => (
              <article
                key={report.id}
                className="rounded-2xl border border-white/10 bg-slate-900 p-5"
              >
                {/* Top row */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="flex min-w-0 gap-3">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-800">
                      {report.reporter
                        .avatarUrl ? (
                        <img
                          src={
                            report
                              .reporter
                              .avatarUrl
                          }
                          alt={
                            report
                              .reporter
                              .name
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center font-semibold text-slate-400">
                          {report.reporter.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white">
                        {report.reporter.name}
                      </p>

                      <p className="text-xs text-slate-500">
                        @{report.reporter.username}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                      {
                        targetClasses[
                          report
                            .targetType
                        ]
                      }
                    </span>

                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                        statusClasses[
                          report.status
                        ]
                      }`}
                    >
                      {report.status}
                    </span>
                  </div>
                </div>

                {/* Report details */}
                <div className="mt-5 rounded-xl border border-white/5 bg-slate-950/60 p-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Reason
                    </p>

                    <p className="mt-1 text-sm font-semibold text-white">
                      {report.reason}
                    </p>
                  </div>

                  {report.details && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Details
                      </p>

                      <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                        {report.details}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                    <span>
                      Target ID:{" "}
                      <span className="font-mono text-slate-400">
                        {report.targetId}
                      </span>
                    </span>

                    <span>
                      Reported:{" "}
                      {new Date(
                        report.createdAt,
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {report.status !==
                    "REVIEWED" && (
                    <button
                      type="button"
                      disabled={
                        isPending
                      }
                      onClick={() =>
                        updateStatus(
                          report.id,
                          "REVIEWED",
                        )
                      }
                      className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-400 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Mark Reviewed
                    </button>
                  )}

                  {report.status !==
                    "RESOLVED" && (
                    <button
                      type="button"
                      disabled={
                        isPending
                      }
                      onClick={() =>
                        updateStatus(
                          report.id,
                          "RESOLVED",
                        )
                      }
                      className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-400 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Resolve
                    </button>
                  )}

                  {report.status !==
                    "DISMISSED" && (
                    <button
                      type="button"
                      disabled={
                        isPending
                      }
                      onClick={() =>
                        updateStatus(
                          report.id,
                          "DISMISSED",
                        )
                      }
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-400 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Dismiss
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      deleteReport(
                        report.id,
                      )
                    }
                    className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Delete Report
                  </button>
                </div>
              </article>
            ),
          )}
        </div>
      )}
    </div>
  );
}