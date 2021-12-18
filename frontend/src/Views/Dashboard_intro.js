import React, { useState } from 'react';
import { Redirect } from "react-router-dom";

import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';

import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import Navbar from '../Components/Navbar'
import AnswerForm from '../Components/AnswerForm';
import Buzzer from '../Components/BuzzerUntimed';
// import QuestionDisplay from './Components/QuestionDisplay';
import QuestionDisplay from '../Components/QuestionDisplaySentence';

import SearcherPassage from '../Components/SearcherPassage';

import {postRequest, getRequest, getScheduleInfo} from '../utils';

import '../App.css';
import HighlightTool from '../Components/HighlightTool';
import HighlightAnswerTool from '../Components/HighlightRecorder';

import { createMuiTheme, withStyles, makeStyles, ThemeProvider } from '@material-ui/core/styles';
import useStyles from '../Styles';
import { green, purple } from '@material-ui/core/colors';

import { Steps, Hints } from 'intro.js-react';
import introJs from 'intro.js';
import 'intro.js/introjs.css';


// main Dashboard. Load question, handle interrupt, load next question
// preloaded questions for experiment setting

let num_questions = 20408;

const MAX_HEIGHT = 250;
const SEARCH_TYPE = 'passage'

class Dashboard extends React.Component {
    constructor(props) {
        super(props);

        this.handleShortcut = this.handleShortcut.bind(this);
        this.handleBuzz = this.handleBuzz.bind(this);

        this.processQuery = this.processQuery.bind(this);
        this.updateGameState = this.updateGameState.bind(this);

        // this.postRequest = this.postRequest.bind(this);
        this.answerQuestion = this.answerQuestion.bind(this);
        this.advanceQuestion = this.advanceQuestion.bind(this);
        this.recordKeywordSearchTerms = this.recordKeywordSearchTerms.bind(this);
        this.updateCurrentDocument = this.updateCurrentDocument.bind(this);
        this.recordHighlight = this.recordHighlight.bind(this);        
        this.recordEvidence = this.recordEvidence.bind(this);
        this.highlightToolCallback = this.highlightToolCallback.bind(this);
        this.handleShortcut = this.handleShortcut.bind(this);
        this.deactivateShortcut = this.deactivateShortcut.bind(this);
        this.onExit = this.onExit.bind(this);
        this.addIntersectionEvent = this.addIntersectionEvent.bind(this);

        this.startTutorial = this.startTutorial.bind(this);
        

        // this.intersectionEvents = [];
        this.maxAttempts = 1;
        // this.keywords = {};
        // this.passage_keywords_map = {};
        this.curDocumentInfo = {'title': null, 'keyword_matches': [], 'intersectionEvents': []};

        

        this.state = {

            game_state: {}, // game state used by server
            
            isValidPlayingTime: true,
            gameOver: false,

            currentQuery: '',
            searchLoading: false,
            retrievedTitles: [],

            answerStatus: null,
            interrupted: false,
            numSeen: 0,
            score: 0,
            isLoaded: false,
            sentenceIndex: 0,
            numAttempts: 1, // number of attempts on current question

            keywords: [],
            shortcutToggled: false,
            wordIndex: 0,

            stepsEnabled: false,
            initialStep: 0,
            steps: [
            {
                intro: `<h1>Welcome to Cheater's Bowl!</h1> This tutorial will walk you through how to play the game.
            The basic goal of this game is to answer trivia questions, with a twist. <b>Click "Next" to Continue.</b>`,
                tooltipClass: 'customTooltip'

            },
              {
                element: "#questionText",
                intro: `This is the question. You can click 'Another Clue' to reveal another sentence. 
                You get more points for answering early (10 points per sentence unrevealed).`
              },
              {
                element: "#answerBox",
                intro: "Answer here. You're given a chance to protest, if you think we judged your answer wrong."
              },
              {
                element: "#searcher",
                intro: `You can search and read Wikipedia pages here. Once you open a document, you can also search for keywords.
                <b>You are not allowed to use any external tools to play this game.</b>`
              },
              {
                element: "#searcher",
                intro: `One important task is recording evidence. We define evidence as "text which helped lead you to the answer."
                To do this, highlight some text in a document to bring up the tooltip, then click "Record as Evidence".`
              },
              {
                element: "#toolbar",
                intro: "The toolbar displays your score, evidence, current packet, and other info."
              },
            {
                element: "#navbar",
                intro: `There are four packets, and each packet has 24 questions. Answer the questions as best as you can 
                before time runs out. You can access this tutorial any time from the navbar. Good luck and have fun!`
            },

            ],
        }
    }

    // on init: authenticate, grab the user data, fetch first question
    async componentDidMount() {
        
        // if it's not a set playing time
        // console.log('isValidPlayingTime', this.isValidPlayingTime())
        const scheduleInfo = await getScheduleInfo()
        if (!scheduleInfo['is_valid_playing_time']) {
            console.log('not valid playing time')
            this.setState({isValidPlayingTime: false})
            return
        } else {
            console.log('endDateTime', new Date(this.state.endDateTime))
            this.setState({endDateTime: scheduleInfo['next_end_datetime']})
        }

        let username = window.sessionStorage.getItem("username");
        let token = window.sessionStorage.getItem("token");

        // postRequest('get_player_info', {'username': username, 'session_token': token, 'mode': 'sentence'}).then(data => {
        //     console.log('player info, ', data);
        //     // this.setState({game_state: data});
        // });

        // start game
        postRequest('start_new_game', {'username': username, 'session_token': token, 'mode': 'sentence'}).then(data => {
            this.setState({game_state: data});

            // if this is a new game, show intro for the first time
            if (data.question_number === 1) {
                console.log('new game started, ', data);
                this.setState({stepsEnabled: true})
                // introJs().start();
            }
        });

        // buzzer shortcut
        window.addEventListener("keydown", this.handleShortcut);
        window.addEventListener("keyup", this.deactivateShortcut);

        // answer shortcut
        HighlightAnswerTool(81, this.answerQuestion);
    }

    // keyboard shortcut to buzz
    handleShortcut(e) {
        // console.log(e.keyCode, this.state.answerStatus)
        if (this.state.answerStatus !== null) {
            this.advanceQuestion();
        } else if (e.keyCode === 32 && this.state.shortcutToggled === false && document.activeElement.tagName == 'BODY') {
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
        postRequest(`/buzz?word_index=${this.state.wordIndex}`);
        this.setState({
            interrupted: !this.state.interrupted
        });
    }


    // fetch data and log query
    async processQuery(query, origin='none', selectedPassageId=-1, context) {
        console.log(`query: ${query}`);
        if (!query){
            return
        }
        
        this.setState({
            searchLoading: true,
            currentQuery: query
        })

        postRequest(`/record_action?name=search_documents`, {data: {query: query, origin: origin, passage_id: selectedPassageId, context: context}})

        if (SEARCH_TYPE === 'page') {
            getRequest(`/search_wiki_titles?query=${query}`)
            .then(
                (result) => {
                    // console.log('search results: ', result);
                    this.updateGameState(result);
                    let titles = result['query_results_map'][query]
                    console.log('titles: ', titles);
                    this.setState({
                        retrievedTitles: titles,
                        searchLoading: false,
                    });
                },
                (error) => {
                    console.log('Error', error)
                }
            )
        } else if (SEARCH_TYPE === 'passage') {
            const result = await getRequest(`/search_tfidf?query=${query}`);
            console.log('search results: ', result);
                        
            this.setState({
                // retrievedTitles: result.map(e => e['page']),
                passages: result,
                searchLoading: false,
            });
        }
    
    }

    async answerQuestion(answer, origin='none', selectedPassageId, context) {

        const isValid = await getScheduleInfo()
        if (!isValid['is_valid_playing_time']) {
            console.log('not valid playing time')
            this.setState({isValidPlayingTime: false})
            return
        }

        // confirm
        if (this.state.game_state.evidence.length === 0) {
            if (!window.confirm("Are you sure you want to answer without recording evidence?")) {
                return
            }
        }

        postRequest(`/record_action?name=answer`, {data: {answer: answer, origin: origin, passage_id: selectedPassageId, context: context, time: Date.now()}})

        // console.log(`expanded answer: ${expanded_answer}`)
        postRequest(`/answer?answer=${answer}&sentence_index=${this.state.sentenceIndex}`).then(data => {
            this.setState({game_state: data});
            let game_state = data;

            // parse answer for correctness
            if (game_state['answer_correct']){
                this.setState({answerStatus: "correct"});
            } else {
                this.setState({answerStatus: "incorrect"});
            }
            
        });
    }

    // advance to next question
    async advanceQuestion(player_decision=null, skip=false){

        const isValid = await getScheduleInfo()
        if (!isValid['is_valid_playing_time']) {
            console.log('not valid playing time')
            this.setState({isValidPlayingTime: false})
            return
        }

        // record keyword search data and intersection events
        console.log('keywords: ', this.keywords);
        // postRequest(`/record_keyword_search`, {
        //     'keywords': this.keywords, 
        //     'passage_keywords_map': this.passage_keywords_map});
        postRequest(`/record_action?name=document_actions`, {data: {documentActions: this.curDocumentInfo}});
        // reset data structures
        this.curDocumentInfo = {'title': null, 'keyword_matches': [], 'intersectionEvents': []};
        // this.keywords = {};
        // this.passage_keywords_map = {};

        postRequest(`/advance_question?player_decision=${player_decision}&skip=${skip}`).then(data => {
            // reset state
            this.setState({game_state: data, interrupted: false, wordIndex: 0, sentenceIndex: 0, answerStatus: null, passages: []});

            let game_state = this.state.game_state;
            console.log('game state', game_state)
            //load the next question
            if (game_state['game_over']) {
                alert('Game Finished. Thank you for your time!');
                this.setState({gameOver: true})
            } else if (game_state['packet_finished']) {
                alert('Packet Finished! Returning to Home...');
                this.setState({gameOver: true})
            } else {
                console.log("New question");
            }
        }); 
    }

    // update keywords dict
    recordKeywordSearchTerms(searchVal: str, search_type: str){
        // this.setState({keywords: this.state.keywords + [searchVal]}) # bug: this clears the search box
        
        let cleaned_searchVal = searchVal.trim();
        // let doc_title = this.state.game_state['cur_doc_selected']['title'];
        let curDoc = this.curDocumentInfo;
        // let doc_title = curDoc['title'];
        console.log('doc: ', curDoc)

        // let keywords = curDoc.keyword_matches
        // if (search_type === 'full') {keywords = curDoc.keywords}
        // else if (search_type === 'passage') {keywords = curDoc.passage_keywords_map}

        // if (!keywords.hasOwnProperty(doc_title)){
        //     keywords[doc_title] = [];
        // }

        // let doc_searchVals = keywords[doc_title];
        let doc_searchVals = curDoc.keyword_matches
        // check if we're adding a duplicate
        if (cleaned_searchVal !== doc_searchVals[doc_searchVals.length - 1]) {
            doc_searchVals.push(cleaned_searchVal);
            // console.log('keywords: ', keywords);
        }
    }

    recordHighlight(startIndex: int, endIndex: int) {
        this.state.game_state['highlight']['startIndex'] = startIndex;
        this.state.game_state['highlight']['endIndex'] = endIndex;
    }

    updateCurrentDocument(title){

        if (this.curDocumentInfo.title) {
            postRequest(`/record_action?name=document_actions`, {data: {documentActions: this.curDocumentInfo}}); // record actions of prev doc
        }
        // reset cur doc
        this.curDocumentInfo = {'title': title, 'keyword_matches': [], 'intersectionEvents': []};
    }

    updateGameState(gameState) {
        this.setState({game_state: gameState});
    }

    async recordEvidence(text, selectedPassageId) {
        // this.state.game_state['evidence'].push(text); // TODO: make immutable update
        // let cur_doc_selected = this.state.game_state['cur_doc_selected']
        // this.state.game_state['evidence'][cur_doc_selected] = text;
        let game_state = await postRequest(`/record_evidence?evidence=${text}`);
        this.updateGameState(game_state);
        this.forceUpdate()
    }

    highlightToolCallback(action, text, selectedElement, selectedPassageId, context) {
        console.log('highlightToolCallback', action, text, selectedElement, selectedPassageId, context);

        if (action === 'record evidence') {
            this.recordEvidence(text, selectedPassageId);
        } else if (action === 'search documents') {
            this.processQuery(text, selectedElement, selectedPassageId, context);
        } else if (action === 'answer') {
            this.answerQuestion(text, selectedElement, selectedPassageId, context);
        }
    }

    startTutorial() {
        this.setState({ stepsEnabled: true });
    }
    onExit() {
        this.setState(() => ({ stepsEnabled: false }));
    }

    addIntersectionEvent(intersectionEvent) {
        this.curDocumentInfo.intersectionEvents.push(intersectionEvent);
    }

    render() {

        const { classes } = this.props;
        let game_state = this.state.game_state;

        // const greenTheme = createMuiTheme({ palette: { primary: green } })
        // const blueTheme = createMuiTheme({ palette: { primary: red } })

        // if there's no login token
        if (window.sessionStorage.getItem("token") == null) {
            return <Redirect to="/login" />;
        }
        // valid playing time or game over
        // console.log('game over', this.state.game_state['game_over'])
        if (!this.state.isValidPlayingTime || this.state.game_state['game_over'] || this.state.game_state['packet_finished']) {
            return <Redirect to="/" />;
        }
        

        let queries;
        if (this.state.game_state['queries']) {
            queries = this.state.game_state['queries'].map((query, index) =>
                <ListItem key={index}>
                    <ListItemText primary={query} />
                </ListItem>
            );
        }

        let docs_selected;
        if (this.state.game_state['documents_selected']) {
            docs_selected = this.state.game_state['documents_selected'].map((query, index) =>
                <ListItem key={index}>
                    <ListItemText primary={query} />
                </ListItem>
            );
        }

        let evidence_list;
        if (this.state.game_state['evidence']) {
            evidence_list = Object.values(this.state.game_state['evidence']).map((evidence, index) =>
                <ListItem key={index}>
                    <ListItemText primary={evidence} />
                </ListItem>
            );
        }

        let override_window;
        let points_breakdown;
        if (this.state.answerStatus != null) {
            if (this.state.answerStatus === 'correct') {
                let num_unread_clues = game_state['question_data']['tokenizations'].length - game_state['buzz_sentence_number']
                points_breakdown = 
                <div>
                    Score breakdown: <br />
                    {/* Sentence number: {this.state.game_state['buzz_sentence_number']} <br />
                    Total sentences: {this.state.game_state['question_data']['tokenizations'].length} <br /> */}
                    Number of unread clues = {num_unread_clues} <br />
                    Score = 10 * (Number of unread clues) + 10 = {10 * num_unread_clues + 10}
                </div>
            }
            override_window = 
            <div>
                <p>{this.state.answerStatus.toUpperCase()}. You answered {this.state.game_state['player_answer']}, our answer is {this.state.game_state.question_data['answer'].replaceAll("_"," ")}). 
                Press any key to continue, or contest the decision. </p>
                {points_breakdown}

                <Button variant="contained" color="primary" onClick={() => this.advanceQuestion()} className={classes.margin}>
                    Continue (any key)
                </Button>
                <Button variant="contained" color="secondary" onClick={() => this.advanceQuestion(true)} className={classes.margin}>
                    Contest decision
                </Button>
            </div>
        }

        {/* <ThemeProvider theme={greenTheme}>
                                    <Button variant="contained" color="primary" className={classes.margin}>
                                    Theme Provider
                                    </Button>
                                </ThemeProvider> */}
        
        const {
            stepsEnabled,
            steps,
            initialStep,
            } = this.state;
        
        const tutorial = <Button variant="contained" color="primary" disableElevation onClick={this.startTutorial}>
            Tutorial
        </Button>

        return (

            <div className={classes.root}>
                
                <Steps
                    enabled={stepsEnabled}
                    steps={steps}
                    initialStep={initialStep}
                    onExit={this.onExit}
                />

                
                <Navbar page="game" endDateTime={this.state.endDateTime} tutorial={tutorial}/>

                <div className={classes.body} style={{maxWidth: 1500, margin: "auto"}}>
                    <Grid container spacing={1}
                        bgcolor="background.paper"
                    >   
                        <Grid item xs={9} style={{'justifyContent': 'flex-start'}}>

                            {/* answer form */}
                            <Grid item xs={12}>
                                <div className="flex-container" style={{"display": "flex", "alignItems": "center", "justifyContent": "space-between"}}>
                                    <div style={{padding: 10}} id="answerBox">
                                        {/* <AnswerForm onSubmit={this.finishQuestion} label="Answer" /> */}
                                        <AnswerForm 
                                            evidence={this.state.game_state['evidence']}
                                            onSubmit={(answer)=>{this.answerQuestion(answer); document.activeElement.blur()}} 
                                            label="Answer" 
                                            />
                                    </div>
                                    {/* <div style={{padding: 10}}>
                                        <Buzzer onClick={this.handleBuzz} 
                                            onTimeout={this.advanceQuestion} 
                                            interrupted={this.state.interrupted}/>
                                    </div> */}
                                    <div style={{padding: 10}}>
                                        <Button variant="contained" color="secondary" onClick={() => this.advanceQuestion(null, true)}>
                                            Skip Question
                                        </Button>
                                    </div>
                                </div>

                                {override_window}
                          
                            </Grid>

                            {/* question display */}
                            <Grid item xs={12} id="questionText" >
                                <Paper className={classes.paper} style={{ "textAlign": "left" }}>
                                    <h3>Question {this.state.game_state['question_number']}</h3>
                                    {Object.keys(this.state.game_state).length > 0 ?
                                        <div>
                                            <QuestionDisplay
                                                text={this.state.game_state['question_data']['question']}
                                                tokenizations={this.state.game_state['question_data']['tokenizations']}
                                                updateSentencePosition={(index) => this.setState({ sentenceIndex: index })} 
                                                // sentenceIndex={this.state.sentenceIndex}
                                            />
                                        </div>
                                        
                                        // <QuestionDisplay
                                        //     text={this.state.game_state['question_data']['question']}
                                        //     interrupted={this.state.interrupted}
                                        //     updateSentencePosition={(index) => this.setState({ sentenceIndex: index })}
                                        //     wordIndex={this.state.wordIndex}
                                        //     updateWordIndex={() => this.setState({wordIndex: this.state.wordIndex + 1})}/>
                                        : "Loading..."
                                    }
                                </Paper>
                            </Grid>
                            

                        {/* full document search */}
                        {/* <Grid item xs={12}>
                            <Searcher 
                                currentQuery={this.state.currentQuery}
                                processQuery={this.processQuery}
                                searchLoading={this.state.searchLoading}
                                retrievedTitles={this.state.retrievedTitles}
                                updateGameState={this.updateGameState} 
                                recordKeywordSearchTerms={this.recordKeywordSearchTerms}
                                updateCurrentDocument={this.updateCurrentDocument}
                                recordHighlight={this.recordHighlight}
                            />
                        </Grid> */}

                        {/* passage search */}
                        <Grid item xs={12} id="searcher">
                            {/* <SearcherTfidf updateGameState={this.updateGameState} 
                                recordKeywordSearchTerms={this.recordKeywordSearchTerms}
                                updateCurrentDocument={this.updateCurrentDocument}
                                recordHighlight={this.recordHighlight}
                                /> */}
                            <SearcherPassage 
                                currentQuery={this.state.currentQuery}
                                processQuery={(query) => this.processQuery(query, 'search_box')}
                                searchLoading={this.state.searchLoading}
                                // retrievedTitles={this.state.retrievedTitles}
                                passages={this.state.passages}

                                updateGameState={this.updateGameState} 
                                recordKeywordSearchTerms={this.recordKeywordSearchTerms}
                                updateCurrentDocument={this.updateCurrentDocument}
                                recordHighlight={this.recordHighlight}
                                addIntersectionEvent={this.addIntersectionEvent}
                                currentQuestionId={this.state.game_state.question_id}
                                curDocumentInfo={this.curDocumentInfo}
                                />
                        </Grid>

                    </Grid>

                    {/* Toolbar */}
                        <Grid item xs={3} id="toolbar">
                            <Paper className={classes.paper}>
                                {Object.keys(this.state.game_state).length > 0 ?
                                    <div >                                        
                                        <h2>
                                        Score: {this.state.game_state['score']} <br />
                                        </h2>
                                        <h3>
                                        Evidence score: {this.state.game_state['evidence_score']} <br />
                                        Packet Number: {this.state.game_state['packet_number']} <br />
                                        </h3>

                                        {/* debugging */}
                                        {/* Answer: {this.state.page} <br /> */}
                                        {/* Question Number: {this.state.game_state['question_number']} <br /> */}
                                        {/* Question ID: {this.state.game_state['question_id']} <br /> */}
                                        {/* Category: {this.state.game_state['question_data']['category']} <br />
                                        {question_data['tournament']} {question_data['year']} */}
                                    </div>
                                : "Waiting"}

                                    <HighlightTool 
                                        shortcutKey={69} 
                                        // callback={this.recordEvidence}
                                        // searchDocuments={this.processQuery}
                                        // answer={this.answerQuestion}
                                        callback={this.highlightToolCallback}
                                    />

                                    <h4>Evidence</h4> 
                                    <List component="nav" aria-label="search results" border={1}
                                        style={{ 
                                            maxHeight: MAX_HEIGHT, 
                                            overflow: "scroll", 
                                            whiteSpace: "pre-wrap", 
                                            textAlign: "left", 
                                            }}>
                                        {evidence_list}
                                    </List>

                                    <h4>Previous queries</h4> 
                                    <List component="nav" aria-label="search results" border={1}
                                        style={{ 
                                            maxHeight: MAX_HEIGHT, 
                                            overflow: "scroll", 
                                            whiteSpace: "pre-wrap", 
                                            textAlign: "left", 
                                            }}>
                                        {queries}
                                    </List>
                                    
                                    <h4>Previous documents</h4> 
                                    <List component="nav" aria-label="search results"
                                        style={{ 
                                            maxHeight: MAX_HEIGHT, 
                                            overflow: "scroll", 
                                            whiteSpace: "pre-wrap", 
                                            textAlign: "left", 
                                            }}>
                                        {docs_selected}
                                    </List>

                                    <h4>Keyboard shortcuts:</h4>
                                    <div style={{ textAlign: "left"}}>
                                        <ul>
                                        {/* <li>Buzz: <code>space</code></li> */}
                                        <li>Query (focus on search box or auto-search highlighted text): <code>Ctrl-s</code>.</li>
                                        <li>Keyword search: <code>Ctrl-f</code></li>
                                        <li>Record evidence: <code>Ctrl-e</code></li>     
                                        <li>Answer from highlight: <code>Ctrl-space</code></li>                              
                                        </ul>
                                    
                                    </div>
                            </Paper>
                        </Grid>
                    </Grid>

                </div>
            </div>
        );
    }
}

export default withStyles(useStyles)(Dashboard);
