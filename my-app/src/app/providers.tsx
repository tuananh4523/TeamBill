// "use client";

// import { SettingsProvider, useSettings } from "@/context/Settings";
// import { ConfigProvider, theme as antdTheme } from "antd";

// function ThemeWrapper({ children }: { children: React.ReactNode }) {
//   const { settings } = useSettings();

//   return (
//     <ConfigProvider
//       theme={{
//         algorithm:
//           settings.theme === "dark"
//             ? antdTheme.darkAlgorithm
//             : antdTheme.defaultAlgorithm,
//       }}
//     >
//       {children}
//     </ConfigProvider>
//   );
// }

// export default function Providers({ children }: { children: React.ReactNode }) {
//   return (
//     <SettingsProvider>
//       <ThemeWrapper>{children}</ThemeWrapper>
//     </SettingsProvider>
//   );
// }
"use client";

import { ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider, App as AntApp } from "antd";
import viVN from "antd/es/locale/vi_VN";

export default function Providers({ children }: { children: ReactNode }) {
  // khởi tạo 1 instance duy nhất cho toàn bộ app
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {/* Bọc toàn bộ app bằng Ant Design App để hỗ trợ message, notification */}
      <ConfigProvider locale={viVN}>
        <AntApp>{children}</AntApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
}
