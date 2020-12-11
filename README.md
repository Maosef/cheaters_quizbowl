# cheaters_quizbowl
 An interface for playing "cheater's bowl", AKA quizbowl with a search engine. Purpose is to collect data on question answering strategies. Part of research for the [Pinafore group](https://github.com/Pinafore) at UMD.
 
 Frontend is written in React, backend is written in Python (FastAPI).

![user interface](cheaters_bowl.png)

## Features

- Question reading
- Question answering
- Search and view external documents (Wikipedia)
- View sections and subsections
- Keyword search (Ctrl-F)

## Setup

Need: `poetry`, `yarn`, `caddy`

Install dependencies:  
`poetry install`  
In `app`: `yarn install`

Download the QANTA dataset (sqlite database, e.g. `qanta.2018.04.18.sqlite3`) from https://github.com/Pinafore/qb, move it to `backend/data`  
Enter poetry environment: `poetry shell`  
Run script to create tables: `python -m backend.helper_scripts.create_tables`  
Run app: `. ./run_app.sh`  
Access app at http://localhost:3000/  

### What run_app does
Run backend:  
`uvicorn backend.server:app`

Run frontend:  
`yarn start`

Run reverse proxy (enables frontend and backend to communicate):  
`caddy run`

## Architecture

### Frontend
- App
    - Login
    - Dashboard_preloaded: the UI container
        - Navbar
        - AnswerForm
        - QuestionDisplayUntimed: displays the question
        - Searcher: search articles
            - DocumentDisplay: search by keyword

### Backend

`server.py` - main server

Each game is represented by a `GameManager` object. The frontend hits the API, which calls functions from the `GameManager`.

API endpoints
* start_new_game
* advance_question - handles getting the next question, and ending the game. Saves data each time.
* search_wiki_titles
* get_document_text
* answer

