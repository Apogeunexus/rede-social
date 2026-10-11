import type { ReactNode } from 'react';

/** The tenant-side panels sit in the app's own column width (AppShell: 680 px from md). */
export function TenantColumn({ children }: { children: ReactNode }) {
  return <div className="mx-auto flex w-full flex-col gap-6 md:max-w-[680px]">{children}</div>;
}
