import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { transporter } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  try {
    // ✅ NextAuth session replaces getUserFromRequest
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const senderId = session.user.id;

    const { recipientEmail, amount } = await req.json();

    if (!recipientEmail || !amount) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      return NextResponse.json(
        { error: "Enter a valid amount" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // ── Get sender ────────────────────────────────
    const sender = await db.collection("users").findOne({
      _id: new ObjectId(senderId),
    });

    if (!sender) {
      return NextResponse.json(
        { error: "Sender not found" },
        { status: 404 }
      );
    }

    // ── Prevent self-transfer ─────────────────────
    if (sender.email === recipientEmail) {
      return NextResponse.json(
        { error: "You cannot transfer funds to yourself" },
        { status: 400 }
      );
    }

    // ── Find recipient ────────────────────────────
    const recipient = await db.collection("users").findOne({
      email: recipientEmail,
    });

    if (!recipient) {
      return NextResponse.json(
        {
          error:
            "User does not exist. Please check the email and try again.",
        },
        { status: 404 }
      );
    }

    // ── Check sender balance ──────────────────────
    const senderBalance = sender.balance ?? 0;

    if (amt > senderBalance) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    const newSenderBalance = parseFloat(
      (senderBalance - amt).toFixed(2)
    );
    const newRecipientBalance = parseFloat(
      ((recipient.balance ?? 0) + amt).toFixed(2)
    );

    const now = new Date();

    // ── Update balances ───────────────────────────
    await db.collection("users").updateOne(
      { _id: new ObjectId(senderId) },
      { $set: { balance: newSenderBalance } }
    );

    await db.collection("users").updateOne(
      { _id: recipient._id },
      { $set: { balance: newRecipientBalance } }
    );

    // ── Log transactions ──────────────────────────
    await db.collection("transactions").insertMany([
      {
        userId: senderId,
        type: "transfer_out",
        amount: amt,
        recipientEmail,
        recipientName:
          recipient.username || recipient.fullName || "User",
        status: "approved",
        method: "Internal Transfer",
        createdAt: now,
      },
      {
        userId: recipient._id.toString(),
        type: "transfer_in",
        amount: amt,
        senderEmail: sender.email,
        senderName: sender.username || sender.fullName || "User",
        status: "approved",
        method: "Internal Transfer",
        createdAt: now,
      },
    ]);

    // ── Email Notifications ───────────────────────
    const senderName = sender.username || sender.fullName || "User";
    const recipientName =
      recipient.username || recipient.fullName || "User";

    try {
      await Promise.all([
        // Sender mail
        transporter.sendMail({
          from: `"Aver Exchange" <${process.env.EMAIL_USER}>`,
          to: sender.email,
          subject: "✅ Transfer Successful",
          html: `
            <div style="margin:0;padding:0;background-color:#f8fafc;font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
              <div style="max-width:640px;margin:0 auto;padding:32px 16px;">

                <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;overflow:hidden;box-shadow:0 20px 40px rgba(15,23,42,0.08);">

                  <div style="background:linear-gradient(135deg,#2563eb 0%,#06b6d4 100%);padding:40px 32px;text-align:center;">
                    <div style="width:64px;height:64px;margin:0 auto 16px;background:rgba(255,255,255,0.18);border-radius:20px;line-height:64px;font-size:32px;">
                      ✅
                    </div>
                    <h1 style="margin:0;font-size:28px;font-weight:800;color:#ffffff;">
                      Transfer Completed
                    </h1>
                    <p style="margin:10px 0 0;font-size:15px;color:rgba(255,255,255,0.9);">
                      Your funds were sent successfully.
                    </p>
                  </div>

                  <div style="padding:40px 32px;">
                    <p style="margin:0 0 16px;font-size:16px;color:#334155;">
                      Hi <strong>${senderName}</strong>,
                    </p>

                    <p style="margin:0 0 28px;font-size:15px;line-height:1.8;color:#475569;">
                      Your internal transfer to <strong>${recipientName}</strong> has been completed successfully.
                    </p>

                    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:18px;padding:24px;">
                      <table style="width:100%;border-collapse:collapse;font-size:14px;">
                        <tr>
                          <td style="padding:10px 0;color:#64748b;">Recipient</td>
                          <td style="padding:10px 0;text-align:right;color:#0f172a;font-weight:600;">
                            ${recipientName}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:10px 0;color:#64748b;">Recipient Email</td>
                          <td style="padding:10px 0;text-align:right;color:#0f172a;font-weight:600;">
                            ${recipient.email}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:10px 0;color:#64748b;">Amount Sent</td>
                          <td style="padding:10px 0;text-align:right;color:#16a34a;font-size:18px;font-weight:800;">
                            $${amt.toFixed(2)}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:10px 0;color:#64748b;">Available Balance</td>
                          <td style="padding:10px 0;text-align:right;color:#0f172a;font-weight:700;">
                            $${newSenderBalance.toFixed(2)}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:10px 0;color:#64748b;">Date & Time</td>
                          <td style="padding:10px 0;text-align:right;color:#0f172a;font-weight:600;">
                            ${now.toLocaleString()}
                          </td>
                        </tr>
                      </table>
                    </div>

                    <p style="margin:28px 0 0;font-size:13px;line-height:1.7;color:#94a3b8;">
                      If you did not authorize this transfer, please contact our support team immediately.
                    </p>
                  </div>

                  <div style="padding:24px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
                    <p style="margin:0;font-size:12px;color:#94a3b8;">
                      © ${new Date().getFullYear()} Aver Exchange. Secure digital asset management.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          `,
        }),

        // Recipient mail
        transporter.sendMail({
          from: `"Aver Exchange" <${process.env.EMAIL_USER}>`,
          to: recipient.email,
          subject: "💰 You Received Funds",
          html: `
            <div style="margin:0;padding:0;background-color:#f8fafc;font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
              <div style="max-width:640px;margin:0 auto;padding:32px 16px;">

                <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;overflow:hidden;box-shadow:0 20px 40px rgba(15,23,42,0.08);">

                  <div style="background:linear-gradient(135deg,#10b981 0%,#059669 100%);padding:40px 32px;text-align:center;">
                    <div style="width:64px;height:64px;margin:0 auto 16px;background:rgba(255,255,255,0.18);border-radius:20px;line-height:64px;font-size:32px;">
                      💰
                    </div>
                    <h1 style="margin:0;font-size:28px;font-weight:800;color:#ffffff;">
                      Funds Received
                    </h1>
                    <p style="margin:10px 0 0;font-size:15px;color:rgba(255,255,255,0.9);">
                      Your account has been credited.
                    </p>
                  </div>

                  <div style="padding:40px 32px;">
                    <p style="margin:0 0 16px;font-size:16px;color:#334155;">
                      Hi <strong>${recipientName}</strong>,
                    </p>

                    <p style="margin:0 0 28px;font-size:15px;line-height:1.8;color:#475569;">
                      You have successfully received funds from <strong>${senderName}</strong>.
                    </p>

                    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:18px;padding:24px;">
                      <table style="width:100%;border-collapse:collapse;font-size:14px;">
                        <tr>
                          <td style="padding:10px 0;color:#64748b;">Sender</td>
                          <td style="padding:10px 0;text-align:right;color:#0f172a;font-weight:600;">
                            ${senderName}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:10px 0;color:#64748b;">Sender Email</td>
                          <td style="padding:10px 0;text-align:right;color:#0f172a;font-weight:600;">
                            ${sender.email}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:10px 0;color:#64748b;">Amount Received</td>
                          <td style="padding:10px 0;text-align:right;color:#16a34a;font-size:18px;font-weight:800;">
                            $${amt.toFixed(2)}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:10px 0;color:#64748b;">Updated Balance</td>
                          <td style="padding:10px 0;text-align:right;color:#0f172a;font-weight:700;">
                            $${newRecipientBalance.toFixed(2)}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:10px 0;color:#64748b;">Date & Time</td>
                          <td style="padding:10px 0;text-align:right;color:#0f172a;font-weight:600;">
                            ${now.toLocaleString()}
                          </td>
                        </tr>
                      </table>
                    </div>

                    <p style="margin:28px 0 0;font-size:13px;line-height:1.7;color:#94a3b8;">
                      Thank you for using Aver Exchange.
                    </p>
                  </div>

                  <div style="padding:24px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
                    <p style="margin:0;font-size:12px;color:#94a3b8;">
                      © ${new Date().getFullYear()} Aver Exchange. Secure digital asset management.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          `,
        }),

        // Admin mail
        transporter.sendMail({
          from: `"Aver Exchange" <${process.env.EMAIL_USER}>`,
          to: process.env.EMAIL_USER!,
          subject: "🔔 Internal Transfer Notification",
          html: `
            <div style="margin:0;padding:0;background-color:#f8fafc;font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
              <div style="max-width:640px;margin:0 auto;padding:32px 16px;">

                <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;overflow:hidden;box-shadow:0 20px 40px rgba(15,23,42,0.08);">

                  <div style="background:linear-gradient(135deg,#f59e0b 0%,#ea580c 100%);padding:40px 32px;text-align:center;">
                    <div style="width:64px;height:64px;margin:0 auto 16px;background:rgba(255,255,255,0.18);border-radius:20px;line-height:64px;font-size:32px;">
                      🔔
                    </div>
                    <h1 style="margin:0;font-size:28px;font-weight:800;color:#ffffff;">
                      Internal Transfer Alert
                    </h1>
                    <p style="margin:10px 0 0;font-size:15px;color:rgba(255,255,255,0.9);">
                      A transfer was completed on the platform.
                    </p>
                  </div>

                  <div style="padding:40px 32px;">
                    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:18px;padding:24px;">
                      <table style="width:100%;border-collapse:collapse;font-size:14px;">
                        <tr>
                          <td style="padding:10px 0;color:#64748b;">Sender</td>
                          <td style="padding:10px 0;text-align:right;font-weight:600;">
                            ${senderName}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:10px 0;color:#64748b;">Sender Email</td>
                          <td style="padding:10px 0;text-align:right;font-weight:600;">
                            ${sender.email}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:10px 0;color:#64748b;">Recipient</td>
                          <td style="padding:10px 0;text-align:right;font-weight:600;">
                            ${recipientName}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:10px 0;color:#64748b;">Recipient Email</td>
                          <td style="padding:10px 0;text-align:right;font-weight:600;">
                            ${recipient.email}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:10px 0;color:#64748b;">Amount</td>
                          <td style="padding:10px 0;text-align:right;color:#16a34a;font-size:18px;font-weight:800;">
                            $${amt.toFixed(2)}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:10px 0;color:#64748b;">Date & Time</td>
                          <td style="padding:10px 0;text-align:right;font-weight:600;">
                            ${now.toLocaleString()}
                          </td>
                        </tr>
                      </table>
                    </div>
                  </div>

                  <div style="padding:24px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
                    <p style="margin:0;font-size:12px;color:#94a3b8;">
                      Automated notification from Aver Exchange.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          `,
        }),
      ]);
    } catch (mailErr) {
      console.error("TRANSFER MAIL ERROR:", mailErr);
    }

    return NextResponse.json({
      success: true,
      newBalance: newSenderBalance,
      recipientName:
        recipient.username || recipient.fullName || "User",
    });
  } catch (err) {
    console.error("TRANSFER ERROR:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}





// import { NextRequest, NextResponse } from "next/server";
// import clientPromise from "@/lib/mongodb";
// import { auth } from "@/lib/auth";
// import { ObjectId } from "mongodb";
// import { transporter } from "@/lib/mailer";

// export async function POST(req: NextRequest) {
//   try {
//     // ✅ NextAuth session replaces getUserFromRequest
//     const session = await auth();

//     if (!session?.user?.id) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const senderId = session.user.id;

//     const { recipientEmail, amount } = await req.json();

//     if (!recipientEmail || !amount) {
//       return NextResponse.json({ error: "All fields are required" }, { status: 400 });
//     }

//     const amt = parseFloat(amount);
//     if (isNaN(amt) || amt <= 0) {
//       return NextResponse.json({ error: "Enter a valid amount" }, { status: 400 });
//     }

//     const client = await clientPromise;
//     const db = client.db();

//     // ── Get sender ────────────────────────────────
//     const sender = await db.collection("users").findOne({
//       _id: new ObjectId(senderId),
//     });

//     if (!sender) {
//       return NextResponse.json({ error: "Sender not found" }, { status: 404 });
//     }

//     // ── Prevent self-transfer ─────────────────────
//     if (sender.email === recipientEmail) {
//       return NextResponse.json(
//         { error: "You cannot transfer funds to yourself" },
//         { status: 400 }
//       );
//     }

//     // ── Find recipient ────────────────────────────
//     const recipient = await db.collection("users").findOne({
//       email: recipientEmail,
//     });

//     if (!recipient) {
//       return NextResponse.json(
//         { error: "User does not exist. Please check the email and try again." },
//         { status: 404 }
//       );
//     }

//     // ── Check sender balance ──────────────────────
//     const senderBalance = sender.balance ?? 0;

//     if (amt > senderBalance) {
//       return NextResponse.json(
//         { error: "Insufficient balance" },
//         { status: 400 }
//       );
//     }

//     const newSenderBalance = parseFloat((senderBalance - amt).toFixed(2));
//     const newRecipientBalance = parseFloat(
//       ((recipient.balance ?? 0) + amt).toFixed(2)
//     );

//     const now = new Date();

//     // ── Update balances ───────────────────────────
//     await db.collection("users").updateOne(
//       { _id: new ObjectId(senderId) },
//       { $set: { balance: newSenderBalance } }
//     );

//     await db.collection("users").updateOne(
//       { _id: recipient._id },
//       { $set: { balance: newRecipientBalance } }
//     );

//     // ── Log transactions ──────────────────────────
//     await db.collection("transactions").insertMany([
//       {
//         userId: senderId,
//         type: "transfer_out",
//         amount: amt,
//         recipientEmail,
//         recipientName: recipient.username || recipient.fullName || "User",
//         status: "approved",
//         method: "Internal Transfer",
//         createdAt: now,
//       },
//       {
//         userId: recipient._id.toString(),
//         type: "transfer_in",
//         amount: amt,
//         senderEmail: sender.email,
//         senderName: sender.username || sender.fullName || "User",
//         status: "approved",
//         method: "Internal Transfer",
//         createdAt: now,
//       },
//     ]);


//       // ── Email Notifications ───────────────────────
//     const senderName = sender.username || sender.fullName || "User";
//     const recipientName = recipient.username || recipient.fullName || "User";

//     try {
//       await Promise.all([
//         // Sender mail
//         transporter.sendMail({
//           from: `"Aver Exchange" <${process.env.EMAIL_USER}>`,
//           to: sender.email,
//           subject: "✅ Transfer Successful",
//           html: `
//             <div style="font-family:Arial,sans-serif;background:#0b1220;padding:40px 20px;color:#fff;">
//               <div style="max-width:600px;margin:auto;background:#111827;border:1px solid #1f2937;border-radius:18px;overflow:hidden;">
                
//                 <div style="background:linear-gradient(135deg,#06b6d4,#2563eb);padding:28px;text-align:center;">
//                   <h1 style="margin:0;font-size:24px;color:white;">Transfer Completed</h1>
//                 </div>

//                 <div style="padding:30px;">
//                   <p style="font-size:15px;color:#d1d5db;">Hello <b>${senderName}</b>,</p>

//                   <p style="font-size:15px;color:#d1d5db;line-height:1.7;">
//                     Your transfer has been completed successfully.
//                   </p>

//                   <div style="background:#0f172a;border:1px solid #1e293b;border-radius:14px;padding:20px;margin:24px 0;">
//                     <table style="width:100%;color:#fff;font-size:14px;">
//                       <tr>
//                         <td style="padding:8px 0;color:#94a3b8;">Recipient</td>
//                         <td style="padding:8px 0;text-align:right;">${recipientName}</td>
//                       </tr>
//                       <tr>
//                         <td style="padding:8px 0;color:#94a3b8;">Recipient Email</td>
//                         <td style="padding:8px 0;text-align:right;">${recipient.email}</td>
//                       </tr>
//                       <tr>
//                         <td style="padding:8px 0;color:#94a3b8;">Amount</td>
//                         <td style="padding:8px 0;text-align:right;color:#22c55e;font-weight:bold;">
//                           $${amt.toFixed(2)}
//                         </td>
//                       </tr>
//                       <tr>
//                         <td style="padding:8px 0;color:#94a3b8;">New Balance</td>
//                         <td style="padding:8px 0;text-align:right;">
//                           $${newSenderBalance.toFixed(2)}
//                         </td>
//                       </tr>
//                     </table>
//                   </div>

//                   <p style="font-size:13px;color:#64748b;">
//                     Transaction Time: ${now.toLocaleString()}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           `,
//         }),

//         // Recipient mail
//         transporter.sendMail({
//           from: `"Aver Exchange" <${process.env.EMAIL_USER}>`,
//           to: recipient.email,
//           subject: "💰 You Received Funds",
//           html: `
//             <div style="font-family:Arial,sans-serif;background:#0b1220;padding:40px 20px;color:#fff;">
//               <div style="max-width:600px;margin:auto;background:#111827;border:1px solid #1f2937;border-radius:18px;overflow:hidden;">
                
//                 <div style="background:linear-gradient(135deg,#10b981,#059669);padding:28px;text-align:center;">
//                   <h1 style="margin:0;font-size:24px;color:white;">Funds Received</h1>
//                 </div>

//                 <div style="padding:30px;">
//                   <p style="font-size:15px;color:#d1d5db;">Hello <b>${recipientName}</b>,</p>

//                   <p style="font-size:15px;color:#d1d5db;line-height:1.7;">
//                     You have received funds from another Aver Exchange user.
//                   </p>

//                   <div style="background:#0f172a;border:1px solid #1e293b;border-radius:14px;padding:20px;margin:24px 0;">
//                     <table style="width:100%;color:#fff;font-size:14px;">
//                       <tr>
//                         <td style="padding:8px 0;color:#94a3b8;">Sender</td>
//                         <td style="padding:8px 0;text-align:right;">${senderName}</td>
//                       </tr>
//                       <tr>
//                         <td style="padding:8px 0;color:#94a3b8;">Sender Email</td>
//                         <td style="padding:8px 0;text-align:right;">${sender.email}</td>
//                       </tr>
//                       <tr>
//                         <td style="padding:8px 0;color:#94a3b8;">Amount Received</td>
//                         <td style="padding:8px 0;text-align:right;color:#22c55e;font-weight:bold;">
//                           $${amt.toFixed(2)}
//                         </td>
//                       </tr>
//                       <tr>
//                         <td style="padding:8px 0;color:#94a3b8;">Updated Balance</td>
//                         <td style="padding:8px 0;text-align:right;">
//                           $${newRecipientBalance.toFixed(2)}
//                         </td>
//                       </tr>
//                     </table>
//                   </div>

//                   <p style="font-size:13px;color:#64748b;">
//                     Transaction Time: ${now.toLocaleString()}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           `,
//         }),

//         // Admin mail
//         transporter.sendMail({
//           from: `"Aver Exchange" <${process.env.EMAIL_USER}>`,
//           to: process.env.EMAIL_USER!,
//           subject: "🔔 Internal Transfer Notification",
//           html: `
//             <div style="font-family:Arial,sans-serif;background:#0b1220;padding:40px 20px;color:#fff;">
//               <div style="max-width:620px;margin:auto;background:#111827;border:1px solid #1f2937;border-radius:18px;overflow:hidden;">

//                 <div style="background:linear-gradient(135deg,#f59e0b,#ea580c);padding:28px;text-align:center;">
//                   <h1 style="margin:0;font-size:24px;color:white;">Internal Transfer Alert</h1>
//                 </div>

//                 <div style="padding:30px;">
//                   <p style="font-size:15px;color:#d1d5db;">
//                     A user transfer has been completed successfully.
//                   </p>

//                   <div style="background:#0f172a;border:1px solid #1e293b;border-radius:14px;padding:20px;margin-top:24px;">
//                     <table style="width:100%;color:#fff;font-size:14px;">
//                       <tr>
//                         <td style="padding:8px 0;color:#94a3b8;">Sender</td>
//                         <td style="padding:8px 0;text-align:right;">${senderName}</td>
//                       </tr>
//                       <tr>
//                         <td style="padding:8px 0;color:#94a3b8;">Sender Email</td>
//                         <td style="padding:8px 0;text-align:right;">${sender.email}</td>
//                       </tr>
//                       <tr>
//                         <td style="padding:8px 0;color:#94a3b8;">Recipient</td>
//                         <td style="padding:8px 0;text-align:right;">${recipientName}</td>
//                       </tr>
//                       <tr>
//                         <td style="padding:8px 0;color:#94a3b8;">Recipient Email</td>
//                         <td style="padding:8px 0;text-align:right;">${recipient.email}</td>
//                       </tr>
//                       <tr>
//                         <td style="padding:8px 0;color:#94a3b8;">Amount</td>
//                         <td style="padding:8px 0;text-align:right;color:#22c55e;font-weight:bold;">
//                           $${amt.toFixed(2)}
//                         </td>
//                       </tr>
//                     </table>
//                   </div>

//                   <p style="font-size:13px;color:#64748b;margin-top:20px;">
//                     ${now.toLocaleString()}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           `,
//         }),
//       ]);
//     } catch (mailErr) {
//       console.error("TRANSFER MAIL ERROR:", mailErr);
//     }

//     return NextResponse.json({
//       success: true,
//       newBalance: newSenderBalance,
//       recipientName: recipient.username || recipient.fullName || "User",
//     });
//   } catch (err) {
//     console.error("TRANSFER ERROR:", err);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }