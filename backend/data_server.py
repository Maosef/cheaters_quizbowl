import json
from fastapi import APIRouter
# from backend.database import Database
# import backend.security as security
# import time
# from pydantic import BaseModel
import sqlite3

HOTPOTQA_NUM_ROWS = 90447 

db_path = '../golden-retriever/hotpotqa.db'
router = APIRouter()


@router.get("/hotpotqa/get_row_by_id/{row_id}")
def get_row_by_id(row_id: str):
    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    query_str = f'''select * from hotpotqa where _id={row_id}'''
    c.execute(query_str)

    doc = c.fetchone()
    print('hotpotqa row: ', doc)

    return {'id':doc[0], 'question':doc[1], 'answer':doc[2]}

@router.get("/hotpotqa/get_random_row")
def get_random_row():
    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    query_str = f'''SELECT * FROM hotpotqa ORDER BY RANDOM() LIMIT 1;'''
    c.execute(query_str)

    doc = c.fetchone()
    print('hotpotqa row: ', doc)

    return {'id':doc[0], 'question':doc[1], 'answer':doc[2]}
