#python db_connector.py
#from backend folder should connect to db
import mysql.connector
from core.settings import settings

# Use settings for database connection
mydb = mysql.connector.connect(
    host=settings.DATABASE_HOST.split(':')[0] if ':' in settings.DATABASE_HOST else settings.DATABASE_HOST,
    user=settings.DATABASE_USER,
    password=settings.DATABASE_PASSWORD,
    port=settings.DATABASE_HOST.split(':')[1] if ':' in settings.DATABASE_HOST else '3306',
    database=settings.DATABASE_NAME
)

mycursor = mydb.cursor()
mycursor.execute("SELECT * FROM Users")
data = mycursor.fetchall()
for i in data:
    print("name:", i[1])
    

