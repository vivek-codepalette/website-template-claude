"use client";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./theme-provider";
import ConvexClientProvider from "./ConvexClientProvider";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <ConvexClientProvider>
        <TooltipProvider>{children}</TooltipProvider>
      </ConvexClientProvider>
      <Toaster position="top-center" richColors />
    </ThemeProvider>
  );
}
