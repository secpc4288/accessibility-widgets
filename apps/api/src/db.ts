import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export async function ensureSeed(): Promise<void> {
  const orgCount = await prisma.organization.count();
  if (orgCount > 0) return;

  const org = await prisma.organization.create({
    data: {
      name: "جهة تجريبية",
      users: {
        create: {
          email: "admin@example.com",
          name: "مدير النظام",
          role: "admin",
        },
      },
      licenses: {
        create: {
          plan: "enterprise",
          status: "active",
          domains: "*",
        },
      },
      sites: {
        create: {
          name: "موقع تجريبي",
          domain: "localhost",
          siteKey: "demo-site-key",
          config: {
            create: {
              json: JSON.stringify({
                language: "ar",
                position: "bottom-left",
                colors: { primary: "#0B5FFF" },
              }),
            },
          },
        },
      },
    },
  });

  void org;
}
