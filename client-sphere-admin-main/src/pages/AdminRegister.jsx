import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaEye, FaEyeSlash, FaLock, FaUser } from "react-icons/fa";
import login from "../assets/photos/login.jpg";
import { authService } from "@/services/authService";

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

export default function AdminRegister() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!email) {
      newErrors.email = "Email is required";
    } else if (email !== email.toLowerCase()) {
      newErrors.email = "Only lowercase allowed";
    } else if (!email.endsWith("@gmail.com")) {
      newErrors.email = "Must be a gmail.com email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (!passwordRegex.test(password)) {
      newErrors.password =
        "Min 8 chars, 1 uppercase, 1 lowercase, 1 number & 1 special char";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await authService.adminRegister({
        name: name.trim(),
        email: email.toLowerCase(),
        password,
      });

      alert("Admin account created successfully. Please login.");
      navigate("/login?type=admin");
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-100">
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img src={login} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/60 via-green-500/50 to-blue-400/40" />
        <div className="absolute top-[56%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-white z-20">
          <div className="max-w-md text-center">
            <h1 className="text-2xl xl:text-4xl font-bold leading-snug drop-shadow-xl">
              Admin registration
            </h1>
            <p className="text-sm mt-4 opacity-95 drop-shadow-md">
              Create your admin account to manage the LMS.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center sm:px-6 py-20 px-6">
        <div className="w-full max-w-sm sm:max-w-md">
          <h2 className="text-2xl font-semibold text-center mb-2">
            Admin Register
          </h2>
          <p className="text-center text-gray-400 text-sm mb-4 sm:mb-6">
            Fill in the details to create an admin account
          </p>

          <form onSubmit={handleRegister}>
            <label className="text-sm text-gray-600">Full Name</label>
            <div
              className={`flex items-center rounded-full px-3 mt-1 mb-1 ${
                errors.name ? "border border-red-500 bg-red-50" : "bg-gray-200"
              }`}
            >
              <FaUser className="text-gray-400 text-sm mr-2" />
              <input
                type="text"
                placeholder="Enter your name"
                className="w-full bg-transparent outline-none text-sm sm:text-base py-2.5"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            {errors.name && (
              <p className="text-red-500 text-xs mb-2">{errors.name}</p>
            )}

            <label className="text-sm text-gray-600">Email</label>
            <div
              className={`flex items-center rounded-full px-3 mt-1 mb-1 ${
                errors.email ? "border border-red-500 bg-red-50" : "bg-gray-200"
              }`}
            >
              <FaEnvelope className="text-gray-400 text-sm mr-2" />
              <input
                type="email"
                placeholder="admin@gmail.com"
                className="w-full bg-transparent outline-none text-sm sm:text-base py-2.5"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mb-2">{errors.email}</p>
            )}

            <label className="text-sm text-gray-600">Password</label>
            <div
              className={`relative flex items-center rounded-full px-3 mt-1 mb-1 ${
                errors.password
                  ? "border border-red-500 bg-red-50"
                  : "bg-gray-200"
              }`}
            >
              <FaLock className="text-gray-400 text-sm mr-2" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                className="w-full bg-transparent outline-none text-sm sm:text-base py-2.5"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mb-2">{errors.password}</p>
            )}

            <label className="text-sm text-gray-600">Confirm Password</label>
            <div
              className={`relative flex items-center rounded-full px-3 mt-1 mb-6 ${
                errors.confirmPassword
                  ? "border border-red-500 bg-red-50"
                  : "bg-gray-200"
              }`}
            >
              <FaLock className="text-gray-400 text-sm mr-2" />
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm password"
                className="w-full bg-transparent outline-none text-sm sm:text-base py-2.5"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <span
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
              >
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mb-4">
                {errors.confirmPassword}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 sm:py-2.5 text-sm sm:text-base rounded-full text-white font-medium bg-gradient-to-r from-blue-500 to-green-500 hover:scale-105 transition shadow-lg disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              to="/login?type=admin"
              className="text-green-600 font-medium hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
