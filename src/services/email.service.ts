import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "",
    port: parseInt(process.env.EMAIL_PORT || ""),
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendOtpEmail = async (email: string, otp: string) => {
    const mailOptions = {
        from: `"Pet Care & Vet Clinic" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Password Reset OTP Code",
        html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 500px; margin: auto; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #4F46E5; text-align: center;">Password Reset Verification</h2>
        <p>You requested to reset your password for your Pet Care account.</p>
        <p>Please use the following 6-digit verification code to proceed. This code is valid for 15 minutes:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #4F46E5; background-color: #f3f4f6; padding: 12px 24px; border-radius: 6px; display: inline-block;">
            ${otp}
          </span>
        </div>

        <p style="margin-top: 20px; font-size: 12px; color: #777; text-align: center;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
    };

    await transporter.sendMail(mailOptions);
};

export const sendAppointmentEmail = async (
    toEmail: string,
    appointmentDetails: { petName: string; doctorName: string; date: string; time: string; status: string }
) => {
    const { petName, doctorName, date, time, status } = appointmentDetails;

    let statusColor = "#4F46E5";
    if (status === "CONFIRMED") statusColor = "#10B981";
    else if (status === "CANCELLED") statusColor = "#EF4444";
    else if (status === "COMPLETED") statusColor = "#3B82F6";

    const mailOptions = {
        from: `"Pet Care & Vet Clinic" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: `Appointment Update: ${status} - Pet Care & Vet Clinic`,
        html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 500px; margin: auto; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #4F46E5; text-align: center;">Appointment Status Update</h2>
        <p>Hello,</p>
        <p>Your appointment status has been updated. Here are the details:</p>
        
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p><strong>🐾 Pet Name:</strong> ${petName}</p>
          <p><strong>👨‍⚕️ Doctor:</strong> ${doctorName}</p>
          <p><strong>📅 Date:</strong> ${date}</p>
          <p><strong>⏰ Time:</strong> ${time}</p>
          <p><strong>📌 Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${status}</span></p>
        </div>

        <p style="text-align: center; font-size: 14px; color: #555;">Thank you for choosing Pet Care & Vet Clinic!</p>
        <p style="margin-top: 20px; font-size: 12px; color: #777; text-align: center;">If you have any questions, feel free to contact us.</p>
      </div>
    `,
    };

    await transporter.sendMail(mailOptions);
};