import { redirect } from "next/navigation";
import { getUserFromRequest } from "@/lib/getUserFromRequest";
import DashboardShell from "@/components/dashboard/DashboardShell";

export const metadata = {
  title: "Dashboard | AverXchange",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Only check token — no DB calls here
  // DB calls in layout cause cold-start timeouts on Vercel/Netlify
  // which trigger the catch block and redirect to login
  const payload = await getUserFromRequest();
  if (!payload || !payload.userId) {
    redirect("/login");
  }

  // Pass empty defaults — DashboardShell and Sidebar
  // fetch their own live data via /api/me client-side
  return (
    <DashboardShell displayName="" balance={0}>
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