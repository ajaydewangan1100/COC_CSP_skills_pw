import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { FormContextProvider } from "@/context/FormContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AlreadySubmittedModal from "@/components/AlreadySubmittedModal";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "PW Skills Policy Portal",
  description:
    "PW Skills Offline Centre - Policy Guidelines & Digital Signature Portal for Students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased min-h-screen flex flex-col font-sans bg-bg text-text">
        <FormContextProvider>
          <Header isMaintenanceMode={process.env.MAINTENANCE_MODE === "true"} />

          <main className="flex-1 max-w-[800px] w-full mx-auto p-[28px_20px_48px] relative z-[1]">
            {process.env.MAINTENANCE_MODE === "true" ? (
              <div className="bg-white p-8 rounded-xl shadow-sm border border-border text-center my-10">
                <script
                  dangerouslySetInnerHTML={{
                    __html: `if(window.location.pathname !== '/') window.history.replaceState(null, '', '/');`,
                  }}
                />
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-[#EB5A46]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <h1 className="text-2xl font-bold text-text mb-3">
                  Site Under Maintenance
                </h1>
                <p className="text-text-secondary leading-relaxed max-w-md mx-auto">
                  We are currently performing scheduled maintenance to improve
                  our systems. Please check back in a short while. We apologize
                  for any inconvenience.
                </p>
              </div>
            ) : (
              children
            )}
          </main>

          <Footer />
          <AlreadySubmittedModal />
        </FormContextProvider>
      </body>
    </html>
  );
}
