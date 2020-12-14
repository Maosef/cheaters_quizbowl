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

import Navbar from './Navbar'

import AnswerForm from './AnswerForm';
import Buzzer from './Buzzer';
import Button_React from './Button_React'
import ContinueButton from './ContinueButton';

// import QuestionDisplay from './Components/QuestionDisplayUntimed';
import QuestionDisplay from './Components/QuestionDisplay';
import Searcher from './Components/Searcher';

import { withStyles } from '@material-ui/core/styles';
import useStyles from './Styles';

import './App.css';


// main Dashboard. Load question, handle interrupt, load next question
// preloaded questions for experiment setting

let server_url = "";
let num_questions = 20408;


class Dashboard extends React.Component {
    constructor(props) {
        super(props);
        this.handleBuzz = this.handleBuzz.bind(this);
        // this.fetchData = this.fetchData.bind(this);
        // this.finishQuestion = this.finishQuestion.bind(this);
        this.skipQuestion = this.skipQuestion.bind(this);
        this.logQueryData = this.logQueryData.bind(this);

        this.postRequest = this.postRequest.bind(this);
        this.answerQuestion = this.answerQuestion.bind(this);
        this.advanceQuestion = this.advanceQuestion.bind(this);
        this.recordKeywordSearchTerms = this.recordKeywordSearchTerms.bind(this);
        this.updateCurrentDocument = this.updateCurrentDocument.bind(this);

        this.maxAttempts = 1;
        this.queryData = new Map();

        this.keywords = {};

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
        // save game progress
    }

    handleBuzz() {
        this.setState({
            interrupted: true
        });
        console.log('interrupted', this.state.interrupted);
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
                let points = 10
                alert("Correct. Answer is " + game_state['answer'] + ". Points added: " + points);
                game_state['score'] += points;
                console.log('score', game_state['score']);
                this.setState({game_state: game_state});
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
        this.postRequest(`/record_keyword_search`, {'keywords': this.keywords});
        this.keywords = {};
        this.postRequest(`/advance_question`).then(data => {
            this.setState({game_state: data, interrupted: false});

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
    recordKeywordSearchTerms(searchVal: str){
        // this.setState({keywords: this.state.keywords + [searchVal]}) # bug: this clears the search box
        
        let cleaned_searchVal = searchVal.trim()
        let doc_title = this.state.game_state['cur_doc_selected'];
        if (!this.keywords.hasOwnProperty(doc_title)){
            this.keywords[doc_title] = [];
        }

        let doc_searchVals = this.keywords[this.state.game_state['cur_doc_selected']]
        // check if we're adding a duplicate
        if (cleaned_searchVal !== doc_searchVals[doc_searchVals.length - 1]) {
            doc_searchVals.push(cleaned_searchVal);
            console.log('keywords: ', this.keywords);
        }
    }

    updateCurrentDocument(doc_title: str){
        // console.log('keywords: ', this.keywords);
        this.state.game_state['cur_doc_selected'] = doc_title;
    }

    // parse answer form, record data, get score
    // finishQuestion(playerAnswer) {
    //     let state = this.state;
    //     let question_idx = this.state.question_idx + 1; //state won't update immediately
        
    //     // parse answer for correctness
    //     if (this.cleanText(playerAnswer) == this.cleanText(this.state.page)) {
    //         let points = state.tokenizations.length - state.sentenceIndex;
    //         alert("Correct. Answer is " + this.state.page + ". Points added: " + points);
    //         // console.log('correct');
    //         this.setState({
    //             score: this.state.score + points
    //         });
    //     } else { // wrong answer
    //         console.log("Attempts", this.state.numAttempts, this.maxAttempts)
    //         if (this.state.numAttempts < this.maxAttempts) {
    //             alert(`Incorrect. Tries left: ${this.maxAttempts-this.state.numAttempts}`);
    //             this.setState({numAttempts: this.state.numAttempts + 1});
    //             return;
    //         } else {
    //             alert("Incorrect. Answer is " + this.state.page);
    //         }
    //     }

    //     this.setState({
    //         numAttempts: 1, interrupted: false, numSeen: this.state.numSeen + 1, question: "", question_idx: this.state.question_idx + 1
    //     });
    //     console.log(question_idx)
    //     console.log("data: ", this.queryData);

    //     let answer_data = {
    //         session_id: window.sessionStorage.getItem("token"),
    //         question_id: this.state.question_id,
    //         answer: playerAnswer,
    //         // query: query,
    //         // evidence: evidence,
    //         stop_position: this.state.sentenceIndex,
    //     };
    //     console.log(answer_data);
    //     // log data: session, email, questionID, answer, query, evidence
    //     // fetch('/api/qanta/v1/post_data', {
    //     //     method: 'POST', // or 'PUT'
    //     //     headers: {
    //     //         'Content-Type': 'application/json',
    //     //     },
    //     //     body: JSON.stringify(answer_data),
    //     //     })
    //     //     .then(response => response.json())
    //     //     .then(data => {
    //     //     console.log('Post Success:', data);
    //     //     })
    //     //     .catch((error) => {
    //     //     console.error('Error:', error);
    //     //     });

    //     //load the next question (on a time delay)
    //     if (question_idx < this.question_ids.length) {
    //         console.log("Question " + question_idx);
    //         let question_id = this.question_ids[question_idx];
    //         setTimeout(this.fetchData(question_id), 2000);

    //     } else {
    //         alert('Test Completed. Thank you for your time!')
    //     }

    // }

    skipQuestion() {
        let question_idx = this.state.question_idx + 1
        this.setState({
            interrupted: false, numSeen: this.state.numSeen + 1, question: "", question_idx: question_idx
        });
        let question_id = this.question_ids[question_idx];
        setTimeout(this.fetchData(question_id), 2000);
    }

    logQueryData(queryData) {
        this.queryData = queryData;
    }

    render() {

        if (window.sessionStorage.getItem("token") == null) {
            return <Redirect to="/login" />;
        }
        const { classes } = this.props;

        let question_data = this.state.game_state['question_data'];

        return (

            <div className={classes.root}>

                {/* <AppBar position="static">
                    <Toolbar>
                        <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" className={classes.title}>
                            Cheater's Quizbowl
                    </Typography>
                        <Button color="inherit">Logout</Button>
                    </Toolbar>
                </AppBar> */}
                
                <Navbar />

                <div className={classes.body} style={{maxWidth: 1200, margin: "auto"}}>
                    <Grid container spacing={3}
                        bgcolor="background.paper"
                    >   
                        {/* answer form */}
                        <Grid item xs={8}>
                            
                            <div className="flex-container" style={{"display": "flex", "alignItems": "center"}}>
                                <div style={{padding: 10}}>
                                    {/* <AnswerForm onSubmit={this.finishQuestion} label="Answer" /> */}
                                    <AnswerForm onSubmit={this.answerQuestion} label="Answer" />
                                </div>
                                <div style={{padding: 10}}>
                                    <Buzzer onClick={this.handleBuzz} onTimeout={this.advanceQuestion} />
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
                            <Paper className={classes.paperBig} style={{ "textAlign": "left" }}>
                                {Object.keys(this.state.game_state).length > 0 ?
                                    // <QuestionDisplay
                                    //     text={this.state.game_state['question_data']['text']}
                                    //     tokenizations={this.state.game_state['question_data']['tokenizations']}
                                    //     updateSentencePosition={(index) => this.setState({ sentenceIndex: index })} />
                                    <QuestionDisplay
                                        text={this.state.game_state['question_data']['text']}
                                        interrupted={this.state.interrupted}
                                        updateSentencePosition={(index) => this.setState({ sentenceIndex: index })} />
                                    : "Loading..."
                                }
                            </Paper>
                        </Grid>
                        
                        {/* document search */}
                        <Grid item xs={12}>
                            <Searcher sendData={this.logQueryData} 
                                recordKeywordSearchTerms={this.recordKeywordSearchTerms}
                                updateCurrentDocument={this.updateCurrentDocument}/>
                        </Grid>
                        

                        <Grid item xs={4}>
                            {Object.keys(this.state.game_state).length > 0 ?
                                <Paper className={classes.paper}>
                                
                                Statistics <br /><br />
                                Category: {this.state.game_state['question_data']['category']} <br />
                                    {/* Answer: {this.state.page} <br /> */}
                                Score: {this.state.game_state['score']} <br />
                                Number of Questions seen: {question_data['numSeen']} <br />
                                {question_data['tournament']} {question_data['year']}
                                
                                </Paper>
                            : "Waiting"}
                        </Grid>
                        <Grid item xs={4}>
                            <Paper className={classes.paper}>
                                Instructions <br /><br />
                            Try to answer the quizbowl question using as few clues as possible. <br />
                            You may use the internal search engine to search Wikipedia articles.
                            Using the keyword search is encouraged! <br /> <br />
                            Keyboard shortcuts: <br />
                            Buzz/Answer: <code>Ctrl-space</code> <br />
                            Query: <code>Ctrl-D</code> <br />
                            Keyword search: <code>Ctrl-F</code> <br />
                            Query highlighted text: <code>Ctrl+s</code> <br />
                            {/* Hit <code>Continue</code> to reveal the next clue. <br /> */}
                            Type <code>Enter</code> to submit your answer. You get one attempt.

                            </Paper>
                        </Grid>
                        {/* <Grid item xs={4}>
                            <Paper className={classes.paper}>
                                Settings <br /><br />
                                Reading speed: {this.state.category} <br />

                            </Paper>
                        </Grid> */}
                    </Grid>
                </div>
            </div>
        );
    }
}

export default withStyles(useStyles)(Dashboard);
