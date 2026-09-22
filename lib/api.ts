import axios, { AxiosRequestConfig } from "axios";
import { NEXT_PUBLIC_API_BASE_URL } from "@/lib/env";

const client = axios.create({
  baseURL: NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

async function request<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
  try {
    const res = await client.request<T>({ url: path, ...config });
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const msg = err.response?.data?.msg ?? err.message ?? "Request failed";
      throw new Error(msg);
    }
    throw err;
  }
}

export type Tenant = {
  tenantId: number;
  name: string;
  companyName: string | null;
  phone: string | null;
  email: string;
  bearerToken: string;
  createdAt: string;
  updatedAt: string;
};

export type SalesforceConnect = {
  salesforceLoginUrl: string;
  salesforceApiUrl: string;
  salesforceToken: string | null;
  refreshToken: string | null;
  instanceUrl: string | null;
  signature: string | null;
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
  grantType: string;
};

export type WhatsappConnect = {
  businessAccountId: string;
  apiVersion: string;
  accessToken: string | null;
  encryptedToken: string;
};

// Tenants
export function listTenants() {
  return request<{ data: Tenant[] }>("/tenants");
}

export function getTenant(tenantId: string) {
  return request<{ data: Tenant }>(`/tenants/${tenantId}`);
}

export function createTenant(body: {
  name: string;
  companyName?: string;
  phone?: string;
  email: string;
}) {
  return request<{ data: Tenant }>("/tenants", {
    method: "POST",
    data: body,
  });
}

export function updateTenant(
  tenantId: string,
  body: { name: string; companyName?: string; phone?: string; email: string }
) {
  return request<{ data: Tenant }>(`/tenants/${tenantId}`, {
    method: "PUT",
    data: body,
  });
}

export function generateTenantBearerToken(tenantId: string) {
  return request<{ data: Tenant }>(`/tenants/${tenantId}/bearer-token`, {
    method: "PUT",
  });
}

export function deleteTenant(tenantId: string) {
  return request<{ data: null }>(`/tenants/${tenantId}`, {
    method: "DELETE",
  });
}

// Salesforce Connect
export function getSalesforceConnect(tenantId: string) {
  return request<{ data: SalesforceConnect | null }>(
    `/tenants/${tenantId}/salesforce-connect`
  );
}

export function saveSalesforceConnect(
  tenantId: string,
  body: Partial<SalesforceConnect>
) {
  return request<{ data: SalesforceConnect }>(
    `/tenants/${tenantId}/salesforce-connect`,
    { method: "PUT", data: body }
  );
}

export function deleteSalesforceConnect(tenantId: string) {
  return request<{ data: null }>(`/tenants/${tenantId}/salesforce-connect`, {
    method: "DELETE",
  });
}

// WhatsApp Connect
export function getWhatsappConnect(tenantId: string) {
  return request<{ data: WhatsappConnect | null }>(
    `/tenants/${tenantId}/whatsapp-connect`
  );
}

export function saveWhatsappConnect(
  tenantId: string,
  body: Partial<WhatsappConnect>
) {
  return request<{ data: WhatsappConnect }>(
    `/tenants/${tenantId}/whatsapp-connect`,
    { method: "PUT", data: body }
  );
}

export function deleteWhatsappConnect(tenantId: string) {
  return request<{ data: null }>(`/tenants/${tenantId}/whatsapp-connect`, {
    method: "DELETE",
  });
}

export type ApiMappingType = "Account" | "Deals" | "ScheduleBooking";
export type ConnectionRecord = {
  id: string;
  numberId?: string;
  phoneNumber?: string;
  apiEndpoint?: string;
  apiMappingType?: ApiMappingType;
  fieldMapping?: Record<string, unknown>;
};
export type ConnectionRecordKind = "whatsapp-connect/numbers" | "salesforce-connect/api-mappings";
export function listConnectionRecords(tenantId: string, kind: ConnectionRecordKind) {
  return request<{ data: ConnectionRecord[] }>(`/tenants/${tenantId}/${kind}`);
}
export function saveConnectionRecord(tenantId: string, kind: ConnectionRecordKind, body: Omit<ConnectionRecord, "id">, id?: string) {
  return request<{ data: ConnectionRecord }>(`/tenants/${tenantId}/${kind}${id ? `/${id}` : ""}`, {
    method: id ? "PUT" : "POST", data: body,
  });
}
export function deleteConnectionRecord(tenantId: string, kind: ConnectionRecordKind, id: string) {
  return request<{ data: null }>(`/tenants/${tenantId}/${kind}/${id}`, { method: "DELETE" });
}
