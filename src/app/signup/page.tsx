'use client';

import React from 'react';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { InteractiveAuthLayout } from '@/components/auth/InteractiveAuthLayout';

export default function SignUpPage() {
  return (
    <InteractiveAuthLayout
      switchPrompt="Already have an account?"
      switchText="Sign in"
      switchHref="/signin"
    >
      <SignUpForm />
    </InteractiveAuthLayout>
  );
}
