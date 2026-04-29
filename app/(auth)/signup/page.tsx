"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupInput } from "@/lib/validators";
import { Eye, EyeOff, UserPlus } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupInput) => {
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.message || "Registration failed");
        return;
      }

      router.push("/login?registered=true");
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="bg-surface rounded-2xl tonal-shadow-lg border border-border-subtle p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-primary-container font-[var(--font-heading)] mb-2">
          AuraSalon
        </h1>
        <p className="text-text-secondary text-sm">
          Create your salon management account
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-error-container text-error text-sm font-medium text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Your Name
            </label>
            <input
              {...register("name")}
              placeholder="John Doe"
              className="w-full px-4 py-2.5 rounded-lg border border-border-subtle bg-surface-muted text-sm focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container transition-all text-text-primary"
            />
            {errors.name && (
              <p className="text-error text-xs mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Phone
            </label>
            <input
              {...register("phone")}
              placeholder="+91 9876543210"
              className="w-full px-4 py-2.5 rounded-lg border border-border-subtle bg-surface-muted text-sm focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container transition-all text-text-primary"
            />
            {errors.phone && (
              <p className="text-error text-xs mt-1">{errors.phone.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Salon Name
          </label>
          <input
            {...register("salonName")}
            placeholder="My Amazing Salon"
            className="w-full px-4 py-2.5 rounded-lg border border-border-subtle bg-surface-muted text-sm focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container transition-all text-text-primary"
          />
          {errors.salonName && (
            <p className="text-error text-xs mt-1">
              {errors.salonName.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Email
          </label>
          <input
            {...register("email")}
            type="email"
            placeholder="owner@salon.com"
            className="w-full px-4 py-2.5 rounded-lg border border-border-subtle bg-surface-muted text-sm focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container transition-all text-text-primary"
          />
          {errors.email && (
            <p className="text-error text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-lg border border-border-subtle bg-surface-muted text-sm focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container transition-all text-text-primary pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-error text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Confirm
            </label>
            <input
              {...register("confirmPassword")}
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-lg border border-border-subtle bg-surface-muted text-sm focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container transition-all text-text-primary"
            />
            {errors.confirmPassword && (
              <p className="text-error text-xs mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary-container text-on-primary py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 shadow-sm mt-2"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              Create Account
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-text-secondary mt-6">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-primary-container font-semibold hover:underline"
        >
          Sign In
        </Link>
      </p>
    </div>
  );
}
