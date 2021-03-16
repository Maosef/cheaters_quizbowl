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

    if 'qanta' in dataset_name:
        qanta_row = db.get_question_by_id(question_id)
        if dataset_name == 'qanta_2':
            sentence_tokenizations = qanta_row["tokenizations"]
            qanta_row["text"] = qanta_row["text"][:sentence_tokenizations[1][1]]
        qanta_row["text"] = qanta_row["text"].replace(chr(160), " ")
        question_dict = {'id': qanta_row['qanta_id'], 
                        'question': qanta_row['text'], 
                        'answer': qanta_row['page'], 
                        'tokenizations': qanta_row["tokenizations"]}
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
        question_dict = {'id': qanta_row['qanta_id'], 
                        'question': qanta_row['text'], 
                        'answer': qanta_row['page'], 
                        'tokenizations': qanta_row["tokenizations"]}
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
            'dataset': 'qanta',
            'num_questions': 20,
            'multiple_answers': False,
            'randomize': False,
            'question_ids': [95072,988,89697,108671,73219,48673,71049,144507,25205,27716,37764,122767,2271,62353,48232,126245,120918,69613,12329],
            'qids_1': [107440,153381,124015,22343,52682,106517,60955,88688,50838,88742,105855,35593,127908,50875,5419,146615,75323,84162,111095,140679],
            'qids_2': [140050,37738,49763,116356,88983,22586,143578,106706,40113,25205,27716,37764,122767,2271,62353,48232,126245,120918,69613,12329],
            'qids_3': [107,74066,31599,50870,121638,146675,5524,53483,6405,125257,77213,105925,95072,988,89697,108671,73219,48673,71049,144507]
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
    def start_game(self, username: str, mode: str):

        self.reset()
        self._file_name = "backend/data/recorded_game_{}.jsonl".format(str(datetime.today().date()))

        self.state['username'] = username
        self.state['mode'] = mode

        print("starting new game...")
        # get questions
        self._question_ids = self.config["question_ids"]
        # if mode == "sentence":
        #     self._question_ids = self.config["qids_1"]
        # elif mode == "incremental":
        #     self._question_ids = self.config["qids_2"]
        # elif mode == "static":
        #     self._question_ids = self.config["qids_3"]

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
            'username': None,
            'mode': None,
            'start_time': str(datetime.utcnow()),
            'question_number': 0, 
            'question_id': '', 
            'cur_question': '', 
            'question_data': {},
            'skipped': False,

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
            'buzz_sentence_number': -1,
            'player_answer': '', 
            'answer': '',
            'answer_correct': None, 
            'score': 0,
            'evidence_score': 0,
            'game_over': False,
            'override_decision': None, # if player challenges decision

            'actions': []
        }
        return True

    def record_action(self, action_name: str, data=None):
        action = {'time': int(datetime.utcnow().timestamp()), 'name': action_name}
        if data:
            action['data'] = data
        print(action)
        self.state['actions'].append(action)

    # get next question, advance state
    def advance_question(self, override_decision=None, skip=False):

        print('keywords:', self.state['keyword_searches'])
        
        if override_decision != None:
            self.state['override_decision'] = override_decision

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
            if skip:
                self.state['skipped'] = True
            else:
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
        self.state['buzz_sentence_number'] = -1

        self.state['evidence'] = []

        self.state['tfidf_search_map'] = {
                'queries': [], 
                'query_results_map': {},
                'documents_selected': [],
                'cur_doc_selected': '',
                'keyword_searches': {},
            }

        self.state['override_decision'] = None
        self.state['actions'] = []

        return self.state

    def buzz(self, word_index):
        self.state['buzz_word_index'] = word_index
        return True

    def process_answer(self, player_answer, sentence_number):
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

        num_sentences = len(self.state['question_data']['tokenizations'])
        points = 0
        print(f'sentence number: {sentence_number}, num sentences: {num_sentences}')
        self.state['buzz_sentence_number'] = sentence_number
        
        if answer_correct:
            points += 10
            points += 5 * (num_sentences - sentence_number)
        print(f'points awarded: {points}')
        self.state['score'] += points

        return self.state

    def normalize(self, s):
        return unidecode.unidecode(s).lower().translate(str.maketrans('', '', string.punctuation))
        
    # normalize answers, remove punctuation and whitespace. try prompts?
    def answer_match(self, player_answer, ground_truth):
        print(f'player answer: {player_answer}, ground truth: {ground_truth}')

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

        self.record_action('search_documents', query)

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

        self.record_action('select_document', page.title)

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
        return True

    def record_evidence(self, evidence: str):
        # cur_doc = self.state['cur_doc_selected']
        self.state['evidence'].append(evidence)
        self.state['evidence_score'] += 10

        self.record_action('record_evidence', evidence)

        return self.state
    
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
