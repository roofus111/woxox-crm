import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ClientsPlaceholderPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Clients &amp; Parties</h1>
        <p className="text-sm text-muted-foreground">
          Client CRM lives in the existing WOXOX CRM module — LegalOS reuses those records.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Use WOXOX CRM</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Corporate, individual, and government clients, contacts, and relationship graphs are
            managed in your host CRM. Legal matters link parties by workspace contact IDs.
          </p>
          <p>Open a matter to attach complainants, opposite parties, witnesses, and advocates.</p>
          <div className="flex gap-2 pt-2">
            <a href={process.env.NEXT_PUBLIC_CRM_APP_URL || "http://localhost:3000/en/manager/customer"}>
              <Button variant="gold">Open WOXOX CRM Contacts</Button>
            </a>
            <Link href="/legal/cases">
              <Button variant="outline">Go to Matters</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
