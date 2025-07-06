import { Inter, Fira_Code } from "next/font/google";
import "./globals.css";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
});

export const metadata = {
  title: "Ailumni - AI-Powered Quiz Generator",
  description: "Create quizzes from your documents or existing quizzes to focus on your mistakes and learn faster.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${firaCode.variable} antialiased`}
      >
        {children}
        <ToastContainer position="bottom-right" theme="colored"/>
      </body>
    </html>
  );
}
