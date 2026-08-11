import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { SecurityForm } from "./SecurityForm";

export default async function SecuritySettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="text-sm font-semibold text-blue-400">
            Nexus Settings
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Security
          </h1>

          <p className="mt-2 text-slate-400">
            Manage your password and account sessions.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900 p-6 sm:p-8">
          <SecurityForm />
        </div>
      </div>
    </main>
  );
}