import json
import sqlite3
from copy import deepcopy
import time
import datetime


data = 'backend/data/spring_novice_question_data.jsonl'
logs = 'backend/data/spring_novice_play_data.jsonl'
PASSAGES = '/fs/clip-quiz/amao/Github/retrieval-based-baselines/wiki_passages.db'

class Passage:
    def __init__(self):
        self.conn = sqlite3.connect(PASSAGES)
        self.cursor = self.conn.cursor()

    def get_text(self, psg_id):
        self.cursor.execute("SELECT text FROM wiki_passages where id = {}".format(psg_id))
        return self.cursor.fetchall()[0][0]

class Questions:
    def __init__(self):
        self.questions = {}
        with open(data) as f:
            for ln in f:
                ln = json.loads(ln)
                self.questions[int(ln['id'])] = ln

    def get_sent(self, qid, sent_index):
        # bounds = self.questions[qid]['sentence_tokenizations'][sent_index]
        bounds = json.loads((self.questions[qid]['sentence_tokenizations']))[sent_index]

        return self.questions[qid]['question'][bounds[0]:bounds[1]]

    def get_answer(self, qid):
        return self.questions[qid]['answer']

    def get_sents(self, qid, num_sents):
        bounds = json.loads((self.questions[qid]['sentence_tokenizations']))[num_sents-1]
        return self.questions[qid]['question'][0:bounds[1]]

passage_retriver = Passage()
questions = Questions()

class Evidence:
    def __init__(self, type, text=None):
        self.type = type  #type is either 'passage' or 'span'
        self.text = text

def evidences_to_json(evidences):
    def to_json(evidence):
        return {'evidence-type': evidence.type, 'text': evidence.text}
    return [to_json(evidence) for evidence in evidences ]

class Example:
    def __init__(self, packet_num, qid, player_ans, buzz_sent, start_time):
        self.packet_num = packet_num
        self.qid = qid
        self.player_ans = player_ans
        self.buzz_sent = buzz_sent

        self.num_sents = 0
        self.evidences = []
        self.gold_actions = [] #(num_sents, evidence, action)
                               #action: next-sent; query:xx; answer
        self.num_ans_attempts = 0

        self.selected_docs = set()
        self.last_answer = None
        self.last_answer_time = None
        self.search_times = set()

        self.start_time = time.mktime(
                    datetime.datetime.strptime(start_time, '%Y-%m-%d %H:%M:%S.%f').timetuple())
                    #'%b %d, %Y %I:%M:%S %p'

        self.passages_visible = set()
        self.passages_onquery = set()
        self.passages_most_visible = set()


    def _add_action(self, typ, arg=None):
        if arg is None:
            label = typ
        else:
            label = '{}:{}'.format(typ, arg)

        self.gold_actions.append((self.num_sents, deepcopy(self.evidences), label))

    def proc_next_sent(self, sent_index):
        if sent_index > 0:
            self._add_action('next-sent')
        self.num_sents = sent_index+1

    def proc_search(self, query, timestamp):
        self._add_action('query', query)
        self.search_times.add(timestamp- self.start_time)

    def proc_sel_document(self, passage_id):
        if passage_id not in self.selected_docs:
            self.evidences.append(Evidence('selected-passage', passage_retriver.get_text(passage_id)))
            self.selected_docs.add(passage_id)

    def proc_record_evidence(self, evidence):
        self.evidences.append(Evidence('player-recorded', evidence))

    def proc_answer(self, answer, timestamp):
        self.last_answer = answer
        self.last_answer_time = timestamp - self.start_time
        """
        self._add_action('answer', answer)
        self.num_ans_attempts += 1
        if self.num_ans_attempts == 2:
            print('ERROR: multiple answer attempts')
        """
    def proc_scrolling(self, vis_events, search_time = None):
        """
        vis_events: [
                        {"passage_id": "16145954", "time": 43, "is_visible": true}
                    ]
        """
        if search_time is not None: self.search_times.add(search_time- self.start_time)
        vis_passages = set()
        vis_on_answer = set()
        vis_on_query = set() 
        passage_status = {}
        for event in vis_events:
            if event['is_visible']: vis_passages.add(event['passage_id'])
            pid = event['passage_id']
            if pid in passage_status:
                if event['is_visible']:
                    if not passage_status[pid]['visible']:
                        passage_status[pid]['visible'] = True
                        passage_status[pid]['last_start'] = event['time']
                elif passage_status[pid]['visible']:
                    passage_status[pid]['visible'] = False
                    passage_status[pid]['total_vis'] += \
                                    event['time'] - passage_status[pid]['last_start']

                    if self.last_answer_time is not None and passage_status[pid]['last_start'] <= self.last_answer_time <= event['time']:
                        vis_on_answer.add(pid)

                    for search_time in self.search_times:
                        if passage_status[pid]['last_start'] <= search_time <= event['time']:
                            vis_on_query.add(pid)

            elif event['is_visible']:
                passage_status[pid] = {'visible': True,'last_start': event['time'], 'total_vis':0}

        #all visible
        for pid in vis_passages:
            if pid not in self.selected_docs and pid not in self.passages_visible:
                self.evidences.append(Evidence('visible-passage',
                                    passage_retriver.get_text(pid)))
                self.passages_visible.add(pid)
        
        #most visible (can be same as selected)
        most_time = 0
        most_vis_psg = None
        for pid, data in passage_status.items():
            if data['total_vis'] > most_time:
                most_vis_psg = pid
                most_time = data['total_vis']

        if most_vis_psg is not None and most_vis_psg not in self.passages_most_visible:
            self.evidences.append(Evidence('most-visible-passage',
                                        passage_retriver.get_text(most_vis_psg)))
            self.passages_most_visible.add(most_vis_psg)

        #visible at answering
        for pid in vis_on_answer:
            self.evidences.append(Evidence('visible-on-answering',
                            passage_retriver.get_text(pid)))


        #visible at querying
        for pid in vis_on_query:
            if pid not in self.passages_onquery:
                self.evidences.append(Evidence('visible-on-query',
                                        passage_retriver.get_text(pid)))
                self.passages_onquery.add(pid)

    def finish(self):
        if self.last_answer is None:
            print('ERROR: no answer recorded')
        else:
            self._add_action('answer', self.last_answer)

def extract(ex):
    example = Example(ex['packet_number'], ex['question_id'], ex['player_answer'],
                        ex['buzz_sentence_number'], ex['start_datetime'])
    scrolling = []
    #sorting actions
    for action in sorted(ex['actions'], key=lambda action: action['time']):
        if action['name'] == 'next_sentence':
            example.proc_scrolling(scrolling)
            scrolling = []
            example.proc_next_sent(action['data']['sentence_index'])
        elif action['name'] == 'search_documents':
            example.proc_scrolling(scrolling, search_time = action['time'])
            scrolling = []
            example.proc_search(action['data']['query'], action['time'])
        elif action['name'] == 'select_document':
            example.proc_sel_document(action['data']['passage_id'])
        elif action['name'] == 'record_evidence':
            if 'data' not in action:
                print('ERROR: Record evidence without data',action)
            else:
                example.proc_record_evidence(action['data'])
        elif action['name'] == 'answer':
            example.proc_scrolling(scrolling)
            scrolling = []            
            example.proc_answer(action['data']['answer'], action['time'])
        elif action['name'] == 'document_actions':            
            if 'intersectionEvents' in  action:#['intersectionEvents']: #action['data']:
                scrolling.extend(action['intersectionEvents'])
            elif 'intersectionEvents' in action['data']:
                scrolling.extend(action['data']['intersectionEvents'])
            elif 'intersectionEvents' in action['data']['documentActions']:
                scrolling.extend(action['data']['documentActions']['intersectionEvents'])
            else:
                assert False
        else:
            assert action['name'] in ['document_actions', 'advance_keyword_match'], action['name']

    example.proc_scrolling(scrolling)
    example.finish()
    return example

total = 0
num_correct = 0
num_actions = 0

def evidences_to_str(evidences):
    output = ''
    for ev in evidences:
        output += 'type:{}-texts:{}'.format(ev['evidence-type'], ev['text'])
    return output

added_actions = set()
gold_sessions = []
with open(logs) as f:
    for ln in f:
        ex = json.loads(ln)
        total += 1
        # if not ex['skipped'] and ex['answer_correct']:
        if not ex['skipped']:
            num_correct += 1
            tr_example = extract(ex)
            num_actions += len(tr_example.gold_actions)

            num_actions_session = len(tr_example.gold_actions)
            num_sentences, num_queries = 0, 0
            for gold in tr_example.gold_actions:
                action_name = gold[2].split(':')[0]
                if action_name == 'query':
                    num_queries += 1
                elif action_name == 'next-sent':
                    num_sentences += 1
            
            cur_query, cur_sentence = 0, 0
            gold_actions = []
            for action_num,gold in enumerate(tr_example.gold_actions):
                qid = tr_example.qid
                # question = questions.get_sents(tr_example.qid, gold[0])
                question = questions.get_sent(tr_example.qid, gold[0]-1)

                evidences = evidences_to_json(gold[1])
                action = gold[2]
                action_name = gold[2].split(':')[0]
                key = 'question||{}-action||{}-evidence||{}'.format(question,
                                                             action, evidences_to_str(evidences))

                if key not in added_actions:
                    gold_actions.append({
                        'question_id': tr_example.qid,
                        'question': question,
                        'evidences': evidences,
                        'action': action,
                        'answer': questions.get_answer(qid),

                        'num_actions': num_actions_session,
                        'answer_correct': ex['answer_correct'],
                        # 'num_actions_until_answer': num_actions_session-action_num,
                        # 'num_queries_until_answer': num_queries-cur_query,
                        # 'num_sentences_until_answer': num_sentences-cur_sentence
                        })

                    added_actions.add(key)

                # each next-sent is like a new question
                if action_name == 'next-sent':
                    gold_sessions.append(gold_actions)
                    gold_actions = []
            if gold_actions: gold_sessions.append(gold_actions)

with open('gold-sessions-2.json', 'w') as oh: json.dump(gold_sessions, oh, indent=4)

print('total: {}, correct: {}'.format(total, num_correct))
print('num-actions: {}'.format(num_actions))
