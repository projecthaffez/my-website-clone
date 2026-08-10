import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { FollowButton } from "./FollowButton";

interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function ProfilePage({
  params,
}: ProfilePageProps) {
  const { username } = await params;

  const profile = await db.user.findUnique({
    where: {
      username: username.toLowerCase(),
    },
    select: {
      id: true,
      username: true,
      name: true,
      bio: true,
      avatarUrl: true,
      coverUrl: true,
      location: true,
      website: true,
      isVerified: true,
      createdAt: true,

      _count: {
        select: {
          followers: true,
          following: true,
          sentFriendRequests: {
            where: {
              status: "ACCEPTED",
            },
          },
        },
      },
    },
  });

  if (!profile) {
    notFound();
  }

  const currentUser = await getCurrentUser();

  const isOwnProfile = currentUser?.id === profile.id;

  let isFollowing = false;

  if (currentUser && !isOwnProfile) {
    const follow = await db.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: profile.id,
        },
      },
      select: {
        followerId: true,
      },
    });

    isFollowing = Boolean(follow);
  }

  const memberSince = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(profile.createdAt);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
          {/* Cover */}
          <div className="relative h-56 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 sm:h-72">
            {profile.coverUrl && (
              <img
                src={profile.coverUrl}
                alt={`${profile.name}'s cover`}
                className="h-full w-full object-cover"
              />
            )}
          </div>

          {/* Profile Header */}
          <div className="relative px-6 pb-6">
            <div className="-mt-16 flex flex-col gap-5 sm:flex-row sm:items-end">
              {/* Avatar */}
              <div className="h-32 w-32 shrink-0 overflow-hidden rounded-full border-4 border-slate-900 bg-slate-800">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-slate-400">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Name */}
              <div className="flex-1 pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold sm:text-3xl">
                    {profile.name}
                  </h1>

                  {profile.isVerified && (
                    <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold">
                      Verified
                    </span>
                  )}
                </div>

                <p className="text-slate-400">
                  @{profile.username}
                </p>
              </div>

              {/* Actions */}
              {isOwnProfile ? (
                <Link
                  href="/settings/profile"
                  className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold transition hover:bg-white/10"
                >
                  Edit Profile
                </Link>
              ) : currentUser ? (
                <FollowButton
                  targetUserId={profile.id}
                  initialFollowing={isFollowing}
                />
              ) : (
                <Link
                  href="/login"
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold transition hover:bg-blue-500"
                >
                  Log In to Follow
                </Link>
              )}
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="mt-5 max-w-2xl text-slate-300">
                {profile.bio}
              </p>
            )}

            {/* Profile Information */}
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-400">
              {profile.location && (
                <span>📍 {profile.location}</span>
              )}

              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  🔗 Website
                </a>
              )}

              <span>Joined {memberSince}</span>
            </div>

            {/* Stats */}
            <div className="mt-6 flex flex-wrap gap-6 border-t border-white/10 pt-5">
              <div>
                <strong className="text-lg">
                  {profile._count.followers}
                </strong>

                <span className="ml-2 text-sm text-slate-400">
                  Followers
                </span>
              </div>

              <div>
                <strong className="text-lg">
                  {profile._count.following}
                </strong>

                <span className="ml-2 text-sm text-slate-400">
                  Following
                </span>
              </div>

              <div>
                <strong className="text-lg">
                  {profile._count.sentFriendRequests}
                </strong>

                <span className="ml-2 text-sm text-slate-400">
                  Friends
                </span>
              </div>
            </div>
          </div>

          {/* Profile Navigation */}
          <nav className="flex overflow-x-auto border-t border-white/10">
            <Link
              href={`/profile/${profile.username}`}
              className="border-b-2 border-blue-500 px-6 py-4 text-sm font-semibold text-white"
            >
              Posts
            </Link>

            <Link
              href={`/profile/${profile.username}?tab=about`}
              className="px-6 py-4 text-sm text-slate-400 hover:text-white"
            >
              About
            </Link>

            <Link
              href={`/profile/${profile.username}?tab=photos`}
              className="px-6 py-4 text-sm text-slate-400 hover:text-white"
            >
              Photos
            </Link>

            <Link
              href={`/profile/${profile.username}?tab=friends`}
              className="px-6 py-4 text-sm text-slate-400 hover:text-white"
            >
              Friends
            </Link>
          </nav>
        </div>

        {/* Posts Placeholder */}
        <section className="mt-6 rounded-2xl border border-white/10 bg-slate-900 p-8 text-center">
          <h2 className="text-lg font-semibold">
            {isOwnProfile
              ? "Your Posts"
              : `${profile.name}'s Posts`}
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Posts will appear here when the News Feed and Post
            Engine are implemented in Phase 4.
          </p>
        </section>
      </div>
    </main>
  );
}