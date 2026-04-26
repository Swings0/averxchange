import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendAdminMail = async (data: any) => {
  await transporter.sendMail({
    from: `"Aver Exchange" <${process.env.EMAIL_USER}>`,
    to: "exchangeaver@gmail.com",
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

export const sendWelcomeMail = async (data: any) => {
  await transporter.sendMail({
    from: `"Aver Exchange" <${process.env.EMAIL_USER}>`,
    to: data.email,
    subject: "Welcome to Aver Exchange 🚀",
    html: `
      <h2>Welcome ${data.fullName}</h2>
      <p>Your account has been created successfully.</p>
      <p>We're excited to have you onboard.</p>
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
    from: `"Aver Exchange" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER!, // admin email
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
    from: `"Aver Exchange" <${process.env.EMAIL_USER}>`,
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