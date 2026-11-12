'use client';

import React, { use, Suspense } from 'react';
import { BlogContent } from '../page';

interface BlogDynamicPageProps {
  params: Promise<{ id: string }>;
}

function DynamicBlogRenderer({ params }: BlogDynamicPageProps) {
  const resolved = use(params);
  return <BlogContent idFromProps={resolved.id} />;
}

export default function BlogDetailPage({ params }: BlogDynamicPageProps) {
  return (
    <Suspense fallback={<div style={{ padding: '80px', textAlign: 'center' }}>Loading Field Notes...</div>}>
      <DynamicBlogRenderer params={params} />
    </Suspense>
  );
}

