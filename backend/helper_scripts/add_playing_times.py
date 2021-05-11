from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String
from datetime import datetime
import json

engine = create_engine("sqlite:///backend/data/qanta.2018.04.18.sqlite3", echo = True)
meta = MetaData()

playing_times = Table(
   'playing_times', meta, 
    Column('start_datetime', String), 
    Column('end_datetime', String),

)
# meta.create_all(engine) # create table

# clear table
conn = engine.connect()
stmt = playing_times.delete()
conn.execute(stmt)

# add times

start_datetime = datetime(2021,5,5,9,0,0)
end_datetime = datetime(2022,5,5,10,30,0)

# start_datetime = datetime(2021,4,28,9,30,0)
# end_datetime = datetime(2021,4,28,10,30,0)

ins = playing_times.insert().values(start_datetime = start_datetime, end_datetime=end_datetime)
# print(str(ins))
conn = engine.connect()
result = conn.execute(ins)

# select
s = playing_times.select()
# conn = engine.connect()
result = conn.execute(s)
