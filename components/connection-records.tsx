"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  type ApiMappingType, type ConnectionRecord, type ConnectionRecordKind,
  listConnectionRecords, saveConnectionRecord, deleteConnectionRecord,
} from "@/lib/api";

export function ConnectionRecords({ tenantId, kind }: { tenantId: string; kind: ConnectionRecordKind }) {
  const mappings = kind === "salesforce-connect/api-mappings";
  const [records, setRecords] = useState<ConnectionRecord[]>([]);
  const [editing, setEditing] = useState<ConnectionRecord | null>(null);
  const [json, setJson] = useState("{}");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;
    listConnectionRecords(tenantId, kind)
      .then(({ data }) => { if (active) { setRecords(data); setError(""); } })
      .catch((err: Error) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [tenantId, kind, reload]);

  function edit(record: ConnectionRecord) {
    setEditing({ ...record });
    setJson(JSON.stringify(record.fieldMapping ?? {}, null, 2));
    setError("");
    setNotice("");
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!editing) return;
    setError("");
    setNotice("");
    let fieldMapping: Record<string, unknown> = {};
    if (mappings) {
      try {
        const parsed: unknown = JSON.parse(json);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
        fieldMapping = parsed as Record<string, unknown>;
      } catch {
        setError('Field mapping must be a valid JSON object, for example: {"Name": "customerName"}');
        return;
      }
    }
    setBusy(true);
    try {
      const body = mappings
        ? { apiEndpoint: editing.apiEndpoint, apiMappingType: editing.apiMappingType, fieldMapping }
        : { numberId: editing.numberId, phoneNumber: editing.phoneNumber };
      const { data } = await saveConnectionRecord(tenantId, kind, body, editing.id || undefined);
      setRecords(previous => editing.id ? previous.map(row => row.id === data.id ? data : row) : [...previous, data]);
      setEditing(null);
      setNotice("Saved successfully.");
    } catch (err) { setError(err instanceof Error ? err.message : "Save failed"); }
    finally { setBusy(false); }
  }

  async function remove(record: ConnectionRecord) {
    if (!window.confirm(`Delete ${mappings ? "this API mapping" : "this WhatsApp number"}?`)) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await deleteConnectionRecord(tenantId, kind, record.id);
      setRecords(previous => previous.filter(row => row.id !== record.id));
      if (editing?.id === record.id) setEditing(null);
      setNotice("Deleted successfully.");
    } catch (err) { setError(err instanceof Error ? err.message : "Delete failed"); }
    finally { setBusy(false); }
  }

  return (
    <Card>
      <CardHeader><CardTitle>{mappings ? "API Mappings" : "WhatsApp Numbers"}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {error && <div role="alert" className="text-sm text-destructive">{error} <Button variant="outline" disabled={busy} onClick={() => setReload(value => value + 1)}>Reload</Button></div>}
        {notice && <p role="status" className="text-sm">{notice}</p>}
        {loading ? <p>Loading...</p> : <>
          {records.length === 0 && <p className="text-sm text-muted-foreground">No {mappings ? "API mappings" : "WhatsApp numbers"} added.</p>}
          {records.map(record => <div key={record.id} className="space-y-2 rounded-md border p-4">
            <p className="font-medium break-all">{mappings ? record.apiMappingType : record.phoneNumber}</p>
            <p className="text-sm break-all">{mappings ? record.apiEndpoint : `Number ID: ${record.numberId}`}</p>
            {mappings && <pre className="overflow-auto rounded bg-muted p-3 text-sm">{JSON.stringify(record.fieldMapping, null, 2)}</pre>}
            <div className="flex gap-2">
              <Button variant="outline" disabled={busy} onClick={() => edit(record)}>Edit</Button>
              <Button variant="destructive" disabled={busy} onClick={() => remove(record)}>Delete</Button>
            </div>
          </div>)}
          {!editing && <Button disabled={busy} onClick={() => edit({ id: "", apiMappingType: "Account", numberId: "", phoneNumber: "", apiEndpoint: "" })}>Add {mappings ? "API Mapping" : "WhatsApp Number"}</Button>}
        </>}
        {editing && <form onSubmit={save} className="space-y-4 rounded-md border p-4">
          <h3 className="font-medium">{editing.id ? "Edit" : "Add"} {mappings ? "API Mapping" : "WhatsApp Number"}</h3>
          <fieldset disabled={busy} className="space-y-4">
            {mappings ? <>
              <label className="block space-y-2"><span>API Endpoint</span><Input required maxLength={255} value={editing.apiEndpoint ?? ""} onChange={e => setEditing({ ...editing, apiEndpoint: e.target.value })} /></label>
              <label className="block space-y-2"><span>Mapping Type</span><select className="block w-full rounded-md border bg-background p-2" value={editing.apiMappingType} onChange={e => setEditing({ ...editing, apiMappingType: e.target.value as ApiMappingType })}>
                {["Account", "Deals", "ScheduleBooking"].map(type => <option key={type} value={type}>{type}</option>)}
              </select></label>
              <label className="block space-y-2"><span>Field Mapping (JSON object)</span><Textarea required rows={10} spellCheck={false} className="font-mono" value={json} onChange={e => setJson(e.target.value)} /></label>
            </> : <>
              <label className="block space-y-2"><span>Number ID</span><Input required maxLength={512} value={editing.numberId ?? ""} onChange={e => setEditing({ ...editing, numberId: e.target.value })} /></label>
              <label className="block space-y-2"><span>Phone Number</span><Input required type="tel" maxLength={512} value={editing.phoneNumber ?? ""} onChange={e => setEditing({ ...editing, phoneNumber: e.target.value })} /></label>
            </>}
            <div className="flex gap-2"><Button type="submit" disabled={busy}>{busy ? "Saving..." : "Save"}</Button><Button type="button" variant="outline" disabled={busy} onClick={() => setEditing(null)}>Cancel</Button></div>
          </fieldset>
        </form>}
      </CardContent>
    </Card>
  );
}
