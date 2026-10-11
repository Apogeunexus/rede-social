import type { ReactNode } from 'react';

/** The tenant-side panels take the app's own column width (AppShell's 680 px) in a 48rem container. */
export function TenantColumn({ children }: { children: ReactNode }) {
  return <div className="mx-auto flex w-full flex-col gap-6 @3xl:max-w-[680px]">{children}</div>;
}
