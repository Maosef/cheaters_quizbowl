import os
from datetime import datetime
import csv

import wikipedia
import wikipediaapi

import unidecode
import string
import pandas as pd

from typing import Optional
import copy

from backend.database import Database


db = Database()

wiki_wiki = wikipediaapi.Wikipedia('en')
wiki_html = wikipediaapi.Wikipedia(
        language='en',
        extract_format=wikipediaapi.ExtractFormat.HTML
)

# Helper functions

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


## Game manager: # manages the game, records data

class GameManager:
    def __init__(self):
        self.question_data = dict()
        self.documents = []

        self.config = {
            'num_questions': 10,
            'randomize': True,
            # 'question_ids': [16848, 115844, 26626, 53873, 6449, 15469, 102066, 151976, 90037, 181475]
            'question_ids': [],
            # 'data_path': "backend/data/"
        }

        self._num_questions = self.config['num_questions']
        self._randomize = self.config['randomize']
        self._question_ids = self.config['question_ids']
        self._file_name = "backend/data/recorded_game_{}.csv".format(str(datetime.today().date()))
        # self._fieldnames = ['username','session_token','time','question_number','question_id','cur_question','question_data','queries','query_results_map',
        #     'documents_selected',
        #     'cur_doc_selected',
        #     'keyword_searches',
        #     'player_answer',
        #     'answer',
        #     'answer_correct',
        #     'score',
        #     'game_over']
        

        self._username = None
        self._session_token = None
        self.state = {} # changes for each question

        self.game_history = []

    # resets, then starts a new game
    def start_game(self, username: str, session_token: str):

        self.reset()
        self.state
        # self._file_name = "backend/data/recorded_game_{}.csv".format(str(datetime.today()))

        print("starting new game...")
        # get questions
        if self.config['randomize']:
            # for i in range(self._num_questions):
            #     q = db.get_random_question()
            #     # only get questions that have a page field
            #     while not q['page']:
            #         q = db.get_random_question()
            #     self._question_ids.append(q['qanta_id'])
            #     self.question_data[q['qanta_id']] = q
            pass
        else:
            for question_id in self._question_ids:
                question_dict = db.get_question_by_id(question_id)
                question_dict["text"] = question_dict["text"].replace(chr(160), " ")
                self.question_data[question_id] = question_dict
        
        return self.advance_question()

    def save_game(self):
        df = pd.DataFrame(self.game_history)
        df.to_csv(self._file_name)
        print("saved game to {}".format(self._file_name))

    def save_state(self):
        df = pd.DataFrame([self.state])
        df.to_csv(self._file_name, mode='a', header=False)
        print("saved state to {}".format(self._file_name))

    def reset(self):
        print("resetting...")

        self.game_history = []
        # state is organized per question, corresponds to rows
        self.state = {
            'username': self._username,
            'session_token': self._session_token,
            'time': str(datetime.utcnow()),
            'question_number': 0, 
            'question_id': '', 
            'cur_question': '', 
            'question_data': {},

            'queries': [], 
            'query_results_map': {}, # map of query to doc search results
            'documents_selected': [],
            'cur_doc_selected': '',
            'keyword_searches': {}, # map of doc to searches

            'buzz_word_index': -1,
            'player_answer': '', 
            'answer': '',
            'answer_correct': None, 
            'score': 0,
            'game_over': False,
        }
        return True

    # get next question, advance state
    def advance_question(self):

        print('keywords:', self.state['keyword_searches'])
        
        if self.state['question_number'] > 0: # record the current state
            # create log file if it doesn't exist
            if not os.path.exists(self._file_name):
                print('creating new file for today: ', self._file_name)
                df = pd.DataFrame([self.state])
                print(df)
                df.to_csv(self._file_name)
            else:
                # self.game_history.append(copy.deepcopy(self.state))
                self.save_state()
                print('saved state')

        cur_question_number = self.state['question_number'] + 1

        if cur_question_number > self._num_questions:
            print('game finished')
            self.state['game_over'] = True
            return self.state
        
        if self.config['randomize']:
            q = db.get_random_question()
            # only get questions that have a page field
            while not q['page']:
                q = db.get_random_question()
            # self._question_ids.append(q['qanta_id'])
            # self.question_data[q['qanta_id']] = q
            cur_question_id = q['qanta_id']
            cur_question = q
        else:
            cur_question_id = self._question_ids[cur_question_number - 1]
            cur_question = self.question_data[cur_question_id]

        # update state
        self.state['question_number'] = cur_question_number
        self.state['question_id'] = cur_question_id
        self.state['cur_question'] = cur_question['text']
        self.state['question_data'] = cur_question

        self.state['queries'] = []
        self.state['query_results_map'] = {}
        self.state['documents_selected'] = []
        self.state['cur_doc_selected'] = ''
        self.state['keyword_searches'] = {}
        self.state['buzz_word_index'] = -1

        return self.state

    def buzz(self, word_index):
        self.state['buzz_word_index'] = word_index
        return True

    def process_answer(self, player_answer):
        question_id = self.state['question_id']
        ground_truth = self.state['question_data']['page']
        answer_correct = self.answer_match(player_answer, ground_truth)
        self.state['answer_correct'] = answer_correct
        self.state['player_answer'] = player_answer
        self.state['answer'] = ground_truth

        if answer_correct:
            self.state['score'] += 10

        return self.state

    def normalize(self, s):
        return unidecode.unidecode(s).lower().translate(str.maketrans('', '', string.punctuation))
        
    # normalize answers, remove punctuation and whitespace. try prompts?
    def answer_match(self, player_answer, ground_truth):
        print('ANSWERS:', player_answer, ground_truth)

        # if the player answer words overlap with ground truth words
        player_answer_words = map(self.normalize, player_answer.split(' '))
        ground_truth_words = map(self.normalize, ground_truth.split('_'))

        # print(len(set(player_answer_words)), len(set(ground_truth_words)))
        # print(set(player_answer_words) & set(ground_truth_words), len(set(player_answer_words).intersection(set(ground_truth_words))))
        return len(set(player_answer_words) & set(ground_truth_words)) > 0

    def search_document_titles(self, query: str):
        print('searching documents...')
        results = wikipedia.search(query)
        self.state['queries'].append(query)
        self.state['query_results_map'][query] = results
        return results

    # old
    def search_documents(self, query: str):

        results = wikipedia.search(query)
        pages = []
        for title in results:
            page = wiki_html.page(title)
            html, sections = parse_html_string(page.text)
            
            # html = page.summary + html
            page_dict = {"title": page.title, "html":html, "sections":sections}
            pages.append(page_dict)

        self.documents = pages
        return pages

    def get_wiki_document_html(self, page_title: str):
        page = wiki_html.page(page_title)
        html, sections = parse_html_string(page.text)
        
        # html = page.summary + html
        page_dict = {"title": page.title, "html":html, "sections":sections}
        self.state['documents_selected'].append(page_title)
        self.state['cur_doc_selected'] = page_title

        return page_dict

    def get_wiki_document_text(self, page_title: str):
        page = wiki_wiki.page(page_title)
        
        page_dict = {"title": page.title, "text": page.text}
        return page_dict

    def record_keyword_search(self, keywords):
        print('keywords', keywords)
        # cur_doc = self.state['cur_doc_selected']
        self.state['keyword_searches'] = keywords.keywords
