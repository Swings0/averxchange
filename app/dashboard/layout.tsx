import { redirect } from "next/navigation";
import { getTokenPayload } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import DashboardShell from "@/components/dashboard/DashboardShell";

// This layout deliberately does NOT render Navbar or Footer.
// It is a clean shell only for authenticated dashboard pages.

export const metadata = {
  title: "Dashboard | AverXchange",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let displayName = "User";
  let balance = 0;

  try {
    const client = await clientPromise;
    const db = client.db();

    // optional safe fetch ONLY (no redirect)
    const user = await db.collection("users").findOne({
      // DO NOT rely on token here
    });

    if (user) {
      displayName = user.username || user.fullName || "User";
      balance = user.balance ?? 0;
    }
  } catch (err) {
    console.error("Dashboard layout error:", err);
  }

  return (
    <DashboardShell displayName={displayName} balance={balance}>
      {children}
    </DashboardShell>
  );
}