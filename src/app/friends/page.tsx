import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export default async function FriendsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const friendships = await db.friendship.findMany({
    where: {
      status: "ACCEPTED",
      OR: [
        {
          requesterId: currentUser.id,
        },
        {
          addresseeId: currentUser.id,
        },
      ],
    },
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      requester: {
        select: {
          id: true,
          username: true,
          name: true,
          avatarUrl: true,
          bio: true,
          isVerified: true,
        },
      },
      addressee: {
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

  const friends = friendships.map((friendship) =>
    friendship.requesterId === currentUser.id
      ? friendship.addressee
      : friendship.requester,
  );

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm text-slate-400 hover:text-white"
          >
            ← Back to Home
          </Link>

          <h1 className="mt-4 text-3xl font-bold">
            Friends
          </h1>

          <p className="mt-2 text-slate-400">
            People you are connected with.
          </p>
        </div>

        {friends.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-10 text-center">
            <div className="text-4xl">👥</div>

            <h2 className="mt-4 text-lg font-semibold">
              No friends yet
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Add people to your network and they will appear
              here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {friends.map((friend) => (
              <Link
                key={friend.id}
                href={`/profile/${friend.username}`}
                className="group rounded-2xl border border-white/10 bg-slate-900 p-5 transition hover:border-blue-500/30 hover:bg-slate-800"
              >
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-slate-800">
                    {friend.avatarUrl ? (
                      <img
                        src={friend.avatarUrl}
                        alt={friend.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-slate-400">
                        {friend.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate font-semibold group-hover:text-blue-400">
                        {friend.name}
                      </h2>

                      {friend.isVerified && (
                        <span className="text-xs text-blue-400">
                          ✓
                        </span>
                      )}
                    </div>

                    <p className="truncate text-sm text-slate-400">
                      @{friend.username}
                    </p>

                    {friend.bio && (
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {friend.bio}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}