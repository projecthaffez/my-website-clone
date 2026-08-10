'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Home,
  Compass,
  MessageSquare,
  Bell,
  Users,
  Flag,
  Bookmark,
  Settings,
  Shield,
  UserCheck,
  TrendingUp,
} from 'lucide-react';

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
    { href: '/', label: 'News Feed', icon: Home },
    { href: '/explore', label: 'Explore & Trending', icon: Compass },
    { href: '/messages', label: 'Direct Messages', icon: MessageSquare },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/groups', label: 'Communities & Groups', icon: Users },
    { href: '/pages-hub', label: 'Pages & Brands', icon: Flag },
    { href: '/saved', label: 'Saved Bookmarks', icon: Bookmark },
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:block sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto pr-2 space-y-6">
      {/* User Profile Mini Header */}
      {user && (
        <Link
          href={`/profile/${user.username}`}
          className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-purple-500/40 hover:bg-slate-900 transition-all group"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 relative border border-purple-500/30 group-hover:border-purple-400">
            <Image
              src={user.avatarUrl || '/default-avatar.svg'}
              alt={user.name}
              width={40}
              height={40}
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-slate-100 truncate group-hover:text-purple-300 transition-colors">
              {user.name}
            </h3>
            <p className="text-xs text-slate-400 truncate">@{user.username}</p>
          </div>
        </Link>
      )}

      {/* Main Navigation Menu */}
      <div className="space-y-1">
        <p className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
          Menu Navigation
        </p>
        {primaryNav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-purple-600/15 text-purple-300 border border-purple-500/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-slate-500'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Management & Admin Links */}
      <div className="space-y-1 pt-4 border-t border-slate-800/80">
        <p className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
          Account & System
        </p>

        <Link
          href="/settings"
          className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 transition-all"
        >
          <Settings className="w-4 h-4 text-slate-500" />
          <span>Account Settings</span>
        </Link>

        {user && (user.role === 'ADMIN' || user.role === 'MODERATOR') && (
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10 transition-all"
          >
            <Shield className="w-4 h-4" />
            <span>Admin Control Panel</span>
          </Link>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-3 pt-4 border-t border-slate-800/60 text-[11px] text-slate-500 space-y-1">
        <p>© 2026 Nexus Social Network</p>
        <div className="flex flex-wrap gap-2 text-slate-600">
          <Link href="#" className="hover:underline">Privacy</Link>
          <span>•</span>
          <Link href="#" className="hover:underline">Terms</Link>
          <span>•</span>
          <Link href="#" className="hover:underline">Cookies</Link>
        </div>
      </div>
    </aside>
  );
}
