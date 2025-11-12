from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

# Database
from app.core.database import get_db

# CRUD operations
from app.crud import taskController as task_crud
from app.crud.projectController import project_crud  

# Schemas
from app.schemas.taskSchema import TaskCreate, TaskRead, TaskUpdate

# Authentication
from app.core.security import get_current_active_user
from app.models.user import User
from app.models.task import TaskStatus, TaskPriority  # Para filtros

router = APIRouter()

# === RUTAS DE TAREAS POR PROYECTO ===

@router.post("/projects/{project_id}/tasks", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
def create_task(
    project_id: int,
    task_in: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new task in a project"""
    project = project_crud.get_by_id(db=db, project_id=project_id, owner_id=current_user.id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or you don't have permission"
        )
    task = task_crud.create(
        db=db,
        obj_in=task_in,
        project_id=project_id,
        creator_id=current_user.id
    )
    return task

@router.get("/projects/{project_id}/tasks", response_model=List[TaskRead])
def get_project_tasks(
    project_id: int,
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    status: Optional[TaskStatus] = Query(None, description="Filter by task status"),
    priority: Optional[TaskPriority] = Query(None, description="Filter by priority"),
    overdue: Optional[bool] = Query(None, description="Filter overdue tasks"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get tasks from a project with filters"""
    project = project_crud.get_by_id(db=db, project_id=project_id, owner_id=current_user.id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or you don't have permission"
        )
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

@router.get("/tasks/{task_id}", response_model=TaskRead)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get task by ID"""
    task = task_crud.get_by_id(db=db, task_id=task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    project = project_crud.get_by_id(db=db, project_id=task.project_id, owner_id=current_user.id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view this task"
        )
    return task

@router.put("/tasks/{task_id}", response_model=TaskRead)
def update_task(
    task_id: int,
    task_update: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a task"""
    task = task_crud.get_by_id(db=db, task_id=task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
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
    task = task_crud.get_by_id(db=db, task_id=task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    project = project_crud.get_by_id(db=db, project_id=task.project_id, owner_id=current_user.id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this task"
        )
    task_crud.delete(db=db, task_id=task_id)
    return {"message": "Task deleted successfully"}
