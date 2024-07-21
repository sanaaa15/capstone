import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database connection configuration
db_config = {
    'host': os.getenv('MYSQL_HOST'),
    'user': os.getenv('MYSQL_USER'),
    'password': os.getenv('MYSQL_PASSWORD'),
    'database': os.getenv('MYSQL_DATABASE')
}

def delete_all_data_and_verify():
    try:
        # Establish a connection to the database
        connection = mysql.connector.connect(**db_config)

        if connection.is_connected():
            cursor = connection.cursor(dictionary=True)

            # Retrieve all tables in the database
            cursor.execute("SHOW TABLES")
            tables = cursor.fetchall()

            # Disable foreign key checks to allow deleting data from all tables
            cursor.execute("SET FOREIGN_KEY_CHECKS = 0")

            # Delete data from all tables
            for table in tables:
                table_name = table[f'Tables_in_{db_config["database"]}']
                print(f"Deleting data from table: {table_name}")
                cursor.execute(f"TRUNCATE TABLE {table_name}")

            # Re-enable foreign key checks
            cursor.execute("SET FOREIGN_KEY_CHECKS = 1")

            # Commit the changes
            connection.commit()

            print("\nAll data has been deleted. Verifying...")

            # Verify deletion by displaying all data
            for table in tables:
                table_name = table[f'Tables_in_{db_config["database"]}']
                print(f"\nData from table: {table_name}")

                # Retrieve all data from the current table
                cursor.execute(f"SELECT * FROM {table_name}")
                rows = cursor.fetchall()

                if rows:
                    # Print column names
                    print(", ".join(rows[0].keys()))

                    # Print rows
                    for row in rows:
                        print(", ".join(str(value) for value in row.values()))
                else:
                    print("No data in this table (successfully deleted)")

    except Error as e:
        print(f"Error: {e}")

    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
            print("\nMySQL connection is closed")

if __name__ == "__main__":
    delete_all_data_and_verify()