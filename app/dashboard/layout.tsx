import { redirect } from "next/navigation";
import { getTokenPayload } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import DashboardShell from "@/components/dashboard/DashboardShell";

export const metadata = {
  title: "Dashboard | AverXchange",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const payload = await getTokenPayload();

  // Only redirect if token is truly missing/invalid
  if (!payload || !payload.userId) {
    redirect("/login");
  }

  let displayName = "User";
  let balance = 0;

  // Do NOT redirect on DB errors — show dashboard with defaults
  // This prevents cold-start DB timeouts from kicking users out
  try {
    const client = await clientPromise;
    const db = client.db();

    let user = null;

    try {
      user = await db.collection("users").findOne(
        { _id: new ObjectId(payload.userId) },
        { projection: { password: 0 } }
      );
    } catch {
      // ObjectId conversion failed or DB query failed — use defaults, don't redirect
    }

    if (user) {
      displayName = user.username || user.fullName || "User";
      balance = user.balance ?? 0;
    }
    // If user is null, we still render the shell with defaults
    // Only a bad token should kick someone out, not a DB hiccup
  } catch {
    // MongoDB connection failed — still render dashboard, don't redirect
    // The individual pages will handle their own data fetching errors
  }

  return (
    <DashboardShell displayName={displayName} balance={balance}>
      {children}
    </DashboardShell>
  );
}






// import { redirect } from "next/navigation";
// import { getTokenPayload } from "@/lib/auth";
// import clientPromise from "@/lib/mongodb";
// import { ObjectId } from "mongodb";
// import DashboardShell from "@/components/dashboard/DashboardShell";

// // This layout deliberately does NOT render Navbar or Footer.
// // It is a clean shell only for authenticated dashboard pages.

// export const metadata = {
//   title: "Dashboard | AverXchange",
// };

// export default async function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const payload = await getTokenPayload();
//   if (!payload) redirect("/login");

//   let displayName = "User";
//   let balance = 0;

//   try {
//     const client = await clientPromise;
//     const db = client.db();

//     const user = await db.collection("users").findOne(
//       { _id: new ObjectId(payload.userId) },
//       { projection: { password: 0 } }
//     );

//     if (!user) redirect("/login");

//     displayName = user.username || user.fullName || "User";
//     balance = user.balance ?? 0;
//   } catch (err) {
//     console.error("Dashboard layout error:", err);
//     redirect("/login");
//   }

//   return (
//     <DashboardShell displayName={displayName} balance={balance}>
//       {children}
//     </DashboardShell>
//   );
// }