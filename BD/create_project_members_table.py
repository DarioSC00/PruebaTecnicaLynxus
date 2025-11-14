import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

def create_project_members_table():
    connection = None
    try:
        # Conectar a la base de datos
        connection = mysql.connector.connect(
            host='localhost',
            user='root',
            password='',
            database='lynxus'
        )
        
        if connection.is_connected():
            cursor = connection.cursor()
            print("✅ Conectado a la base de datos")
            
            # Crear tabla project_members
            create_table_query = """
            CREATE TABLE IF NOT EXISTS project_members (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                project_id INT NOT NULL,
                joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
                UNIQUE KEY unique_user_project (user_id, project_id),
                INDEX idx_user_id (user_id),
                INDEX idx_project_id (project_id)
            )
            """
            
            cursor.execute(create_table_query)
            print("✅ Tabla project_members creada exitosamente")
            
            # Migrar datos existentes: agregar owner como miembro de sus proyectos
            migrate_query = """
            INSERT IGNORE INTO project_members (user_id, project_id, joined_at)
            SELECT owner_id, id, created_at
            FROM projects
            """
            
            cursor.execute(migrate_query)
            rows_affected = cursor.rowcount
            print(f"✅ {rows_affected} owners added as members of their projects")
            
            connection.commit()
            print("✅ Migration completed successfully")
            
    except Error as e:
        print(f"❌ Error: {e}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
            print("✅ Connection closed")

if __name__ == "__main__":
    print("🚀 Starting migration for project_members...")
    create_project_members_table()
