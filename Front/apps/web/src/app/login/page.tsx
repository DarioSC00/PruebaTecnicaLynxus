"use client";

import React from "react";
import Login from "../../features/loginComponents/loginComponents";

export default function Page() {
  return (
    <main
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <Login />
    </main>
  );
}

