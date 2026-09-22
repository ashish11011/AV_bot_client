"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ConnectionRecords } from "@/components/connection-records";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toast, ToastState } from "@/components/notification-toast";
import { TenantBreadcrumb } from "@/components/tenant-breadcrumb";
import {
  getSalesforceConnect,
  saveSalesforceConnect,
  deleteSalesforceConnect,
} from "@/lib/api";

type FormState = {
  salesforceLoginUrl: string;
  salesforceApiUrl: string;
  instanceUrl: string;
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
  grantType: string;
};

const emptyForm: FormState = {
  salesforceLoginUrl: "",
  salesforceApiUrl: "",
  instanceUrl: "",
  clientId: "",
  clientSecret: "",
  username: "",
  password: "",
  grantType: "",
};

export default function SalesforceConnectPage() {
  const { tenantId } = useParams<{ tenantId: string }>();

  const [form, setForm] = useState<FormState>(emptyForm);
  const [hasData, setHasData] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    getSalesforceConnect(tenantId)
      .then((res) => {
        if (res.data) {
          setForm({
            salesforceLoginUrl: res.data.salesforceLoginUrl ?? "",
            salesforceApiUrl: res.data.salesforceApiUrl ?? "",
            instanceUrl: res.data.instanceUrl ?? "",
            clientId: res.data.clientId ?? "",
            clientSecret: res.data.clientSecret ?? "",
            username: res.data.username ?? "",
            password: res.data.password ?? "",
            grantType: res.data.grantType ?? "",
          });
          setHasData(true);
        }
      })
      .catch(() => {
        setHasData(false);
      })
      .finally(() => setLoaded(true));
  }, [tenantId]);

  function handleAdd() {
    setForm(emptyForm);
    setIsAdding(true);
    setShowForm(true);
  }

  function handleEdit() {
    setIsAdding(false);
    setShowForm(true);
  }

  function handleChange(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      await saveSalesforceConnect(tenantId, form);

      setHasData(true);
      setShowForm(false);

      setToast({
        message: isAdding
          ? "Salesforce connect added"
          : "Salesforce connect updated",
        type: "success",
      });

      setSaving(false);
      setDeleting(false);
    } catch (err) {
      setToast({
        message:
          err instanceof Error
            ? err.message
            : "Failed to save Salesforce connect",
        type: "error",
      });
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Do you want to delete Salesforce connect? This action cannot be undone."
    );

    if (!confirmed) return;

    setDeleting(true);

    try {
      await deleteSalesforceConnect(tenantId);

      setHasData(false);
      setForm(emptyForm);

      setToast({
        message: "Salesforce connect deleted",
        type: "success",
      });

      setSaving(false);
      setDeleting(false);
    } catch (err) {
      setToast({
        message:
          err instanceof Error
            ? err.message
            : "Failed to delete Salesforce connect",
        type: "error",
      });
      setDeleting(false);
    }
  }

  if (!loaded) {
    return (
      <p className="text-sm text-muted-foreground">
        Loading...
      </p>
    );
  }

  const fields: {
    key: keyof FormState;
    label: string;
    type?: string;
  }[] = [
    { key: "salesforceLoginUrl", label: "Salesforce Login URL" },
    { key: "salesforceApiUrl", label: "Salesforce API URL" },
    { key: "instanceUrl", label: "Instance URL" },
    { key: "clientId", label: "Client ID" },
    { key: "clientSecret", label: "Client Secret", type: "password" },
    { key: "username", label: "Username" },
    { key: "password", label: "Password", type: "password" },
    { key: "grantType", label: "Grant Type" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <TenantBreadcrumb
        currentPage="Salesforce Connect"
        tenantId={tenantId}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          Salesforce Connect
        </h1>

        {!showForm && !hasData && (
          <Button onClick={handleAdd}>
            <PlusIcon />
            Add Salesforce Connect
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {showForm
              ? isAdding
                ? "Add Salesforce Connect"
                : "Edit Salesforce Connect"
              : "Salesforce Connect"}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {!showForm && hasData && (
            <div className="flex gap-2">
              <Button onClick={handleEdit}>Edit</Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          )}

          {!showForm && !hasData && (
            <p className="text-sm text-muted-foreground">
              No Salesforce connection configured.
            </p>
          )}

          {showForm && (
            <form
              onSubmit={handleSave}
              className="flex flex-col gap-4"
            >
              {fields.map((field) => (
                <div key={field.key}>
                  <Label className="mb-2">
                    {field.label}
                  </Label>
                  <Input
                    type={field.type ?? "text"}
                    value={form[field.key]}
                    onChange={(e) =>
                      handleChange(field.key, e.target.value)
                    }
                    required
                  />
                </div>
              ))}

              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving
                    ? "Saving..."
                    : isAdding
                      ? "Add"
                      : "Update"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {hasData && <ConnectionRecords key={tenantId} tenantId={tenantId} kind="salesforce-connect/api-mappings" />}

      <Toast
        toast={toast}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
