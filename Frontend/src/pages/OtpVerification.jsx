import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { sendOtp, verifyOtp } from "../../slices/AuthSlice.js"
import { toast } from "react-toastify";

export default function OtpVerification() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, otpSent, isVerified, error, pendingEmail } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  useEffect(() => {
  if (!pendingEmail) {
    toast.warn("Please signup first");
    navigate("/signup");
  }
}, [pendingEmail, navigate]);

  // Watch for verification state
  useEffect(() => {
    if (isVerified) {
      toast.success("Email verified successfully! 🎉");
      navigate("/login"); // ✅ redirect to login page
    }
  }, [isVerified, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error); // show error toast
      navigate("/signup"); // ❌ go back if verification fails
    }
  }, [error, navigate]);

  const handleSendOtp = () => {
    if (!email) {
      toast.warn("Please enter your email first");
      return;
    }
    dispatch(sendOtp(email));
    toast.info("Sending OTP...");
  };

  const handleVerifyOtp = () => {
    if (!otp) {
      toast.warn("Please enter the OTP");
      return;
    }
    dispatch(verifyOtp({ email, otp }));
    toast.info("Verifying OTP...");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="bg-white p-8 rounded-xl shadow-md w-96">
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
          Verify Your Email
        </h2>

        {/* Email Input + Send OTP Button */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-indigo-200"
          />
          <button
            onClick={handleSendOtp}
            disabled={loading}
            className="mt-3 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-60"
          >
            Send OTP
          </button>
        </div>

        {/* OTP Input + Verify Button */}
        {otpSent && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-indigo-200"
            />
            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="mt-3 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-60"
            >
              Verify OTP
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
