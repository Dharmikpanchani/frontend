import type { Metadata } from "next";
import "./globals.css";
import ThemeProviderWrapper from "@/components/ThemeProviderWrapper";
import { ReduxProvider } from "@/redux/Providers";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "School Management",
  description: "User portal for School Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="portal-school">
        <ReduxProvider>
          <ThemeProviderWrapper>
            <Toaster
              reverseOrder={false}
              toastOptions={{
                duration: 3000,
                style: {
                  maxWidth: "unset",
                },
              }}
            />
            {children}
          </ThemeProviderWrapper>
        </ReduxProvider>
      </body>
    </html>
  );
}
