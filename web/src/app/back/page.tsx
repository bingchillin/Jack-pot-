"use client";

import { Suspense } from "react";
import { Authenticated } from "@refinedev/core";
import { ThemedLayoutV2 } from "@refinedev/antd";
import { Header } from "@components/header";
import dynamic from "next/dynamic";

// Create a client-side only dashboard component
const DashboardContent = dynamic(() => import("@/components/dashboard"), {
  ssr: false,
});

export default function DashboardPage() {
  return (
    <Suspense>
      <Authenticated key="dashboard-page">
        <ThemedLayoutV2 Header={Header}>
          <DashboardContent />
        </ThemedLayoutV2>
      </Authenticated>
    </Suspense>
  );
} 