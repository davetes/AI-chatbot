"use client";

import { useEffect } from "react";
import { logout } from "../../services/auth";

export default function LogoutPage() {
  useEffect(() => {
    logout().finally(() => {
      window.location.href = "/login";
    });
  }, []);

  return (
    <div className="h-full w-full flex items-center justify-center p-6">
      <p className="text-sm text-slate-600 dark:text-slate-300">Logging out...</p>
    </div>
  );
}
