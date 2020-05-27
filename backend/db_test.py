# import sqlite3
# import os

path = "backend/data/qanta.2018.04.18.sqlite3"

# print(os.path.exists(path))
# conn = sqlite3.connect(path)
# c = conn.cursor()

# c.execute('SELECT * FROM questions LIMIT 10')


from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String
from database import Database, Question, User, Record


db = Database()
from database import Question, User, Record

db.create_all()


# engine = create_engine('sqlite:///' + path, echo = True)
# meta = MetaData()


# users = Table(
#    'users', meta, 
#    Column('email', String, primary_key = True), 
#    Column('password', String), 
# )

# # class User(Base):
# #     __tablename__ = "users"
# #     email = Column(String, primary_key=True)
# #     password = Column(String)

# #     def __str__(self):
# #         return self.email


# meta.create_all(engine)