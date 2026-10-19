import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { z } from "zod";
import { ensureSeed, prisma } from "./db.js";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }),
);

app.get("/health", (c) => c.json({ ok: true }));

app.get("/v1/config/:siteKey", async (c) => {
  const siteKey = c.req.param("siteKey");
  const site = await prisma.site.findUnique({
    where: { siteKey },
    include: { config: true, organization: { include: { licenses: true } } },
  });
  if (!site) return c.json({ error: "Site not found" }, 404);

  const license = site.organization.licenses.find((l) => l.status === "active");
  if (!license) return c.json({ error: "No active license" }, 403);

  const host = c.req.header("origin") || c.req.header("referer") || "";
  const allowed = license.domains === "*" || host.includes(site.domain);
  if (!allowed && host) {
    return c.json({ error: "Domain not allowed" }, 403);
  }

  const config = site.config ? JSON.parse(site.config.json) : {};
  c.header("Cache-Control", "public, max-age=60");
  return c.json({ ...config, siteKey: site.siteKey });
});

const eventsSchema = z.object({
  events: z.array(
    z.object({
      siteKey: z.string(),
      event: z.string(),
      featureId: z.string().optional(),
      timestamp: z.string().optional(),
      path: z.string().optional(),
    }),
  ),
});

app.post("/v1/events", async (c) => {
  const body = eventsSchema.parse(await c.req.json());
  for (const ev of body.events) {
    const site = await prisma.site.findUnique({ where: { siteKey: ev.siteKey } });
    if (!site) continue;
    await prisma.usageEvent.create({
      data: {
        siteId: site.id,
        event: ev.event,
        featureId: ev.featureId,
        path: ev.path,
      },
    });
  }
  return c.json({ accepted: body.events.length });
});

app.get("/v1/sites", async (c) => {
  const sites = await prisma.site.findMany({
    include: { config: true, _count: { select: { events: true, scans: true } } },
  });
  return c.json(sites);
});

app.post("/v1/sites", async (c) => {
  const body = z
    .object({
      name: z.string(),
      domain: z.string(),
      organizationId: z.string().optional(),
    })
    .parse(await c.req.json());

  const org =
    (body.organizationId &&
      (await prisma.organization.findUnique({ where: { id: body.organizationId } }))) ||
    (await prisma.organization.findFirst());
  if (!org) return c.json({ error: "No organization" }, 400);

  const site = await prisma.site.create({
    data: {
      name: body.name,
      domain: body.domain,
      siteKey: `sk_${Math.random().toString(36).slice(2, 12)}`,
      organizationId: org.id,
      config: { create: { json: JSON.stringify({ language: "ar" }) } },
    },
  });
  return c.json(site, 201);
});

app.put("/v1/sites/:id/config", async (c) => {
  const id = c.req.param("id");
  const json = await c.req.json();
  const site = await prisma.site.findUnique({ where: { id } });
  if (!site) return c.json({ error: "Not found" }, 404);
  const config = await prisma.widgetConfig.upsert({
    where: { siteId: id },
    create: { siteId: id, json: JSON.stringify(json) },
    update: { json: JSON.stringify(json) },
  });
  return c.json(config);
});

app.get("/v1/sites/:id/analytics", async (c) => {
  const id = c.req.param("id");
  const events = await prisma.usageEvent.findMany({
    where: { siteId: id },
    orderBy: { createdAt: "desc" },
    take: 500,
  });
  const byEvent: Record<string, number> = {};
  const byFeature: Record<string, number> = {};
  for (const e of events) {
    byEvent[e.event] = (byEvent[e.event] || 0) + 1;
    if (e.featureId) byFeature[e.featureId] = (byFeature[e.featureId] || 0) + 1;
  }
  return c.json({ total: events.length, byEvent, byFeature, recent: events.slice(0, 20) });
});

app.get("/v1/licenses", async (c) => {
  const licenses = await prisma.license.findMany({ include: { organization: true } });
  return c.json(licenses);
});

app.get("/v1/scans", async (c) => {
  const scans = await prisma.scanReport.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { site: true },
  });
  return c.json(scans);
});

app.post("/v1/scans", async (c) => {
  const body = z
    .object({ siteId: z.string(), url: z.string().url() })
    .parse(await c.req.json());

  // Lazy import to keep cold start lighter when scanner deps missing
  const { scanUrl } = await import("@a11y/scanner");
  const report = await scanUrl(body.url);
  const saved = await prisma.scanReport.create({
    data: {
      siteId: body.siteId,
      url: report.url,
      score: report.score,
      json: JSON.stringify(report),
    },
  });
  return c.json({ id: saved.id, ...report }, 201);
});

app.get("/v1/users", async (c) => {
  const users = await prisma.user.findMany({ include: { organization: true } });
  return c.json(users);
});

const port = Number(process.env.PORT || 8787);

await ensureSeed();
serve({ fetch: app.fetch, port }, () => {
  console.log(`API listening on http://127.0.0.1:${port}`);
});

export default app;
