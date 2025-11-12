from fastapi import FastAPI
from app.core.database import Base, engine
# importa routers existentes
from app.api.routes import userRoutes, projectRoutes, taskRoutes, commentRoutes

app = FastAPI(title="Tasks API")

# opcional en dev: crear tablas si no usas Alembic
Base.metadata.create_all(bind=engine)

app.include_router(userRoutes.router, prefix="/auth", tags=["auth"])
app.include_router(projectRoutes.router, prefix="/projects", tags=["projects"])
app.include_router(taskRoutes.router, prefix="/tasks", tags=["tasks"])
app.include_router(commentRoutes.router, prefix="/comments", tags=["comments"])