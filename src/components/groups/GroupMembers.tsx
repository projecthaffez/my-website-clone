"use client";

import { useState } from "react";
import {
  removeGroupMemberAction,
  updateGroupMemberRoleAction,
} from "@/actions/group";

interface GroupMember {
  role: "MEMBER" | "MODERATOR" | "ADMIN";
  joinedAt: Date;
  user: {
    id: string;
    username: string;
    name: string;
    avatarUrl: string | null;
    isVerified: boolean;
  };
}

interface GroupMembersProps {
  groupId: string;
  members: GroupMember[];
  canManage: boolean;
  currentUserId: string;
}

export function GroupMembers({
  groupId,
  members,
  canManage,
  currentUserId,
}: GroupMembersProps) {
  const [memberList, setMemberList] =
    useState(members);

  const [loadingUserId, setLoadingUserId] =
    useState<string | null>(null);

  const [error, setError] = useState("");

  async function changeRole(
    userId: string,
    role: "MEMBER" | "MODERATOR",
  ) {
    setError("");
    setLoadingUserId(userId);

    try {
      const result =
        await updateGroupMemberRoleAction(
          groupId,
          userId,
          role,
        );

      if (!result.success) {
        setError(result.error);
        return;
      }

      setMemberList((current) =>
        current.map((member) =>
          member.user.id === userId
            ? {
                ...member,
                role,
              }
            : member,
        ),
      );
    } catch (error) {
      console.error(
        "changeRole failed:",
        error,
      );

      setError(
        "Failed to update member role.",
      );
    } finally {
      setLoadingUserId(null);
    }
  }

  async function removeMember(
    userId: string,
  ) {
    if (
      !window.confirm(
        "Remove this member from the group?",
      )
    ) {
      return;
    }

    setError("");
    setLoadingUserId(userId);

    try {
      const result =
        await removeGroupMemberAction(
          groupId,
          userId,
        );

      if (!result.success) {
        setError(result.error);
        return;
      }

      setMemberList((current) =>
        current.filter(
          (member) =>
            member.user.id !== userId,
        ),
      );
    } catch (error) {
      console.error(
        "removeMember failed:",
        error,
      );

      setError(
        "Failed to remove member.",
      );
    } finally {
      setLoadingUserId(null);
    }
  }

  function getRoleLabel(
    role: GroupMember["role"],
  ) {
    if (role === "ADMIN") {
      return "Admin";
    }

    if (role === "MODERATOR") {
      return "Moderator";
    }

    return "Member";
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">
            Members
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {memberList.length}{" "}
            {memberList.length === 1
              ? "member"
              : "members"}{" "}
            in this group.
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="mt-5 space-y-3">
        {memberList.map((member) => {
          const isCurrentUser =
            member.user.id === currentUserId;

          const isAdmin =
            member.role === "ADMIN";

          const isLoading =
            loadingUserId ===
            member.user.id;

          return (
            <div
              key={member.user.id}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* User */}
                <div className="flex min-w-0 items-center gap-3">
                  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-slate-800">
                    {member.user.avatarUrl ? (
                      <img
                        src={
                          member.user.avatarUrl
                        }
                        alt={member.user.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-bold text-slate-400">
                        {member.user.name
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-semibold text-white">
                        {member.user.name}
                      </span>

                      {member.user
                        .isVerified && (
                        <span className="text-xs text-blue-400">
                          ✓
                        </span>
                      )}

                      {isCurrentUser && (
                        <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs text-blue-400">
                          You
                        </span>
                      )}
                    </div>

                    <p className="truncate text-sm text-slate-500">
                      @{member.user.username}
                    </p>
                  </div>
                </div>

                {/* Role + Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      isAdmin
                        ? "bg-blue-500/10 text-blue-400"
                        : member.role ===
                            "MODERATOR"
                          ? "bg-purple-500/10 text-purple-400"
                          : "bg-white/5 text-slate-400"
                    }`}
                  >
                    {getRoleLabel(
                      member.role,
                    )}
                  </span>

                  {canManage &&
                    !isCurrentUser &&
                    !isAdmin && (
                      <>
                        {member.role ===
                        "MEMBER" ? (
                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() =>
                              changeRole(
                                member.user.id,
                                "MODERATOR",
                              )
                            }
                            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isLoading
                              ? "Updating..."
                              : "Make Moderator"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() =>
                              changeRole(
                                member.user.id,
                                "MEMBER",
                              )
                            }
                            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isLoading
                              ? "Updating..."
                              : "Remove Moderator"}
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() =>
                            removeMember(
                              member.user.id,
                            )
                          }
                          className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isLoading
                            ? "Removing..."
                            : "Remove"}
                        </button>
                      </>
                    )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {memberList.length === 0 && (
        <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center text-sm text-slate-500">
          No members found.
        </div>
      )}
    </section>
  );
}