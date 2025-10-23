#python db_connector.py
#from backend folder should connect to db
import mysql.connector
mydb = mysql.connector.connect(
    host='localhost',
    user='root',
    password='', #password here
    port='3306',
    database=''#database name
)

mycursor = mydb.cursor()
mycursor.execute("SELECT * FROM Users")
data = mycursor.fetchall()
for i in data:
    print("name:", i[1])
    

