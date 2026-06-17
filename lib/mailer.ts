import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // smtp.go54mail.com
  port: Number(process.env.EMAIL_PORT), // 465
  secure: Number(process.env.EMAIL_PORT) === 465, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Optional: verify connection once on startup (logs to your server console,
// not the browser) so you can see auth/connection problems immediately
// instead of only when a user registers. Safe to remove if too noisy.
transporter.verify((err) => {
  if (err) {
    console.error("[mailer] SMTP connection/auth failed:", err);
  } else {
    console.log("[mailer] SMTP connection OK, ready to send mail");
  }
});

export const sendAdminMail = async (data: any) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_TO, // support@averhq.com
    replyTo: data.email,
    subject: "New User Registered",
    html: `
      <h2>New User</h2>
      <p><b>Name:</b> ${data.fullName}</p>
      <p><b>Email:</b> ${data.email}</p>
      <p><b>Phone:</b> ${data.phone}</p>
      <p><b>Country:</b> ${data.country}</p>
      <p><b>Referral:</b> ${data.referralId || "None"}</p>
    `,
  });
};

// NOTE: Tailwind utility classes (bg-gradient-to-r, rounded-3xl, backdrop-blur,
// etc.) do NOT work in email — there is no Tailwind build step processing this
// HTML string, and most email clients (Gmail, Outlook) strip <style> blocks
// and unrecognized classes entirely. The previous version would have sent
// (or silently failed to render nicely), but inline styles below guarantee
// consistent rendering across clients.
export const sendWelcomeMail = async (data: any) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: data.email,
    subject: "Welcome to Aver Exchange 🚀",
    html: `
      <div style="min-height:100vh; background:#f8fafc; padding:40px 16px; font-family:Arial,Helvetica,sans-serif;">
        <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:24px; overflow:hidden; border:1px solid #e2e8f0;">

          <!-- Header -->
          <div style="background:linear-gradient(90deg,#0f172a,#164e63,#06b6d4); padding:48px 32px; text-align:center;">
            <div style="display:inline-flex; align-items:center; justify-content:center; width:64px; height:64px; border-radius:16px; background:rgba(255,255,255,0.1); margin-bottom:24px; font-size:28px; line-height:64px;">
              🚀
            </div>
            <h1 style="color:#ffffff; font-size:28px; font-weight:bold; margin:0 0 12px;">
              Welcome to Aver Exchange
            </h1>
            <p style="color:#cffafe; font-size:16px; line-height:1.6; max-width:480px; margin:0 auto;">
              Your account is now active and ready to help you build wealth with confidence.
            </p>
          </div>

          <!-- Body -->
          <div style="padding:40px 32px;">
            <p style="font-size:18px; color:#1e293b; margin:0 0 24px;">
              Hi <span style="font-weight:600;">${data.fullName || "there"}</span>,
            </p>

            <p style="color:#475569; line-height:1.8; margin:0 0 24px;">
              We're excited to welcome you to <span style="font-weight:600; color:#0f172a;">Aver Exchange</span>.
              Your account has been created successfully, and you now have access to a secure platform
              designed to make investing simple, transparent, and rewarding.
            </p>

            <!-- Features -->
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:16px; padding:24px; margin-bottom:32px;">
              <h2 style="font-size:13px; font-weight:600; color:#0f172a; text-transform:uppercase; letter-spacing:0.05em; margin:0 0 16px;">
                What you can do now
              </h2>
              <table cellpadding="0" cellspacing="0" style="width:100%; color:#475569;">
                <tr><td style="padding:6px 0;"><span style="color:#10b981;">✓</span>&nbsp; Explore our investment plans.</td></tr>
                <tr><td style="padding:6px 0;"><span style="color:#10b981;">✓</span>&nbsp; Deposit funds and track your portfolio.</td></tr>
                <tr><td style="padding:6px 0;"><span style="color:#10b981;">✓</span>&nbsp; Monitor earnings in real time.</td></tr>
                <tr><td style="padding:6px 0;"><span style="color:#10b981;">✓</span>&nbsp; Withdraw profits securely when ready.</td></tr>
              </table>
            </div>

            <p style="color:#475569; line-height:1.8; margin:0 0 32px;">
              Our team is committed to providing you with a reliable and seamless investment experience.
              If you ever need assistance, our support team is just a message away.
            </p>

            <!-- CTA -->
            <div style="text-align:center; margin-bottom:32px;">
              <a
                href="${appUrl}/dashboard"
                style="display:inline-block; padding:16px 32px; border-radius:12px; background:#06b6d4; color:#0f172a; font-weight:600; font-size:16px; text-decoration:none;"
              >
                Access Your Dashboard
              </a>
            </div>

            <p style="color:#475569; line-height:1.8; margin:0;">
              Welcome aboard,<br />
              <span style="font-weight:600; color:#0f172a;">The Aver Exchange Team</span>
            </p>
          </div>

          <!-- Footer -->
          <div style="padding:24px 32px; background:#f8fafc; border-top:1px solid #e2e8f0; text-align:center;">
            <p style="font-size:12px; color:#94a3b8; line-height:1.6; margin:0;">
              © ${new Date().getFullYear()} Aver Exchange. All rights reserved.
            </p>
            <p style="font-size:12px; color:#94a3b8; line-height:1.6; margin:4px 0 0;">
              Secure. Transparent. Built for your financial growth.
            </p>
          </div>
        </div>
      </div>
    `,
  });
};

export const sendDepositNotificationToAdmin = async (data: {
  userName: string;
  userEmail: string;
  amount: string;
  paymentMethod: string;
  walletAddress: string;
  proofBase64: string;
  proofMimeType: string;
  proofFileName: string;
}) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_TO, // support@averhq.com
    replyTo: data.userEmail,
    subject: `💰 New Deposit Submission — ${data.userName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0f2744;">New Deposit Submission</h2>
        <table style="width:100%; border-collapse:collapse;">
          <tr>
            <td style="padding:8px; border:1px solid #ddd; background:#f9f9f9;"><b>User Name</b></td>
            <td style="padding:8px; border:1px solid #ddd;">${data.userName}</td>
          </tr>
          <tr>
            <td style="padding:8px; border:1px solid #ddd; background:#f9f9f9;"><b>User Email</b></td>
            <td style="padding:8px; border:1px solid #ddd;">${data.userEmail}</td>
          </tr>
          <tr>
            <td style="padding:8px; border:1px solid #ddd; background:#f9f9f9;"><b>Amount</b></td>
            <td style="padding:8px; border:1px solid #ddd;">$${data.amount}</td>
          </tr>
          <tr>
            <td style="padding:8px; border:1px solid #ddd; background:#f9f9f9;"><b>Payment Method</b></td>
            <td style="padding:8px; border:1px solid #ddd;">${data.paymentMethod}</td>
          </tr>
          <tr>
            <td style="padding:8px; border:1px solid #ddd; background:#f9f9f9;"><b>Wallet Address</b></td>
            <td style="padding:8px; border:1px solid #ddd; font-family:monospace; font-size:12px;">${data.walletAddress}</td>
          </tr>
        </table>
        <p style="margin-top:16px; color:#666;">Payment proof is attached below.</p>
      </div>
    `,
    attachments: [
      {
        filename: data.proofFileName,
        content: data.proofBase64,
        encoding: "base64",
        contentType: data.proofMimeType,
      },
    ],
  });
};

export const sendDepositConfirmationToUser = async (data: {
  userName: string;
  userEmail: string;
  amount: string;
  paymentMethod: string;
}) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: data.userEmail,
    subject: "Deposit Received — We're Processing It 🕐",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0f2744;">Deposit Received!</h2>
        <p>Hi <b>${data.userName}</b>,</p>
        <p>We've received your deposit request of <b>$${data.amount}</b> via <b>${data.paymentMethod}</b>.</p>
        <p>Our team is reviewing your payment proof and will credit your account shortly.</p>
        <p style="color:#666; font-size:13px;">If you have any questions, contact our support team.</p>
        <p>— The Aver Exchange Team</p>
      </div>
    `,
  });
};



// import nodemailer from "nodemailer";

// export const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST, // smtp.go54mail.com
//   port: Number(process.env.EMAIL_PORT), // 465
//   secure: Number(process.env.EMAIL_PORT) === 465, // true for 465, false for 587
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// export const sendAdminMail = async (data: any) => {
//   await transporter.sendMail({
//     from: process.env.EMAIL_FROM,
//     to: process.env.EMAIL_TO, // support@averhq.com
//     replyTo: data.email,
//     subject: "New User Registered",
//     html: `
//       <h2>New User</h2>
//       <p><b>Name:</b> ${data.fullName}</p>
//       <p><b>Email:</b> ${data.email}</p>
//       <p><b>Phone:</b> ${data.phone}</p>
//       <p><b>Country:</b> ${data.country}</p>
//       <p><b>Referral:</b> ${data.referralId || "None"}</p>
//     `,
//   });
// };

// export const sendWelcomeMail = async (data: any) => {
//   await transporter.sendMail({
//     from: process.env.EMAIL_FROM,
//     to: data.email,
//     subject: "Welcome to Aver Exchange 🚀",
//     html: `
//       <div class="min-h-screen bg-slate-50 py-10 px-4">
//         <div class="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
          
//           <!-- Header -->
//           <div class="bg-gradient-to-r from-slate-900 via-cyan-900 to-cyan-500 px-8 py-12 text-center">
//             <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur mb-6">
//               <span class="text-3xl">🚀</span>
//             </div>

//             <h1 class="text-3xl font-bold text-white mb-3">
//               Welcome to Aver Exchange
//             </h1>

//             <p class="text-cyan-100 text-base leading-7 max-w-lg mx-auto">
//               Your account is now active and ready to help you build wealth with confidence.
//             </p>
//           </div>

//           <!-- Body -->
//           <div class="px-8 py-10">
//             <p class="text-lg text-slate-800 mb-6">
//               Hi <span class="font-semibold">${data.fullName}</span>,
//             </p>

//             <p class="text-slate-600 leading-8 mb-6">
//               We’re excited to welcome you to <span class="font-semibold text-slate-900">Aver Exchange</span>.
//               Your account has been created successfully, and you now have access to a secure platform
//               designed to make investing simple, transparent, and rewarding.
//             </p>

//             <!-- Features -->
//             <div class="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8">
//               <h2 class="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4">
//                 What you can do now
//               </h2>

//               <ul class="space-y-3 text-slate-600">
//                 <li class="flex items-start gap-3">
//                   <span class="text-emerald-500">✓</span>
//                   Explore our investment plans.
//                 </li>
//                 <li class="flex items-start gap-3">
//                   <span class="text-emerald-500">✓</span>
//                   Deposit funds and track your portfolio.
//                 </li>
//                 <li class="flex items-start gap-3">
//                   <span class="text-emerald-500">✓</span>
//                   Monitor earnings in real time.
//                 </li>
//                 <li class="flex items-start gap-3">
//                   <span class="text-emerald-500">✓</span>
//                   Withdraw profits securely when ready.
//                 </li>
//               </ul>
//             </div>

//             <p class="text-slate-600 leading-8 mb-8">
//               Our team is committed to providing you with a reliable and seamless investment experience.
//               If you ever need assistance, our support team is just a message away.
//             </p>

//             <!-- CTA -->
//             <div class="text-center mb-8">
//               <a
//                 href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
//                 class="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-cyan-500 text-slate-900 font-semibold text-base shadow-lg"
//               >
//                 Access Your Dashboard
//               </a>
//             </div>

//             <p class="text-slate-600 leading-8">
//               Welcome aboard,<br />
//               <span class="font-semibold text-slate-900">The Aver Exchange Team</span>
//             </p>
//           </div>

//           <!-- Footer -->
//           <div class="px-8 py-6 bg-slate-50 border-t border-slate-200 text-center">
//             <p class="text-xs text-slate-400 leading-6">
//               © ${new Date().getFullYear()} Aver Exchange. All rights reserved.
//             </p>
//             <p class="text-xs text-slate-400 leading-6 mt-1">
//               Secure. Transparent. Built for your financial growth.
//             </p>
//           </div>
//         </div>
//       </div>
//     `,
//   });
// };

// export const sendDepositNotificationToAdmin = async (data: {
//   userName: string;
//   userEmail: string;
//   amount: string;
//   paymentMethod: string;
//   walletAddress: string;
//   proofBase64: string;
//   proofMimeType: string;
//   proofFileName: string;
// }) => {
//   await transporter.sendMail({
//     from: process.env.EMAIL_FROM,
//     to: process.env.EMAIL_TO, // support@averhq.com
//     replyTo: data.userEmail,
//     subject: `💰 New Deposit Submission — ${data.userName}`,
//     html: `
//       <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
//         <h2 style="color: #0f2744;">New Deposit Submission</h2>
//         <table style="width:100%; border-collapse:collapse;">
//           <tr>
//             <td style="padding:8px; border:1px solid #ddd; background:#f9f9f9;"><b>User Name</b></td>
//             <td style="padding:8px; border:1px solid #ddd;">${data.userName}</td>
//           </tr>
//           <tr>
//             <td style="padding:8px; border:1px solid #ddd; background:#f9f9f9;"><b>User Email</b></td>
//             <td style="padding:8px; border:1px solid #ddd;">${data.userEmail}</td>
//           </tr>
//           <tr>
//             <td style="padding:8px; border:1px solid #ddd; background:#f9f9f9;"><b>Amount</b></td>
//             <td style="padding:8px; border:1px solid #ddd;">$${data.amount}</td>
//           </tr>
//           <tr>
//             <td style="padding:8px; border:1px solid #ddd; background:#f9f9f9;"><b>Payment Method</b></td>
//             <td style="padding:8px; border:1px solid #ddd;">${data.paymentMethod}</td>
//           </tr>
//           <tr>
//             <td style="padding:8px; border:1px solid #ddd; background:#f9f9f9;"><b>Wallet Address</b></td>
//             <td style="padding:8px; border:1px solid #ddd; font-family:monospace; font-size:12px;">${data.walletAddress}</td>
//           </tr>
//         </table>
//         <p style="margin-top:16px; color:#666;">Payment proof is attached below.</p>
//       </div>
//     `,
//     attachments: [
//       {
//         filename: data.proofFileName,
//         content: data.proofBase64,
//         encoding: "base64",
//         contentType: data.proofMimeType,
//       },
//     ],
//   });
// };

// export const sendDepositConfirmationToUser = async (data: {
//   userName: string;
//   userEmail: string;
//   amount: string;
//   paymentMethod: string;
// }) => {
//   await transporter.sendMail({
//     from: process.env.EMAIL_FROM,
//     to: data.userEmail,
//     subject: "Deposit Received — We're Processing It 🕐",
//     html: `
//       <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
//         <h2 style="color: #0f2744;">Deposit Received!</h2>
//         <p>Hi <b>${data.userName}</b>,</p>
//         <p>We've received your deposit request of <b>$${data.amount}</b> via <b>${data.paymentMethod}</b>.</p>
//         <p>Our team is reviewing your payment proof and will credit your account shortly.</p>
//         <p style="color:#666; font-size:13px;">If you have any questions, contact our support team.</p>
//         <p>— The Aver Exchange Team</p>
//       </div>
//     `,
//   });
// };





// import nodemailer from "nodemailer";

// export const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// export const sendAdminMail = async (data: any) => {
//   await transporter.sendMail({
//     from: `"Aver Exchange" <${process.env.EMAIL_USER}>`,
//     to: "exchangeaver@gmail.com",
//     subject: "New User Registered",
//     html: `
//       <h2>New User</h2>
//       <p><b>Name:</b> ${data.fullName}</p>
//       <p><b>Email:</b> ${data.email}</p>
//       <p><b>Phone:</b> ${data.phone}</p>
//       <p><b>Country:</b> ${data.country}</p>
//       <p><b>Referral:</b> ${data.referralId || "None"}</p>
//     `,
//   });
// };

// export const sendWelcomeMail = async (data: any) => {
//   await transporter.sendMail({
//     from: `"Aver Exchange" <${process.env.EMAIL_USER}>`,
//     to: data.email,
//     subject: "Welcome to Aver Exchange 🚀",
//     html: `
//       <h2>Welcome ${data.fullName}</h2>
//       <p>Your account has been created successfully.</p>
//       <p>We're excited to have you onboard.</p>
//     `,
//   });
// };

// export const sendDepositNotificationToAdmin = async (data: {
//   userName: string;
//   userEmail: string;
//   amount: string;
//   paymentMethod: string;
//   walletAddress: string;
//   proofBase64: string;
//   proofMimeType: string;
//   proofFileName: string;
// }) => {
//   await transporter.sendMail({
//     from: `"Aver Exchange" <${process.env.EMAIL_USER}>`,
//     to: process.env.EMAIL_USER!, // admin email
//     subject: `💰 New Deposit Submission — ${data.userName}`,
//     html: `
//       <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
//         <h2 style="color: #0f2744;">New Deposit Submission</h2>
//         <table style="width:100%; border-collapse:collapse;">
//           <tr>
//             <td style="padding:8px; border:1px solid #ddd; background:#f9f9f9;"><b>User Name</b></td>
//             <td style="padding:8px; border:1px solid #ddd;">${data.userName}</td>
//           </tr>
//           <tr>
//             <td style="padding:8px; border:1px solid #ddd; background:#f9f9f9;"><b>User Email</b></td>
//             <td style="padding:8px; border:1px solid #ddd;">${data.userEmail}</td>
//           </tr>
//           <tr>
//             <td style="padding:8px; border:1px solid #ddd; background:#f9f9f9;"><b>Amount</b></td>
//             <td style="padding:8px; border:1px solid #ddd;">$${data.amount}</td>
//           </tr>
//           <tr>
//             <td style="padding:8px; border:1px solid #ddd; background:#f9f9f9;"><b>Payment Method</b></td>
//             <td style="padding:8px; border:1px solid #ddd;">${data.paymentMethod}</td>
//           </tr>
//           <tr>
//             <td style="padding:8px; border:1px solid #ddd; background:#f9f9f9;"><b>Wallet Address</b></td>
//             <td style="padding:8px; border:1px solid #ddd; font-family:monospace; font-size:12px;">${data.walletAddress}</td>
//           </tr>
//         </table>
//         <p style="margin-top:16px; color:#666;">Payment proof is attached below.</p>
//       </div>
//     `,
//     attachments: [
//       {
//         filename: data.proofFileName,
//         content: data.proofBase64,
//         encoding: "base64",
//         contentType: data.proofMimeType,
//       },
//     ],
//   });
// };

// export const sendDepositConfirmationToUser = async (data: {
//   userName: string;
//   userEmail: string;
//   amount: string;
//   paymentMethod: string;
// }) => {
//   await transporter.sendMail({
//     from: `"Aver Exchange" <${process.env.EMAIL_USER}>`,
//     to: data.userEmail,
//     subject: "Deposit Received — We're Processing It 🕐",
//     html: `
//       <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
//         <h2 style="color: #0f2744;">Deposit Received!</h2>
//         <p>Hi <b>${data.userName}</b>,</p>
//         <p>We've received your deposit request of <b>$${data.amount}</b> via <b>${data.paymentMethod}</b>.</p>
//         <p>Our team is reviewing your payment proof and will credit your account shortly.</p>
//         <p style="color:#666; font-size:13px;">If you have any questions, contact our support team.</p>
//         <p>— The Aver Exchange Team</p>
//       </div>
//     `,
//   });
// };