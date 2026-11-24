import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (!loading && isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = {};
    if (!form.email.trim()) nextErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      nextErrors.email = "Please enter a valid email";
    if (!form.password) nextErrors.password = "Password is required";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    try {
      await login(form.email.trim(), form.password);
      navigate("/home", { replace: true });
    } catch (error) {
      setErrors({
        backend:
          error.response?.data?.message || "Unable to login. Please try again.",
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
        <h1>Welcome Back</h1>

        {errors.backend && <div className="error-box">{errors.backend}</div>}

        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          type="email"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          placeholder="Enter your email"
        />
        {errors.email && <p className="field-error">{errors.email}</p>}

        <label htmlFor="password">Password</label>
        <div className="password-field">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={(event) =>
              setForm({ ...form, password: event.target.value })
            }
            placeholder="Enter your password"
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((current) => !current)}
          >
            {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        </div>
        {errors.password && <p className="field-error">{errors.password}</p>}

        <button className="primary-button" type="submit" disabled={submitting}>
          {submitting ? "Logging in..." : "Login"}
        </button>

        <p className="auth-link">
          Don&apos;t have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </form>
    </main>
  );
}
