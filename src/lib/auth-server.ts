import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin } from 'better-auth/plugins';
import prisma from './prisma';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 6,
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'freelancer',
        input: true,
      },
      workerProfileId: {
        type: 'string',
        required: false,
        input: true,
      },
    },
  },
  plugins: [
    admin(),
  ],
  secret: process.env.BETTER_AUTH_SECRET || 'rp1MPtUhg0A/Oxb9ZYIhoL72g/KhDBdGtrhZpiMCSDk=',
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ],
});

export type Auth = typeof auth;

