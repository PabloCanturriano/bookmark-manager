import { Suspense } from "react";
import { DashboardContent } from "./DashboardContent";

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  );
}
