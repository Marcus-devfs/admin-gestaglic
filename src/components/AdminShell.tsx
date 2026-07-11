"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Bell,
  LogOut,
} from "lucide-react";
import { APP_ICON, APP_NAME } from "@/lib/brand";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/usuarios", label: "Usuários", icon: Users },
  { href: "/assinaturas", label: "Assinaturas", icon: CreditCard },
  { href: "/notificacoes", label: "Notificações", icon: Bell },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { admin, logout, loading } = useAuth();
  const isLogin = pathname === "/login";

  if (loading || (!admin && !isLogin)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  if (isLogin) return <>{children}</>;

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
          {NAV.map(({ href, label, icon: Icon }) => (
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
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium",
                pathname === href || (href !== "/" && pathname.startsWith(href + "/")) ? "bg-brand-600 text-white" : "text-gray-600"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
