import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";

interface FollowingPageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function FollowingPage({
  params,
}: FollowingPageProps) {
  const { username } = await params;

  const profile = await db.user.findUnique({
    where: {
      username: username.toLowerCase(),
    },
    select: {
      id: true,
      username: true,
      name: true,
    },
  });

  if (!profile) {
    notFound();
  }

  const following = await db.follow.findMany({
    where: {
      followerId: profile.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      following: {
        select: {
          id: true,
          username: true,
          name: true,
          avatarUrl: true,
          bio: true,
          isVerified: true,
        },
      },
    },
  });

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <Link
            href={`/profile/${profile.username}`}
            className="text-sm text-slate-400 hover:text-white"
          >
            ← Back to Profile
          </Link>

          <h1 className="mt-4 text-3xl font-bold">
            {profile.name} is Following
          </h1>

          <p className="mt-2 text-slate-400">
            {following.length}{" "}
            {following.length === 1
              ? "person"
              : "people"}
          </p>
        </div>

        {following.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-10 text-center">
            <div className="text-4xl">👥</div>

            <h2 className="mt-4 text-lg font-semibold">
              Not following anyone yet
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Profiles followed by this user will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {following.map(({ following: user }) => (
              <Link
                key={user.id}
                href={`/profile/${user.username}`}
                className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-slate-900 p-5 transition hover:border-blue-500/30 hover:bg-slate-800"
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-slate-800">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-slate-400">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate font-semibold group-hover:text-blue-400">
                      {user.name}
                    </h2>

                    {user.isVerified && (
                      <span className="text-xs text-blue-400">
                        ✓
                      </span>
                    )}
                  </div>

                  <p className="truncate text-sm text-slate-400">
                    @{user.username}
                  </p>

                  {user.bio && (
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {user.bio}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}