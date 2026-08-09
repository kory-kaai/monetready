"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";

export interface SidebarNavItem {
  id: string;
  label: string;
  href?: string;
}

interface AppSidebarProps {
  productName: string;
  title: string;
  items: SidebarNavItem[];
  activeId: string;
  onSelect: (id: string) => void;
  footer?: ReactNode;
}

export function AppSidebar({
  productName,
  title,
  items,
  activeId,
  onSelect,
  footer,
}: AppSidebarProps) {
  return (
    <aside className="app-sidebar" aria-label={`${title} navigation`}>
      <div className="app-sidebar-header">
        <Link href="/" className="logo app-sidebar-brand">
          <BrandLogo size={40} />
          {productName}
        </Link>
        <p className="app-sidebar-title">{title}</p>
      </div>

      <nav className="app-sidebar-nav">
        {items.map((item) =>
          item.href ? (
            <Link
              key={item.id}
              href={item.href}
              className={`app-sidebar-link${activeId === item.id ? " active" : ""}`}
            >
              {item.label}
            </Link>
          ) : (
            <button
              key={item.id}
              type="button"
              className={`app-sidebar-link${activeId === item.id ? " active" : ""}`}
              onClick={() => onSelect(item.id)}
              aria-current={activeId === item.id ? "page" : undefined}
            >
              {item.label}
            </button>
          ),
        )}
      </nav>

      {footer ? <div className="app-sidebar-footer">{footer}</div> : null}
    </aside>
  );
}
