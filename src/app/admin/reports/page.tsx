import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAdminReportsAction } from "@/actions/adminReport";
import { ReportManagement } from "./ReportManagement";

export default async function AdminReportsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (
    currentUser.role !== "ADMIN" &&
    currentUser.role !== "MODERATOR"
  ) {
    redirect("/");
  }

  const result =
    await getAdminReportsAction();

  if (!result.success) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
            <h1 className="text-xl font-bold text-red-300">
              Unable to load reports
            </h1>

            <p className="mt-2 text-sm text-red-400">
              {result.error}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const pendingCount =
    result.reports.filter(
      (report) =>
        report.status === "PENDING",
    ).length;

  const reviewedCount =
    result.reports.filter(
      (report) =>
        report.status === "REVIEWED",
    ).length;

  const resolvedCount =
    result.reports.filter(
      (report) =>
        report.status === "RESOLVED",
    ).length;

  const dismissedCount =
    result.reports.filter(
      (report) =>
        report.status === "DISMISSED",
    ).length;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-950/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              Nexus Moderation
            </p>

            <h1 className="mt-1 text-xl font-bold">
              Reports Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-slate-400 sm:block">
              {currentUser.name}
            </span>

            <a
              href="/"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Home
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold">
            Content Reports
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Review reports submitted by users
            and manage moderation status.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
            <p className="text-sm text-slate-500">
              Pending
            </p>

            <p className="mt-2 text-3xl font-bold text-amber-400">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
            <p className="text-sm text-slate-500">
              Reviewed
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-400">
              {reviewedCount}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
            <p className="text-sm text-slate-500">
              Resolved
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-400">
              {resolvedCount}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
            <p className="text-sm text-slate-500">
              Dismissed
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-400">
              {dismissedCount}
            </p>
          </div>
        </div>

        {/* Reports */}
        <section className="mt-8">
          <ReportManagement
            initialReports={
              result.reports
            }
          />
        </section>
      </div>
    </main>
  );
}