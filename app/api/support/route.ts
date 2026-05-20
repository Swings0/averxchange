import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { transporter } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  try {
    // ✅ NEXTAUTH (replaces apiAuth)
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subject, category, message } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection("users").findOne(
      { _id: new ObjectId(session.user.id) },
      { projection: { password: 0 } }
    );

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const userName = user.username || user.fullName || "User";
    const supportSubject = subject || "General Inquiry";
    const supportCategory = category || "General";
    const submittedAt = new Date().toLocaleString();

    await Promise.all([
      // 📩 Admin email
      transporter.sendMail({
        from: `"Aver Exchange" <${process.env.EMAIL_USER}>`,
        to: "Supportaverexchange@gmail.com",
        replyTo: user.email,
        subject: `[Support] ${supportSubject} — ${userName}`,
        html: `
          <div style="margin:0;padding:40px 20px;background:#0b1120;font-family:Arial,sans-serif;color:#e5e7eb;">
            <div style="max-width:680px;margin:0 auto;background:#111827;border:1px solid #1f2937;border-radius:24px;overflow:hidden;">
              
              <div style="background:linear-gradient(135deg,#f59e0b,#ea580c);padding:32px;text-align:center;">
                <h1 style="margin:0;font-size:28px;color:#ffffff;">
                  📩 New Support Message
                </h1>
                <p style="margin:8px 0 0;color:#ffedd5;font-size:14px;">
                  Customer support request submitted from Aver Exchange
                </p>
              </div>

              <div style="padding:32px;">
                <div style="background:#0f172a;border:1px solid #1e293b;border-radius:16px;padding:24px;">
                  <table style="width:100%;border-collapse:collapse;font-size:14px;">
                    <tr>
                      <td style="padding:8px 0;color:#94a3b8;">Name</td>
                      <td style="padding:8px 0;text-align:right;color:#ffffff;font-weight:600;">
                        ${userName}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0;color:#94a3b8;">Email</td>
                      <td style="padding:8px 0;text-align:right;color:#ffffff;">
                        ${user.email}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0;color:#94a3b8;">Category</td>
                      <td style="padding:8px 0;text-align:right;color:#ffffff;">
                        ${supportCategory}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0;color:#94a3b8;">Subject</td>
                      <td style="padding:8px 0;text-align:right;color:#ffffff;">
                        ${supportSubject}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0;color:#94a3b8;">Submitted</td>
                      <td style="padding:8px 0;text-align:right;color:#ffffff;">
                        ${submittedAt}
                      </td>
                    </tr>
                  </table>
                </div>

                <div style="margin-top:24px;">
                  <p style="margin:0 0 12px;color:#94a3b8;font-size:13px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;">
                    Message
                  </p>
                  <div style="background:#0f172a;border:1px solid #1e293b;border-radius:16px;padding:20px;color:#e5e7eb;line-height:1.8;white-space:pre-wrap;">
                    ${message}
                  </div>
                </div>
              </div>
            </div>
          </div>
        `,
      }),

      // 📩 User confirmation email
      transporter.sendMail({
        from: `"Aver Exchange Support" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "We received your message ✅",
        html: `
          <div style="margin:0;padding:40px 20px;background:#0b1120;font-family:Arial,sans-serif;color:#e5e7eb;">
            <div style="max-width:680px;margin:0 auto;background:#111827;border:1px solid #1f2937;border-radius:24px;overflow:hidden;">
              
              <div style="background:linear-gradient(135deg,#06b6d4,#2563eb);padding:36px;text-align:center;">
                <div style="font-size:42px;margin-bottom:12px;">💬</div>
                <h1 style="margin:0;font-size:28px;color:#ffffff;">
                  Message Received
                </h1>
                <p style="margin:10px 0 0;color:#dbeafe;font-size:15px;">
                  Our support team has successfully received your request.
                </p>
              </div>

              <div style="padding:32px;">
                <p style="margin:0 0 16px;font-size:15px;color:#d1d5db;">
                  Hi <strong style="color:#ffffff;">${userName}</strong>,
                </p>

                <p style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#d1d5db;">
                  Thank you for contacting Aver Exchange Support. Your message is now in our queue,
                  and one of our specialists will review it and respond as soon as possible.
                </p>

                <div style="background:#0f172a;border:1px solid #1e293b;border-radius:16px;padding:24px;margin:24px 0;">
                  <table style="width:100%;border-collapse:collapse;font-size:14px;">
                    <tr>
                      <td style="padding:8px 0;color:#94a3b8;">Subject</td>
                      <td style="padding:8px 0;text-align:right;color:#ffffff;font-weight:600;">
                        ${supportSubject}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0;color:#94a3b8;">Category</td>
                      <td style="padding:8px 0;text-align:right;color:#ffffff;">
                        ${supportCategory}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0;color:#94a3b8;">Submitted</td>
                      <td style="padding:8px 0;text-align:right;color:#ffffff;">
                        ${submittedAt}
                      </td>
                    </tr>
                  </table>
                </div>

                <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#d1d5db;">
                  We typically respond within <strong style="color:#ffffff;">24 hours</strong>.
                  For urgent matters, you can reply directly to this email.
                </p>

                <div style="background:#052e16;border:1px solid #14532d;border-radius:14px;padding:16px;margin-top:24px;">
                  <p style="margin:0;font-size:14px;color:#bbf7d0;line-height:1.7;">
                    Thank you for choosing Aver Exchange. We’re committed to providing
                    fast, secure, and reliable support whenever you need us.
                  </p>
                </div>
              </div>

              <div style="padding:20px 32px;border-top:1px solid #1f2937;text-align:center;">
                <p style="margin:0;font-size:12px;color:#6b7280;">
                  © ${new Date().getFullYear()} Aver Exchange. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        `,
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("SUPPORT ERROR:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}












// import { NextRequest, NextResponse } from "next/server";
// import { auth } from "@/lib/auth";
// import clientPromise from "@/lib/mongodb";
// import { ObjectId } from "mongodb";
// import { transporter } from "@/lib/mailer";

// export async function POST(req: NextRequest) {
//   try {
//     // ✅ NEXTAUTH (replaces apiAuth)
//     const session = await auth();

//     if (!session?.user?.id) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const { subject, category, message } = await req.json();

//     if (!message?.trim()) {
//       return NextResponse.json(
//         { error: "Message is required" },
//         { status: 400 }
//       );
//     }

//     const client = await clientPromise;
//     const db = client.db();

//     const user = await db.collection("users").findOne(
//       { _id: new ObjectId(session.user.id) },
//       { projection: { password: 0 } }
//     );

//     if (!user) {
//       return NextResponse.json(
//         { error: "User not found" },
//         { status: 404 }
//       );
//     }

//     const userName = user.username || user.fullName || "User";

//     await Promise.all([
//       // 📩 Admin email
//       transporter.sendMail({
//         from: `"Aver Exchange" <${process.env.EMAIL_USER}>`,
//         to: "Supportaverexchange@gmail.com",
//         replyTo: user.email,
//         subject: `[Support] ${subject || "General Inquiry"} — ${userName}`,
//         html: `
//           <div style="font-family:sans-serif;max-width:600px;">
//             <h2>New Support Message</h2>
//             <p><b>Name:</b> ${userName}</p>
//             <p><b>Email:</b> ${user.email}</p>
//             <p><b>Category:</b> ${category || "General"}</p>
//             <p><b>Subject:</b> ${subject || "No subject"}</p>

//             <div style="background:#f4f6f8;border-left:4px solid #0f2744;padding:16px;margin-top:12px;">
//               <p style="margin:0;white-space:pre-wrap;">${message}</p>
//             </div>
//           </div>
//         `,
//       }),

//       // 📩 User confirmation email
//       transporter.sendMail({
//         from: `"Aver Exchange Support" <${process.env.EMAIL_USER}>`,
//         to: user.email,
//         subject: "We received your message ✅",
//         html: `
//           <div style="font-family:sans-serif;max-width:600px;">
//             <h2>Support Request Received</h2>
//             <p>Hi <b>${userName}</b>,</p>
//             <p>We've received your message and will get back to you within 24 hours.</p>
//             <p>For urgent matters: <b>support@averexchange.com</b></p>
//             <p>— The Aver Exchange Support Team</p>
//           </div>
//         `,
//       }),
//     ]);

//     return NextResponse.json({ success: true });
//   } catch (err) {
//     console.error("SUPPORT ERROR:", err);
//     return NextResponse.json(
//       { error: "Server error" },
//       { status: 500 }
//     );
//   }
// }