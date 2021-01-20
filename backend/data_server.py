import json
from fastapi import APIRouter
# import time
# from pydantic import BaseModel
import sqlite3
import marshal

# HOTPOTQA_NUM_ROWS = 90447 
HOTPOTQA_NUM_ROWS = 7405
hotpotqa_table_name = 'hotpotqa_dev'
hotpotqa_db_path = '../golden-retriever/hotpotqa.db'

nq_table_name = 'nq_dev'
nq_db_path = '../retrieval-based-baselines/nq.db'

router = APIRouter()


@router.get("/hotpotqa/get_row_by_id/{row_id}")
def get_row_by_id(row_id: str):
    conn = sqlite3.connect(hotpotqa_db_path)
    c = conn.cursor()

    query_str = f'''select * from {hotpotqa_table_name} where _id=?'''
    print('row id', row_id)
    c.execute(query_str, (row_id,))
    doc = c.fetchone()
    print('hotpotqa row: ', doc)

    if doc == None: return None
    else: return {'id':doc[0], 'question':doc[1], 'answer':doc[2]}

@router.get("/hotpotqa/get_random_row")
def get_random_row():
    conn = sqlite3.connect(hotpotqa_db_path)
    c = conn.cursor()

    query_str = f'''SELECT * FROM {hotpotqa_table_name} ORDER BY RANDOM() LIMIT 1;'''
    c.execute(query_str)

    doc = c.fetchone()
    print('hotpotqa row: ', doc)

    return {'id':doc[0], 'question':doc[1], 'answer':doc[2]}


@router.get("/nq/get_row_by_question/{question}")
def get_row_by_id(question: str):
    conn = sqlite3.connect(nq_db_path)
    c = conn.cursor()

    query_str = f'''select * from {nq_table_name} where question=?'''
    c.execute(query_str, (question,))
    doc = c.fetchone()
    print('nq row: ', doc)

    if doc == None: return None
    else: return {'id':doc[0], 'question':doc[1], 'answer':marshal.loads(doc[2])}

@router.get("/nq/get_random_row")
def get_random_row():
    conn = sqlite3.connect(nq_db_path)
    c = conn.cursor()

    query_str = f'''SELECT * FROM {nq_table_name} ORDER BY RANDOM() LIMIT 1;'''
    c.execute(query_str)

    doc = c.fetchone()
    print('nq row: ', doc)

    return {'id':doc[0], 'question':doc[1], 'answer':marshal.loads(doc[2])}


