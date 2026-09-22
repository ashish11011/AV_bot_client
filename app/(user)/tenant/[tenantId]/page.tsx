"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CopyIcon,
  KeyRoundIcon,
  MessageCircleIcon,
  PencilIcon,
  PlugIcon,
  RefreshCcwIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Toast, ToastState } from "@/components/notification-toast";
import {
  generateTenantBearerToken,
  getTenant,
  type Tenant,
} from "@/lib/api";

export default function TenantDetailPage() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const router = useRouter();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    getTenant(tenantId).then((res) => setTenant(res.data));
  }, [tenantId]);

  async function handleCopyBearerToken() {
    if (!tenant?.bearerToken) return;

    try {
      await navigator.clipboard.writeText(tenant.bearerToken);
      setToast({ message: "Bearer token copied", type: "success" });
    } catch {
      setToast({ message: "Failed to copy bearer token", type: "error" });
    }
  }

  async function handleGenerateBearerToken() {
    const confirmed = window.confirm(
      "Generate a new bearer token? The old token will stop working immediately."
    );

    if (!confirmed) return;

    setGenerating(true);

    try {
      const res = await generateTenantBearerToken(tenantId);
      setTenant(res.data);
      setToast({ message: "Bearer token generated and saved", type: "success" });
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : "Failed to generate bearer token",
        type: "error",
      });
    } finally {
      setGenerating(false);
    }
  }

  if (!tenant) return <p className="text-sm text-muted-foreground">Loading...</p>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{tenant.name}</h1>
          <p className="text-sm text-muted-foreground">{tenant.email}</p>
        </div>
        <Button variant="outline" onClick={() => router.push(`/tenant/${tenantId}/edit`)}>
          <PencilIcon /> Edit
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRoundIcon className="size-4" /> Bearer Token
          </CardTitle>
          <CardDescription>
            View, copy, or generate a new token for this tenant.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="rounded-md border bg-muted/40 p-3 font-mono text-sm break-all">
            {tenant.bearerToken}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleCopyBearerToken}>
              <CopyIcon />
              Copy
            </Button>
            <Button
              variant="outline"
              onClick={handleGenerateBearerToken}
              disabled={generating}
            >
              <RefreshCcwIcon />
              {generating ? "Generating..." : "Generate New Token"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card
          className="cursor-pointer"
          onClick={() => router.push(`/tenant/${tenantId}/salesforce-connect`)}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlugIcon className="size-4" /> Salesforce Connect
            </CardTitle>
            <CardDescription>Visit to set up Salesforce for this tenant</CardDescription>
          </CardHeader>
        </Card>

        <Card
          className="cursor-pointer"
          onClick={() => router.push(`/tenant/${tenantId}/whatsapp`)}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircleIcon className="size-4" /> WhatsApp Connect
            </CardTitle>
            <CardDescription>Visit to set up WhatsApp for this tenant</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
