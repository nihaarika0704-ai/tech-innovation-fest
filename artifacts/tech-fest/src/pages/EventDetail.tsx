import { useParams } from "wouter";
import { Link } from "wouter";
import { useGetEvent, getGetEventQueryKey } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, MapPin, Users, UserRound, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function EventDetail() {
  const { id } = useParams();
  const eventId = parseInt(id || "0", 10);

  const { data: event, isLoading, error } = useGetEvent(eventId, {
    query: {
      enabled: !!eventId && !isNaN(eventId),
      queryKey: getGetEventQueryKey(eventId)
    }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="h-8 w-32 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-[400px] w-full rounded-xl" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold mb-4">Event not found</h2>
        <p className="text-muted-foreground mb-8">The event you're looking for doesn't exist or has been removed.</p>
        <Link href="/events">
          <Button>Back to Events</Button>
        </Link>
      </div>
    );
  }

  const isSoldOut = event.seatsAvailable <= 0;

  return (
    <div className="container mx-auto px-4 py-12">
      <Link href="/events" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Events
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="aspect-video w-full overflow-hidden rounded-2xl border bg-muted mb-8 relative group">
              {event.imageUrl ? (
                <img src={event.imageUrl} alt={event.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-secondary/50">
                  <Sparkles className="h-16 w-16 text-muted-foreground/30" />
                </div>
              )}
            </div>

            <Badge variant="secondary" className="mb-4 text-sm px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20">{event.category}</Badge>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">{event.name}</h1>
            
            <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground">
              {event.description.split('\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          {/* Action Card */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm sticky top-24">
            <h3 className="font-semibold text-lg mb-6 flex items-center">
              <ShieldCheck className="mr-2 h-5 w-5 text-primary" /> Event Details
            </h3>
            
            <div className="space-y-5 mb-8">
              <div className="flex items-start">
                <Calendar className="mr-3 h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Date & Time</p>
                  <p className="text-sm text-muted-foreground">{new Date(event.eventDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <MapPin className="mr-3 h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Venue</p>
                  <p className="text-sm text-muted-foreground">{event.venue}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <UserRound className="mr-3 h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Organizer</p>
                  <p className="text-sm text-muted-foreground">{event.organizer}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Users className="mr-3 h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Availability</p>
                  <p className="text-sm text-muted-foreground">
                    <span className={isSoldOut ? "text-destructive font-bold" : "text-emerald-500 font-bold"}>
                      {event.seatsAvailable}
                    </span> / {event.totalSeats} seats remaining
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t">
              <Link href={isSoldOut ? "#" : `/register?eventId=${event.id}`}>
                <Button 
                  size="lg" 
                  className="w-full h-12 text-base font-bold" 
                  disabled={isSoldOut}
                  data-testid="btn-register-cta"
                >
                  {isSoldOut ? "Sold Out" : "Register Now"}
                  {!isSoldOut && <ArrowRight className="ml-2 h-5 w-5" />}
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
