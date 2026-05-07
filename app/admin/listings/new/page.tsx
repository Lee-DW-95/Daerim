import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ListingForm } from "@/components/admin/listing-form";

export default function NewListingPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/admin/listings"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        매물 목록
      </Link>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">새 매물 등록</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          저장하면 사이트의 /listings, 단지 페이지, 홈에 즉시 반영됩니다.
        </p>
      </div>
      <ListingForm mode="create" />
    </div>
  );
}
