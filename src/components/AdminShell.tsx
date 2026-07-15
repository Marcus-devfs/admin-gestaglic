"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Bell,
  LogOut,
  FileText,
  MessageSquare,
  Inbox,
  Globe,
} from "lucide-react";
import { APP_ICON, APP_NAME } from "@/lib/brand";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/lp", label: "Landing", icon: Globe },
  { href: "/usuarios", label: "Usuários", icon: Users },
  { href: "/conteudo", label: "Conteúdo", icon: FileText },
  { href: "/comunidade", label: "Comunidade", icon: MessageSquare },
  { href: "/feedback", label: "Feedback", icon: Inbox, badgeKey: "feedback" as const },
  { href: "/assinaturas", label: "Financeiro", icon: CreditCard },
  { href: "/notificacoes", label: "Notificações", icon: Bell },
];

function NavBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="ml-auto inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { admin, logout, loading } = useAuth();
  const isLogin = pathname === "/login";
  const [openFeedbacks, setOpenFeedbacks] = useState(0);

  const loadBadges = useCallback(() => {
    if (!admin) return;
    api
      .get<{ open: number }>("/admin/feedback/counts")
      .then(({ data }) => setOpenFeedbacks(data.open ?? 0))
      .catch(() => {});
  }, [admin]);

  useEffect(() => {
    if (isLogin || !admin) return;
    loadBadges();
    const id = window.setInterval(loadBadges, 60_000);
    const onFeedbackChanged = () => loadBadges();
    window.addEventListener("admin-feedback-changed", onFeedbackChanged);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("admin-feedback-changed", onFeedbackChanged);
    };
  }, [admin, isLogin, loadBadges, pathname]);

  if (loading || (!admin && !isLogin)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  if (isLogin) return <>{children}</>;

  const badgeFor = (badgeKey?: "feedback") => {
    if (badgeKey === "feedback") return openFeedbacks;
    return 0;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-gray-200 bg-white md:flex">
        <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-5">
          <Image src={APP_ICON} alt={APP_NAME} width={36} height={36} className="rounded-lg" />
          <div>
            <p className="font-bold text-gray-900 text-sm">{APP_NAME}</p>
            <p className="text-[10px] text-gray-400">admin.gestaglic.com.br</p>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ href, label, icon: Icon, badgeKey }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                pathname === href || (href !== "/" && pathname.startsWith(href + "/"))
                  ? "bg-brand-50 text-brand-700"
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
              <NavBadge count={badgeFor(badgeKey)} />
            </Link>
          ))}
        </nav>
        <div className="border-t border-gray-100 p-4">
          <p className="text-xs text-gray-500 truncate">{admin?.email}</p>
          <button
            onClick={logout}
            className="mt-2 flex items-center gap-2 text-xs text-gray-400 hover:text-red-500"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sair
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between border-b bg-white px-4 py-3">
          <span className="font-bold text-sm">{APP_NAME}</span>
          <button onClick={logout} className="text-xs text-gray-500">Sair</button>
        </header>
        <nav className="md:hidden flex gap-1 overflow-x-auto border-b bg-white px-2 py-2">
          {NAV.map(({ href, label, badgeKey }) => {
            const count = badgeFor(badgeKey);
            const active =
              pathname === href || (href !== "/" && pathname.startsWith(href + "/"));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium",
                  active ? "bg-brand-600 text-white" : "text-gray-600"
                )}
              >
                {label}
                {count > 0 && (
                  <span
                    className={cn(
                      "absolute -right-1 -top-1 inline-flex min-w-[1rem] items-center justify-center rounded-full px-1 py-0.5 text-[9px] font-bold leading-none",
                      active ? "bg-amber-300 text-amber-900" : "bg-amber-500 text-white"
                    )}
                  >
                    {count > 99 ? "99+" : count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
