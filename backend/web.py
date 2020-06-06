from fastapi import FastAPI
# from starlette.middleware.cors import CORSMiddleware
from fastapi.middleware.cors import CORSMiddleware

# from quel import entity
from backend import qanta
from backend import security

import wikipedia

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

# search wikipedia
@app.get("/search_wiki")
def search_wikipedia(query: str, limit: int=8):
    if str:
        results = wikipedia.search(query, results = limit)
        print(results)
        titles, summaries = [], []
        for title in results:
            try:
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
        return {'titles': titles, 'summaries': summaries}


