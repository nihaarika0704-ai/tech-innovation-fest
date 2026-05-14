import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  useGetAdminMe, 
  useAdminLogout,
  useGetDashboardStats,
  useListRegistrations,
  useDeleteRegistration,
  useListEvents,
  useCreateEvent,
  useDeleteEvent
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  LogOut, 
  Trash2, 
  Users, 
  CalendarDays, 
  Search,
  Plus
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  
  // Auth check
  const { data: adminMe, isLoading: isCheckingAuth, error: authError } = useGetAdminMe({
    query: { retry: false }
  });

  const logoutMutation = useAdminLogout();

  // Queries
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats({
    query: { enabled: !!adminMe?.isAdmin }
  });
  
  const { data: registrations, isLoading: registrationsLoading } = useListRegistrations(
    searchQuery ? { search: searchQuery } : undefined,
    { query: { enabled: !!adminMe?.isAdmin } }
  );

  const { data: events, isLoading: eventsLoading } = useListEvents(undefined, {
    query: { enabled: !!adminMe?.isAdmin }
  });

  // Mutations
  const deleteRegistration = useDeleteRegistration();
  const deleteEvent = useDeleteEvent();

  useEffect(() => {
    if (!isCheckingAuth && (authError || !adminMe?.isAdmin)) {
      setLocation("/admin/login");
    }
  }, [adminMe, isCheckingAuth, authError, setLocation]);

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    queryClient.clear();
    setLocation("/admin/login");
  };

  const handleDeleteRegistration = async (id: number) => {
    if (!confirm("Are you sure you want to delete this registration?")) return;
    try {
      await deleteRegistration.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: ["/api/registrations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events/stats/dashboard"] });
      toast({ title: "Registration deleted" });
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to delete" });
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (!confirm("Are you sure you want to delete this event? This will also delete all associated registrations.")) return;
    try {
      await deleteEvent.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events/stats/dashboard"] });
      toast({ title: "Event deleted" });
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to delete" });
    }
  };

  if (isCheckingAuth || !adminMe?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage TechFest registrations and events.</p>
        </div>
        <Button variant="outline" onClick={handleLogout} disabled={logoutMutation.isPending}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats?.totalRegistrations || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats?.totalEvents || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="registrations" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="registrations">Registrations</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="registrations" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email or roll no..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Roll Number</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrationsLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : registrations?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No registrations found
                    </TableCell>
                  </TableRow>
                ) : (
                  registrations?.map((reg) => (
                    <TableRow key={reg.id}>
                      <TableCell>
                        <div className="font-medium">{reg.name}</div>
                        <div className="text-xs text-muted-foreground">{reg.email}</div>
                      </TableCell>
                      <TableCell>{reg.rollNumber}</TableCell>
                      <TableCell>{reg.department}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{reg.eventName}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteRegistration(reg.id)}
                          disabled={deleteRegistration.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Seats</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eventsLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : events?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No events found
                    </TableCell>
                  </TableRow>
                ) : (
                  events?.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.name}</TableCell>
                      <TableCell><Badge variant="secondary">{event.category}</Badge></TableCell>
                      <TableCell>{new Date(event.eventDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span className={event.seatsAvailable <= 0 ? "text-destructive font-medium" : ""}>
                          {event.seatsAvailable}
                        </span> / {event.totalSeats}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteEvent(event.id)}
                          disabled={deleteEvent.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registrations by Event</CardTitle>
              <CardDescription>Visual breakdown of popularity</CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : stats?.registrationsByEvent && stats.registrationsByEvent.length > 0 ? (
                <div className="h-[400px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.registrationsByEvent}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="eventName" 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      />
                      <Tooltip
                        cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar 
                        dataKey="count" 
                        fill="hsl(var(--primary))" 
                        radius={[4, 4, 0, 0]}
                        barSize={40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No data available yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
