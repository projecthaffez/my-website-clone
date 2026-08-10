'use client';

import React from 'react';
import Link from 'next/link';
import { TrendingUp, UserPlus, Sparkles, ExternalLink } from 'lucide-react';

export function Rightbar() {
  const trendingTags = [
    { tag: '#NexusRelease', postsCount: '14.2k posts' },
    { tag: '#NextJS16', postsCount: '9.8k posts' },
    { tag: '#WebDev2026', postsCount: '7.5k posts' },
    { tag: '#AIPlatforms', postsCount: '5.1k posts' },
    { tag: '#TypeScript', postsCount: '3.9k posts' },
  ];

  const suggestedUsers = [
    { id: '1', name: 'Alex Rivera', username: 'arivera', avatar: '/default-avatar.svg', bio: 'Fullstack Architect' },
    { id: '2', name: 'Elena Chen', username: 'echen_dev', avatar: '/default-avatar.svg', bio: 'UI/UX Designer' },
    { id: '3', name: 'Marcus Vance', username: 'mvance', avatar: '/default-avatar.svg', bio: 'AI Researcher' },
  ];

  return (
    <aside className="w-80 shrink-0 hidden xl:block sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto pl-2 space-y-6">
      {/* Trending Topics Card */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-100 font-bold text-sm">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span>Trending Topics</span>
          </div>
          <Link href="/explore" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
            See all
          </Link>
        </div>

        <div className="space-y-2.5 pt-1">
          {trendingTags.map((item) => (
            <Link
              key={item.tag}
              href={`/search?q=${encodeURIComponent(item.tag)}`}
              className="block p-2 rounded-xl hover:bg-slate-800/60 transition-all group"
            >
              <p className="text-xs font-bold text-slate-200 group-hover:text-purple-400 transition-colors">
                {item.tag}
              </p>
              <p className="text-[11px] text-slate-500">{item.postsCount}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Suggested Connections Card */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-100 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Who to Follow</span>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          {suggestedUsers.map((person) => (
            <div key={person.id} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-slate-800 shrink-0 border border-purple-500/30 overflow-hidden">
                  <img src={person.avatar} alt={person.name} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-200 truncate">{person.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">@{person.username}</p>
                </div>
              </div>

              <button className="px-3 py-1 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white rounded-full text-[11px] font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1">
                <UserPlus className="w-3 h-3" />
                <span>Follow</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
