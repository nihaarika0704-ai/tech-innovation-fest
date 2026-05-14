import { useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { useListEvents, useCreateRegistration } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Terminal, CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const registrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  rollNumber: z.string().min(4, "Roll number is required"),
  department: z.string().min(2, "Department is required"),
  eventId: z.string().min(1, "Please select an event"),
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

export function Register() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const initialEventId = searchParams.get("eventId");
  
  const { toast } = useToast();
  
  const { data: events, isLoading: eventsLoading } = useListEvents();
  const createRegistration = useCreateRegistration();

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: "",
      email: "",
      rollNumber: "",
      department: "",
      eventId: initialEventId || "",
    },
  });

  // Set the initial event ID once events load if passed in URL
  useEffect(() => {
    if (initialEventId && events?.find(e => e.id.toString() === initialEventId)) {
      form.setValue("eventId", initialEventId);
    }
  }, [initialEventId, events, form]);

  const availableEvents = events?.filter(e => e.seatsAvailable > 0) || [];

  const onSubmit = async (data: RegistrationFormValues) => {
    try {
      await createRegistration.mutateAsync({
        data: {
          name: data.name,
          email: data.email,
          rollNumber: data.rollNumber,
          department: data.department,
          eventId: parseInt(data.eventId, 10)
        }
      });
      
      toast({
        title: "Registration Successful!",
        description: "You have been successfully registered for the event.",
      });
      
      // Redirect to home after 2 seconds
      setTimeout(() => {
        setLocation("/");
      }, 2000);
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: "There was an error registering for the event. Please try again.",
      });
    }
  };

  if (createRegistration.isSuccess) {
    return (
      <div className="container mx-auto px-4 py-24 flex items-center justify-center min-h-[70vh]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 max-w-md w-full bg-card p-10 rounded-2xl border shadow-lg"
        >
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">You're In!</h2>
          <p className="text-muted-foreground text-lg">
            Your registration is confirmed. We've sent the details to your email. Get ready to build.
          </p>
          <Button 
            className="w-full mt-8" 
            onClick={() => setLocation("/")}
            data-testid="btn-return-home"
          >
            Return Home
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 lg:py-24">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <Terminal className="mx-auto h-12 w-12 text-primary mb-4" />
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">Secure Your Spot</h1>
          <p className="text-muted-foreground">
            Register for your favorite events before seats run out.
          </p>
        </div>

        <Card className="border-2 shadow-xl shadow-primary/5">
          <CardHeader className="pb-8 border-b bg-muted/20">
            <CardTitle className="text-xl">Registration Form</CardTitle>
            <CardDescription>Fill out all the details to register.</CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="eventId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Event</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={eventsLoading || createRegistration.isPending}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-event">
                            <SelectValue placeholder={eventsLoading ? "Loading events..." : "Choose an event"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableEvents.length === 0 && !eventsLoading ? (
                            <SelectItem value="none" disabled>No events available</SelectItem>
                          ) : (
                            availableEvents.map(event => (
                              <SelectItem key={event.id} value={event.id.toString()}>
                                {event.name} ({event.seatsAvailable} seats left)
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} data-testid="input-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>College Email</FormLabel>
                        <FormControl>
                          <Input placeholder="john@college.edu" type="email" {...field} data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rollNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Roll Number</FormLabel>
                        <FormControl>
                          <Input placeholder="CS24001" {...field} data-testid="input-roll" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <FormControl>
                          <Input placeholder="Computer Science" {...field} data-testid="input-dept" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-bold mt-8" 
                  disabled={createRegistration.isPending || eventsLoading || availableEvents.length === 0}
                  data-testid="btn-submit-registration"
                >
                  {createRegistration.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Registering...
                    </>
                  ) : "Complete Registration"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
