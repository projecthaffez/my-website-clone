import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { GroupMembershipButton } from "@/components/groups/GroupMembershipButton";
import { GroupPostComposer } from "@/components/groups/GroupPostComposer";
import { GroupMembers } from "@/components/groups/GroupMembers";
import { PostCard } from "@/components/posts/PostCard";

interface GroupPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function GroupPage({
  params,
}: GroupPageProps) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const { slug } = await params;

  const group = await db.group.findUnique({
    where: {
      slug,
    },

    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      avatarUrl: true,
      coverUrl: true,
      privacy: true,
      createdAt: true,

      creator: {
        select: {
          id: true,
          username: true,
          name: true,
          avatarUrl: true,
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

      posts: {
        where: {
          isDeleted: false,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,

        select: {
          id: true,
          content: true,
          createdAt: true,

          author: {
            select: {
              username: true,
              name: true,
              avatarUrl: true,
              isVerified: true,
            },
          },
        },
      },
    },
  });

  if (!group) {
    notFound();
  }

  const membership = group.members[0] ?? null;

  const isMember = Boolean(membership);

  const isAdmin =
    membership?.role === "ADMIN";

  const groupMembers = isMember
    ? await db.groupMember.findMany({
        where: {
          groupId: group.id,
        },
        orderBy: {
          joinedAt: "asc",
        },
        select: {
          role: true,
          joinedAt: true,

          user: {
            select: {
              id: true,
              username: true,
              name: true,
              avatarUrl: true,
              isVerified: true,
            },
          },
        },
      })
    : [];

  const formattedDate =
    new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
    }).format(group.createdAt);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
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
              href="/groups"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Groups
            </Link>

            <Link
              href="/"
              className="hidden rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white sm:block"
            >
              Home
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Group Header */}
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
          {/* Cover */}
          <div className="relative h-48 bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950">
            {group.coverUrl && (
              <img
                src={group.coverUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            )}
          </div>

          <div className="px-5 pb-6">
            {/* Main Group Info */}
            <div className="-mt-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                {/* Avatar */}
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-4 border-slate-900 bg-slate-800">
                  {group.avatarUrl ? (
                    <img
                      src={group.avatarUrl}
                      alt={group.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-slate-400">
                      {group.name
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="pb-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-bold">
                      {group.name}
                    </h1>

                    <span className="rounded-full bg-white/5 px-2 py-1 text-xs text-slate-400">
                      {group.privacy === "PUBLIC"
                        ? "Public"
                        : "Private"}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    /{group.slug}
                  </p>
                </div>
              </div>

              {/* Membership */}
              <GroupMembershipButton
                groupId={group.id}
                isMember={isMember}
                isAdmin={isAdmin}
              />
            </div>

            {/* Description */}
            {group.description && (
              <p className="mt-6 max-w-3xl text-sm leading-6 text-slate-400">
                {group.description}
              </p>
            )}

            {/* Stats */}
            <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-500">
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

              <span>
                Created {formattedDate}
              </span>
            </div>

            {/* Creator */}
            <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-5">
              <div className="h-9 w-9 overflow-hidden rounded-full bg-slate-800">
                {group.creator.avatarUrl ? (
                  <img
                    src={group.creator.avatarUrl}
                    alt={group.creator.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-bold text-slate-400">
                    {group.creator.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}
              </div>

              <div className="text-sm">
                <span className="text-slate-500">
                  Created by{" "}
                </span>

                <Link
                  href={`/profile/${group.creator.username}`}
                  className="font-semibold text-slate-300 hover:text-blue-400"
                >
                  {group.creator.name}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Members */}
        {isMember && (
          <section className="mt-6">
            <GroupMembers
              groupId={group.id}
              members={groupMembers}
              canManage={isAdmin}
              currentUserId={currentUser.id}
            />
          </section>
        )}

        {/* Community Posts */}
        <section className="mt-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold">
              Community Posts
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Recent posts shared in this group.
            </p>
          </div>

          {/* Create Post */}
          {isMember && (
            <div className="mb-6">
              <GroupPostComposer
                groupId={group.id}
                groupName={group.name}
              />
            </div>
          )}

          {/* Private Group */}
          {!isMember &&
          group.privacy === "PRIVATE" ? (
            <div className="rounded-2xl border border-white/10 bg-slate-900 p-10 text-center">
              <div className="text-4xl">
                🔒
              </div>

              <h3 className="mt-4 text-lg font-semibold">
                Private Group
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Join this group to access its
                community content.
              </p>
            </div>
          ) : group.posts.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-slate-900 p-10 text-center">
              <div className="text-4xl">
                📝
              </div>

              <h3 className="mt-4 text-lg font-semibold">
                No posts yet
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                This community hasn't shared any
                posts yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {group.posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}