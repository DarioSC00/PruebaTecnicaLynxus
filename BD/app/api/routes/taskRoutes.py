from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

# Database
from app.core.database import get_db

# CRUD operations
from app.crud.task import task_crud
from app.crud.project import project_crud  # 🔧 FALTA: verificar que el proyecto existe

# Schemas
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate  # 🔧 PascalCase + typo corregido

# Authentication
from app.core.security import get_current_active_user
from app.models.user import User
from app.models.task import TaskStatus, TaskPriority  # 🔧 Para filtros

router = APIRouter()

# === RUTAS DE TAREAS POR PROYECTO ===

@router.post("/projects/{project_id}/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    project_id: int,
    task_in: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new task in a project"""
    # 🔧 Verificar que el proyecto existe y pertenece al usuario
    project = project_crud.get_by_id(db=db, project_id=project_id, owner_id=current_user.id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or you don't have permission"
        )
    
    # 🔧 Crear tarea con project_id, no owner_id
    task = task_crud.create(
        db=db,
        obj_in=task_in,
        project_id=project_id,  # 🔧 CORRECTO: project_id
        creator_id=current_user.id  # 🔧 Quien crea la tarea
    )
    return task

@router.get("/projects/{project_id}/tasks", response_model=List[TaskResponse])
def get_project_tasks(
    project_id: int,
    skip: int = 0,
    limit: int = 100,
    search: str = None,
    status: Optional[TaskStatus] = Query(None, description="Filter by task status"),  # 🔧 NUEVO
    priority: Optional[TaskPriority] = Query(None, description="Filter by priority"),  # 🔧 NUEVO
    overdue: Optional[bool] = Query(None, description="Filter overdue tasks"),  # 🔧 NUEVO
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get tasks from a project with filters"""
    # 🔧 Verificar que el proyecto existe y pertenece al usuario
    project = project_crud.get_by_id(db=db, project_id=project_id, owner_id=current_user.id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or you don't have permission"
        )
    
    # 🔧 Obtener tareas con filtros
    tasks = task_crud.get_by_project(
        db=db,
        project_id=project_id,
        skip=skip,
        limit=limit,
        search=search,
        status=status,
        priority=priority,
        overdue=overdue
    )
    return tasks

@router.get("/tasks/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)  # 🔧 FALTA auth
):
    """Get task by ID"""
    task = task_crud.get_by_id(db=db, task_id=task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # 🔧 Verificar permisos: el usuario debe ser owner del proyecto
    project = project_crud.get_by_id(db=db, project_id=task.project_id, owner_id=current_user.id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view this task"
        )
    
    return task

@router.put("/tasks/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_update: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a task"""
    # 🔧 Verificar que la tarea existe
    task = task_crud.get_by_id(db=db, task_id=task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # 🔧 Verificar permisos
    project = project_crud.get_by_id(db=db, project_id=task.project_id, owner_id=current_user.id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to update this task"
        )
    
    updated_task = task_crud.update(db=db, task_id=task_id, obj_in=task_update)
    return updated_task

@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a task"""
    # 🔧 Verificar que la tarea existe
    task = task_crud.get_by_id(db=db, task_id=task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # 🔧 Verificar permisos
    project = project_crud.get_by_id(db=db, project_id=task.project_id, owner_id=current_user.id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this task"
        )
    
    task_crud.delete(db=db, task_id=task_id)
    return {"message": "Task deleted successfully"}
