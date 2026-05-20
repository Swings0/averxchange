import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getAdminPayload } from "@/lib/adminAuth";
import { ObjectId } from "mongodb";
import { transporter } from "@/lib/mailer";

// GET — fetch all pending deposits
export async function GET() {
  try {
    const admin = await getAdminPayload();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    const pending = await db
      .collection("transactions")
      .find({ type: "deposit", status: "pending" })
      .sort({ createdAt: -1 })
      .toArray();

    const enriched = await Promise.all(
      pending.map(async (t) => {
        const user = await db.collection("users").findOne(
          { _id: new ObjectId(t.userId) },
          { projection: { username: 1, fullName: 1, email: 1 } }
        );

        return {
          id: t._id.toString(),
          userId: t.userId,
          userName: user?.username || user?.fullName || "Unknown",
          userEmail: user?.email || "",
          amount: t.amount,
          paymentMethod: t.paymentMethod,
          proofFileName: t.proofFileName || "",
          status: t.status,
          createdAt: t.createdAt?.toISOString() ?? "",
        };
      })
    );

    return NextResponse.json({ deposits: enriched });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST — approve or decline a deposit
export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminPayload();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { transactionId, action } = await req.json();

    if (!transactionId || !["approve", "decline"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const transaction = await db.collection("transactions").findOne({
      _id: new ObjectId(transactionId),
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    const user = await db.collection("users").findOne({
      _id: new ObjectId(transaction.userId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userName = user.username || user.fullName || "User";

    const formattedAmount = `$${Number(transaction.amount).toLocaleString(
      undefined,
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;

    const timestamp = new Date().toLocaleString();

    // ── APPROVE ───────────────────────────────────────────────
    if (action === "approve") {
      await db.collection("transactions").updateOne(
        { _id: new ObjectId(transactionId) },
        {
          $set: {
            status: "approved",
            approvedAt: new Date(),
          },
        }
      );

      await db.collection("users").updateOne(
        { _id: new ObjectId(transaction.userId) },
        {
          $inc: {
            balance: transaction.amount,
            totalDeposit: transaction.amount,
          },
        }
      );

      try {
        await transporter.sendMail({
          from: `"Aver Exchange" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: "✅ Deposit Approved",
          html: `
            <div style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
              <div style="max-width:640px;margin:0 auto;padding:40px 20px;">
                <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:24px;overflow:hidden;">

                  <div style="background:linear-gradient(135deg,#10b981,#059669);padding:40px 30px;text-align:center;">
                    <div style="font-size:42px;margin-bottom:12px;">✅</div>
                    <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;">
                      Deposit Approved
                    </h1>
                  </div>

                  <div style="padding:36px 30px;">
                    <p style="font-size:15px;color:#374151;">
                      Hi <strong>${userName}</strong>,
                    </p>

                    <p style="font-size:15px;line-height:1.8;color:#4b5563;">
                      Your deposit has been successfully approved and credited to your account.
                    </p>

                    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:16px;padding:24px;margin:24px 0;">
                      <table style="width:100%;font-size:14px;border-collapse:collapse;">
                        <tr>
                          <td style="padding:8px 0;color:#6b7280;">Amount</td>
                          <td style="text-align:right;font-weight:700;color:#10b981;">
                            ${formattedAmount}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:8px 0;color:#6b7280;">Method</td>
                          <td style="text-align:right;color:#111827;">
                            ${transaction.paymentMethod}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:8px 0;color:#6b7280;">Approved At</td>
                          <td style="text-align:right;color:#111827;">
                            ${timestamp}
                          </td>
                        </tr>
                      </table>
                    </div>

                    <p style="font-size:14px;color:#6b7280;">
                      Thank you for using Aver Exchange.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          `,
        });
      } catch (e) {
        console.error("Approve mail error:", e);
      }

      return NextResponse.json({
        success: true,
        message: "Deposit approved and balance credited",
      });
    }

    // ── DECLINE ───────────────────────────────────────────────
    if (action === "decline") {
      await db.collection("transactions").deleteOne({
        _id: new ObjectId(transactionId),
      });

      try {
        await transporter.sendMail({
          from: `"Aver Exchange" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: "❌ Deposit Declined",
          html: `
            <div style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
              <div style="max-width:640px;margin:0 auto;padding:40px 20px;">
                <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:24px;overflow:hidden;">

                  <div style="background:linear-gradient(135deg,#ef4444,#dc2626);padding:40px 30px;text-align:center;">
                    <div style="font-size:42px;margin-bottom:12px;">❌</div>
                    <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;">
                      Deposit Declined
                    </h1>
                  </div>

                  <div style="padding:36px 30px;">
                    <p style="font-size:15px;color:#374151;">
                      Hi <strong>${userName}</strong>,
                    </p>

                    <p style="font-size:15px;line-height:1.8;color:#4b5563;">
                      Unfortunately, your deposit of <strong>${formattedAmount}</strong>
                      via <strong>${transaction.paymentMethod}</strong> could not be verified and was declined.
                    </p>

                    <p style="font-size:14px;color:#6b7280;">
                      If you believe this is a mistake, please contact support with your payment proof.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          `,
        });
      } catch (e) {
        console.error("Decline mail error:", e);
      }

      return NextResponse.json({
        success: true,
        message: "Deposit declined and removed",
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}





// import { NextRequest, NextResponse } from "next/server";
// import clientPromise from "@/lib/mongodb";
// import { getAdminPayload } from "@/lib/adminAuth";
// import { ObjectId } from "mongodb";
// import { transporter } from "@/lib/mailer";

// // GET — fetch all pending deposits
// export async function GET() {
//   try {
//     const admin = await getAdminPayload();
//     if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const client = await clientPromise;
//     const db = client.db();

//     const pending = await db
//       .collection("transactions")
//       .find({ type: "deposit", status: "pending" })
//       .sort({ createdAt: -1 })
//       .toArray();

//     // Enrich with user info
//     const enriched = await Promise.all(
//       pending.map(async (t) => {
//         const user = await db.collection("users").findOne(
//           { _id: new ObjectId(t.userId) },
//           { projection: { username: 1, fullName: 1, email: 1 } }
//         );
//         return {
//           id: t._id.toString(),
//           userId: t.userId,
//           userName: user?.username || user?.fullName || "Unknown",
//           userEmail: user?.email || "",
//           amount: t.amount,
//           paymentMethod: t.paymentMethod,
//           proofFileName: t.proofFileName || "",
//           status: t.status,
//           createdAt: t.createdAt?.toISOString() ?? "",
//         };
//       })
//     );

//     return NextResponse.json({ deposits: enriched });
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }

// // POST — approve or decline a deposit
// export async function POST(req: NextRequest) {
//   try {
//     const admin = await getAdminPayload();
//     if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const { transactionId, action } = await req.json();
//     // action: "approve" | "decline"

//     if (!transactionId || !["approve", "decline"].includes(action)) {
//       return NextResponse.json({ error: "Invalid request" }, { status: 400 });
//     }

//     const client = await clientPromise;
//     const db = client.db();

//     const transaction = await db.collection("transactions").findOne({
//       _id: new ObjectId(transactionId),
//     });

//     if (!transaction) {
//       return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
//     }

//     const user = await db.collection("users").findOne({
//       _id: new ObjectId(transaction.userId),
//     });

//     if (!user) {
//       return NextResponse.json({ error: "User not found" }, { status: 404 });
//     }

//     const userName = user.username || user.fullName || "User";

//     if (action === "approve") {
//       // Update transaction to approved
//       await db.collection("transactions").updateOne(
//         { _id: new ObjectId(transactionId) },
//         { $set: { status: "approved", approvedAt: new Date() } }
//       );

//       // Credit balance and totalDeposit
//       await db.collection("users").updateOne(
//         { _id: new ObjectId(transaction.userId) },
//         {
//           $inc: {
//             balance: transaction.amount,
//             totalDeposit: transaction.amount,
//           },
//         }
//       );

//       // Notify user
//       try {
//         await transporter.sendMail({
//           from: `"Aver Exchange" <${process.env.EMAIL_USER}>`,
//           to: user.email,
//           subject: "✅ Deposit Approved!",
//           html: `
//             <div style="font-family:sans-serif;max-width:600px;">
//               <h2 style="color:#0f2744;">Deposit Approved!</h2>
//               <p>Hi <b>${userName}</b>,</p>
//               <p>Your deposit of <b>$${transaction.amount.toLocaleString()}</b> via <b>${transaction.paymentMethod}</b> has been approved and credited to your account.</p>
//               <p>Your new balance reflects this deposit. Thank you for investing with us!</p>
//               <p>— The Aver Exchange Team</p>
//             </div>
//           `,
//         });
//       } catch (e) {
//         console.error("Approve mail error:", e);
//       }

//       return NextResponse.json({ success: true, message: "Deposit approved and balance credited" });
//     }

//     if (action === "decline") {
//       // Delete transaction entirely
//       await db.collection("transactions").deleteOne({
//         _id: new ObjectId(transactionId),
//       });

//       // Notify user
//       try {
//         await transporter.sendMail({
//           from: `"Aver Exchange" <${process.env.EMAIL_USER}>`,
//           to: user.email,
//           subject: "❌ Deposit Declined",
//           html: `
//             <div style="font-family:sans-serif;max-width:600px;">
//               <h2 style="color:#c0392b;">Deposit Declined</h2>
//               <p>Hi <b>${userName}</b>,</p>
//               <p>Unfortunately, your deposit of <b>$${transaction.amount.toLocaleString()}</b> via <b>${transaction.paymentMethod}</b> could not be verified and has been declined.</p>
//               <p>If you believe this is an error, please contact our support team with your payment proof.</p>
//               <p>— The Aver Exchange Team</p>
//             </div>
//           `,
//         });
//       } catch (e) {
//         console.error("Decline mail error:", e);
//       }

//       return NextResponse.json({ success: true, message: "Deposit declined and removed" });
//     }
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }