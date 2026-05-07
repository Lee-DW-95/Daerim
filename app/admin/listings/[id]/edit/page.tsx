import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ListingForm } from "@/components/admin/listing-form";

type Params = { id: string };

export default async function EditListingPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) notFound();

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
        <h1 className="text-3xl font-bold tracking-tight">매물 편집</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {data.headline}
        </p>
      </div>
      <ListingForm mode="edit" initial={data} />
    </div>
  );
}
