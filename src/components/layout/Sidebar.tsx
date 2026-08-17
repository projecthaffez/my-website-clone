"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  Compass,
  MessageSquare,
  Bell,
  Users,
  FileText,
  Bookmark,
  Settings,
  Shield,
  UserPlus,
} from "lucide-react";

interface SidebarProps {
  user?: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string | null;
    role?: string;
  } | null;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const primaryNav = [
    {
      href: "/",
      label: "News Feed",
      icon: Home,
    },
    {
      href: "/explore",
      label: "Explore & Trending",
      icon: Compass,
    },
    {
      href: "/messages",
      label: "Direct Messages",
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
      icon: UserPlus,
    },
    {
      href: "/groups",
      label: "Communities & Groups",
      icon: Users,
    },
    {
      href: "/pages",
      label: "Pages & Brands",
      icon: FileText,
    },
    {
      href: "/saved",
      label: "Saved Bookmarks",
      icon: Bookmark,
    },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  };

  return (
    <aside className="sticky top-20 hidden h-[calc(100vh-5rem)] w-64 shrink-0 space-y-6 overflow-y-auto pr-2 lg:block">
      {/* User Profile */}
      {user && (
        <Link
          href={`/profile/${user.username}`}
          className="group flex items-center gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-3 transition-all hover:border-purple-500/40 hover:bg-slate-900"
        >
          <div className="relative h-10 w-10 overflow-hidden rounded-full border border-purple-500/30 bg-slate-800 transition-colors group-hover:border-purple-400">
            <Image
              src={
                user.avatarUrl ||
                "/default-avatar.svg"
              }
              alt={user.name}
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-bold text-slate-100 transition-colors group-hover:text-purple-300">
              {user.name}
            </h3>

            <p className="truncate text-xs text-slate-400">
              @{user.username}
            </p>
          </div>
        </Link>
      )}

      {/* Main Navigation */}
      <div className="space-y-1">
        <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Menu Navigation
        </p>

        {primaryNav.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                active
                  ? "border border-purple-500/30 bg-purple-600/15 text-purple-300"
                  : "text-slate-400 hover:bg-slate-900/80 hover:text-slate-100"
              }`}
            >
              <Icon
                className={`h-4 w-4 ${
                  active
                    ? "text-purple-400"
                    : "text-slate-500"
                }`}
              />

              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Account & System */}
      <div className="space-y-1 border-t border-slate-800/80 pt-4">
        <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Account & System
        </p>

        <Link
          href="/settings/profile"
          className={`flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
            pathname.startsWith("/settings")
              ? "border border-purple-500/30 bg-purple-600/15 text-purple-300"
              : "text-slate-400 hover:bg-slate-900/80 hover:text-slate-100"
          }`}
        >
          <Settings className="h-4 w-4 text-slate-500" />
          <span>Account Settings</span>
        </Link>

        {user &&
          (user.role === "ADMIN" ||
            user.role === "MODERATOR") && (
            <Link
              href="/admin/reports"
              className={`flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                pathname.startsWith("/admin")
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "text-emerald-400 hover:bg-emerald-500/10"
              }`}
            >
              <Shield className="h-4 w-4" />
              <span>Admin Reports</span>
            </Link>
          )}
      </div>

      {/* Footer */}
      <div className="space-y-2 border-t border-slate-800/60 px-3 pt-4 text-[11px] text-slate-500">
        <p>© 2026 Nexus Social Network</p>

        <div className="flex flex-wrap gap-2 text-slate-600">
          <span>Privacy</span>
          <span>•</span>
          <span>Terms</span>
          <span>•</span>
          <span>Cookies</span>
        </div>
      </div>
    </aside>
  );
}