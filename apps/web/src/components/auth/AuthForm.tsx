"use client";

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { PageLoader } from "@/components/ui/PageLoader";
import { IconAlert, IconGoogle, Spinner } from "@/components/ui/Icons";
import { getFirebaseAuth } from "@/lib/firebase/client";

type AuthMode = "login" | "signup";

interface AuthFormProps {
  mode: AuthMode;
}

function friendlyAuthError(message: string): string {
  if (message.includes("auth/invalid-credential") || message.includes("auth/wrong-password")) {
    return "Invalid email or password. Please try again.";
  }
  if (message.includes("auth/email-already-in-use")) {
    return "An account with this email already exists.";
  }
  if (message.includes("auth/weak-password")) {
    return "Password must be at least 6 characters.";
  }
  if (message.includes("auth/popup-closed-by-user")) {
    return "Sign-in was cancelled. Please try again.";
  }
  return "Something went wrong. Please try again.";
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  function validateField(field: "email" | "password", value: string): string | undefined {
    if (field === "email") {
      if (!value.trim()) return "Email is required.";
      if (!isValidEmail(value)) return "Enter a valid email address.";
    }
    if (field === "password") {
      if (!value) return "Password is required.";
      if (value.length < 6) return "Password must be at least 6 characters.";
    }
    return undefined;
  }

  function handleBlur(field: "email" | "password") {
    const value = field === "email" ? email : password;
    const message = validateField(field, value);
    setFieldErrors((prev) => ({ ...prev, [field]: message }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const emailError = validateField("email", email);
    const passwordError = validateField("password", password);
    if (emailError || passwordError) {
      setFieldErrors({ email: emailError, password: passwordError });
      return;
    }

    setLoading(true);

    try {
      const auth = getFirebaseAuth();
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      setRedirecting(true);
      router.push("/dashboard");
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Authentication failed";
      setError(friendlyAuthError(raw));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setLoading(true);
    try {
      const auth = getFirebaseAuth();
      await signInWithPopup(auth, new GoogleAuthProvider());
      setRedirecting(true);
      router.push("/dashboard");
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Google sign-in failed";
      setError(friendlyAuthError(raw));
    } finally {
      setLoading(false);
    }
  }

  if (redirecting) {
    return (
      <PageLoader
        message={mode === "login" ? "Welcome back" : "Account created"}
        submessage="Taking you to your dashboard"
      />
    );
  }

  return (
    <div className="auth-card">
      <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
      <p className="subtitle">
        {mode === "login"
          ? "Sign in to your hosted dashboard — score, playbooks, and GitHub YAML sync."
          : "Create your hosted account, or use the open-source CLI if you prefer self-hosted."}
      </p>

      {error ? (
        <div className="form-error-banner" role="alert">
          <IconAlert />
          <span>{error}</span>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} noValidate aria-busy={loading}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) {
                setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }
            }}
            onBlur={() => handleBlur("email")}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
          />
          {fieldErrors.email ? (
            <p id="email-error" className="field-error" role="alert">
              {fieldErrors.email}
            </p>
          ) : null}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
            minLength={6}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) {
                setFieldErrors((prev) => ({ ...prev, password: undefined }));
              }
            }}
            onBlur={() => handleBlur("password")}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={
              fieldErrors.password ? "password-error" : mode === "signup" ? "password-hint" : undefined
            }
          />
          {fieldErrors.password ? (
            <p id="password-error" className="field-error" role="alert">
              {fieldErrors.password}
            </p>
          ) : mode === "signup" ? (
            <p id="password-hint" className="field-hint">
              At least 6 characters
            </p>
          ) : null}
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? (
            <>
              <Spinner />
              Please wait…
            </>
          ) : mode === "login" ? (
            "Sign in"
          ) : (
            "Create account"
          )}
        </button>
      </form>

      <div className="auth-divider" aria-hidden>
        or
      </div>

      <button
        type="button"
        className="btn btn-secondary btn-block btn-google"
        onClick={handleGoogle}
        disabled={loading}
      >
        <IconGoogle />
        Continue with Google
      </button>

      <p className="auth-footer">
        {mode === "login" ? (
          <>
            No account? <Link href="/signup">Create one</Link>
          </>
        ) : (
          <>
            Already have an account? <Link href="/login">Sign in</Link>
          </>
        )}
      </p>
      <p className="auth-footer auth-footer-secondary">
        Self-hosted instead? <Link href="/cli">View CLI commands</Link>
      </p>
    </div>
  );
}
