import os
from datetime import datetime
import csv

import wikipedia
import wikipediaapi

import json
import unidecode
import string
import requests
# import pandas as pd

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

# get question API
def get_question_by_id(question_id: str, dataset_name: str):

    if dataset_name == 'qanta':
        qanta_row = db.get_question_by_id(question_id)
        qanta_row["text"] = qanta_row["text"].replace(chr(160), " ")
        question_dict = {'id': qanta_row['qanta_id'], 'question': qanta_row['text'], 'answer': qanta_row['page']}
    elif dataset_name == 'hotpotqa':
        r = requests.get(f"http://127.0.0.1:8000/hotpotqa/get_row_by_id/{question_id}")
        if r.status_code != requests.codes.ok:
            print("Error")
        hotpotqa_row = r.json()
        print('hotpotqa_row', hotpotqa_row)
        question_dict = hotpotqa_row
    return question_dict

def get_random_question(dataset_name: str):

    if dataset_name == 'qanta' or dataset_name == 'qanta_2':
        qanta_row = db.get_random_question()
        if dataset_name == 'qanta_2':
            sentence_tokenizations = qanta_row["tokenizations"]
            qanta_row["text"] = qanta_row["text"][:sentence_tokenizations[1][1]]
            
        qanta_row["text"] = qanta_row["text"].replace(chr(160), " ")
        question_dict = {'id': qanta_row['qanta_id'], 'question': qanta_row['text'], 'answer': qanta_row['page']}
    elif dataset_name == 'hotpotqa':
        r = requests.get(f"http://127.0.0.1:8000/hotpotqa/get_random_row")
        if r.status_code != requests.codes.ok:
            print("Error")
        hotpotqa_row = r.json()
        print('hotpotqa_row', hotpotqa_row)
        question_dict = hotpotqa_row
    elif dataset_name == 'nq':
        r = requests.get(f"http://127.0.0.1:8000/nq/get_random_row")
        if r.status_code != requests.codes.ok:
            print("Error")
        row = r.json()
        print('nq_row', row)
        question_dict = row
    return question_dict


## Game manager: # manages the game, records data

class GameManager:
    def __init__(self):
        self.question_data = dict()
        self.documents = []

        '''
        dataset:
        - qanta
        - qanta_2: first 2 sentences of qanta
        - nq: natural questions
        - hotpotqa

        multiple_answers: when answer is a list of valid answers, used for NQ
        randomize: whether to give random questions
        '''
        self.config = {
            'dataset': 'qanta_2',
            'num_questions': 20,
            'multiple_answers': False,
            'randomize': True,
            # 'question_ids': [16848, 115844, 26626, 53873, 6449, 15469, 102066, 151976, 90037, 181475]
            'question_ids': ['5adf04c95542993a75d263d5',
                            '5ae497595542995ad6573db7',
                            '5ae6914755429908198fa627',
                            '5ade450b5542997c77adedc5',
                            '5ae6050f55429929b0807a5e',
                            '5ade9c9355429975fa854f1b',
                            '5a8b71915542995d1e6f1393',
                            '5ae5e881554299546bf82fbb',
                            '5a8ece2e5542995085b37497',
                            '5a8e3e9b5542995085b37402',
                            '5a825a9d55429940e5e1a870',
                            '5ae0ba1155429924de1b7156',
                            '5adf744d5542992d7e9f937e',
                            '5ae685fd5542996d980e7bda',
                            '5a75a76b5542992db9473697',
                            '5ac2a399554299218029dada',
                            '5a7631c05542994ccc91870b',
                            '5adcb0ab5542994d58a2f69a',
                            '5a86edcc55429960ec39b6da',
                            '5a76a0005542993569682c64']
            # 'data_path': "backend/data/"
        }

        self._num_questions = self.config['num_questions']
        self._randomize = self.config['randomize']
        self._question_ids = self.config['question_ids']
        self._file_name = "backend/data/recorded_game_{}.jsonl".format(str(datetime.today().date()))

        self._username = None
        self._session_token = None
        self.state = {} # changes for each question

        self.game_history = []

    # resets, then starts a new game
    def start_game(self, username: str, session_token: str):

        self.reset()
        self._file_name = "backend/data/recorded_game_{}.jsonl".format(str(datetime.today().date()))

        print("starting new game...")
        # get questions
        if self.config['randomize']:
            pass
        else:
            for question_id in self._question_ids:
                question_dict = get_question_by_id(question_id, self.config['dataset'])
                
                self.question_data[question_id] = question_dict
        
        return self.advance_question()

    def save_state(self):
        # df = pd.DataFrame([self.state])
        # df.to_csv(self._file_name, mode='a', header=False)

        with open(self._file_name, mode='a+') as outfile:
            json.dump(self.state, outfile)
            outfile.write('\n')
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
            'evidence': [], # list of highlighted spans

            'tfidf_search_map': {
                'queries': [], 
                'query_results_map': {}, # map of query to doc search results
                'documents_selected': [],
                'cur_doc_selected': '',
                'keyword_searches': {}, # map of doc to searches
            },

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
            # if not os.path.exists(self._file_name):
            #     print('creating new file for today: ', self._file_name)
            #     df = pd.DataFrame([self.state])
            #     print(df)
            #     df.to_csv(self._file_name)
            # else:
            #     self.save_state()
            #     print('saved state')
            
            # clean state
            self.state['cur_doc_selected'] = None
            self.save_state()

        cur_question_number = self.state['question_number'] + 1

        if cur_question_number > self._num_questions:
            print('game finished')
            self.state['game_over'] = True
            return self.state
        
        if self.config['randomize']:
            q = get_random_question(self.config['dataset'])
            # only get questions that have a page field
            while not q['answer']:
                q = get_random_question(self.config['dataset'])
            cur_question_id = q['id']
            cur_question = q
        else:
            cur_question_id = self._question_ids[cur_question_number - 1]
            cur_question = self.question_data[cur_question_id]

        # update state
        self.state['question_number'] = cur_question_number
        self.state['question_id'] = cur_question_id
        self.state['cur_question'] = cur_question['question']
        self.state['question_data'] = cur_question

        self.state['queries'] = []
        self.state['query_results_map'] = {}
        self.state['documents_selected'] = []
        self.state['cur_doc_selected'] = ''
        self.state['keyword_searches'] = {}
        self.state['buzz_word_index'] = -1

        self.state['tfidf_search_map'] = {
                'queries': [], 
                'query_results_map': {},
                'documents_selected': [],
                'cur_doc_selected': '',
                'keyword_searches': {},
            }

        return self.state

    def buzz(self, word_index):
        self.state['buzz_word_index'] = word_index
        return True

    def process_answer(self, player_answer):
        question_id = self.state['question_id']
        ground_truth = self.state['question_data']['answer']

        if self.config['multiple_answers']:
            answer_matches = [self.answer_match(player_answer, cand_ans) for cand_ans in ground_truth]
            answer_correct = (True in answer_matches)
        else:
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
        config = self.config['dataset']
        if 'qanta' in config:
            ground_truth_words = map(self.normalize, ground_truth.split('_'))
        else:
            ground_truth_words = map(self.normalize, ground_truth.split(' '))

        # print(len(set(player_answer_words)), len(set(ground_truth_words)))
        return len(set(player_answer_words) & set(ground_truth_words)) > 0

    def search_document_titles(self, query: str):
        print('searching documents...')
        results = wikipedia.search(query)
        self.state['queries'].append(query)
        self.state['query_results_map'][query] = results
        return self.state

    # def search_documents_tfidf(self, query: str):

    #     r = requests.get(f"http://127.0.0.1:5000/search_passages?query={query}")
    #     if r.status_code != requests.codes.ok:
    #         print("Error")
    #     self.state['tfidf_results'] = r.json()
    #     return self.state

    def get_wiki_document_html(self, page_title: str):
        page = wiki_html.page(page_title)
        html, sections = parse_html_string(page.text)
        
        # html = page.summary + html
        page_dict = {"title": page.title, "html":html, "sections":sections}
        self.state['documents_selected'].append(page_title)
        self.state['cur_doc_selected'] = page_dict

        return self.state

    def get_wiki_document_text(self, page_title: str):
        page = wiki_wiki.page(page_title)
        
        page_dict = {"title": page.title, "text": page.text}
        return page_dict

    def record_keyword_search(self, keywords, search_box: str):
        # cur_doc = self.state['cur_doc_selected']
        if search_box == 'full':
            self.state['keyword_searches'] = keywords
        elif search_box == 'passage':
            self.state['tfidf_search_map']['keyword_searches'] = keywords

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
