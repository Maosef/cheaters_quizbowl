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
from datetime import datetime

DRQA_RETRIEVER_URL = 'http://127.0.0.1:5000'

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

class ActionRecord(BaseModel):
    data: dict


app = FastAPI()
db = Database()

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


# cache for storing game sessions.
game_sessions = dict()

def get_game_object(current_user: str, username=""):
    print('current user: ', current_user)

    if current_user not in game_sessions:
        game_object = GameManager()
        if username: game_object.state['username'] = username
        game_sessions[current_user] = game_object

        # saved state from disk
        state = db.get_user_state(current_user)
        if state:
            print('loading state from disk...')
            game_object.load(state)
            # print('question number', game_object.state['question_number'])
    else:
        print('loading state from cache...')
        
    return game_sessions[current_user]

# def get_game_object(current_user: str):
#     state = db.get_user_state(current_user)
#     if state:
#         return state
    # if current_user not in game_sessions:
    #     game_sessions[current_user] = GameManager()
    # game_object = game_sessions[current_user]
    # print('current user: ', current_user)
    # return game_sessions[current_user]



def destroy_game_object(current_user: str):
    del game_sessions[current_user]


# endpoints

@app.get("/")
def read_root():
    return {"Hello": "World"}

# get player info from database
@app.get("/get_player_info")
async def get_player_info(username: str, current_user: str = Depends(get_current_user)):

    print(f'cur user: {current_user}')
    game_manager = get_game_object(current_user, username)
    # get state of the game
    return game_manager.state
    # if game_manager.state['packet_finished'] = False:


# start a new game
@app.post("/start_new_game")
async def start_new_game(request: InitRequest, current_user: str = Depends(get_current_user)):

    print(f'cur user: {current_user}, mode: {request.mode}')
    game_manager = get_game_object(current_user)
    # check if game is new or existing
    if game_manager.state['question_number'] == 0:
        game_manager.start_game(request.username, request.mode)
    else: # starting new packet
        game_manager.state['packet_finished'] = False
        
    return game_manager.state

@app.post("/buzz")
def buzz(word_index: int, current_user: str = Depends(get_current_user)):
    game_manager = get_game_object(current_user)
    return game_manager.buzz(word_index)

# answer
@app.post("/answer")
def answer(answer: str, sentence_index: int = -1, current_user: str = Depends(get_current_user)):
    print('answer', answer)
    game_manager = get_game_object(current_user)
    state = game_manager.process_answer(answer, sentence_index)
    return state
    
@app.post("/advance_question")
def advance_question(player_decision = None, skip: bool = False, current_user: str = Depends(get_current_user)):
    print(f'player_decision: {player_decision}, skipped: {skip}')
    game_manager = get_game_object(current_user)
    return game_manager.advance_question(player_decision, skip)

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
def record_evidence(evidence: str, current_user: str = Depends(get_current_user)):
    print(evidence)
    game_manager = get_game_object(current_user)
    game_manager.record_evidence(evidence)
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
def search_tfidf(query: str, limit:int=20, current_user: str = Depends(get_current_user)):
    game_manager = get_game_object(current_user)
    r = requests.get(f"{DRQA_RETRIEVER_URL}/search_pages?query={query}&n_docs={limit}")
    search_results = r.json()
    if r.status_code != requests.codes.ok:
        print("Error in search")
    else:
        game_manager.state['tfidf_search_map']['queries'].append(query)
        game_manager.state['tfidf_search_map']['query_results_map'][query] = [(res['id'], res['page']) for res in search_results]
    return search_results

@app.get("/get_document_passages/{page_title}")
def get_document_passages(page_title: str, current_user: str = Depends(get_current_user)):
    game_manager = get_game_object(current_user)
    r = requests.get(f"{DRQA_RETRIEVER_URL}/get_document_passages/{page_title}")
    if r.status_code != requests.codes.ok:
        print("Error in getting document")

    # print("getting doc: ", r.json()['id'])
    # game_manager.state['tfidf_search_map']['documents_selected'].append(r.json())
    return r.json()

# name, score, questions answered
@app.get("/get_leaderboard")
def get_leaderboard():
    top_players = []
    for user, game_manager in game_sessions.items():
        player_state = game_manager.state
        # packet_scores = player_state['packet_scores'].values()
        packet_scores = player_state['packet_scores']
        filled_scores = [0]*4
        for i,k in enumerate(sorted(packet_scores.keys())):
            filled_scores[i] = packet_scores[k]
        top_players.append({
            'id': player_state['username'],
            'username': player_state['username'], 
            'score': player_state['score'],
            'num_questions': player_state['question_number'],
            'score1': filled_scores[0],
            'score2': filled_scores[1],
            'score3': filled_scores[2],
            'score4': filled_scores[3],
            })
    return top_players

@app.get("/get_players")
def get_players():
    top_players = {}
    for user, game_manager in game_sessions.items():
        top_players[user] = game_manager.state
    return top_players

@app.get("/get_top_scores")
def get_top_scores():
    top_players = {}
    for user, game_manager in game_sessions.items():
        top_players[user] = game_manager.state['score']
    return top_players


# times
@app.get("/get_schedule_info")
def get_schedule_info():
    res = db.get_playing_times()
    print('playing times', res)
    now = datetime.now()
    for interval in res:
        print('interval', interval)
        # datetime.strptime(date_time_str, '%Y-%m-%d %H:%M:%S.%f')
        if now >= datetime.strptime(interval['start_datetime'], '%Y-%m-%d %H:%M:%S') and now <= datetime.strptime(interval['end_datetime'], '%Y-%m-%d %H:%M:%S'):
            print('valid playing time!')
            return {'is_valid_playing_time': True, 'valid_times': res, 'next_end_datetime': interval['end_datetime']}
    return {'is_valid_playing_time': False, 'valid_times': res}



@app.post("/record_action")
def record_action(name: str, action: ActionRecord, current_user: str = Depends(get_current_user)):
    game_manager = get_game_object(current_user)
    game_manager.record_action(name, action.data)

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