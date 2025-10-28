export const otpEmailTemplate = (otp, username) => `
  <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
    <h2>Hello ${username || "User"},</h2>
    <p>Here is your One-Time Password (OTP) for verification:</p>
    <h1 style="letter-spacing: 4px; background-color: #f5f5f5; padding: 10px; display: inline-block;">${otp}</h1>
    <p>This OTP is valid for 10 minutes.</p>
    <p>If you didn’t request this, you can ignore this email.</p>
    <br />
    <p>Thanks,<br />Team NodesNest 🚀</p>
  </div>
`;