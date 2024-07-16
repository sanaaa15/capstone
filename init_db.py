import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv
import os

load_dotenv()

db_config = {
    'host': os.getenv('MYSQL_HOST'),
    'user': os.getenv('MYSQL_USER'),
    'password': os.getenv('MYSQL_PASSWORD'),
    'database': os.getenv('MYSQL_DATABASE')
}

def init_db():
    try:
        connection = mysql.connector.connect(**db_config)
        if connection.is_connected():
            cursor = connection.cursor()

            # Create users table
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INT NOT NULL AUTO_INCREMENT,
                full_name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                UNIQUE KEY (email)
            )
            ''')

            # Create measurements table
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS measurements (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                user_id INT DEFAULT NULL,
                height DECIMAL(5,2) DEFAULT NULL,
                shoulder_width DECIMAL(5,2) DEFAULT NULL,
                arm_length DECIMAL(5,2) DEFAULT NULL,
                neck DECIMAL(5,2) DEFAULT NULL,
                wrist DECIMAL(5,2) DEFAULT NULL,
                chest DECIMAL(5,2) DEFAULT NULL,
                waist DECIMAL(5,2) DEFAULT NULL,
                hip DECIMAL(5,2) DEFAULT NULL,
                thigh DECIMAL(5,2) DEFAULT NULL,
                ankle DECIMAL(5,2) DEFAULT NULL,
                created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                UNIQUE KEY (id)
            )
            ''')

            print("Database tables created successfully")

    except Error as e:
        print(f"Error: {e}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
            print("MySQL connection is closed")

if __name__ == "__main__":
    init_db()