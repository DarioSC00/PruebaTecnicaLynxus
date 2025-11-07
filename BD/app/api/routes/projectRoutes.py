from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

# Database
from app.core.database import get_db

# CRUD operations
from app.crud.project import project_crud 

# Schemas
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate  

# Authentication
from app.core.security import get_current_active_user  
from app.models.user import User 


router = APIRouter()

# === RUTAS DE PROYECTOS ===
@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    project_in: ProjectCreate,  
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)  
):
    """Create a new project"""
    project = project_crud.create(
        db=db, 
        obj_in=project_in, 
        owner_id=current_user.id  
    )
    return project

@router.get("/", response_model=List[ProjectResponse])
def get_projects(
    skip: int = 0,
    limit: int = 100,
    search: str = None,  
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)  
):
    """Get list of projects for current user"""
    projects = project_crud.get_all(
        db=db, 
        owner_id=current_user.id,  
        skip=skip, 
        limit=limit,
        search=search
    )
    return projects

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: int,
    db: Session = Depends(get_db)
):
    """Get project by ID"""
    project = project_crud.get_by_id(db=db, project_id=project_id)
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    return project
@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    project_in: ProjectUpdate,
    db: Session = Depends(get_db)
):
    """Update project by ID"""
    updated_project = project_crud.update(
        db=db, 
        project_id=project_id, 
        obj_in=project_in
    )
    
    if not updated_project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    return updated_project
@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db)
):
    """Delete project by ID"""
    success = project_crud.delete(db=db, project_id=project_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    return {"message": "Project deleted successfully"}
@router.get("/user/{user_id}", response_model=List[ProjectResponse])
def get_projects_by_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get projects by user ID"""
    projects = project_crud.get_by_user_id(db=db, user_id=user_id)
    return projects