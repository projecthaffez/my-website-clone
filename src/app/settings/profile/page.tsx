import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ProfileForm } from "./ProfileForm";

export default async function EditProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-blue-400">
            Nexus Settings
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Edit Profile
          </h1>

          <p className="mt-2 text-slate-400">
            Update your public profile information.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900 p-6 sm:p-8">
          <ProfileForm
            initialData={{
              name: user.name,
              username: user.username,
              bio: user.bio ?? "",
              location: user.location ?? "",
              website: user.website ?? "",
              avatarUrl: user.avatarUrl ?? "",
              coverUrl: user.coverUrl ?? "",
            }}
          />
        </div>
      </div>
    </main>
  );
}