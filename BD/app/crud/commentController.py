from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.comment import Comment
from app.schemas.comment import CommentCreate, CommentUpdate
from typing import List, Optional

class CommentCRUD:
    
    def create(self, db: Session, *, obj_in: CommentCreate, author_id: int) -> Comment:
        """Create comment"""
        comment = Comment(
            body=obj_in.body,
            task_id=obj_in.task_id,
            author_id=author_id
        )
        db.add(comment)
        db.commit()
        db.refresh(comment)
        return comment
    
    def get_by_task(self, db: Session, *, task_id: int) -> List[Comment]:
        """Get all comments for a task"""
        return db.query(Comment).filter(Comment.task_id == task_id).all()
    
    def get_by_id(self, db: Session, *, comment_id: int) -> Optional[Comment]:
        """Get comment by ID"""
        return db.query(Comment).filter(Comment.id == comment_id).first()
    
    def delete(self, db: Session, *, comment_id: int, author_id: int) -> bool:
        """Delete comment (only the author can delete it)"""
        comment = db.query(Comment).filter(
            and_(Comment.id == comment_id, Comment.author_id == author_id)
        ).first()
        
        if comment:
            db.delete(comment)
            db.commit()
            return True
        return False

# Instancia global para usar en las rutas
comment_crud = CommentCRUD()