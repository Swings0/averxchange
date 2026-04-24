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