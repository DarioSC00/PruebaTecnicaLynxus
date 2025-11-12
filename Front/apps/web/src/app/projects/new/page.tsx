import React from "react";
import ProjectCreateComponent from "../../../features/projectComponents/projectCreateComponent";

export const metadata = {
  title: "Nuevo proyecto",
};

export default function NewProjectPage() {
  return (
    <main style={{ padding: 16 }}>
      <h1 style={{ margin: 0, marginBottom: 12 }}>Nuevo proyecto</h1>
      {/* El componente abre el modal de creación */}
      <ProjectCreateComponent defaultOpen={true} />
    </main>
  );
}