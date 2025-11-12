from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.models.task import Task

from app.schemas.taskSchema import TaskCreate, TaskUpdate
from typing import List, Optional

class TaskCRUD:

    def create(self, db: Session, *, obj_in: TaskCreate, owner_id: int) -> Project:
        """Crear una nueva tarea"""
        task = Project(
            name=obj_in.name,                    # 🔧 name, no title
            description=obj_in.description,
            owner_id=owner_id                    # 🔧 owner_id, no author_id
        )
        db.add(task)
        db.commit()
        db.refresh(task)
        return task
    def get_all(self, db: Session, *, owner_id: int, skip: int = 0, limit: int = 100, search: str = None) -> List[Project]:
        """Obtener todas las tareas del usuario con paginación y búsqueda"""
        query = db.query(Project).filter(
            and_(Project.owner_id == owner_id, Project.archived == False)
        )
        
        # Búsqueda por nombre
        if search:
            query = query.filter(Project.name.ilike(f"%{search}%"))
        
        return query.offset(skip).limit(limit).all()
    def get_by_id(self, db: Session, *, project_id: int, owner_id: int) -> Optional[Project]:
        """Obtener tarea por ID (solo del owner)"""
        return db.query(Project).filter(
            and_(Project.id == project_id, Project.owner_id == owner_id)
        ).first()
    def update(self, db: Session, *, project_id: int, obj_in: TaskUpdate, owner_id: int) -> Optional[Project]:
        """Actualizar tarea"""
        task = db.query(Project).filter(
            and_(Project.id == project_id, Project.owner_id == owner_id)
        ).first()
        
        if task:
            update_data = obj_in.dict(exclude_unset=True)  # Solo campos que se enviaron
            for field, value in update_data.items():
                setattr(task, field, value)
            
            db.commit()
            db.refresh(task)
            return task
        return None
    def archive(self, db: Session, *, project_id: int, owner_id: int) -> bool:
        """Archivar tarea (soft delete)"""
        task = db.query(Project).filter(
            and_(Project.id == project_id, Project.owner_id == owner_id)
        ).first()

        if task:
            task.archived = True
            db.commit()
            return True
        return False
# Instancia global para usar en las rutas
task_crud = TaskCRUD()