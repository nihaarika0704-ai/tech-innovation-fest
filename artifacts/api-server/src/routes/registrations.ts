import { Router, type IRouter } from "express";
import { eq, and, ilike, sql } from "drizzle-orm";
import { db, registrationsTable, eventsTable } from "@workspace/db";
import {
  ListRegistrationsQueryParams,
  CreateRegistrationBody,
  DeleteRegistrationParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/registrations/stats/dashboard", async (req, res): Promise<void> => {
  const totalRegistrations = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(registrationsTable);

  const totalEvents = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(eventsTable);

  const registrationsByEvent = await db
    .select({
      eventId: registrationsTable.eventId,
      eventName: eventsTable.name,
      count: sql<number>`count(*)::int`,
    })
    .from(registrationsTable)
    .leftJoin(eventsTable, eq(registrationsTable.eventId, eventsTable.id))
    .groupBy(registrationsTable.eventId, eventsTable.name);

  const recentRegistrations = await db
    .select({
      id: registrationsTable.id,
      name: registrationsTable.name,
      email: registrationsTable.email,
      rollNumber: registrationsTable.rollNumber,
      department: registrationsTable.department,
      eventId: registrationsTable.eventId,
      eventName: eventsTable.name,
      createdAt: registrationsTable.createdAt,
    })
    .from(registrationsTable)
    .leftJoin(eventsTable, eq(registrationsTable.eventId, eventsTable.id))
    .orderBy(sql`${registrationsTable.createdAt} desc`)
    .limit(10);

  res.json({
    totalRegistrations: totalRegistrations[0]?.count ?? 0,
    totalEvents: totalEvents[0]?.count ?? 0,
    registrationsByEvent: registrationsByEvent.map((r) => ({
      eventId: r.eventId,
      eventName: r.eventName ?? "Unknown",
      count: r.count,
    })),
    recentRegistrations: recentRegistrations.map((r) => ({
      ...r,
      eventName: r.eventName ?? "Unknown",
      createdAt: r.createdAt.toISOString(),
    })),
  });
});

router.get("/registrations", async (req, res): Promise<void> => {
  const parsed = ListRegistrationsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const conditions = [];
  if (parsed.data.eventId) {
    conditions.push(eq(registrationsTable.eventId, parsed.data.eventId));
  }
  if (parsed.data.search) {
    const search = `%${parsed.data.search}%`;
    conditions.push(
      sql`(${registrationsTable.name} ilike ${search} or ${registrationsTable.email} ilike ${search} or ${registrationsTable.rollNumber} ilike ${search})`
    );
  }

  const query = db
    .select({
      id: registrationsTable.id,
      name: registrationsTable.name,
      email: registrationsTable.email,
      rollNumber: registrationsTable.rollNumber,
      department: registrationsTable.department,
      eventId: registrationsTable.eventId,
      eventName: eventsTable.name,
      createdAt: registrationsTable.createdAt,
    })
    .from(registrationsTable)
    .leftJoin(eventsTable, eq(registrationsTable.eventId, eventsTable.id));

  const rows =
    conditions.length > 0
      ? await query.where(and(...conditions))
      : await query;

  res.json(
    rows.map((r) => ({
      ...r,
      eventName: r.eventName ?? "Unknown",
      createdAt: r.createdAt.toISOString(),
    }))
  );
});

router.post("/registrations", async (req, res): Promise<void> => {
  const parsed = CreateRegistrationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [event] = await db
    .select()
    .from(eventsTable)
    .where(eq(eventsTable.id, parsed.data.eventId));

  if (!event) {
    res.status(400).json({ error: "Event not found" });
    return;
  }

  if (event.seatsAvailable <= 0) {
    res.status(400).json({ error: "No seats available for this event" });
    return;
  }

  const existing = await db
    .select()
    .from(registrationsTable)
    .where(
      and(
        eq(registrationsTable.rollNumber, parsed.data.rollNumber),
        eq(registrationsTable.eventId, parsed.data.eventId)
      )
    );

  if (existing.length > 0) {
    res.status(409).json({ error: "You are already registered for this event" });
    return;
  }

  const [registration] = await db
    .insert(registrationsTable)
    .values(parsed.data)
    .returning();

  await db
    .update(eventsTable)
    .set({ seatsAvailable: event.seatsAvailable - 1 })
    .where(eq(eventsTable.id, parsed.data.eventId));

  const [eventRow] = await db
    .select()
    .from(eventsTable)
    .where(eq(eventsTable.id, registration.eventId));

  res.status(201).json({
    ...registration,
    eventName: eventRow?.name ?? "Unknown",
    createdAt: registration.createdAt.toISOString(),
  });
});

router.delete("/registrations/:id", async (req, res): Promise<void> => {
  const params = DeleteRegistrationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [registration] = await db
    .select()
    .from(registrationsTable)
    .where(eq(registrationsTable.id, params.data.id));

  if (!registration) {
    res.status(404).json({ error: "Registration not found" });
    return;
  }

  await db
    .delete(registrationsTable)
    .where(eq(registrationsTable.id, params.data.id));

  await db
    .update(eventsTable)
    .set({ seatsAvailable: sql`${eventsTable.seatsAvailable} + 1` })
    .where(eq(eventsTable.id, registration.eventId));

  res.sendStatus(204);
});

export default router;
