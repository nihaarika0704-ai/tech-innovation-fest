import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Code, Cpu, Gamepad2, Globe, Sparkles, Terminal } from "lucide-react";
import { useListEvents, getListEventsQueryKey } from "@workspace/api-client-react";
import { motion } from "framer-motion";

export function Home() {
  const { data: events, isLoading } = useListEvents();
  const featuredEvents = events?.slice(0, 3) || [];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background py-24 md:py-32">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b')] bg-cover bg-center opacity-5 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background"></div>
        
        <div className="container relative z-10 mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium mb-8 bg-background/50 backdrop-blur-sm">
              <Sparkles className="mr-2 h-4 w-4 text-primary" />
              <span className="text-primary font-semibold">June 15-17, 2026</span>
              <span className="mx-2 text-muted-foreground">|</span>
              <span className="text-muted-foreground">University Campus</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 dark:from-white dark:to-gray-500">
              TECH INNOVATION <span className="text-primary">FEST</span>
            </h1>
            
            <p className="mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground mb-10">
              Three days of building, breaking, and creating. Join the most electric tech event of the year. Hackathons, AI, Robotics, and more.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="h-12 px-8 text-base font-bold w-full sm:w-auto">
                  Grab Your Pass
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/events">
                <Button variant="outline" size="lg" className="h-12 px-8 text-base font-bold w-full sm:w-auto">
                  View Schedule
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Featured Events</h2>
              <p className="text-muted-foreground mt-2">Glimpse into what's happening.</p>
            </div>
            <Link href="/events" className="hidden md:flex items-center text-primary font-medium hover:underline">
              See all events <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[300px] rounded-xl bg-muted animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md hover:border-primary/50"
                >
                  <div className="aspect-video w-full overflow-hidden bg-muted">
                    {event.imageUrl ? (
                      <img src={event.imageUrl} alt={event.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-secondary">
                        <Terminal className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
                        {event.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">{event.name}</h3>
                    <div className="flex items-center text-sm text-muted-foreground mb-4">
                      <Calendar className="mr-2 h-4 w-4" />
                      {new Date(event.eventDate).toLocaleDateString()}
                    </div>
                    <Link href={`/events/${event.id}`}>
                      <Button variant="secondary" className="w-full">Details</Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          
          <div className="mt-8 text-center md:hidden">
            <Link href="/events">
              <Button variant="outline" className="w-full">View All Events</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Tracks Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-12">Tracks & Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <div className="flex flex-col items-center p-6 rounded-2xl bg-secondary/50 border hover:border-primary/50 transition-colors">
              <Code className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-semibold">Coding</h3>
            </div>
            <div className="flex flex-col items-center p-6 rounded-2xl bg-secondary/50 border hover:border-primary/50 transition-colors">
              <Cpu className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-semibold">AI & ML</h3>
            </div>
            <div className="flex flex-col items-center p-6 rounded-2xl bg-secondary/50 border hover:border-primary/50 transition-colors">
              <Gamepad2 className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-semibold">Gaming</h3>
            </div>
            <div className="flex flex-col items-center p-6 rounded-2xl bg-secondary/50 border hover:border-primary/50 transition-colors">
              <Globe className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-semibold">Web Dev</h3>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
