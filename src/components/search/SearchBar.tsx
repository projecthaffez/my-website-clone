"use client";

import { useState } from "react";
import Link from "next/link";
import { searchUsersAction } from "@/actions/search";

interface SearchUser {
  id: string;
  username: string;
  name: string;
  bio: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
}

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    const cleanQuery = query.trim();

    if (!cleanQuery) {
      setUsers([]);
      setSearched(false);
      setError("");
      return;
    }

    setLoading(true);
    setError("");
    setSearched(true);

    const result =
      await searchUsersAction(cleanQuery);

    setLoading(false);

    if (!result.success) {
      setUsers([]);
      setError(result.error);
      return;
    }

    setUsers(result.users);
  }

  return (
    <div className="relative w-full max-w-md">
      <form
        onSubmit={handleSearch}
        className="flex gap-2"
      >
        <input
          type="search"
          value={query}
          onChange={(event) =>
            setQuery(event.target.value)
          }
          placeholder="Search people..."
          maxLength={100}
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500"
        />

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && (
        <div className="mt-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs text-red-300">
          {error}
        </div>
      )}

      {searched && !loading && !error && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
          {users.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-slate-500">
              No users found.
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {users.map((user) => (
                <Link
                  key={user.id}
                  href={`/profile/${user.username}`}
                  onClick={() => {
                    setSearched(false);
                  }}
                  className="flex gap-3 border-b border-white/5 px-4 py-3 transition last:border-b-0 hover:bg-white/5"
                >
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-800">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-semibold text-slate-400">
                        {user.name
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-white">
                        {user.name}
                      </p>

                      {user.isVerified && (
                        <span className="shrink-0 rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                          ✓
                        </span>
                      )}
                    </div>

                    <p className="truncate text-xs text-slate-500">
                      @{user.username}
                    </p>

                    {user.bio && (
                      <p className="mt-1 truncate text-xs text-slate-400">
                        {user.bio}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}