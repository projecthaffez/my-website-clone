import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { PrivacyForm } from "./PrivacyForm";

export default async function PrivacySettingsPage() {
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
            Privacy Settings
          </h1>

          <p className="mt-2 text-slate-400">
            Control who can see your profile and interact with you.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900 p-6 sm:p-8">
          <PrivacyForm
            initialData={{
              profileVisibility: user.profileVisibility,
              allowFriendRequests: user.allowFriendRequests,
              allowMessages: user.allowMessages,
            }}
          />
        </div>
      </div>
    </main>
  );
}