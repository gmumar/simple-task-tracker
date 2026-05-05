import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const font = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta'
});

export const metadata = {
  title: "Work Tracker",
  description: "A beautiful, modern work tracker",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${font.className} antialiased`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
