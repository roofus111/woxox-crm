import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function BillingPlaceholderPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Billing &amp; Invoices</h1>
        <p className="text-sm text-muted-foreground">
          Invoicing, retainers, GST, and trust accounts stay in the existing WOXOX Billing module.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Use WOXOX Billing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            LegalOS surfaces practice analytics and matter context; fee notes and invoices are issued
            from WOXOX Billing so finance, GST, and trust accounting stay single-source.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <a href={process.env.NEXT_PUBLIC_CRM_BILLING_URL || "http://localhost:3000/en/manager/saleRequest/invoice"}>
              <Button variant="gold">Open WOXOX Invoices</Button>
            </a>
            <Link href="/legal/analytics">
              <Button variant="outline">Practice analytics</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
