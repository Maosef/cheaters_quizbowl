from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.database import Database
from backend import qanta
from backend import security
from backend.game_manager_utils import GameManager 

import wikipedia
import wikipediaapi

from typing import Optional
import copy
import requests


class PlayerRequest(BaseModel):
    username: Optional[str] = None
    session_token: Optional[str] = None
    # data: Optional[dict] = None

class Keywords(BaseModel):

    keywords: Optional[dict] = None

app = FastAPI()
origins = [
    "http://localhost:8000",
    "http://localhost:3000",
    "http://localhost:2020",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex="https://.*\.ngrok\.io",
    allow_credentials=True,
    allow_methods=["*", "POST"],
    allow_headers=["*", "POST"],
)

# app.include_router(qanta.router, prefix="/api/qanta/v1")
app.include_router(security.router, prefix="/token")
app.include_router(qanta.router)
# app.include_router(search_engine.router, prefix="/search")



QUESTION_IDS = [16848, 115844, 26626, 53873, 6449, 15469, 102066, 151976, 90037, 181475]

# todo: allow managing multiple game sessions at once
games = dict()
game_manager = GameManager() 

# endpoints

@app.get("/")
def read_root():
    return {"Hello": "World"}

# start a new game
@app.post("/start_new_game")
def start_new_game(player_request: PlayerRequest):

    # print(player_request)
    game_manager.start_game(player_request.username, player_request.session_token)
    return game_manager.state

@app.post("/buzz")
def buzz(word_index: int):
    return game_manager.buzz(word_index)

# answer
@app.post("/answer")
def answer(answer: str):
    state = game_manager.process_answer(answer)
    return state
    
@app.post("/advance_question")
def advance_question():
    return game_manager.advance_question()

# get question ids
@app.get("/get_question_ids")
def get_question_list():
    return game_manager.question_ids

# get document
@app.get("/get_document_text")
def get_document_text(title: str):
    return game_manager.get_wiki_document_text(title)

# get document
@app.get("/get_document_html")
def get_document_html(title: str):
    print("get doc endpoint")
    return game_manager.get_wiki_document_html(title)

@app.post("/record_keyword_search")
def record_keyword_search(keywords: Keywords):
    game_manager.record_keyword_search(keywords)
    return game_manager.state

# search wikipedia. get titles
@app.get("/search_wiki_titles")
def search_wikipedia_titles(query: str, limit=None):
    
    return game_manager.search_document_titles(query)

# search wikipedia. get clean html
@app.get("/search_wiki")
def search_wikipedia_html(query: str, limit=None):
    
    pages = game_manager.search_documents(query)
    return {'error': False, 'pages': pages}


# TF-IDF index
@app.get("/search_tfidf")
def search_tfidf(query: str, limit=None):
    
    r = requests.get(f"http://127.0.0.1:5000/search_passages?query={query}")
    if r.status_code != requests.codes.ok:
        print("Error")
    return r.json()

@app.get("/get_document_by_id/{doc_id}")
def get_document_by_id(doc_id: int):
    
    r = requests.get(f"http://127.0.0.1:5000/get_document_by_id/{doc_id}")
    if r.status_code != requests.codes.ok:
        print("Error")
    return r.json()


# search wikipedia. create html from sections
# @app.get("/search_wiki_sections")
# def search_wikipedia_sections(query: str, limit: int=8):
    
#     # results = wikipedia.search(query, results = limit)
#     results = wikipedia.search(query)
#     print(results)
#     pages = []
#     for title in results:
#         try:
#             page = wiki_wiki.page(title)
#             # page = wikipedia.page(title)

#             html, sections = parse_sections(page.sections)
            
#             html = page.summary + html
#             page_dict = {"title": page.title, "html":html, "sections":sections}
#             pages.append(page_dict)

#         except wikipedia.exceptions.DisambiguationError as e:
#             print(title, "DisambiguationError")
#             print(e.options)
#             continue
#         except wikipedia.exceptions.PageError:
#             print(title, "PageError")
#             continue
#     return {'error': False, 'pages': pages}




