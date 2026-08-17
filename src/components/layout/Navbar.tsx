"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { logoutUserAction } from "@/actions/auth";
import {
  Home,
  Compass,
  MessageSquare,
  Bell,
  Users,
  Bookmark,
  Settings,
  Shield,
  LogOut,
  ChevronDown,
  Sparkles,
  FileText,
  UserPlus,
} from "lucide-react";

interface NavbarProps {
  user?: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string | null;
    role?: string;
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] =
    useState(false);

  const navLinks = [
    {
      href: "/",
      label: "Home",
      icon: Home,
    },
    {
      href: "/explore",
      label: "Explore",
      icon: Compass,
    },
    {
      href: "/messages",
      label: "Messages",
      icon: MessageSquare,
    },
    {
      href: "/notifications",
      label: "Notifications",
      icon: Bell,
    },
    {
      href: "/friends",
      label: "Friends",
      icon: Users,
    },
    {
      href: "/groups",
      label: "Groups",
      icon: Users,
    },
    {
      href: "/pages",
      label: "Pages",
      icon: FileText,
    },
    {
      href: "/saved",
      label: "Saved",
      icon: Bookmark,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3 group"
        >
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 p-[2px] shadow-md shadow-purple-500/20 transition-transform group-hover:scale-105">
            <div className="flex h-full w-full items-center justify-center rounded-[9px] bg-slate-950">
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-lg font-extrabold text-transparent">
                N
              </span>
            </div>
          </div>

          <span className="hidden text-xl font-extrabold tracking-tight text-white sm:inline-block">
            NEXUS
          </span>
        </Link>

        {/* Navigation */}
        {user && (
          <nav className="flex items-center gap-1 overflow-x-auto sm:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;

              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname === link.href ||
                    pathname.startsWith(
                      `${link.href}/`,
                    );

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? "border border-purple-500/20 bg-purple-600/15 text-purple-400"
                      : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200"
                  }`}
                >
                  <Icon className="h-5 w-5" />

                  <span className="hidden xl:inline">
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        )}

        {/* User Controls */}
        <div className="flex shrink-0 items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setIsDropdownOpen(
                    (value) => !value,
                  )
                }
                className="flex cursor-pointer items-center gap-2.5 rounded-full border border-transparent p-1.5 transition-all hover:border-slate-800 hover:bg-slate-900"
              >
                <div className="relative h-8 w-8 overflow-hidden rounded-full border border-purple-500/30 bg-slate-800">
                  <Image
                    src={
                      user.avatarUrl ||
                      "/default-avatar.svg"
                    }
                    alt={user.name}
                    width={32}
                    height={32}
                    className="h-full w-full object-cover"
                  />
                </div>

                <span className="hidden max-w-[120px] truncate text-sm font-semibold text-slate-200 md:inline-block">
                  {user.name}
                </span>

                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 py-2 shadow-2xl">
                  {/* User Info */}
                  <div className="border-b border-slate-800 px-4 py-3">
                    <p className="text-sm font-bold text-slate-100">
                      {user.name}
                    </p>

                    <p className="text-xs text-slate-400">
                      @{user.username}
                    </p>
                  </div>

                  <div className="py-1">
                    {/* Profile */}
                    <Link
                      href={`/profile/${user.username}`}
                      onClick={() =>
                        setIsDropdownOpen(false)
                      }
                      className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-slate-300 transition-colors hover:bg-purple-600/10 hover:text-white"
                    >
                      <Sparkles className="h-4 w-4 text-purple-400" />
                      <span>View Profile</span>
                    </Link>

                    {/* Friends */}
                    <Link
                      href="/friends"
                      onClick={() =>
                        setIsDropdownOpen(false)
                      }
                      className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-slate-300 transition-colors hover:bg-purple-600/10 hover:text-white"
                    >
                      <UserPlus className="h-4 w-4 text-slate-400" />
                      <span>Friends</span>
                    </Link>

                    {/* Saved */}
                    <Link
                      href="/saved"
                      onClick={() =>
                        setIsDropdownOpen(false)
                      }
                      className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-slate-300 transition-colors hover:bg-purple-600/10 hover:text-white"
                    >
                      <Bookmark className="h-4 w-4 text-slate-400" />
                      <span>Saved Posts</span>
                    </Link>

                    {/* Messages */}
                    <Link
                      href="/messages"
                      onClick={() =>
                        setIsDropdownOpen(false)
                      }
                      className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-slate-300 transition-colors hover:bg-purple-600/10 hover:text-white"
                    >
                      <MessageSquare className="h-4 w-4 text-slate-400" />
                      <span>Messages</span>
                    </Link>

                    {/* Notifications */}
                    <Link
                      href="/notifications"
                      onClick={() =>
                        setIsDropdownOpen(false)
                      }
                      className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-slate-300 transition-colors hover:bg-purple-600/10 hover:text-white"
                    >
                      <Bell className="h-4 w-4 text-slate-400" />
                      <span>Notifications</span>
                    </Link>

                    {/* Settings */}
                    <Link
                      href="/settings/profile"
                      onClick={() =>
                        setIsDropdownOpen(false)
                      }
                      className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-slate-300 transition-colors hover:bg-purple-600/10 hover:text-white"
                    >
                      <Settings className="h-4 w-4 text-slate-400" />
                      <span>Account Settings</span>
                    </Link>

                    {/* Admin */}
                    {(user.role === "ADMIN" ||
                      user.role === "MODERATOR") && (
                      <Link
                        href="/admin/reports"
                        onClick={() =>
                          setIsDropdownOpen(false)
                        }
                        className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-emerald-400 transition-colors hover:bg-emerald-500/10"
                      >
                        <Shield className="h-4 w-4" />
                        <span>Admin Reports</span>
                      </Link>
                    )}
                  </div>

                  {/* Logout */}
                  <div className="mt-1 border-t border-slate-800 pt-1">
                    <form action={logoutUserAction}>
                      <button
                        type="submit"
                        className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 text-xs font-semibold text-slate-300 transition-colors hover:text-white"
              >
                Sign In
              </Link>

              <Link
                href="/register"
                className="rounded-full bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-purple-600/20 transition-colors hover:bg-purple-500"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}