from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# from quel import entity
from backend import qanta
from backend import security

import wikipedia
import wikipediaapi

wiki_wiki = wikipediaapi.Wikipedia('en')

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

# app.include_router(entity.router, prefix="/api/entity/v1")
# app.include_router(qanta.router, prefix="/api/qanta/v1")
app.include_router(security.router, prefix="/token")
app.include_router(qanta.router)


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


# endpoints

@app.get("/")
def read_root():
    return {"Hello": "World"}

# search wikipedia
@app.get("/search_wiki")
def search_wikipedia(query: str, limit: int=8):
    
    # results = wikipedia.search(query, results = limit)
    results = wikipedia.search(query)
    print(results)
    pages = []
    for title in results:
        try:
            page = wiki_wiki.page(title)
            # page = wikipedia.page(title)

            html, sections = parse_sections(page.sections)
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


