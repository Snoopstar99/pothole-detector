import { describe, it, expect, vi, beforeEach } from "vitest";

describe("email.sendDamageReport", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("should send email with correct structure", async () => {
    const mockSendMail = vi.fn().mockResolvedValue({ messageId: "test-id" });
    const mockTransporter = {
      sendMail: mockSendMail,
    };

    vi.doMock("nodemailer", () => ({
      default: {
        createTransport: vi.fn(() => mockTransporter),
      },
    }));

    const { sendDamageReport } = await import("./email");

    const testData = {
      potholeCount: 3,
      severityLevel: "HIGH" as const,
      averageConfidence: 0.85,
      location: {
        latitude: 40.7128,
        longitude: -74.006,
        address: "5th Avenue, New York",
      },
      timestamp: "2026-03-11T14:00:00Z",
      imageBase64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      damageDescription: "Severe potholes detected",
    };

    await sendDamageReport(testData);

    expect(mockSendMail).toHaveBeenCalledOnce();
    const callArgs = mockSendMail.mock.calls[0][0];

    // Verify email structure
    expect(callArgs.from).toBeDefined();
    expect(callArgs.to).toBeDefined();
    expect(callArgs.subject).toContain("Road Damage Alert");
    expect(callArgs.subject).toContain("3");
    expect(callArgs.subject).toContain("HIGH");
    expect(callArgs.html).toContain("Detection Summary");
    expect(callArgs.html).toContain("3");
    expect(callArgs.html).toContain("HIGH");
    expect(callArgs.attachments).toHaveLength(1);
    expect(callArgs.attachments[0].filename).toContain("pothole-detection");

    vi.doUnmock("nodemailer");
  });

  it("should include location coordinates in email", async () => {
    const mockSendMail = vi.fn().mockResolvedValue({ messageId: "test-id" });
    const mockTransporter = {
      sendMail: mockSendMail,
    };

    vi.doMock("nodemailer", () => ({
      default: {
        createTransport: vi.fn(() => mockTransporter),
      },
    }));

    const { sendDamageReport } = await import("./email");

    const testData = {
      potholeCount: 2,
      severityLevel: "MEDIUM" as const,
      averageConfidence: 0.75,
      location: {
        latitude: 51.5074,
        longitude: -0.1278,
        address: "London, UK",
      },
      timestamp: "2026-03-11T14:00:00Z",
      imageBase64: "test-base64",
      damageDescription: "",
    };

    await sendDamageReport(testData);

    const callArgs = mockSendMail.mock.calls[0][0];
    expect(callArgs.html).toContain("51.5074");
    expect(callArgs.html).toContain("-0.1278");
    expect(callArgs.html).toContain("London, UK");
    expect(callArgs.html).toContain("maps.google.com");

    vi.doUnmock("nodemailer");
  });
});
