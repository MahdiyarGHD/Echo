"use client";

import { useParams } from "next/navigation";
import PasteView from "@/components/PasteView";

export default function PastePage() {
  const params = useParams();
  const accessCode = params?.accessCode as string;
  return <PasteView accessCode={accessCode} />;
}
