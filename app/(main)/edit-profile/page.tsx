"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EditProfilePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/profile");
  }, [router]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6 text-sm text-slate-500">
      Redirecting to Profile...
    </div>
  );
}
