from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# from quel import entity
from backend import qanta
from backend import security

import wikipedia
import wikipediaapi

wiki_wiki = wikipediaapi.Wikipedia('en')
wiki_html = wikipediaapi.Wikipedia(
        language='en',
        extract_format=wikipediaapi.ExtractFormat.HTML
)

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

# helper functions

# create html string, nested section dictionary
def parse_sections(sections, level=1):
    html = ""
    parsed_sections = []

    for s in sections:
        html += """<h{} id=\"{}\">{}</h{}>
<p>{}</p>
""".format(level,s.title,s.title,level,s.text)
#             print("%s: %s - %s" % ("*" * (level + 1), s.title, s.text[0:40]))
        inner_html, inner_parsed_sections = parse_sections(s.sections, level + 1)
        html += inner_html
        parsed_sections.append({'title':s.title, 'sections':inner_parsed_sections})
    return html, parsed_sections

def parse_html_string(html_text):

    return html_text, []


QUESTION_IDS = [181475, 16848, 115844, 26626, 53873, 6449, 15469, 102066, 151976, 90037]

class GameManager:
    def __init__(self):
        self.question_ids = QUESTION_IDS
        self.questions = dict()
        self.states = []

        self.state = {'cur_question': '', 'actions': [], 'answer': '', 'correct': None}

    # pull question data
    def start_game(self):

        for question_id in self.question_ids:
            question_dict = db.get_question_by_id(qanta_id)
            question_dict["text"] = question_dict["text"].replace(chr(160), " ")
            self.questions[question_id] = question_dict

    def process_answer(self, question_id, player_answer):
        ground_truth = self.questions[question_id]['answer']
        if player_answer == ground_truth:
            return True
        else:
            return False


game_manager = GameManager() 

# endpoints

@app.get("/")
def read_root():
    return {"Hello": "World"}

# get question ids
@app.get("/get_question")
def get_question_list():
    return QUESTION_IDS

# get document
@app.get("/get_document")
def get_document(title: str):
    return

# answer
@app.post("/answer")
def answer(question_id: str, answer: str):
    result = game_manager.process_answer(question_id, answer)
    return result

# search wikipedia. get clean html
@app.get("/search_wiki")
def search_wikipedia_html(query: str, limit=None):
    
    # results = wikipedia.search(query, results = limit)
    results = wikipedia.search(query)
    print(results)
    pages = []
    for title in results:
        try:
            page = wiki_html.page(title)
            html, sections = parse_html_string(page.text)
            
            # html = page.summary + html
            page_dict = {"title": page.title, "html":html, "sections":sections}
            pages.append(page_dict)

        except wikipedia.exceptions.DisambiguationError as e:
            print(title, "DisambiguationError")
            print(e.options)
            continue
        except wikipedia.exceptions.PageError:
            print(title, "PageError")
            continue
    return {'error': False, 'pages': pages}

# search wikipedia. create html from sections
@app.get("/search_wiki")
def search_wikipedia_sections(query: str, limit: int=8):
    
    # results = wikipedia.search(query, results = limit)
    results = wikipedia.search(query)
    print(results)
    pages = []
    for title in results:
        try:
            page = wiki_wiki.page(title)
            # page = wikipedia.page(title)

            html, sections = parse_sections(page.sections)
            
            html = page.summary + html
            page_dict = {"title": page.title, "html":html, "sections":sections}
            pages.append(page_dict)

        except wikipedia.exceptions.DisambiguationError as e:
            print(title, "DisambiguationError")
            print(e.options)
            continue
        except wikipedia.exceptions.PageError:
            print(title, "PageError")
            continue
    return {'error': False, 'pages': pages}


# search wikipedia
@app.get("/search_wiki_old")
def search_wikipedia_old(query: str, limit: int=8):
    
    results = wikipedia.search(query, results = limit)
    print(results)
    titles, summaries = [], []
    for title in results:
        try:
            # page = wiki_wiki.page(title)
            page = wikipedia.page(title)
            # summaries.append(wikipedia.summary(title))
            # print(page.content)
            summaries.append(page.content)
            titles.append(title)
        except wikipedia.exceptions.DisambiguationError as e:
            print(title, "DisambiguationError")
            print(e.options)
            continue
        except wikipedia.exceptions.PageError:
            print(title, "PageError")
            continue
    # summaries = [wikipedia.summary(title) for title in results]
    print(len(titles), len(summaries))
    return {'error': False, 'titles': titles, 'summaries': summaries}


