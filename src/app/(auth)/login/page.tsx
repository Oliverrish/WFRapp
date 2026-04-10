"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { normalizeAuthRedirect } from "@/lib/routes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        setError("Failed to send code. Please check your email.");
        return;
      }

      const redirectTo = normalizeAuthRedirect(searchParams.get("redirect"));

      sessionStorage.setItem("otp_email", email);
      if (redirectTo) {
        sessionStorage.setItem("post_login_redirect", redirectTo);
      } else {
        sessionStorage.removeItem("post_login_redirect");
      }
      router.push("/verify");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-wfr-bg-cool to-white" />

      <div className="relative w-full max-w-md animate-in fade-in-0 duration-500">
        <Card className="shadow-lg ring-1 ring-border">
          <CardHeader className="text-center pb-2">
            {/* Logo matching sidebar branding */}
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary">
              <span className="text-xl font-bold text-wfr-gold">W</span>
            </div>
            <div className="mb-4">
              <p className="text-xs font-semibold tracking-widest text-foreground">
                WORKSHOPS FOR
              </p>
              <p className="text-xs font-medium tracking-widest text-wfr-gold">
                RETIREMENT
              </p>
            </div>

            <CardTitle>
              <h2 className="text-2xl">Welcome back</h2>
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Enter your email to sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 text-base"
                  autoFocus
                />
              </div>

              {error && (
                <div className="rounded-lg bg-destructive/10 p-3">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-primary hover:bg-wfr-navy-light"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending code...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Continue with email
                  </>
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                We&apos;ll send you a one-time code to sign in
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
