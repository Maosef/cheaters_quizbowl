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


import Searcher from '../Components/SearcherControlled';
import SearcherTfidf from '../Components/SearcherTfidf';
import SearcherPassage from '../Components/SearcherPassage';

import {postRequest, getRequest} from '../utils';

import '../App.css';
import HighlightTool from '../Components/HighlightTool';
import HighlightRecorder from '../Components/HighlightRecorder';

import TabTool from '../Components/TabTool';

import { createMuiTheme, withStyles, makeStyles, ThemeProvider } from '@material-ui/core/styles';
import useStyles from '../Styles';
import { green, purple } from '@material-ui/core/colors';


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

        this.handleShortcut = this.handleShortcut.bind(this);
        this.deactivateShortcut = this.deactivateShortcut.bind(this);

        this.maxAttempts = 1;

        this.keywords = {};
        this.passage_keywords_map = {};

        this.state = {

            game_state: {}, // game state used by server

            currentQuery: '',
            searchLoading: false,
            retrievedTitles: [],
            // sessionToken: "",
            // question_id: -1,
            // question_idx: 0,
            // question: "",
            // category: "",
            // page: "",
            // tokenizations: [], //list of lists
            // year: -1,
            // tournament: "",

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
        }
    }

    // on init: authenticate, grab the user data, fetch first question
    async componentDidMount() {
        // start game
        let username = window.sessionStorage.getItem("username");
        let token = window.sessionStorage.getItem("token");
        
        postRequest('start_new_game', {'username': username, 'session_token': token, 'mode': 'sentence'}).then(data => {
            console.log('new game started, ', data);
            this.setState({game_state: data});
        });

        // console.log('new game started, ', response.json());
        // this.setState({game_state: response.json()});

        // buzzer shortcut
        window.addEventListener("keydown", this.handleShortcut);
        window.addEventListener("keyup", this.deactivateShortcut);

        // answer shortcut
        // HighlightRecorder(81, this.answerQuestion);
        HighlightRecorder(81, this.answerQuestion);
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
    async processQuery(query) {
        console.log(`query: ${query}`);
        if (!query){
            return
        }
        
        this.setState({
            searchLoading: true,
            currentQuery: query
        })

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


    answerQuestion(answer, expanded_answer) {

        console.log(`expanded answer: ${expanded_answer}`)
        postRequest(`/answer?answer=${answer}&context=${expanded_answer}&sentence_index=${this.state.sentenceIndex}`).then(data => {
            this.setState({game_state: data});
            let game_state = data;

            // parse answer for correctness
            if (game_state['answer_correct']){
                this.setState({answerStatus: "correct"});
            } else {
                this.setState({answerStatus: "incorrect"});
            }
            

            // if (game_state['answer_correct']) {
            //     alert("Correct. Answer is " + game_state['answer'] + ". Score: " + game_state['score']);
            //     this.advanceQuestion();
            // } else { // wrong answer
            //     // console.log("Attempts", this.state.numAttempts, this.maxAttempts)
            //     if (this.state.numAttempts < this.maxAttempts) {
            //         alert(`Incorrect. Tries left: ${this.maxAttempts-this.state.numAttempts}`);
            //         this.setState({numAttempts: this.state.numAttempts + 1});
            //         return;
            //     } else {
            //         alert("Incorrect. Answer is " + game_state['answer']);
            //         this.advanceQuestion();
            //     }
            // }
        });
    }

    // advance to next question
    advanceQuestion(player_decision=null, skip=false){
        // record keyword search data
        console.log('keywords: ', this.keywords);
        postRequest(`/record_keyword_search`, {
            'keywords': this.keywords, 
            'passage_keywords_map': this.passage_keywords_map});
        this.keywords = {};
        this.passage_keywords_map = {};

        postRequest(`/advance_question?player_decision=${player_decision}&skip=${skip}`).then(data => {
            // reset state
            this.setState({game_state: data, interrupted: false, wordIndex: 0, sentenceIndex: 0, answerStatus: null});

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
        // console.log('doc title: ', doc_title)
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

    recordHighlight(startIndex: int, endIndex: int) {
        this.state.game_state['highlight']['startIndex'] = startIndex;
        this.state.game_state['highlight']['endIndex'] = endIndex;
    }

    updateCurrentDocument(doc: Object){
        // console.log('keywords: ', this.keywords);
        this.state.game_state['cur_doc_selected'] = doc;
    }

    updateGameState(gameState) {
        this.setState({game_state: gameState});
    }

    async recordEvidence(text) {
        this.state.game_state['evidence'].push(text);
        // let cur_doc_selected = this.state.game_state['cur_doc_selected']
        // this.state.game_state['evidence'][cur_doc_selected] = text;
        let game_state = await postRequest(`/record_evidence?evidence=${text}`);
        this.updateGameState(game_state);
        this.forceUpdate()
    }

    render() {

        const { classes } = this.props;

        // const greenTheme = createMuiTheme({ palette: { primary: green } })
        // const blueTheme = createMuiTheme({ palette: { primary: red } })

        if (window.sessionStorage.getItem("token") == null) {
            return <Redirect to="/login" />;
        }

        let question_data = this.state.game_state['question_data'];



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
        if (this.state.answerStatus != null) {
            override_window = <div>
                <p>We judged the answer as {this.state.answerStatus} (Our answer is {this.state.game_state.question_data['answer'].replaceAll("_"," ")}). 
                Press any key to continue, or override. </p>
                <Button variant="contained" color="primary" onClick={() => this.advanceQuestion()} className={classes.margin}>
                    Continue (any key)
                </Button>
                <Button variant="contained" color="secondary" onClick={() => this.advanceQuestion(true)} className={classes.margin}>
                    Override decision
                </Button>
            </div>
        }

        {/* <ThemeProvider theme={greenTheme}>
                                    <Button variant="contained" color="primary" className={classes.margin}>
                                    Theme Provider
                                    </Button>
                                </ThemeProvider> */}
        

        return (

            <div className={classes.root}>
                
                <Navbar text="Cheater's Bowl, Sentence Split" />

                <div className={classes.body} style={{maxWidth: 1500, margin: "auto"}}>
                    <Grid container spacing={1}
                        bgcolor="background.paper"
                    >   
                        <Grid item xs={9} style={{'justifyContent': 'flex-start'}}>

                            {/* answer form */}
                            <Grid item xs={12}>
                                <div className="flex-container" style={{"display": "flex", "alignItems": "center", "justifyContent": "space-between"}}>
                                    <div style={{padding: 10}}>
                                        {/* <AnswerForm onSubmit={this.finishQuestion} label="Answer" /> */}
                                        <AnswerForm 
                                            evidence={this.state.game_state['evidence']}
                                            onSubmit={(answer)=>{this.answerQuestion(answer); document.activeElement.blur()}} 
                                            label="Answer" />
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
                            {/* <Grid item xs={4}></Grid>
                            <Grid item xs={4}></Grid> */}

                            {/* question display */}
                            <Grid item xs={12}>
                                <Paper className={classes.paper} style={{ "textAlign": "left" }}>
                                    <h3>Question {this.state.game_state['question_number']}</h3>
                                    {Object.keys(this.state.game_state).length > 0 ?
                                        <QuestionDisplay
                                            text={this.state.game_state['question_data']['question']}
                                            tokenizations={this.state.game_state['question_data']['tokenizations']}
                                            updateSentencePosition={(index) => this.setState({ sentenceIndex: index })} />
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
                        <Grid item xs={12}>
                            {/* <SearcherTfidf updateGameState={this.updateGameState} 
                                recordKeywordSearchTerms={this.recordKeywordSearchTerms}
                                updateCurrentDocument={this.updateCurrentDocument}
                                recordHighlight={this.recordHighlight}
                                /> */}
                            <SearcherPassage 
                                currentQuery={this.state.currentQuery}
                                processQuery={(query) => this.processQuery(query, 'passage')}
                                searchLoading={this.state.searchLoading}
                                // retrievedTitles={this.state.retrievedTitles}
                                passages={this.state.passages}

                                updateGameState={this.updateGameState} 
                                recordKeywordSearchTerms={this.recordKeywordSearchTerms}
                                updateCurrentDocument={this.updateCurrentDocument}
                                recordHighlight={this.recordHighlight}
                                />
                        </Grid>

                    </Grid>

                    {/* Toolbar */}
                        <Grid item xs={3}>
                            <Paper className={classes.paper}>
                                {Object.keys(this.state.game_state).length > 0 ?
                                    <div >                                        
                                        <h2>
                                        Score: {this.state.game_state['score']} <br />
                                        </h2>
                                        <h3>
                                        Evidence score: {this.state.game_state['evidence_score']} <br />
                                        </h3>

                                        {/* debugging */}
                                        {/* Answer: {this.state.page} <br /> */}
                                        {/* Question Number: {this.state.game_state['question_number']} <br /> */}
                                        Question ID: {this.state.game_state['question_id']} <br />
                                        {/* Category: {this.state.game_state['question_data']['category']} <br />
                                        {question_data['tournament']} {question_data['year']} */}
                                    </div>
                                : "Waiting"}

                                    <HighlightTool 
                                        shortcutKey={69} 
                                        callback={this.recordEvidence}
                                        searchDocuments={this.processQuery}
                                        answer={this.answerQuestion}
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