'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { logoutUserAction } from '@/actions/auth';
import {
  Search,
  Home,
  Compass,
  MessageSquare,
  Bell,
  Users,
  Flag,
  Bookmark,
  Settings,
  Shield,
  LogOut,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navLinks = [
    { href: '/', label: 'Home Feed', icon: Home },
    { href: '/explore', label: 'Explore', icon: Compass },
    { href: '/messages', label: 'Messages', icon: MessageSquare, badge: '3' },
    { href: '/notifications', label: 'Notifications', icon: Bell, badge: '5' },
    { href: '/groups', label: 'Groups', icon: Users },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Search */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 p-[2px] shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[9px] flex items-center justify-center">
                <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 text-lg">
                  N
                </span>
              </div>
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white hidden sm:inline-block">
              NEXUS
            </span>
          </Link>

          {/* Search Box */}
          <div className="relative hidden md:block w-64 lg:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Nexus..."
              className="w-full h-9 pl-9 pr-4 bg-slate-900/90 border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-full text-slate-200 placeholder-slate-500 text-xs outline-none transition-all"
            />
          </div>
        </div>

        {/* Center Primary Nav Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-purple-600/15 text-purple-400 border border-purple-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="hidden lg:inline">{link.label}</span>
                {link.badge && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full shadow-sm">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right User Controls */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-full hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-800 relative border border-purple-500/30">
                  <Image
                    src={user.avatarUrl || '/default-avatar.svg'}
                    alt={user.name}
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                </div>
                <span className="text-sm font-semibold text-slate-200 hidden md:inline-block max-w-[120px] truncate">
                  {user.name}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {/* User Dropdown */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-3 border-b border-slate-800">
                    <p className="text-sm font-bold text-slate-100">{user.name}</p>
                    <p className="text-xs text-slate-400">@{user.username}</p>
                  </div>

                  <div className="py-1">
                    <Link
                      href={`/profile/${user.username}`}
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-purple-600/10 transition-colors"
                    >
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span>View Profile</span>
                    </Link>

                    <Link
                      href="/saved"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-purple-600/10 transition-colors"
                    >
                      <Bookmark className="w-4 h-4 text-slate-400" />
                      <span>Saved Posts</span>
                    </Link>

                    <Link
                      href="/settings"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-purple-600/10 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Account Settings</span>
                    </Link>

                    {(user.role === 'ADMIN' || user.role === 'MODERATOR') && (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-slate-800 pt-1 mt-1">
                    <form action={logoutUserAction}>
                      <button
                        type="submit"
                        className="w-full flex items-center gap-3 px-4 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
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
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white rounded-full shadow-md shadow-purple-600/20 transition-colors"
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
