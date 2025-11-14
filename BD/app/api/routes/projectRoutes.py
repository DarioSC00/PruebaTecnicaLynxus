from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Path, Query
from sqlalchemy.orm import Session
from datetime import datetime
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.crud.projectController import project_crud
from app.schemas.projectSchema import ProjectCreate, ProjectResponse, ProjectUpdate, ProjectOut  
from app.api.dependencies import get_current_active_user  
from app.models.user import User
from app.models.project import Project
from app.models.task import Task
from app.models.comment import Comment

router = APIRouter()

# === RUTAS DE PROYECTOS ===
@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    project_in: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Crear un nuevo proyecto"""
    try:
        project = project_crud.create(
            db=db,
            obj_in=project_in,
            owner_id=current_user.id
        )
        return project
    except Exception as e:
        print(f"❌ Error creando proyecto: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear proyecto: {str(e)}"
        )


@router.get("/", response_model=List[ProjectResponse])
def get_projects(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Obtener lista de proyectos del usuario actual"""
    projects = project_crud.get_all(
        db=db,
        owner_id=current_user.id,
        skip=skip,
        limit=limit,
        search=search
    )
    return projects


# Endpoint GET /{project_id} movido a la línea 136 (read_project)


@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    project_in: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Actualizar proyecto por ID"""
    updated_project = project_crud.update(
        db=db,
        project_id=project_id,
        obj_in=project_in,
        owner_id=current_user.id
    )
    if not updated_project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado"
        )
    return updated_project


@router.delete("/{project_id}", status_code=status.HTTP_200_OK)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Eliminar proyecto por ID"""
    success = project_crud.delete(
        db=db, 
        project_id=project_id, 
        owner_id=current_user.id
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado"
        )
    return {"message": "Proyecto eliminado correctamente"}


@router.get("/user/{user_id}", response_model=List[ProjectResponse])
def get_projects_by_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Obtener proyectos por ID de usuario"""
    projects = project_crud.get_all(db=db, owner_id=user_id)
    return projects


@router.get("/{project_id}", response_model=ProjectOut)
def read_project(
    project_id: int, 
    db: Session = Depends(get_db)
):
    """Obtener proyecto por ID con todas sus tareas"""
    project = db.query(Project).options(
        selectinload(Project.owner),
        selectinload(Project.tasks).selectinload(Task.assignee),
        selectinload(Project.tasks).selectinload(Task.comments).selectinload(Comment.author)
    ).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project
