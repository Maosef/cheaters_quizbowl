from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.database import Database
from backend import qanta
from backend import security
from backend.security import get_current_user
from backend import data_server

# from backend.game_manager_utils import GameManager 
from backend.game_manager_generic import GameManager 

import wikipedia
import wikipediaapi

from typing import Optional
import copy
import requests


class InitRequest(BaseModel):
    username: str
    session_token: Optional[str] = ''
    mode: Optional[str] = ''
    # data: Optional[dict] = None

class Keywords(BaseModel):
    keywords: dict
    passage_keywords_map: dict

class Evidence(BaseModel):
    evidence: list

class Answer(BaseModel):
    answer: str
    sentence_index: int

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
app.include_router(data_server.router)


# todo: allow managing multiple game sessions at once
game_sessions = dict()
# game_manager = GameManager() 

def get_game_object(current_user: str):
    if current_user not in game_sessions:
        game_sessions[current_user] = GameManager()
    game_object = game_sessions[current_user]
    print('current user: ', current_user)
    return game_sessions[current_user]

def destroy_game_object(current_user: str):
    del game_sessions[current_user]


# endpoints

@app.get("/")
def read_root():
    return {"Hello": "World"}

# start a new game
@app.post("/start_new_game")
async def start_new_game(request: InitRequest, current_user: str = Depends(get_current_user)):

    print(f'cur user: {current_user}, mode: {request.mode}')
    game_manager = get_game_object(current_user)
    # remember the state of the game
    if 'mode' not in game_manager.state or game_manager.state['mode'] != request.mode:
        game_manager.start_game(current_user, request.mode)
    return game_manager.state

@app.post("/buzz")
def buzz(word_index: int, current_user: str = Depends(get_current_user)):
    game_manager = get_game_object(current_user)
    return game_manager.buzz(word_index)

# answer
@app.post("/answer")
def answer(answer: str, context: str, sentence_index: int = -1, current_user: str = Depends(get_current_user)):
    print('answer', answer)
    game_manager = get_game_object(current_user)
    state = game_manager.process_answer(answer, sentence_index)
    return state
    
@app.post("/advance_question")
def advance_question(player_decision = None, current_user: str = Depends(get_current_user)):
    print('player_decision', player_decision)
    game_manager = get_game_object(current_user)
    return game_manager.advance_question(player_decision)

# get question ids
@app.get("/get_question_ids")
def get_question_list(current_user: str = Depends(get_current_user)):
    game_manager = get_game_object(current_user)
    return game_manager.question_ids

# get document
@app.get("/get_document_text")
def get_document_text(title: str, current_user: str = Depends(get_current_user)):
    game_manager = get_game_object(current_user)
    return game_manager.get_wiki_document_text(title)

# get document
@app.get("/get_document_html")
def get_document_html(title: str, current_user: str = Depends(get_current_user)):
    print("get doc endpoint")
    game_manager = get_game_object(current_user)
    return game_manager.get_wiki_document_html(title)

@app.post("/record_keyword_search")
def record_keyword_search(keywords: Keywords, current_user: str = Depends(get_current_user)):
    print(keywords)
    game_manager = get_game_object(current_user)
    game_manager.record_keyword_search(keywords.keywords, 'full')
    game_manager.record_keyword_search(keywords.passage_keywords_map, 'passage')
    return game_manager.state

@app.post("/record_evidence")
def record_evidence(evidence: Evidence, current_user: str = Depends(get_current_user)):
    print(evidence)
    game_manager = get_game_object(current_user)
    game_manager.record_evidence(evidence.evidence)
    return game_manager.state


# search wikipedia. get titles
@app.get("/search_wiki_titles")
def search_wikipedia_titles(query: str, limit=None, current_user: str = Depends(get_current_user)):
    game_manager = get_game_object(current_user)
    return game_manager.search_document_titles(query)

# search wikipedia. get clean html
@app.get("/search_wiki")
def search_wikipedia_html(query: str, limit=None, current_user: str = Depends(get_current_user)):
    game_manager = get_game_object(current_user)
    pages = game_manager.search_documents(query)
    return {'error': False, 'pages': pages}


# TF-IDF index
@app.get("/search_tfidf")
def search_tfidf(query: str, limit:int=10, current_user: str = Depends(get_current_user)):
    game_manager = get_game_object(current_user)
    r = requests.get(f"http://127.0.0.1:5000/search_passages?query={query}&n_docs={limit}")
    if r.status_code != requests.codes.ok:
        print("Error in search")
    else:
        search_results = r.json()
        game_manager.state['tfidf_search_map']['queries'].append(query)
        game_manager.state['tfidf_search_map']['query_results_map'][query] = [(res['id'], res['page']) for res in search_results]
    return search_results

@app.get("/get_document_by_id/{doc_id}")
def get_document_by_id(doc_id: int, current_user: str = Depends(get_current_user)):
    game_manager = get_game_object(current_user)
    r = requests.get(f"http://127.0.0.1:5000/get_document_by_id/{doc_id}")
    if r.status_code != requests.codes.ok:
        print("Error in getting document")
    else:
        print("getting doc: ", r.json()['id'])
        game_manager.state['tfidf_search_map']['documents_selected'].append(r.json())
    return r.json()


@app.get("/get_players")
def get_players():
    top_players = {}
    for user, game_manager in game_sessions.items():
        top_players[user] = game_manager.state['score']
    return top_players

@app.post("/record_action")
def record_action(name: str, current_user: str = Depends(get_current_user)):
    game_manager = get_game_object(current_user)
    game_manager.record_action(name)

    return True

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