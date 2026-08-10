import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { FriendRequestActions } from "./FriendRequestActions";

export default async function FriendRequestsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const requests = await db.friendship.findMany({
    where: {
      addresseeId: currentUser.id,
      status: "PENDING",
    },
    orderBy: {
      createdAt: "desc",
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
    },
  });

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm text-slate-400 hover:text-white"
          >
            ← Back to Home
          </Link>

          <h1 className="mt-4 text-3xl font-bold">
            Friend Requests
          </h1>

          <p className="mt-2 text-slate-400">
            Manage people who want to connect with you.
          </p>
        </div>

        {requests.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-10 text-center">
            <div className="text-4xl">👥</div>

            <h2 className="mt-4 text-lg font-semibold">
              No pending requests
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              When someone sends you a friend request, it will
              appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <div
                key={request.id}
                className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-900 p-5 sm:flex-row sm:items-center"
              >
                <Link
                  href={`/profile/${request.requester.username}`}
                  className="flex min-w-0 flex-1 items-center gap-4"
                >
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-slate-800">
                    {request.requester.avatarUrl ? (
                      <img
                        src={request.requester.avatarUrl}
                        alt={request.requester.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xl font-bold text-slate-400">
                        {request.requester.name
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate font-semibold">
                        {request.requester.name}
                      </h2>

                      {request.requester.isVerified && (
                        <span className="text-xs text-blue-400">
                          ✓
                        </span>
                      )}
                    </div>

                    <p className="truncate text-sm text-slate-400">
                      @{request.requester.username}
                    </p>

                    {request.requester.bio && (
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {request.requester.bio}
                      </p>
                    )}
                  </div>
                </Link>

                <FriendRequestActions
                  requestId={request.id}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}