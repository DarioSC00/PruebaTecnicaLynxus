"""Script para agregar columna project_id a tabla comments"""
from sqlalchemy import create_engine, text
from app.core.config import settings

# Crear conexión
engine = create_engine(settings.DATABASE_URL)

# Ejecutar comandos uno por uno
commands = [
    "ALTER TABLE comments MODIFY COLUMN task_id INT NULL",
    "ALTER TABLE comments ADD COLUMN IF NOT EXISTS project_id INT NULL",
    "ALTER TABLE comments ADD INDEX IF NOT EXISTS idx_project_id (project_id)",
]

# Comando de foreign key por separado (puede fallar si ya existe)
fk_command = """
ALTER TABLE comments 
ADD CONSTRAINT fk_comments_project 
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
"""

try:
    with engine.connect() as conn:
        for cmd in commands:
            try:
                conn.execute(text(cmd))
                print(f"✅ Ejecutado: {cmd[:50]}...")
            except Exception as e:
                print(f"⚠️  Ya existe o error: {cmd[:50]}... - {e}")
        
        # Intentar agregar foreign key
        try:
            conn.execute(text(fk_command))
            print("✅ Foreign key agregado")
        except Exception as e:
            print(f"⚠️  Foreign key ya existe o error: {e}")
        
        conn.commit()
        print("\n✅ Tabla comments actualizada exitosamente")
except Exception as e:
    print(f"❌ Error general: {e}")
