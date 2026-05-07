"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import type { ContactStatus } from "@/lib/supabase/types";

export async function updateContactStatusAction(
  id: string,
  status: ContactStatus
) {
  const supabase = await createSupabaseServerClient();
  const update: { status: ContactStatus; replied_at?: string | null } = {
    status,
  };
  if (status === "replied") update.replied_at = new Date().toISOString();
  const { error } = await supabase
    .from("contacts")
    .update(update)
    .eq("id", id);
  if (error) {
    console.warn("[contact] status update failed:", error.message);
  }
  revalidatePath("/admin/contacts");
  revalidatePath("/admin");
}

export async function deleteContactAction(id: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("contacts").delete().eq("id", id);
  if (error) {
    console.warn("[contact] delete failed:", error.message);
  }
  revalidatePath("/admin/contacts");
  revalidatePath("/admin");
}
