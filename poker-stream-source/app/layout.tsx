import type { Metadata } from "next";
import "./globals.css";
export const metadata:Metadata={title:"Poker Stream · Operator Console",description:"Live poker hand capture and table operations console.",icons:{icon:"/favicon.svg",shortcut:"/favicon.svg"}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="ja"><body>{children}</body></html>;}
