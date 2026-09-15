import nodemailer from 'nodemailer';

// Booking details ka type define kar rahay hain taake TypeScript error na de
interface BookingDetails {
  full_name: string;
  service_date: string;
  service_time: string;
  full_address: string;
  cleaning_type?: string;
  area?: string;
}

export async function sendAssignmentEmail(
  cleanerEmail: string, 
  cleanerName: string, 
  bookingDetails: BookingDetails
) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true, 
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"Camz Cleaning" <${process.env.SMTP_USER}>`,
      to: cleanerEmail,
      subject: `New Job Assigned: ${bookingDetails.cleaning_type || 'Cleaning Service'}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #0056b3;">Hello ${cleanerName},</h2>
          <p style="color: #333; font-size: 16px;">You have been assigned a new cleaning job. Here are the details:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px; color: #333; font-size: 15px;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; width: 35%;"><strong>Customer:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${bookingDetails.full_name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Service Date:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${bookingDetails.service_date}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Time:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${bookingDetails.service_time}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Address:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${bookingDetails.full_address}</td>
            </tr>
          </table>
          
          <p style="margin-top: 25px; color: #555; font-size: 14px;">Please log in to your cleaner dashboard for full instructions and scope of work.</p>
          <p style="margin-top: 15px; font-size: 15px;">Best Regards,<br><strong style="color: #000;">Camz Cleaning Operations</strong></p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [EMAIL SUCCESS] Assignment email sent to ${cleanerEmail} (ID: ${info.messageId})`);
    return true;

  } catch (error) {
    console.error("❌ [EMAIL FAILED] Error sending assignment email:", error);
    return false;
  }
}

export async function sendCredentialsEmail(
  userEmail: string, 
  userName: string, 
  userPass: string,
  userRole: string
) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Formatting the role to look better (e.g., "data_entry" -> "Data Entry")
    const formattedRole = userRole.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

    const mailOptions = {
      from: `"Camz Cleaning" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: `Welcome to Camz Cleaning - Your Account Details`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #0056b3;">Welcome, ${userName}!</h2>
          <p style="color: #333; font-size: 16px;">An account has been created for you on the Camz Cleaning Portal as a <strong>${formattedRole}</strong>.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 15px;">
            <p style="margin: 0 0 10px 0; font-size: 15px;"><strong>Your Login Details:</strong></p>
            <p style="margin: 5px 0; font-size: 15px;"><strong>Email:</strong> ${userEmail}</p>
            <p style="margin: 5px 0; font-size: 15px;"><strong>Password:</strong> ${userPass}</p>
          </div>
          
          <p style="margin-top: 25px; color: #555; font-size: 14px;">Please log in and remember to change your password as soon as possible for security reasons.</p>
          <p style="margin-top: 15px; font-size: 15px;">Best Regards,<br><strong style="color: #000;">Camz Cleaning Operations</strong></p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [EMAIL SUCCESS] Welcome email sent to ${userName} (${userEmail})`);
    return true;

  } catch (error) {
    console.error("❌ [EMAIL FAILED] Error sending welcome email:", error);
    return false;
  }
}