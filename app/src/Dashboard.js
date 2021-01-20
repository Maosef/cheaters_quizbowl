import React, { useState } from 'react';
import { Redirect } from "react-router-dom";

import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import Navbar from './Components/Navbar'
import AnswerForm from './Components/AnswerForm';
// import Buzzer from './Buzzer';
import Buzzer from './Components/BuzzerUntimed';
import Button_React from './Components/Button_React'
import ContinueButton from './Components/ContinueButton';
import QuestionDisplay from './Components/QuestionDisplay';
import Searcher from './Components/Searcher';
import SearcherTfidf from './Components/SearcherTfidf';

import postRequest from './utils';

import { withStyles } from '@material-ui/core/styles';
import useStyles from './Styles';

import './App.css';
import HightlightTools from './Components/HighlightToolsComponent';

import TabTool from './Components/TabTool';

// main Dashboard. Load question, handle interrupt, load next question
// preloaded questions for experiment setting

let server_url = "";
let num_questions = 20408;


class Dashboard extends React.Component {
    constructor(props) {
        super(props);
        
        this.handleShortcut = this.handleShortcut.bind(this);
        this.handleBuzz = this.handleBuzz.bind(this);
        
        this.skipQuestion = this.skipQuestion.bind(this);
        this.updateGameState = this.updateGameState.bind(this);

        this.postRequest = this.postRequest.bind(this);
        this.answerQuestion = this.answerQuestion.bind(this);
        this.advanceQuestion = this.advanceQuestion.bind(this);
        this.recordKeywordSearchTerms = this.recordKeywordSearchTerms.bind(this);
        this.updateCurrentDocument = this.updateCurrentDocument.bind(this);
        this.recordEvidence = this.recordEvidence.bind(this);

        this.handleShortcut = this.handleShortcut.bind(this);
        this.deactivateShortcut = this.deactivateShortcut.bind(this);

        this.maxAttempts = 1;

        this.keywords = {};
        this.passage_keywords_map = {};

        // mutable state
        this.state = {

            game_state: {},

            sessionToken: "",
            question_id: -1,
            question_idx: 0,
            question: "",
            category: "",
            page: "",
            tokenizations: [], //list of lists
            year: -1,
            tournament: "",

            interrupted: false,
            numSeen: 0,
            score: 0,
            isLoaded: false,
            sentenceIndex: 0,
            numAttempts: 1, // number of attempts on current question

            keywords: [],
            shortcutToggled: false,
            wordIndex: 0,
        }
    }

    // on init: authenticate, grab the user data, fetch first question
    componentDidMount() {

        // start game
        let username = window.sessionStorage.getItem("username");
        let token = window.sessionStorage.getItem("token");
        
        console.log('username and token: ', username, token);
        this.postRequest('start_new_game', {'username': username, 'session_token': token}).then(data => {
            console.log('new game started, ', data);
            this.setState({game_state: data});
        });

        window.addEventListener("keydown", this.handleShortcut);
        window.addEventListener("keyup", this.deactivateShortcut);
    }

    // keyboard shortcut to buzz
    handleShortcut(e) {
        // if ((e.ctrlKey || e.metaKey) && e.keyCode === 32 && this.state.isToggled === false) {
        if (e.keyCode === 32 && this.state.shortcutToggled === false && document.activeElement.tagName == 'BODY') {
          this.setState({shortcutToggled: true});
          
          e.preventDefault();
          this.handleBuzz();
          console.log('buzzed, ', this.shortcutToggled);
        }
    }

    deactivateShortcut(e) {
        this.setState({shortcutToggled: false});
    }

    // record buzz location
    handleBuzz() {
        this.postRequest(`/buzz?word_index=${this.state.wordIndex}`);
        this.setState({
            interrupted: !this.state.interrupted
        });
    }

    async postRequest(url, data={}) {
        
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(data)
          });
          return response.json(); // parses JSON response into native JavaScript objects
    }

    answerQuestion(answer) {
        this.postRequest(`/answer?answer=${answer}`).then(data => {
            this.setState({game_state: data});
            let game_state = data;

            // parse answer for correctness
            if (game_state['answer_correct']) {
                // let points = state.tokenizations.length - state.sentenceIndex;
                alert("Correct. Answer is " + game_state['answer'] + ". Score: " + game_state['score']);
                this.advanceQuestion();
            } else { // wrong answer
                // console.log("Attempts", this.state.numAttempts, this.maxAttempts)
                if (this.state.numAttempts < this.maxAttempts) {
                    alert(`Incorrect. Tries left: ${this.maxAttempts-this.state.numAttempts}`);
                    this.setState({numAttempts: this.state.numAttempts + 1});
                    return;
                } else {
                    alert("Incorrect. Answer is " + game_state['answer']);
                    this.advanceQuestion();
                }
            }
        });
    }

    // advance to next question, record keyword search data
    advanceQuestion(){
        console.log('keywords: ', this.keywords);
        this.postRequest(`/record_keyword_search`, {
            'keywords': this.keywords, 
            'passage_keywords_map': this.passage_keywords_map});
        this.keywords = {};
        this.passage_keywords_map = {};

        this.postRequest(`/advance_question`).then(data => {
            this.setState({game_state: data, interrupted: false, wordIndex: 0});

            let game_state = this.state.game_state;
            //load the next question
            if (game_state['game_over']) {
                alert('Game Finished. Thank you for your time!');
            } else {
                console.log("New question");
            }
        }); 
    }

    // update keywords dict
    recordKeywordSearchTerms(searchVal: str, search_type: str){
        // this.setState({keywords: this.state.keywords + [searchVal]}) # bug: this clears the search box
        
        let cleaned_searchVal = searchVal.trim();
        let doc_title = this.state.game_state['cur_doc_selected']['title'];
        let keywords;
        if (search_type === 'full') {keywords = this.keywords}
        else if (search_type === 'passage') {keywords = this.passage_keywords_map}

        if (!keywords.hasOwnProperty(doc_title)){
            keywords[doc_title] = [];
        }

        let doc_searchVals = keywords[doc_title];
        // check if we're adding a duplicate
        if (cleaned_searchVal !== doc_searchVals[doc_searchVals.length - 1]) {
            doc_searchVals.push(cleaned_searchVal);
            // console.log('keywords: ', keywords);
        }
    }

    updateCurrentDocument(doc_title: str){
        // console.log('keywords: ', this.keywords);
        this.state.game_state['cur_doc_selected'] = doc_title;
    }

    skipQuestion() {
        let question_idx = this.state.question_idx + 1
        this.setState({
            interrupted: false, numSeen: this.state.numSeen + 1, question: "", question_idx: question_idx
        });
        let question_id = this.question_ids[question_idx];
        setTimeout(this.fetchData(question_id), 2000);
    }

    updateGameState(gameState) {
        this.setState({game_state: gameState});
    }

    recordEvidence(text) {
        this.state.game_state['evidence'].push(text);
    }

    render() {

        if (window.sessionStorage.getItem("token") == null) {
            return <Redirect to="/login" />;
        }
        const { classes } = this.props;

        let question_data = this.state.game_state['question_data'];

        let queries;
        if (this.state.game_state['queries']) {
            queries = this.state.game_state['queries'].map((query) =>
                <ListItem button key={query.toString()}>
                    <ListItemText primary={query} />
                </ListItem>
            );
        }

        let docs_selected;
        if (this.state.game_state['documents_selected']) {
            docs_selected = this.state.game_state['documents_selected'].map((query) =>
                <ListItem button key={query.toString()}>
                    <ListItemText primary={query} />
                </ListItem>
            );
        }

        let evidence_list;
        if (this.state.game_state['evidence']) {
            evidence_list = this.state.game_state['evidence'].map((evidence) =>
                <ListItem button key={evidence.toString()}>
                    <ListItemText primary={evidence} />
                </ListItem>
            );
        }

        return (

            <div className={classes.root}>
                
                <Navbar />

                <div className={classes.body} style={{maxWidth: 2000, margin: "auto"}}>
                    <Grid container spacing={1}
                        bgcolor="background.paper"
                    >   
                        <Grid container item xs={8}>
                        
                        {/* answer form */}
                        <Grid item xs={9}>
                            
                            <div className="flex-container" style={{"display": "flex", "alignItems": "center"}}>
                                <div style={{padding: 10}}>
                                    {/* <AnswerForm onSubmit={this.finishQuestion} label="Answer" /> */}
                                    <AnswerForm onSubmit={this.answerQuestion} label="Answer" />
                                </div>
                                <div style={{padding: 10}}>
                                    <Buzzer onClick={this.handleBuzz} 
                                        onTimeout={this.advanceQuestion} 
                                        interrupted={this.state.interrupted}/>
                                </div>
                                <div style={{padding: 10}}>
                                    <Button variant="contained" color="secondary" onClick={this.advanceQuestion}>
                                        Skip
                                    </Button>
                                </div>
                            </div>
                                                        
                        </Grid>

                        {/* question display */}
                        <Grid item xs={12}>
                            <Paper className={classes.paper} style={{ "textAlign": "left" }}>
                                {Object.keys(this.state.game_state).length > 0 ?
                                    // <QuestionDisplay
                                    //     text={this.state.game_state['question_data']['text']}
                                    //     tokenizations={this.state.game_state['question_data']['tokenizations']}
                                    //     updateSentencePosition={(index) => this.setState({ sentenceIndex: index })} />
                                    <QuestionDisplay
                                        text={this.state.game_state['question_data']['question']}
                                        interrupted={this.state.interrupted}
                                        updateSentencePosition={(index) => this.setState({ sentenceIndex: index })}
                                        wordIndex={this.state.wordIndex}
                                        updateWordIndex={() => this.setState({wordIndex: this.state.wordIndex + 1})}/>
                                    : "Loading..."
                                }
                            </Paper>
                        </Grid>
                        
                        {/* <TabTool tab1={<Searcher updateGameState={this.updateGameState} 
                                recordKeywordSearchTerms={this.recordKeywordSearchTerms}
                                updateCurrentDocument={this.updateCurrentDocument}/>}
                                
                                tab2={<SearcherTfidf updateGameState={this.updateGameState} 
                                recordKeywordSearchTerms={this.recordKeywordSearchTerms}
                                updateCurrentDocument={this.updateCurrentDocument}/>}
                                /> */}

                        {/* full document search */}
                        <Grid item xs={12}>
                            <Searcher updateGameState={this.updateGameState} 
                                recordKeywordSearchTerms={this.recordKeywordSearchTerms}
                                updateCurrentDocument={this.updateCurrentDocument}/>
                        </Grid>

                        {/* full document search */}
                        <Grid item xs={12}>
                            <SearcherTfidf updateGameState={this.updateGameState} 
                                recordKeywordSearchTerms={this.recordKeywordSearchTerms}
                                updateCurrentDocument={this.updateCurrentDocument}/>
                        </Grid>
                        
                        {/* <Grid item xs={4}>
                            <Paper className={classes.paper}>
                                Settings <br /><br />
                                Reading speed: {this.state.category} <br />

                            </Paper>
                        </Grid> */}
                    </Grid>

                    {/* Toolbar */}
                        <Grid item xs={3}>
                            <Paper className={classes.paper}>
                                    
                                {Object.keys(this.state.game_state).length > 0 ?
                                    <div >                                        
                                            {/* Answer: {this.state.page} <br /> */}
                                        Score: {this.state.game_state['score']} <br />
                                        Question Number: {this.state.game_state['question_number']} <br />
                                        Question ID: {this.state.game_state['question_id']} <br />
                                        Category: {this.state.game_state['question_data']['category']} <br />
                                        {question_data['tournament']} {question_data['year']}
                                        
                                    </div>
                                : "Waiting"}

                                    <HightlightTools callback={this.recordEvidence}/>

                                    <h4>Evidence List</h4> 
                                    <List component="nav" aria-label="search results" border={1}
                                        style={{ 
                                            maxHeight: 500, 
                                            overflow: "scroll", 
                                            whiteSpace: "pre-wrap", 
                                            textAlign: "left", 
                                            }}>
                                        {evidence_list}
                                    </List>

                                    <h4>Previous queries</h4> 
                                    <List component="nav" aria-label="search results" border={1}
                                        style={{ 
                                            maxHeight: 500, 
                                            overflow: "scroll", 
                                            whiteSpace: "pre-wrap", 
                                            textAlign: "left", 
                                            }}>
                                        {queries}
                                    </List>
                                    
                                    <h4>Previous documents</h4> 
                                    <List component="nav" aria-label="search results"
                                        style={{ 
                                            maxHeight: 500, 
                                            overflow: "scroll", 
                                            whiteSpace: "pre-wrap", 
                                            textAlign: "left", 
                                            }}>
                                        {docs_selected}
                                    </List>

                                    <h4>Instructions</h4> 
                                    <p>
                                    Try to answer the quizbowl question using as few clues as possible. You may use the internal search engine to search Wikipedia articles.
                                    Using the keyword search is encouraged!
                                    </p>


                                    <h4>Keyboard shortcuts:</h4>
                                    <p style={{ textAlign: "left"}}>
                                        <ul>
                                        <li>Buzz: <code>space</code></li>
                                        <li>Query (focus on search box or auto-search highlighted text): <code>Ctrl-s</code>.</li>
                                        <li>Keyword search: <code>Ctrl-f</code></li>                                        
                                        </ul>
                                    
                                    Type <code>Enter</code> to submit your answer. You get one attempt.
                                    </p>

                                
                            </Paper>
                        </Grid>
                    </Grid>

                </div>
            </div>
        );
    }
}

export default withStyles(useStyles)(Dashboard);
