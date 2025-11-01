"use client";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { endpoints, setAuthToken } from "@/commons/Api";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");
      if (!token) {
        router.push("/auth/signin");
        return;
      }

      try {
        const res = await fetch(endpoints.auth.verifyEmail(token));
        const data = await res.json();

        if (res.ok && data.success) {
          if (data.token) setAuthToken(data.token);
          router.push("/");
        } else if (
          data?.emailVerified ||
          data?.user?.emailVerified ||
          /already verified/i.test(data?.message)
        ) {
          if (data?.token) setAuthToken(data.token);
          router.push("/");
        } else {
          router.push("/auth/signin");
        }
      } catch {
        router.push("/auth/signin");
      }
    };

    verifyEmail();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 border-4 border-[#E84C88] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-700 text-sm font-medium">
          Verifying your email...
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-[#E84C88] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-700 text-sm font-medium">
              Verifying your email...
            </p>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}