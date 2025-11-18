"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import * as projectService from "./projectService/projectService";
import styles from "./projectPage.module.css";
import { toast } from "react-toastify";

type Props = {
  defaultOpen?: boolean;
  onCreated?: () => void;
};

type CreateProjectInput = {
  name: string;
  description?: string;
};

export default function ProjectCreateComponent({ defaultOpen = false, onCreated }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(Boolean(defaultOpen));
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formData, setFormData] = useState<CreateProjectInput>({
    name: "",
    description: "",
  });

  const handleInputChange = (field: keyof CreateProjectInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Project name is required");
      return;
    }
    setSubmitting(true);
    try {
      await projectService.createProject(formData);
      toast.success("Project created successfully");
      setOpen(false);
      setFormData({ name: "", description: "" });
      if (typeof onCreated === "function") onCreated();
      router.push("/project");
    } catch (err: unknown) {
      console.error("createProject error:", err);
      toast.error("Error creating project. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button className={styles.btn} onClick={() => setOpen(true)}>
        <AddIcon sx={{ mr: 1 }} />
        New Project
      </button>

      <Dialog 
        open={open} 
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontSize: '1.5rem',
          fontWeight: 700,
          py: 3,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AddIcon />
            <span>Create New Project</span>
          </Box>
        </DialogTitle>
        
        <form onSubmit={handleCreate}>
          <DialogContent sx={{ pt: 4, pb: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Project Name"
                fullWidth
                required
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter a memorable project name"
                variant="outlined"
                disabled={submitting}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    fontSize: '1.1rem',
                  }
                }}
              />

              <TextField
                label="Description"
                fullWidth
                multiline
                rows={6}
                value={formData.description || ""}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe your project goals, scope, key deliverables, timeline, and team responsibilities..."
                variant="outlined"
                disabled={submitting}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />

              <Box sx={{ 
                mt: 1, 
                p: 2.5, 
                borderRadius: 2,
                bgcolor: '#f0f9ff',
                border: '1px solid #bae6fd'
              }}>
                <Typography variant="caption" sx={{ color: '#0369a1', display: 'block', mb: 1, fontWeight: 700 }}>
                  💡 Project Creation Tips
                </Typography>
                <Typography variant="body2" sx={{ color: '#0c4a6e', fontSize: '0.875rem', lineHeight: 1.6 }}>
                  • <strong>Clear naming:</strong> Choose a descriptive name that reflects the project's purpose
                  <br />
                  • <strong>Detailed description:</strong> Include goals, scope, and expected outcomes
                  <br />
                  • <strong>Team collaboration:</strong> Add team members after creating the project
                  <br />
                  • <strong>Task management:</strong> Break down work into manageable tasks with priorities
                </Typography>
              </Box>
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 2 }}>
            <Button
              onClick={() => {
                setOpen(false);
                setFormData({ name: "", description: "" });
              }}
              disabled={submitting}
              variant="outlined"
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                px: 3,
                py: 1,
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              variant="contained"
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                px: 4,
                py: 1,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #63408b 100%)',
                },
              }}
            >
              {submitting ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                  Creating...
                </>
              ) : (
                <>
                  <AddIcon sx={{ mr: 1 }} />
                  Create Project
                </>
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}