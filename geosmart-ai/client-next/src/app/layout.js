import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

export const metadata = {
  title: "GeoSmart AI | Government Crisis Management",
  description: "Next-generation AI-driven humanitarian network and crisis response platform.",
};

import FloatingWhatsAppWidget from "@/components/FloatingWhatsAppWidget";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <AuthProvider>
          {children}
          <FloatingWhatsAppWidget />
        </AuthProvider>
      </body>
    </html>
  );
}
