from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware
import wikipedia

app = FastAPI()

# CORS stuff
origins = [
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db_path = './question_data/questions.csv'
db = pd.read_csv(db_path) # 20408 rows

@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/get_question/{question_id}")
def read_item(question_id: int):
    row = db.iloc[question_id]
    # print(row)
    return {"question": row['Text'], "answer": row['Answer'], "category":row['Category']}

# search wikipedia
@app.get("/search_wiki")
def search_wikipedia(query: str = "Barack"):
    results = wikipedia.search(query, results = 3)
    summaries = [wikipedia.summary(title) for title in results]
    return {'titles': results, 'summaries': summaries}

# store data
# @app.put("/items/{item_id}")
# def update_item(item_id: int, item: Item):
#     return {"item_name": item.name, "item_id": item_id}