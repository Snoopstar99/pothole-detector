import nodemailer from "nodemailer";
import { ENV } from "./_core/env";

// Create Gmail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: ENV.gmailUser,
    pass: ENV.gmailAppPassword,
  },
});

export interface EmailReportData {
  potholeCount: number;
  severityLevel: "LOW" | "MEDIUM" | "HIGH";
  averageConfidence: number;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  timestamp: string;
  imageBase64: string; // Base64 encoded image with bounding boxes
  damageDescription: string;
}

export async function sendDamageReport(data: EmailReportData): Promise<boolean> {
  try {
    // Determine damage description based on severity
    const damageDescriptions: Record<string, string> = {
      LOW: "Minor surface cracks that may develop into larger issues if not addressed",
      MEDIUM: "Moderate potholes that could cause vehicle damage and safety concerns",
      HIGH: "Severe potholes requiring immediate attention to prevent accidents and vehicle damage",
    };

    const damageDesc = damageDescriptions[data.severityLevel];

    // Create email HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { background-color: #f5f5f5; padding: 20px; border-radius: 0 0 5px 5px; }
            .section { margin-bottom: 20px; background-color: white; padding: 15px; border-radius: 5px; }
            .section h2 { color: #1e40af; margin-top: 0; font-size: 16px; border-bottom: 2px solid #1e40af; padding-bottom: 10px; }
            .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .detail-row:last-child { border-bottom: none; }
            .label { font-weight: bold; color: #555; }
            .value { color: #333; }
            .severity-high { color: #ef4444; font-weight: bold; }
            .severity-medium { color: #f59e0b; font-weight: bold; }
            .severity-low { color: #10b981; font-weight: bold; }
            .location { background-color: #f0f9ff; padding: 10px; border-left: 4px solid #0284c7; margin: 10px 0; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚨 Road Damage Report</h1>
              <p>Pothole Detection Alert</p>
            </div>
            
            <div class="content">
              <div class="section">
                <h2>Detection Summary</h2>
                <div class="detail-row">
                  <span class="label">Potholes Detected:</span>
                  <span class="value">${data.potholeCount}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Severity Level:</span>
                  <span class="value severity-${data.severityLevel.toLowerCase()}">${data.severityLevel}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Average Confidence:</span>
                  <span class="value">${data.averageConfidence.toFixed(1)}%</span>
                </div>
                <div class="detail-row">
                  <span class="label">Date/Time:</span>
                  <span class="value">${data.timestamp}</span>
                </div>
              </div>

              <div class="section">
                <h2>Location Information</h2>
                <div class="location">
                  <div class="detail-row">
                    <span class="label">Latitude:</span>
                    <span class="value">${data.location.latitude.toFixed(6)}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Longitude:</span>
                    <span class="value">${data.location.longitude.toFixed(6)}</span>
                  </div>
                  ${data.location.address ? `
                    <div class="detail-row">
                      <span class="label">Address:</span>
                      <span class="value">${data.location.address}</span>
                    </div>
                  ` : ""}
                  <p style="margin: 10px 0 0 0; font-size: 12px;">
                    <a href="https://maps.google.com/?q=${data.location.latitude},${data.location.longitude}" target="_blank">
                      View on Google Maps
                    </a>
                  </p>
                </div>
              </div>

              <div class="section">
                <h2>Damage Assessment</h2>
                <p>${damageDesc}</p>
              </div>

              <div class="section">
                <h2>Recommended Action</h2>
                <p>Please prioritize inspection and repair of this road section. The detected damage poses a risk to vehicle safety and road infrastructure.</p>
              </div>

              <div class="footer">
                <p>This report was generated by NaveEye - AI-Powered Road Damage Detection System</p>
                <p>Report Time: ${new Date().toISOString()}</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email with image attachment
    await transporter.sendMail({
      from: ENV.gmailUser,
      to: ENV.authorityEmail,
      subject: `🚨 Road Damage Alert - ${data.potholeCount} Pothole(s) Detected [${data.severityLevel}]`,
      html: htmlContent,
      attachments: [
        {
          filename: `pothole-detection-${Date.now()}.jpg`,
          content: Buffer.from(data.imageBase64, "base64"),
          contentType: "image/jpeg",
        },
      ],
    });

    console.log("Email sent successfully to:", ENV.authorityEmail);
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error("Failed to send damage report email");
  }
}
