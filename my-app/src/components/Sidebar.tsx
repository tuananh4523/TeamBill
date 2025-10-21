"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Home,
  Wallet,
  FileText,
  ChevronDown,
  ChevronUp,
  Plus,
  Users,
  Tags,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ROUTER_PATH } from "@/app/routerPath";
import { useState } from "react";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Button } from "antd";

export default function Sidebar({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}) {
  const pathname = usePathname();
  const [openGhiChep, setOpenGhiChep] = useState(false);

  return (
     <aside
      className={clsx(
        "min-h-screen flex flex-col transition-all duration-300",
        collapsed ? "w-[78px]" : "w-[280px]"
      )}
    >
     
      {/* ===== Header Logo ===== */}
      <div className="h-[70px] flex items-center justify-center border-b">
        <Button type="text" className="flex items-center justify-center p-0">
          <Link
            href={ROUTER_PATH.DASHBOARD}
            className={clsx(
              "flex items-center gap-3 hover:opacity-90 transition-all",
              collapsed && "flex-col gap-1"
            )}
          >
            <Image
              src="/Logo.png"
              alt="Team Bill Logo"
              width={46} // 🔹 Tăng size logo
              height={46}
              className="rounded-md"
            />
            {!collapsed && (
              <span className="text-2xl font-bold text-blue-700 leading-none">
                Team Bill
              </span>
            )}
          </Link>
        </Button>
      </div>

      {/* ===== Nút chính (Thêm ghi chép) ===== */}
      <div className="mt-4 flex justify-center">
        <button
          className={clsx(
            "flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition-all",
            collapsed ? "w-10 h-10" : "w-[200px] h-10 gap-2 px-3"
          )}
        >
          <Plus className="w-4 h-4" />
          {!collapsed && <span>Thêm ghi chép</span>}
          {!collapsed && <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* ===== Menu chính ===== */}
      <nav
        className={clsx(
          "flex-1 mt-4 overflow-y-auto text-sm text-gray-700 transition-all",
          collapsed ? "space-y-2" : "px-2 space-y-1"
        )}
      >
        <MenuItem
          icon={Home}
          label="Trang chủ"
          href={ROUTER_PATH.DASHBOARD}
          active={pathname === ROUTER_PATH.DASHBOARD}
          collapsed={collapsed}
        />

        <MenuItem
          icon={Wallet}
          label="Tài khoản"
          href={ROUTER_PATH.WALLET.WALLET}
          active={pathname === ROUTER_PATH.WALLET.WALLET}
          collapsed={collapsed}
        />

        {/* Ghi chép (có submenu) */}
        <div>
          <button
            onClick={() => setOpenGhiChep(!openGhiChep)}
            className={clsx(
              "w-full flex items-center justify-between rounded-md transition-all",
              collapsed ? "justify-center py-2" : "px-3 py-2 hover:bg-blue-50",
              openGhiChep && !collapsed
                ? "text-blue-600 font-medium bg-blue-50"
                : "text-gray-700 hover:text-gray-900"
            )}
          >
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {!collapsed && "Ghi chép"}
            </span>
            {!collapsed &&
              (openGhiChep ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              ))}
          </button>

          {!collapsed && openGhiChep && (
            <div className="ml-8 mt-1 space-y-1">
              <SubItem
                label="Lịch sử"
                href={ROUTER_PATH.RECORDS}
                active={pathname === ROUTER_PATH.RECORDS}
              />
              <SubItem
                label="Báo cáo"
                href={ROUTER_PATH.REPORTS}
                active={pathname === ROUTER_PATH.REPORTS}
              />
            </div>
          )}
        </div>

        <MenuItem
          icon={Users}
          label="Nhóm"
          href={ROUTER_PATH.TEAMS}
          active={pathname === ROUTER_PATH.TEAMS}
          collapsed={collapsed}
        />

        <MenuItem
          icon={Tags}
          label="Danh mục chi tiêu"
          href={ROUTER_PATH.CATEGORIES}
          active={pathname === ROUTER_PATH.CATEGORIES}
          collapsed={collapsed}
        />

        <MenuItem
          icon={BarChart3}
          label="Báo cáo chi tiêu"
          href={ROUTER_PATH.SUMMARY}
          active={pathname === ROUTER_PATH.SUMMARY}
          collapsed={collapsed}
        />
      </nav>

      {/* ===== Footer: Nút thu gọn ===== */}
      <div
        className="border-t py-3 text-gray-600 hover:text-gray-900 flex items-center justify-center cursor-pointer transition-all"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <div className="flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm">Thu gọn</span>
          </div>
        )}
      </div>
    </aside>
  );
}

/* ========= Component MenuItem ========= */
function MenuItem({
  icon: Icon,
  label,
  href,
  active,
  collapsed,
}: {
  icon: React.ElementType;
  label: string;
  href: string;
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "flex items-center rounded-md transition-all duration-200",
        active
          ? "bg-blue-50 text-blue-600 font-medium"
          : "hover:bg-gray-50 text-gray-700 hover:text-gray-900",
        collapsed ? "justify-center py-2" : "gap-2 px-3 py-2"
      )}
    >
      <Icon className="w-4 h-4" />
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}

/* ========= Component SubItem ========= */
function SubItem({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "block px-3 py-1 rounded-md text-sm transition",
        active
          ? "text-blue-600 font-medium bg-blue-50"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
      )}
    >
      {label}
    </Link>
  );
}
