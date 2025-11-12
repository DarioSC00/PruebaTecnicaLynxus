import React from "react";
import ProjectList from "../../features/projectComponents/projectComponent";

export const metadata = { title: "Proyectos" };

export default function ProjectsPage() {
  return (
    <main style={{ padding: 16 }}>
      <h1 style={{ margin: 0, marginBottom: 12 }}>Proyectos</h1>
      <ProjectList />
    </main>
  );
}