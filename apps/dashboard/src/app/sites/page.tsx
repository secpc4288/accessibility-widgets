import { Card } from "@/components/ui";
import { apiGet } from "@/lib/api";
import { SiteActions } from "./site-actions";

type Site = {
  id: string;
  name: string;
  domain: string;
  siteKey: string;
  config?: { json: string } | null;
};

export default async function SitesPage() {
  let sites: Site[] = [];
  try {
    sites = await apiGet<Site[]>("/v1/sites");
  } catch {
    sites = [];
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">المواقع</h1>
          <p className="text-slate-600">إدارة النطاقات ومفاتيح التضمين وإعدادات الأداة.</p>
        </div>
        <SiteActions />
      </div>

      <div className="grid gap-4">
        {sites.map((site) => {
          const cfg = site.config ? JSON.parse(site.config.json) : {};
          return (
            <Card key={site.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{site.name}</h2>
                  <p className="text-sm text-slate-500">{site.domain}</p>
                  <p className="mt-2 text-xs">
                    كود التضمين:
                    <code className="mr-2 rounded bg-slate-100 px-2 py-1">
                      {`<script src="https://cdn.example.com/v2/muneer.js" data-site-key="${site.siteKey}"></script>`}
                    </code>
                  </p>
                </div>
                <SiteActions siteId={site.id} initialConfig={cfg} />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
