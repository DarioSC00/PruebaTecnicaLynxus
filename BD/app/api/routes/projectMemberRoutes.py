from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.api.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.project import Project
from app.models.project_member import project_members
from app.schemas.userSchema import UserOut
from pydantic import BaseModel

router = APIRouter()


class AddMemberRequest(BaseModel):
    user_id: int


@router.post("/{project_id}/members", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def add_member_to_project(
    project_id: int,
    request: AddMemberRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Add a member to the project (only the owner can do it)"""
    
    # Verify that the project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Verify that the current user is the owner
    if project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the owner can add members")
    
    # Verify that the user to add exists
    user_to_add = db.query(User).filter(User.id == request.user_id).first()
    if not user_to_add:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if already a member
    if user_to_add in project.members:
        raise HTTPException(status_code=400, detail="User is already a project member")
    
    # Add member
    project.members.append(user_to_add)
    db.commit()
    db.refresh(user_to_add)
    
    return user_to_add


@router.get("/{project_id}/members", response_model=List[UserOut])
def get_project_members(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all members of a project"""
    
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Verify that the user has access to the project (is owner or member)
    if current_user.id != project.owner_id and current_user not in project.members:
        raise HTTPException(status_code=403, detail="You don't have access to this project")
    
    return project.members


@router.delete("/{project_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_member_from_project(
    project_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Remove a member from the project (only the owner can do it)"""
    
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Verify that the current user is the owner
    if project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the owner can remove members")
    
    # Don't allow the owner to remove themselves
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Owner cannot be removed from the project")
    
    # Find the user to remove
    user_to_remove = db.query(User).filter(User.id == user_id).first()
    if not user_to_remove:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if they are a member
    if user_to_remove not in project.members:
        raise HTTPException(status_code=400, detail="User is not a project member")
    
    # Remove member
    project.members.remove(user_to_remove)
    db.commit()
    
    return None
