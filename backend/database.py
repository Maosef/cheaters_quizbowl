from typing import Dict, List, Any
import json
import time
import random
from contextlib import contextmanager
import html

from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    Float,
    create_engine,
    and_,
    MetaData,
    Table,
    Column,
    ForeignKey,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, scoped_session, relationship
from sqlalchemy.orm.scoping import ScopedSession

from backend.log import get_logger
# from log import get_logger

PLAYS_TABLE_NAME = 'plays_dev_2'

log = get_logger(__name__)

Base = declarative_base()  # pylint: disable=invalid-name


class Database:
    def __init__(self, find_questions=True):
        self._engine = create_engine(
            # Separate name to avoid confusing it with the unmodified qanta db
            # "sqlite:///data/quel_db.sqlite3"
            "sqlite:///backend/data/qanta.2018.04.18.sqlite3"
        )  # pylint: disable=invalid-name
        Base.metadata.bind = self._engine

        # gets ids, lets us get random question
        if find_questions:
            with self._session_scope as session:
                self._all_qanta_ids = [
                    r[0] for r in session.query(Question.qanta_id).all()
                ]

        meta = MetaData()
        self.plays = Table(
            PLAYS_TABLE_NAME, meta, 
            Column('username', String, primary_key = True), 
            Column('question_id', String, primary_key = True),
            Column('start_datetime', String, primary_key = True), 
            Column('data', String),
        )

    def create_all(self):
        Base.metadata.create_all(self._engine, checkfirst=True)

    def drop_all(self):
        Base.metadata.drop_all(self._engine)

    def reset_all(self):
        self.drop_all()
        self.create_all()

    @property
    @contextmanager
    def _session_scope(self) -> ScopedSession:
        session = scoped_session(sessionmaker(bind=self._engine))
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    def get_all_qanta_ids(self):
        return self._all_qanta_ids

    def get_random_question(self):
        with self._session_scope as session:
            qanta_id = random.choice(self._all_qanta_ids)
            question = session.query(Question).filter_by(qanta_id=qanta_id).first()
            return question.to_dict()

    def get_question_by_id(self, qanta_id: int):
        with self._session_scope as session:
            question = session.query(Question).filter_by(qanta_id=qanta_id).first()
            return question.to_dict()


    def insert_question_play(self, question_play: dict):

        try:
            serialized = json.dumps(question_play)
            insert_params = {
                'username': question_play['username'], 
                'question_id': question_play['question_id'], 
                'start_datetime': question_play['start_datetime'],
                'data': serialized}

            ins = self.plays.insert()
            ins = self.plays.insert().values(**insert_params)
            conn = self._engine.connect()
            result = conn.execute(ins)
        
        except Exception as e:
            print(f'error while writing question play: {e}')

    # def write_questions(self, questions: Dict[str, Any]):
    #     start = time.time()

    #     with self._session_scope as session:
    #         question_list = []
    #         for question in questions:
    #             question["tokenizations"] = str(question["tokenizations"])
    #             question["tokens"] = json.dumps(question["tokens"])
    #             question_list.append(question)
    #         session.bulk_insert_mappings(Question, question_list)
    #     log.info("Took %s time to write questions", time.time() - start)

    def write_answer_data(self, answer_data):
        print(answer_data)
        # print(answer_data['session_id'])
        with self._session_scope as session:
            session.bulk_insert_mappings(
                Record, [answer_data]
            )
            return True
        
    def get_password(self, email):
        with self._session_scope as session:
            results = session.query(User).filter(User.email == email).first()
            if results:
                return results.password
            return None

    # registration
    def insert_email_password(self, email, password):
        with self._session_scope as session:
            if not session.query(User).filter(User.email == email).first():
                session.bulk_insert_mappings(
                    User, [{"email": email, "password": password}]
                )
                return True
            return False

    # easy registration
    def insert_user_password(self, user_id, password):
        with self._session_scope as session:
            if not session.query(User).filter(User.user_id == user_id).first():
                session.bulk_insert_mappings(
                    User, [{"user_id": user_id, "password": password}]
                )
                return True
            return False

    def insert_session(self, user_id, session_id):
        with self._session_scope as session:
            # if not session.query(User).filter(User.user_id == user_id).first():
            session.bulk_insert_mappings(
                Session, [{"user_id": user_id, "session_id": session_id}]
            )
            return True

    def reset_users(self):
        with self._session_scope as session:
            session.query(User).filter(User.password != "").delete()


class Question(Base):
    __tablename__ = "questions"
    qanta_id = Column(Integer, primary_key=True)
    text = Column(String)
    first_sentence = Column(String)
    tokenizations = Column(String)
    answer = Column(String)
    page = Column(String)
    fold = Column(String)
    gameplay = Column(Boolean)
    category = Column(String)
    subcategory = Column(String)
    tournament = Column(String)
    difficulty = Column(String)
    year = Column(Integer)
    proto_id = Column(Integer)
    qdb_id = Column(Integer)
    dataset = Column(String)
    # tokens = Column(String)
    

    def from_dict(self, d):
        for k in d:
            setattr(self, k, d[k])

    def to_dict(self):
        return {
            "qanta_id": self.qanta_id,
            "text": self.text,
            "tokenizations": json.loads(self.tokenizations),
            "answer": self.answer,
            "page": self.page,
            "fold": self.fold,
            "gameplay": self.gameplay,
            "category": self.category,
            "subcategory": self.subcategory,
            "tournament": self.tournament,
            "difficulty": self.difficulty,
            "year": self.year,
            "proto_id": self.proto_id,
            "qdb_id": self.proto_id,
            "dataset": self.dataset,
            # "tokens": json.loads(self.tokens),
        }

class User(Base):
    __tablename__ = "users"
    user_id = Column(String, primary_key=True)
    password = Column(String)
    sessions = relationship('Session')

    def __str__(self):
        return self.user_id

# record_question_table = Table('record_question_table', Base.metadata,
#     Column('record_id', String, ForeignKey('questions.qanta_id')),
#     Column('question_id', Integer, ForeignKey('records.record_id'))
# )

class Session(Base): # data on a single session
    __tablename__ = "sessions"

    session_id = Column(String, primary_key=True)
    user_id = Column(String,ForeignKey('users.user_id'))
    records = relationship('Record')

class Record(Base): # a single question attempt during a session
    __tablename__ = "records"
    
    record_id = Column(Integer, primary_key=True)
    # user_id = Column(Integer,ForeignKey('users.user_id'))
    session_id = Column(String, ForeignKey('sessions.session_id'))
    # question_id = relationship('Question', secondary=record_question_table)
    question_id = Column(Integer, ForeignKey('questions.qanta_id'))
    answer = Column(String)
    query = Column(String)
    evidence = Column(String)
    stop_position = Column(Integer)

    

