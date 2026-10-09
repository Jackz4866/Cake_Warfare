import { createAuthClient } from '@neondatabase/auth';
import { BetterAuthReactAdapter } from '@neondatabase/auth/react/adapters';

const authUrl = import.meta.env.VITE_NEON_AUTH_URL || 'https://ep-bitter-thunder-b6d0r9rs.neonauth.c-2.sa-east-1.aws.neon.tech/neondb/auth';

export const auth = createAuthClient(authUrl, {
  adapter: BetterAuthReactAdapter(),
});

export const { useSession } = auth;
