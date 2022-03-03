# main class for document annotation


import pandas as pd
import numpy as np
from modAL.models import ActiveLearner
from modAL.uncertainty import classifier_uncertainty

from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import SGDClassifier

ACTIVE_LEARNER_MIN_DOCS = 3 # min # docs to start active learner

class AnnotationSession():
    
    def __init__(self, document_data, topic_model):
        self.document_data = document_data
        self.topic_model = topic_model
        # self.df_dominant_topic = df_dominant_topic
        self.labels = []
        
        # classifier
        text = document_data['text'].apply(str).tolist()

        # tfidf
        self.tfidf = TfidfVectorizer(stop_words='english', lowercase=True, ngram_range=(1,2))
        self.corpus_features = self.tfidf.fit_transform(text)

        # self.classifier = SGDClassifier('log')
        self.learner = None
        
        self.minibatch_features = []
        self.minibatch_labels = []
        
        self.active_learner_started = False

    def get_num_labelled_docs(self):
        return self.document_data['manual_label'].notnull().sum()
#         print(f"number of labelled docs: {self.document_data['manual_labels'].notnull().sum()}")
    
    def get_statistics(self):

        return {'num_labelled_docs': int(self.get_num_labelled_docs())}

    # ingest documents, train topic model
    def preprocess_documents(self):
#         df = pd.read_csv(data_path)
#         self.train_topic_model(df)
        # save: corpus, id2word, model, top topic per doc
        return
    
    def get_topics(self):
        # return self.topic_model.lda_model.print_topics()
        topic_words = []
        topic_weights = []
        for index, topic in self.topic_model.lda_model.show_topics(formatted=False, num_words=30):
            topic_words.append([w[0] for w in topic])
            topic_weights.append([w[1] for w in topic])

            # print('Topic: {} \nWords: {}'.format(idx, [w[0] for w in topic]))
        return topic_words, topic_weights

    def get_documents(self):
        '''gets document metadata'''

        columns = [
            'doc_id',
            'text',
            'source',
            'manual_label',
            'predicted_label',
            'prediction_score',
            'uncertainty_score']

        documents = self.document_data[columns].rename(columns={'doc_id':'id'}).head(100).fillna('')
        res = documents.to_dict(orient='records')
        return res

    def get_document_clusters(self, n_docs=10):
        
        columns = [
            'doc_id',
            'text',
            'source',
            'manual_label',
            'predicted_label',
            'prediction_score',
            'uncertainty_score']

        document_clusters = []
        groupby = self.document_data.groupby('dominant_topic')
        for topic_id, group in groupby:
            # document_clusters[topic] = []
            # documents = []
            # get the most uncertain documents
            sorted_group = group.sort_values('uncertainty_score', ascending=False)
            # sorted_group = group['document_number']
            doc_ids = sorted_group['doc_id'].head(n_docs)
            # print(self.document_data.iloc[doc_ids].shape)
            documents = self.document_data.iloc[doc_ids][columns].fillna('')
            documents = documents.to_dict(orient='records')
            # for doc_id in sorted_group.head(n_docs):
                # text = self.document_data.iloc[doc_id]['text']
                # manual_label = self.document_data.iloc[doc_id]['manual_label']

                # documents.append({'doc_id': doc_id, 'text': text, 'manual_label': manual_label})
            document_clusters.append({'topic_id': topic_id, 'topic_words': group.iloc[0]['topic_keywords'], 'documents': documents})

        return document_clusters


    def add_label(self, label):
        if label not in self.labels:
            self.labels.append(label)

        # update classifier?

    def remove_label(self, label):
        if label in self.labels:
            self.labels.remove(label)

            # refit classifier
            df = self.document_data
            df = df[df['manual_label'].isin(self.labels)]
            X = self.tfidf.transform(df['text'])
            y = df['manual_label']
            self.learner.fit(X,y)

    def rename_label(self, old_label, new_label):
        if old_label in self.labels:
            self.labels.remove(old_label)
            self.labels.append(new_label)

            # refit classifier
            df = self.document_data
            df = df[df['manual_label'].isin(self.labels)]
            X = self.tfidf.transform(df['text'])
            y = df['manual_label']
            self.learner.fit(X,y)


    # view document: text, context, predicted label and confidence, top topic(s)
    def view_document(self, doc_id):

        doc = self.document_data.loc[doc_id]
        print(doc)

    # label document: update, recommend next doc. if batch finished: update classifier, topic model
    def label_document(self, doc_id, labels):
        
        self.document_data.loc[doc_id,'manual_label'] = labels
        
        row = self.document_data.loc[doc_id]
#         features = self.tfidf.transform([row['text']])
        
        if self.get_num_labelled_docs() < ACTIVE_LEARNER_MIN_DOCS:
            self.minibatch_features.append(row['text'])
            self.minibatch_labels.append(labels)

            return 'no_active_learning'
        else: # active learning
            if not self.active_learner_started: # start active learning
                print('initializing active learner')
                self.minibatch_features = self.tfidf.transform(self.minibatch_features)
                print(self.minibatch_features.shape, len(self.minibatch_labels))
                self.learner = ActiveLearner(
                    estimator=SGDClassifier('log'),
                    X_training=self.minibatch_features, y_training=self.minibatch_labels
                )
                self.active_learner_started = True
            else:
                query_idx = doc_id # doc id must equal query idx
#                 print(self.corpus_features[query_idx], [labels])
                self.learner.teach(self.corpus_features[query_idx], [labels]) 
            
            # update uncertainty scores
            self.document_data['uncertainty_score'] = classifier_uncertainty(self.learner, self.corpus_features)
            self.document_data['predicted_label'] = self.learner.predict(self.corpus_features)

            return "active_learning_update"

    # def update_document_metadata(self):
    #     self.document_data['uncertainty_score'] = classifier_uncertainty(self.learner, self.corpus_features)

    # choose the next doc to annotate
    def get_next_document_to_label(self):
        # uncertainty sampling
        query_idx, query_inst = self.learner.query(self.corpus_features)

        # print(query_idx, query_inst.shape)
        return int(query_idx[0])

