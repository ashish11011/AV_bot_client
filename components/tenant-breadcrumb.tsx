import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";

type TenantBreadcrumbProps = {
  tenantId: string;
  currentPage: string;
  tenantLabel?: string;
};

export function TenantBreadcrumb({
  tenantId,
  currentPage,
  tenantLabel,
}: TenantBreadcrumbProps) {
  const detailLabel = tenantLabel?.trim() || `Tenant ${tenantId}`;

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1">
        <li>
          <Link className="transition-colors hover:text-foreground" href="/tenant">
            Tenants
          </Link>
        </li>
        <li aria-hidden="true" className="flex items-center">
          <ChevronRightIcon className="size-4" />
        </li>
        <li>
          <Link
            className="transition-colors hover:text-foreground"
            href={`/tenant/${tenantId}`}
          >
            {detailLabel}
          </Link>
        </li>
        <li aria-hidden="true" className="flex items-center">
          <ChevronRightIcon className="size-4" />
        </li>
        <li aria-current="page" className="font-medium text-foreground">
          {currentPage}
        </li>
      </ol>
    </nav>
  );
}
