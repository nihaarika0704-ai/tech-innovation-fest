import { useState } from "react";
import { Link } from "wouter";
import { useListEvents } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Search, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORIES = [
  "All",
  "Coding Contest",
  "Hackathon",
  "AI Workshop",
  "Robotics",
  "Gaming Tournament",
  "Web Development Challenge"
];

export function Events() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: events, isLoading } = useListEvents(
    selectedCategory === "All" ? undefined : { category: selectedCategory }
  );

  const filteredEvents = events?.filter(e => 
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Discover Events</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore all the exciting competitions, workshops, and challenges happening at Tech Innovation Fest.
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="w-full justify-start md:justify-center">
              {CATEGORIES.map(cat => (
                <TabsTrigger key={cat} value={cat} data-testid={`tab-${cat}`}>
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search events..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-events"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="flex flex-col rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden h-[400px]">
              <Skeleton className="h-48 w-full rounded-none" />
              <div className="p-6 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <div className="pt-4 flex gap-4">
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredEvents && filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group flex flex-col rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md hover:border-primary/50 transition-all overflow-hidden"
              data-testid={`card-event-${event.id}`}
            >
              <div className="aspect-video w-full overflow-hidden bg-muted relative">
                {event.imageUrl ? (
                  <img src={event.imageUrl} alt={event.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-secondary">
                    <Sparkles className="h-12 w-12 text-muted-foreground/30" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <Badge variant="secondary" className="bg-background/80 backdrop-blur font-semibold">
                    {event.category}
                  </Badge>
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                  {event.name}
                </h3>
                
                <div className="space-y-2 mb-6 flex-1 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-primary" />
                    <span>{new Date(event.eventDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-primary" />
                    <span className="truncate">{event.venue}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4 text-primary" />
                    <span>{event.seatsAvailable} / {event.totalSeats} seats left</span>
                  </div>
                </div>
                
                <div className="mt-auto">
                  <Link href={`/events/${event.id}`}>
                    <Button className="w-full" data-testid={`btn-event-details-${event.id}`}>
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed">
          <Sparkles className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No events found</h3>
          <p className="text-muted-foreground">Try adjusting your category filter or search query.</p>
          <Button variant="outline" className="mt-6" onClick={() => { setSelectedCategory("All"); setSearchQuery(""); }}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
