import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { CreateGroupForm } from "@/components/groups/CreateGroupForm";

export default async function GroupsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const groups = await db.group.findMany({
    where: {
      privacy: "PUBLIC",
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      avatarUrl: true,
      privacy: true,
      creator: {
        select: {
          username: true,
          name: true,
        },
      },
      _count: {
        select: {
          members: true,
          posts: true,
        },
      },
      members: {
        where: {
          userId: currentUser.id,
        },
        select: {
          role: true,
        },
      },
    },
  });

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-950/95">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <div>
            <Link
              href="/"
              className="text-xl font-bold tracking-tight"
            >
              Nexus
            </Link>

            <p className="mt-1 text-xs text-slate-500">
              Groups & Communities
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Home
            </Link>

            <Link
              href={`/profile/${currentUser.username}`}
              className="hidden rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white sm:block"
            >
              Profile
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Page Header */}
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-bold">
              Groups
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Discover communities, connect with
              people who share your interests, and
              participate in meaningful discussions.
            </p>
          </div>
        </div>

        {/* Create Group */}
        <section className="mb-8 rounded-2xl border border-white/10 bg-slate-900 p-5">
          <h2 className="text-lg font-semibold">
            Create a Group
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Start your own community on Nexus.
          </p>

          <div className="mt-5">
            <CreateGroupForm />
          </div>
        </section>

        {/* Groups */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">
                Discover Groups
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Public communities you can join.
              </p>
            </div>

            <span className="text-xs text-slate-600">
              {groups.length}{" "}
              {groups.length === 1
                ? "group"
                : "groups"}
            </span>
          </div>

          {groups.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-slate-900 p-10 text-center">
              <div className="text-4xl">
                👥
              </div>

              <h3 className="mt-4 text-lg font-semibold">
                No groups yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Be the first person to create a
                community on Nexus.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {groups.map((group) => {
                const membership =
                  group.members[0];

                const isMember =
                  Boolean(membership);

                return (
                  <article
                    key={group.id}
                    className="rounded-2xl border border-white/10 bg-slate-900 p-5 transition hover:border-white/20"
                  >
                    <div className="flex gap-4">
                      {/* Avatar */}
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-slate-800">
                        {group.avatarUrl ? (
                          <img
                            src={group.avatarUrl}
                            alt={group.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xl font-bold text-slate-400">
                            {group.name
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/groups/${group.slug}`}
                          className="text-lg font-semibold hover:text-blue-400"
                        >
                          {group.name}
                        </Link>

                        <p className="mt-1 text-xs text-slate-500">
                          Created by{" "}
                          <span className="text-slate-400">
                            {group.creator.name}
                          </span>
                        </p>
                      </div>
                    </div>

                    {group.description && (
                      <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-400">
                        {group.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
                      <span>
                        👥 {group._count.members}{" "}
                        {group._count.members === 1
                          ? "member"
                          : "members"}
                      </span>

                      <span>
                        📝 {group._count.posts}{" "}
                        {group._count.posts === 1
                          ? "post"
                          : "posts"}
                      </span>

                      <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-emerald-400">
                        Public
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="mt-5 flex items-center gap-2">
                      <Link
                        href={`/groups/${group.slug}`}
                        className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold transition hover:bg-blue-500"
                      >
                        View Group
                      </Link>

                      {isMember && (
                        <span className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5 text-sm font-semibold text-emerald-400">
                          Member
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}