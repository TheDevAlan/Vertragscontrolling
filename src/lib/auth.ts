import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import type { Role } from '@/types';

// Validierung des NEXTAUTH_SECRET (nur zur Laufzeit, nicht beim Build)
const nextAuthSecret = process.env.NEXTAUTH_SECRET;
// Prüfe ob wir im Build-Prozess sind (NEXT_PHASE wird beim Build gesetzt)
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

// Debug-Logging (nur in Production, um zu sehen welche Variablen verfügbar sind)
if (process.env.NODE_ENV === 'production' && !isBuildPhase) {
  console.log('[DEBUG] Environment check:');
  console.log('[DEBUG] NEXTAUTH_SECRET:', nextAuthSecret ? 'SET (length: ' + nextAuthSecret.length + ')' : 'NOT SET');
  console.log('[DEBUG] NODE_ENV:', process.env.NODE_ENV);
  console.log('[DEBUG] Available env vars (keys):', Object.keys(process.env).filter(k => k.includes('NEXT') || k.includes('AUTH')).join(', '));
}

if (!nextAuthSecret && !isBuildPhase) {
  const errorMessage = 
    process.env.NODE_ENV === 'production'
      ? 'NEXTAUTH_SECRET ist nicht gesetzt. Bitte setzen Sie die Umgebungsvariable NEXTAUTH_SECRET in Railway (Variables Tab).'
      : 'NEXTAUTH_SECRET ist nicht gesetzt. Bitte fügen Sie NEXTAUTH_SECRET zu Ihrer .env oder .env.local Datei hinzu.';
  throw new Error(errorMessage);
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'E-Mail', type: 'email' },
        password: { label: 'Passwort', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('E-Mail und Passwort erforderlich');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error('Benutzer nicht gefunden');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Ungültiges Passwort');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 Stunden
  },
  secret: nextAuthSecret,
};

