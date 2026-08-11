import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { PostCard } from "@/components/posts/PostCard";

interface PostDetailPageProps {
  params: Promise<{
    postId: string;
  }>;
}

export default async function PostDetailPage({
  params,
}: PostDetailPageProps) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const { postId } = await params;

  const post = await db.post.findUnique({
    where: {
      id: postId,
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      isDeleted: true,
      isPinned: true,

      media: {
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          url: true,
          type: true,
          aspectRatio: true,
        },
      },

      author: {
        select: {
          username: true,
          name: true,
          avatarUrl: true,
          isVerified: true,
        },
      },

      reactions: {
        where: {
          userId: currentUser.id,
        },
        select: {
          id: true,
        },
      },

      savedBy: {
        where: {
          userId: currentUser.id,
        },
        select: {
          userId: true,
        },
      },

      _count: {
        select: {
          reactions: true,
          comments: true,
        },
      },
    },
  });

  if (!post || post.isDeleted) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
          <Link
            href="/"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10"
          >
            Back to Feed
          </Link>

          <div>
            <h1 className="font-semibold">
              Post
            </h1>

            <p className="text-xs text-slate-500">
              Post by {post.author.name}
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-8">
        <PostCard
          post={{
            id: post.id,
            content: post.content,
            createdAt: post.createdAt,
            media: post.media,
            author: post.author,
            isPinned: post.isPinned,
            isLiked:
              post.reactions.length > 0,
            isSaved:
              post.savedBy.length > 0,
            reactionCount:
              post._count.reactions,
            commentCount:
              post._count.comments,
          }}
        />
      </div>
    </main>
  );
}
