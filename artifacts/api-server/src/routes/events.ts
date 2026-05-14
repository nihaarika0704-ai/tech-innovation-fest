import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, eventsTable } from "@workspace/db";
import {
  ListEventsQueryParams,
  CreateEventBody,
  GetEventParams,
  UpdateEventParams,
  UpdateEventBody,
  DeleteEventParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/events/stats/summary", async (req, res): Promise<void> => {
  const events = await db.select().from(eventsTable);
  const categoryCounts: Record<string, number> = {};
  let totalSeats = 0;

  for (const event of events) {
    categoryCounts[event.category] = (categoryCounts[event.category] || 0) + 1;
    totalSeats += event.totalSeats;
  }

  res.json({
    totalEvents: events.length,
    totalSeats,
    categoryCounts: Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      count,
    })),
  });
});

router.get("/events", async (req, res): Promise<void> => {
  const parsed = ListEventsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  let query = db.select().from(eventsTable).$dynamic();

  if (parsed.data.category) {
    query = query.where(eq(eventsTable.category, parsed.data.category));
  }

  const events = await query;
  res.json(events);
});

router.post("/events", async (req, res): Promise<void> => {
  const parsed = CreateEventBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { totalSeats, ...rest } = parsed.data;
  const [event] = await db
    .insert(eventsTable)
    .values({ ...rest, totalSeats, seatsAvailable: totalSeats })
    .returning();

  res.status(201).json(event);
});

router.get("/events/:id", async (req, res): Promise<void> => {
  const params = GetEventParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [event] = await db
    .select()
    .from(eventsTable)
    .where(eq(eventsTable.id, params.data.id));

  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  res.json(event);
});

router.patch("/events/:id", async (req, res): Promise<void> => {
  const params = UpdateEventParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateEventBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [event] = await db
    .update(eventsTable)
    .set(parsed.data)
    .where(eq(eventsTable.id, params.data.id))
    .returning();

  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  res.json(event);
});

router.delete("/events/:id", async (req, res): Promise<void> => {
  const params = DeleteEventParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [event] = await db
    .delete(eventsTable)
    .where(eq(eventsTable.id, params.data.id))
    .returning();

  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
