'use client';

import React from 'react';
import { SignInForm } from '@/components/auth/SignInForm';
import { InteractiveAuthLayout } from '@/components/auth/InteractiveAuthLayout';

export default function SignInPage() {
  return (
    <InteractiveAuthLayout
      switchPrompt="Don't have an account?"
      switchText="Sign up"
      switchHref="/signup"
    >
      <SignInForm />
    </InteractiveAuthLayout>
  );
}
