import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Moon, Sun, Terminal } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { setTheme, theme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl hover:text-primary transition-colors">
            <Terminal className="h-6 w-6 text-primary" />
            <span>TechFest</span>
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link href="/" className={`text-sm font-medium transition-colors hover:text-primary ${location === "/" ? "text-primary" : "text-muted-foreground"}`}>
              Home
            </Link>
            <Link href="/events" className={`text-sm font-medium transition-colors hover:text-primary ${location.startsWith("/events") ? "text-primary" : "text-muted-foreground"}`}>
              Events
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">Register Now</Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t bg-muted/40">
        <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold">
            <Terminal className="h-5 w-5 text-primary" />
            <span>Tech Innovation Fest</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 Tech Innovation Fest. Built by students, for students.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/admin/login" className="hover:text-primary transition-colors">Admin Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
