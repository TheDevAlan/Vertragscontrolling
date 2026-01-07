'use client';

import { Bell, User } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header = ({ title, subtitle }: HeaderProps) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        {subtitle && (
          <p className="text-sm text-slate-500">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Benachrichtigungen */}
        <button
          className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          aria-label="Benachrichtigungen"
        >
          <Bell className="w-5 h-5" />
          {/* Badge für ungelesene Benachrichtigungen */}
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary-600 rounded-full" />
        </button>

        {/* Benutzer-Avatar */}
        <button
          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Benutzerprofil"
        >
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-primary-600" />
          </div>
        </button>
      </div>
    </header>
  );
};

