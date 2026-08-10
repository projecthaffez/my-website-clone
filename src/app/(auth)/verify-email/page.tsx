import React from 'react';
import Link from 'next/link';
import { Mail, CheckCircle2, ArrowRight } from 'lucide-react';

export default function VerifyEmailPage() {
  return (
    <div className="w-full text-center">
      <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto mb-6">
        <Mail className="w-8 h-8 text-purple-400" />
      </div>

      <h1 className="text-2xl font-bold text-white tracking-tight">Check your email</h1>
      <p className="text-sm text-slate-400 mt-2 mb-6 leading-relaxed">
        We sent a verification link to your registered email address. Please click the link inside to verify your account.
      </p>

      <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl mb-6 text-xs text-slate-400 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>Verification tokens are automatically processed upon clicking.</span>
      </div>

      <Link
        href="/login"
        className="w-full h-11 bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm rounded-xl flex items-center justify-center gap-2 transition-all"
      >
        <span>Return to Login</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
