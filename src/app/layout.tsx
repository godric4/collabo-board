import type { Metadata } from "next"
import type { ReactNode } from "react"
import { AlertProvider } from "@/components/ui/alert-provider"
import BoardStoreHydration from "@/components/providers/board-store-hydration"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Collabo Board",
  description: "A little space for big ideas.",
}

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html
      lang='en'
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className='flex min-h-full flex-col'>
        <AlertProvider>
          <BoardStoreHydration />
          {children}
        </AlertProvider>
      </body>
    </html>
  )
}

export default RootLayout
