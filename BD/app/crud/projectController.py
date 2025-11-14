from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.models.project import Project
from app.schemas.projectSchema import ProjectCreate, ProjectUpdate

from typing import List, Optional

class ProjectCRUD:

    def create(self, db: Session, *, obj_in: ProjectCreate, owner_id: int) -> Project:
        """Create a new project"""
        project = Project(
            name=obj_in.name,                  
            description=obj_in.description,
            owner_id=owner_id                    
        )
        db.add(project)
        db.commit()
        db.refresh(project)
        return project

    def get_all(self, db: Session, *, owner_id: int, skip: int = 0, limit: int = 100, search: str = None) -> List[Project]:
        """Get all projects for the user with pagination and search"""
        query = db.query(Project).filter(
            and_(Project.owner_id == owner_id, Project.archived == False)
        )
        
        # Search by name
        if search:
            query = query.filter(Project.name.ilike(f"%{search}%"))
        
        return query.offset(skip).limit(limit).all()

    def get_by_id(self, db: Session, *, project_id: int, owner_id: int) -> Optional[Project]:
        """Get project by ID (only for the owner)"""
        return db.query(Project).filter(
            and_(Project.id == project_id, Project.owner_id == owner_id)
        ).first()

    def update(self, db: Session, *, project_id: int, obj_in: ProjectUpdate, owner_id: int) -> Optional[Project]:
        """Update project"""
        project = db.query(Project).filter(
            and_(Project.id == project_id, Project.owner_id == owner_id)
        ).first()
        
        if project:
            update_data = obj_in.dict(exclude_unset=True)  # Only fields that were sent
            for field, value in update_data.items():
                setattr(project, field, value)
            
            db.commit()
            db.refresh(project)
            return project
        return None

    def archive(self, db: Session, *, project_id: int, owner_id: int) -> bool:
        """Archive project (soft delete)"""
        project = db.query(Project).filter(
            and_(Project.id == project_id, Project.owner_id == owner_id)
        ).first()
        
        if project:
            project.archived = True
            db.commit()
            return True
        return False

    def delete(self, db: Session, *, project_id: int, owner_id: int) -> bool:
        """Delete project permanently (only the owner)"""
        project = db.query(Project).filter(
            and_(Project.id == project_id, Project.owner_id == owner_id)
        ).first()
        
        if project:
            db.delete(project)
            db.commit()
            return True
        return False

    def count_total(self, db: Session, *, owner_id: int, search: str = None) -> int:
        """Count total projects for pagination"""
        query = db.query(Project).filter(
            and_(Project.owner_id == owner_id, Project.archived == False)
        )
        
        if search:
            query = query.filter(Project.name.ilike(f"%{search}%"))
        
        return query.count()

# Instancia global para usar en las rutas
project_crud = ProjectCRUD()