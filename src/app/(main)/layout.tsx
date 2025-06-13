import { MainAppLayout } from '@/components/layout/MainAppLayout';
import type { ReactNode } from 'react';

export default function MainLayout({ children }: { children: ReactNode }) {
  return <MainAppLayout>{children}</MainAppLayout>;
}
