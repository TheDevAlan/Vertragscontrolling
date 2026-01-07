import 'next-auth';
import type { Role } from '@/types';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name: string | null;
    role: Role;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: Role;
  }
}

