import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const { signup, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });

  if (!loading && isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!form.name.trim()) nextErrors.name = "Full name is required";
    if (!form.email.trim()) nextErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      nextErrors.email = "Please enter a valid email";
    if (!/^[6-9]\d{9}$/.test(form.mobile))
      nextErrors.mobile = "Please enter a valid 10-digit mobile number";
    if (form.password.length < 8)
      nextErrors.password = "Password must be at least 8 characters";
    if (form.password !== form.confirmPassword)
      nextErrors.confirmPassword = "Passwords do not match";

    setErrors(nextErrors);
    setSuccess("");

    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    try {
      await signup({
        name: form.name,
        email: form.email,
        mobile: form.mobile,
        password: form.password,
      });

      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login", { replace: true }), 1200);
    } catch (error) {
      setErrors({
        backend:
          error.response?.data?.message ||
          "Unable to register. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <div className="brand auth-brand">
          red<span>Bus</span>
        </div>
        <h1>Create Account</h1>

        {errors.backend && <div className="error-box">{errors.backend}</div>}
        {success && <div className="success-box">{success}</div>}

        <label htmlFor="name">Full Name</label>
        <input
          id="name"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          placeholder="Enter full name"
        />
        {errors.name && <p className="field-error">{errors.name}</p>}

        <label htmlFor="signup-email">Email Address</label>
        <input
          id="signup-email"
          type="email"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          placeholder="Enter email"
        />
        {errors.email && <p className="field-error">{errors.email}</p>}

        <label htmlFor="mobile">Mobile Number</label>
        <input
          id="mobile"
          inputMode="numeric"
          maxLength="10"
          value={form.mobile}
          onChange={(event) =>
            setForm({ ...form, mobile: event.target.value.replace(/\D/g, "") })
          }
          placeholder="Enter mobile number"
        />
        {errors.mobile && <p className="field-error">{errors.mobile}</p>}

        <label htmlFor="signup-password">Password</label>
        <div className="password-field">
          <input
            id="signup-password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={(event) =>
              setForm({ ...form, password: event.target.value })
            }
            placeholder="Minimum 8 characters"
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide passwords" : "Show passwords"}
            onClick={() => setShowPassword((current) => !current)}
          >
            {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        </div>
        {errors.password && <p className="field-error">{errors.password}</p>}

        <label htmlFor="confirm-password">Confirm Password</label>
        <input
          id="confirm-password"
          type={showPassword ? "text" : "password"}
          value={form.confirmPassword}
          onChange={(event) =>
            setForm({ ...form, confirmPassword: event.target.value })
          }
          placeholder="Re-enter password"
        />
        {errors.confirmPassword && (
          <p className="field-error">{errors.confirmPassword}</p>
        )}

        <button className="primary-button" type="submit" disabled={submitting}>
          {submitting ? "Creating account..." : "Sign Up"}
        </button>

        <p className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </main>
  );
}
