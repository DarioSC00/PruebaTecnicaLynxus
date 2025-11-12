from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import userRoutes  # importa tus routers reales

# Añadir estas líneas para asegurarse que todos los modelos se registren:
from app.models import user as _user  # importa por side-effect
from app.models import project as _project
from app.models import task as _task
from app.models import comment as _comment

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,            # en desarrollo puedes usar ["*"] temporalmente
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# incluir el router de usuarios con prefijo /users (asegúrate que userRoutes define `router`)
app.include_router(userRoutes.router, prefix="/users", tags=["users"])

# luego incluir otros routers
# app.include_router(projectRoutes.router, prefix="/projects", tags=["projects"])
# app.include_router(taskRoutes.router, prefix="/tasks", tags=["tasks"])
# app.include_router(commentRoutes.router, prefix="/comments", tags=["comments"])

# (opcional) crear tablas si no lo haces en otra parte
# Base.metadata.create_all(bind=engine)