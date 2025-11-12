from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Importar routers existentes
from app.api.routes import userRoutes, projectRoutes, taskRoutes, commentRoutes

app = FastAPI(title="API PruebaTecnicaLynxus")

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(userRoutes.router, prefix="/users", tags=["users"])
app.include_router(projectRoutes.router, prefix="/projects", tags=["projects"])
app.include_router(taskRoutes.router, prefix="/tasks", tags=["tasks"])
app.include_router(commentRoutes.router, prefix="/comments", tags=["comments"])

@app.get("/", tags=["health"])
def read_root():
    return {"message": "API PruebaTecnicaLynxus OK"}
