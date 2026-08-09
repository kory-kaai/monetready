"use client";

import type { ReactNode } from "react";
import { AppSidebar, type SidebarNavItem } from "@/components/layout/AppSidebar";

interface AppShellProps {
  productName: string;
  title: string;
  items: SidebarNavItem[];
  activeId: string;
  onSelect: (id: string) => void;
  sidebarFooter?: ReactNode;
  children: ReactNode;
}

export function AppShell({
  productName,
  title,
  items,
  activeId,
  onSelect,
  sidebarFooter,
  children,
}: AppShellProps) {
  return (
    <div className="app-shell">
      <AppSidebar
        productName={productName}
        title={title}
        items={items}
        activeId={activeId}
        onSelect={onSelect}
        footer={sidebarFooter}
      />
      <div className="app-main">
        <div className="app-main-inner">{children}</div>
      </div>
    </div>
  );
}
