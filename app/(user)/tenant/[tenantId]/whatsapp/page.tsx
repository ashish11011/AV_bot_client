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
  getWhatsappConnect,
  saveWhatsappConnect,
  deleteWhatsappConnect,
} from "@/lib/api";

type FormState = {
  businessAccountId: string;
  apiVersion: string;
  accessToken: string;
  encryptedToken: string;
};

const emptyForm: FormState = {
  businessAccountId: "",
  apiVersion: "",
  accessToken: "",
  encryptedToken: "",
};

export default function WhatsappConnectPage() {
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
    getWhatsappConnect(tenantId)
      .then((res) => {
        if (res.data) {
          setForm({
            businessAccountId:
              res.data.businessAccountId ?? "",
            apiVersion: res.data.apiVersion ?? "",
            accessToken: res.data.accessToken ?? "",
            encryptedToken: res.data.encryptedToken ?? "",
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
      await saveWhatsappConnect(tenantId, form);

      setHasData(true);
      setShowForm(false);

      setToast({
        message: isAdding
          ? "WhatsApp connect added"
          : "WhatsApp connect updated",
        type: "success",
      });

      setSaving(false);
      setDeleting(false);
    } catch (err) {
      setToast({
        message:
          err instanceof Error
            ? err.message
            : "Failed to save WhatsApp connect",
        type: "error",
      });
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Do you want to delete WhatsApp connect? This action cannot be undone."
    );

    if (!confirmed) return;

    setDeleting(true);

    try {
      await deleteWhatsappConnect(tenantId);

      setHasData(false);
      setForm(emptyForm);

      setToast({
        message: "WhatsApp connect deleted",
        type: "success",
      });

      setSaving(false);
      setDeleting(false);
    } catch (err) {
      setToast({
        message:
          err instanceof Error
            ? err.message
            : "Failed to delete WhatsApp connect",
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
    {
      key: "businessAccountId",
      label: "Business Account ID",
    },
    {
      key: "apiVersion",
      label: "API Version",
    },
    {
      key: "accessToken",
      label: "Access Token",
      type: "password",
    },
    {
      key: "encryptedToken",
      label: "Encrypted Token",
      type: "password",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <TenantBreadcrumb
        currentPage="WhatsApp Connect"
        tenantId={tenantId}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          WhatsApp Connect
        </h1>

        {!showForm && !hasData && (
          <Button onClick={handleAdd}>
            <PlusIcon />
            Add WhatsApp Connect
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {showForm
              ? isAdding
                ? "Add WhatsApp Connect"
                : "Edit WhatsApp Connect"
              : "WhatsApp Connect"}
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
              No WhatsApp connection configured.
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

      {hasData && <ConnectionRecords key={tenantId} tenantId={tenantId} kind="whatsapp-connect/numbers" />}

      <Toast
        toast={toast}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
