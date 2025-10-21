"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { Breadcrumb } from "antd";
import { HomeOutlined } from "@ant-design/icons";

type Category = { id: string; name: string; color: string };

export default function AppBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const [groupName, setGroupName] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState<string | null>(null);

  // 🔹 Mapping tiêu đề từng phần đường dẫn
  const mapTitle = (segment: string, idx: number) => {
    switch (segment) {
      case "dashboard":
        return "Bảng điều khiển";
      case "wallet":
        return "Ví tiền";
      case "transactions":
        return "Lịch sử giao dịch";
      case "deposit":
        return "Nạp tiền";
      case "withdraw":
        return "Rút tiền";
      case "expenses":
        return "Chi tiêu";
      case "payments":
        return "Thanh toán";
      case "teams":
        return "Nhóm";
      case "friends":
        return "Bạn bè";
      case "categories":
        return "Danh mục chi tiêu";
      case "summary":
        return "Báo cáo chi tiêu";
      case "reports":
        return "Báo cáo tổng hợp";
      case "records":
        return "Lịch sử ghi chép";
      case "split":
        return "Chia hóa đơn";
      case "event":
        return "Sự kiện";
      case "settings":
        return "Cài đặt";
      case "profile":
        return "Hồ sơ cá nhân";
      default:
        if (segments[0] === "split" && idx === 1) return groupName || "Nhóm";
        if (segments[0] === "split" && segments[2] === "event" && idx === 3)
          return categoryName || "Danh mục";
        return segment;
    }
  };

  // 🔹 Gọi API lấy tên nhóm / danh mục động
  useEffect(() => {
    const fetchGroupName = async () => {
      if (segments[0] === "split" && segments[1]) {
        try {
          const res = await axios.get(
            `http://localhost:8080/api/teams/${segments[1]}`
          );
          setGroupName(res.data.name);
        } catch {
          setGroupName(null);
        }
      }
    };

    const fetchCategoryName = async () => {
      if (segments[0] === "split" && segments[2] === "event" && segments[3]) {
        try {
          const res = await axios.get(
            `http://localhost:8080/api/events/${segments[3]}`
          );
          const categoryId = res.data.categoryId;
          const catRes = await axios.get<Category>(
            `http://localhost:8080/api/categories/${categoryId}`
          );
          setCategoryName(catRes.data.name);
        } catch {
          setCategoryName(null);
        }
      }
    };

    fetchGroupName();
    fetchCategoryName();
  }, [segments]);

  // 🔹 Dữ liệu breadcrumb
  const breadcrumbItems = [
    {
      title: (
        <Link
          href="/"
          className="flex items-center gap-2 px-2 py-1 text-gray-700 hover:text-blue-600 transition-all"
        >
          <HomeOutlined className="text-[16px] text-gray-600 px-2" />
          <span className="font-medium text-gray-700">Trang chủ</span>
        </Link>
      ),
    },
    ...segments.map((segment, idx) => {
      const href = "/" + segments.slice(0, idx + 1).join("/");
      const isLast = idx === segments.length - 1;
      const title = mapTitle(segment, idx);

      return {
        title: isLast ? (
          <span className="font-semibold text-gray-900">{title}</span>
        ) : (
          <Link
            href={href}
            className="text-gray-700 hover:text-blue-600 transition-all"
          >
            {title}
          </Link>
        ),
      };
    }),
  ];

  return (
    <div className="bg-transparent">
      <Breadcrumb
        className="text-[14px] font-medium leading-tight"
        items={breadcrumbItems}
        separator={<span className="text-gray-400 px-1">/</span>}
      />
    </div>
  );
}
