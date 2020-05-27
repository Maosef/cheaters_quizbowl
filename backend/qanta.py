import json
from fastapi import APIRouter
from backend.database import Database
# import backend.security as security
# import time
from pydantic import BaseModel


class Answer(BaseModel):
    session_id: str
    # email: str = None
    question_id: int
    answer: str
    query: str
    evidence: str
    stop_position: int

db = Database()
router = APIRouter()


@router.get("/api/qanta/v1/random")
def get_random_question():
    return db.get_random_question()


@router.get("/api/qanta/v1/{qanta_id}")
def get_question(qanta_id: int):

    question_dict = db.get_question_by_id(qanta_id)

    question_dict["text"] = question_dict["text"].replace(chr(160), " ")
    entity_list, entity_locations, _ = db.get_entities(qanta_id)

    question_dict["entities"] = entity_list
    question_dict["entity_locations"] = entity_locations

    return question_dict


# @router.get("/api/qanta/autocorrect/{text}")
# def autocorrect(text: str):
#     return db.get_autocorrect(text)

@router.post("/api/qanta/v1/post_data")
def post_data(answer_data: Answer):
    db.write_answer_data(answer_data.dict())
    return