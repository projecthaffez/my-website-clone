import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";

interface FollowersPageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function FollowersPage({
  params,
}: FollowersPageProps) {
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

  const followers = await db.follow.findMany({
    where: {
      followingId: profile.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      follower: {
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
            {profile.name}'s Followers
          </h1>

          <p className="mt-2 text-slate-400">
            {followers.length}{" "}
            {followers.length === 1 ? "follower" : "followers"}
          </p>
        </div>

        {followers.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-10 text-center">
            <div className="text-4xl">👥</div>

            <h2 className="mt-4 text-lg font-semibold">
              No followers yet
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              People who follow this profile will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {followers.map(({ follower }) => (
              <Link
                key={follower.id}
                href={`/profile/${follower.username}`}
                className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-slate-900 p-5 transition hover:border-blue-500/30 hover:bg-slate-800"
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-slate-800">
                  {follower.avatarUrl ? (
                    <img
                      src={follower.avatarUrl}
                      alt={follower.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-slate-400">
                      {follower.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate font-semibold group-hover:text-blue-400">
                      {follower.name}
                    </h2>

                    {follower.isVerified && (
                      <span className="text-xs text-blue-400">
                        ✓
                      </span>
                    )}
                  </div>

                  <p className="truncate text-sm text-slate-400">
                    @{follower.username}
                  </p>

                  {follower.bio && (
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {follower.bio}
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