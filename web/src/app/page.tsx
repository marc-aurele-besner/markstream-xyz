"use client";

import { Home } from "@/components/home";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Home />
    </Suspense>
  );
}
