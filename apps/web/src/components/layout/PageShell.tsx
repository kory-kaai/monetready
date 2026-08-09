import type { ReactNode } from "react";
import { FloatingOrbs } from "@/components/ui/FloatingOrbs";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteNav } from "@/components/layout/SiteNav";
import type { MonetreadySpec } from "@monetready/core";

interface PageShellProps {
  spec: MonetreadySpec;
  children: ReactNode;
}

export function PageShell({ spec, children }: PageShellProps) {
  return (
    <>
      <div className="bg-mesh" aria-hidden />
      <FloatingOrbs />
      <SiteNav spec={spec} />
      <div className="container">
        <main id="main-content">{children}</main>
      </div>
      <SiteFooter spec={spec} />
    </>
  );
}
