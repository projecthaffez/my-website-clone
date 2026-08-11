"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
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
  const [query, setQuery] =
    useState("");

  const [users, setUsers] =
    useState<SearchUser[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [searched, setSearched] =
    useState(false);

  const [error, setError] =
    useState("");

  const searchRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent,
    ) {
      if (
        searchRef.current &&
        !searchRef.current.contains(
          event.target as Node,
        )
      ) {
        setSearched(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );
    };
  }, []);

  async function handleSearch(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const cleanQuery =
      query.trim();

    if (!cleanQuery) {
      setUsers([]);
      setSearched(false);
      setError("");
      return;
    }

    if (cleanQuery.length > 100) {
      setUsers([]);
      setSearched(true);
      setError(
        "Search query is too long.",
      );
      return;
    }

    setLoading(true);
    setError("");
    setSearched(true);

    try {
      const result =
        await searchUsersAction(
          cleanQuery,
        );

      if (!result.success) {
        setUsers([]);
        setError(result.error);
        return;
      }

      setUsers(result.users);
    } catch (error) {
      console.error(
        "SearchBar search failed:",
        error,
      );

      setUsers([]);
      setError(
        "Failed to search users. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setQuery("");
    setUsers([]);
    setSearched(false);
    setError("");
  }

  return (
    <div
      ref={searchRef}
      className="relative w-full max-w-md"
    >
      <form
        onSubmit={handleSearch}
        className="flex gap-2"
      >
        <div className="relative min-w-0 flex-1">
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);

              if (
                !event.target.value.trim()
              ) {
                setUsers([]);
                setSearched(false);
                setError("");
              }
            }}
            onFocus={() => {
              if (
                query.trim() &&
                users.length > 0
              ) {
                setSearched(true);
              }
            }}
            placeholder="Search people..."
            maxLength={100}
            autoComplete="off"
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 pr-10 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500"
          />

          {query && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-sm text-slate-500 transition hover:bg-white/5 hover:text-white"
            >
              ×
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={
            loading ||
            !query.trim()
          }
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Searching..."
            : "Search"}
        </button>
      </form>

      {error && (
        <div className="mt-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs text-red-300">
          {error}
        </div>
      )}

      {searched &&
        !error && (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
            {loading ? (
              <div className="px-4 py-6 text-center">
                <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />

                <p className="mt-3 text-sm text-slate-500">
                  Searching people...
                </p>
              </div>
            ) : users.length === 0 ? (
              <div className="px-4 py-7 text-center">
                <div className="text-2xl">
                  🔎
                </div>

                <p className="mt-2 text-sm font-medium text-slate-300">
                  No users found
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  Try another name or username.
                </p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                <div className="border-b border-white/5 px-4 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                    People
                  </p>
                </div>

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
                          <span
                            aria-label="Verified"
                            className="shrink-0 rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold text-white"
                          >
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