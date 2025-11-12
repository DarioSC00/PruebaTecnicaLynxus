from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

# Database
from app.core.database import get_db

# CRUD operations
from app.crud.commentController import comment_crud
from app.crud.taskController import task_crud
from app.crud.projectController import project_crud

# Schemas
from app.schemas.commentSchema import CommentCreate, CommentUpdate, CommentRead

# Authentication
from app.core.auth import get_current_user
from app.models.user import User

router = APIRouter()


# === RUTAS DE COMENTARIOS POR TAREA ===

@router.get("/tasks/{task_id}/comments", response_model=List[CommentRead])
def get_task_comments(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all comments from a task"""
    task = task_crud.get_by_id(db=db, task_id=task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Verificar permisos: el usuario debe ser owner del proyecto
    project = project_crud.get_by_id(db=db, project_id=task.project_id, owner_id=current_user.id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view comments from this task"
        )

    comments = comment_crud.get_by_task(db=db, task_id=task_id)
    return comments


@router.post("/tasks/{task_id}/comments", response_model=CommentRead, status_code=status.HTTP_201_CREATED)
def create_comment(
    task_id: int,
    comment_in: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new comment on a task"""
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
            detail="You don't have permission to comment on this task"
        )

    comment = comment_crud.create(
        db=db,
        obj_in=comment_in,
        author_id=current_user.id
    )
    return comment


@router.get("/comments/{comment_id}", response_model=CommentRead)
def get_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get comment by ID"""
    comment = comment_crud.get_by_id(db=db, comment_id=comment_id)
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )

    # Verificar permisos: el usuario debe ser owner del proyecto
    task = task_crud.get_by_id(db=db, task_id=comment.task_id)
    project = project_crud.get_by_id(db=db, project_id=task.project_id, owner_id=current_user.id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view this comment"
        )

    return comment


@router.put("/comments/{comment_id}", response_model=CommentRead)
def update_comment(
    comment_id: int,
    comment_update: CommentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a comment (only the author can update)"""
    comment = comment_crud.get_by_id(db=db, comment_id=comment_id)
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )

    if comment.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own comments"
        )

    updated_comment = comment_crud.update(
        db=db,
        comment_id=comment_id,
        obj_in=comment_update
    )
    return updated_comment


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a comment (only the author can delete)"""
    comment = comment_crud.get_by_id(db=db, comment_id=comment_id)
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )

    if comment.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own comments"
        )

    success = comment_crud.delete(db=db, comment_id=comment_id, author_id=current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete comment"
        )

    return {"message": "Comment deleted successfully"}
