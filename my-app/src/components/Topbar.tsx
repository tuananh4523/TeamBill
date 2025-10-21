"use client";

import { Bell, LogIn, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { Avatar, Button, Dropdown, MenuProps, Tooltip } from "antd";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/Settings";
import AuthModal from "@/components/Modals/AuthModal";
import Breadcrumb from "@/components/Breadcrumb";

export default function Topbar() {
  const { user, login, logout } = useAuth();
  const { settings, updateSettings } = useSettings();
  const [showAuth, setShowAuth] = useState(false);

  const items: MenuProps["items"] = [
    {
      key: "profile",
      label: <Link href="/profile">Hồ sơ cá nhân</Link>,
    },
    {
      key: "logout",
      label: (
        <span className="text-red-500" onClick={logout}>
          Đăng xuất
        </span>
      ),
    },
  ];

  return (
    <>
      <div className="flex items-center justify-between w-full h-[60px] bg-white/90 backdrop-blur-sm border-b border-gray-200 px-5 shadow-sm">
        {/* Logo + breadcrumb */}
        <div className="flex items-center gap-3">
         
          <Breadcrumb />
        </div>

        {/* Controls bên phải */}
        <div className="flex items-center gap-3">
          {/* Nút đổi theme */}
          <Tooltip
            title={
              settings.theme === "dark" ? "Chuyển sang sáng" : "Chuyển sang tối"
            }
          >
            <Button
              type="text"
              shape="circle"
              icon={
                settings.theme === "dark" ? (
                  <Sun size={18} />
                ) : (
                  <Moon size={18} />
                )
              }
              onClick={() =>
                updateSettings({
                  theme: settings.theme === "dark" ? "light" : "dark",
                })
              }
            />
          </Tooltip>

          {/* Chuông thông báo */}
          <Tooltip title="Thông báo">
            <Button
              type="text"
              shape="circle"
              icon={<Bell size={18} className="text-gray-600" />}
            />
          </Tooltip>

          {/* Tài khoản */}
          {!user ? (
            <Button
              type="primary"
              icon={<LogIn size={16} />}
              onClick={() => setShowAuth(true)}
              className="rounded-full"
            >
              Đăng nhập
            </Button>
          ) : (
            <Dropdown menu={{ items }} placement="bottomRight">
              <Avatar
                size={38}
                style={{
                  backgroundColor: "#007AFF",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                {user.username?.charAt(0).toUpperCase()}
              </Avatar>
            </Dropdown>
          )}
        </div>
      </div>

      {/* Modal đăng nhập */}
      {showAuth && (
        <AuthModal
          isOpen={showAuth}
          onClose={() => setShowAuth(false)}
          onLoginSuccess={login}
        />
      )}
    </>
  );
}
