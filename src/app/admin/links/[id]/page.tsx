import { db } from "@/lib/db";
import { LinkEditor } from "@/components/admin/LinkEditor";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditLinkPage({ params }: Props) {
  const { id } = await params;
  const link = await db.link.findUnique({
    where: { id }
  });

  if (!link) notFound();

  return <LinkEditor initialData={link} />;
}
