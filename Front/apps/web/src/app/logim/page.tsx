"use client";

import React from "react";
import LoginForm from "../../features/loginComponents/login";
import { redirect } from "next/dist/client/components/navigation";

export default function LoginPage() {
  return (
    <main
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <LoginForm />
    </main>
  );
}

