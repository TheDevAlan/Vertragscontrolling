'use client';

import Link from 'next/link';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-6">
          <FileQuestion className="w-10 h-10 text-primary-600" />
        </div>
        
        <h1 className="text-4xl font-bold text-slate-900 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-slate-700 mb-4">
          Seite nicht gefunden
        </h2>
        <p className="text-slate-500 mb-8 max-w-md">
          Die angeforderte Seite existiert nicht oder wurde verschoben.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link href="/">
            <Button variant="primary">
              <Home className="w-4 h-4 mr-2" />
              Zur Startseite
            </Button>
          </Link>
          <Button variant="secondary" onClick={handleGoBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück
          </Button>
        </div>
      </div>
    </div>
  );
}

