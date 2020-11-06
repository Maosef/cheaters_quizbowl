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

import QuestionDisplay from './Components/QuestionDisplayUntimed';
import Searcher from './Components/Searcher';

import { withStyles } from '@material-ui/core/styles';
import useStyles from './Styles';

import './App.css';

import KeywordSearch from './KeywordSearch';


// main Dashboard. Load question, handle interrupt, load next question
// preloaded questions for experiment setting

// let server_url = "http://127.0.0.1:8000";
// let server_url = "http://127.0.0.1:8000/api/qanta/v1/random"
let server_url = "";
let num_questions = 20408;


class Dashboard extends React.Component {
    constructor(props) {
        super(props);
        this.handleBuzz = this.handleBuzz.bind(this);
        this.fetchData = this.fetchData.bind(this);
        this.finishQuestion = this.finishQuestion.bind(this);
        // this.finishQuestion_multi = this.finishQuestion_multi.bind(this);
        this.cleanText = this.cleanText.bind(this);
        this.skipQuestion = this.skipQuestion.bind(this);
        this.logQueryData = this.logQueryData.bind(this);

        //preloaded questions
        this.question_ids = [181475, 16848, 115844, 26626, 53873, 6449, 15469, 102066, 151976, 90037];

        this.maxAttempts = 3;
        this.queryData = new Map();

        // mutable state
        this.state = {
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
            finished: false,
            numSeen: 0,
            score: 0,
            isLoaded: false,
            sentenceIndex: 0,
            numAttempts: 1, // number of attempts on current question

        }
        
    }

    // on init: authenticate, grab the user data, fetch first question
    componentDidMount() {
        let question_id = this.question_ids[0];
        this.fetchData(question_id);
    }
    // componentWillUnmount() {
    //     alert('unmounting');
    // }

    handleBuzz() {
        console.log(this.state.interrupted);
        this.setState({
            interrupted: !this.state.interrupted
        });
    }

    // fetch data from server
    fetchData(question_id) {
        // let id = Math.floor(Math.random() * num_questions);

        // fetch(server_url + "/get_question/")
        fetch(server_url + "/api/qanta/v1/" + question_id)
            .then(res => res.json())
            .then(
                (result) => {
                    // console.log('Result: ', result.question);
                    this.setState({
                        isLoaded: true,
                        // question: result.question.replace(/\|\|\|/g,""),
                        question_id: result.qanta_id,
                        question: result.text,
                        answer: result.answer,
                        category: result.category,
                        page: result.page,
                        tokenizations: result.tokenizations,
                        year: result.year,
                        tournament: result.tournament
                    });
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    console.log('error');
                    this.setState({
                        isLoaded: true,
                        error
                    });
                }
            )
    }

    cleanText(text) { //remove accents, text in parentheses, whitespace and punctuation
        let string_norm = text.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
        let str_no_paren = string_norm.replace(/ *\([^)]*\) */g, "");
        let cleanText = str_no_paren.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()\s"'”“]/g, "");
        // alert(cleanText)
        return cleanText;
    }

    // record data from answerform_multi, get score
    // finishQuestion_multi(query,evidence,playerAnswer){
    //     let state = this.state;
    //     let question_idx = this.state.question_idx + 1; //state won't update immediately
    //     this.setState({
    //         interrupted: false, numSeen: this.state.numSeen + 1, question: "", question_idx: this.state.question_idx + 1
    //     });
    //     console.log(question_idx)
    //     if (this.cleanText(playerAnswer) == this.cleanText(this.state.page)) {
    //         let points = state.tokenizations.length - state.sentenceIndex;
    //         alert("Correct. Answer is " + this.state.page + ". Points added: " + points);
    //         // console.log('correct');
    //         this.setState({
    //             score: this.state.score + points
    //         });
    //     } else {
    //         alert("Incorrect. Answer is " + this.state.page);
    //         // console.log('incorrect');
    //     }
    //     let answer_data = {
    //         session_id: window.sessionStorage.getItem("token"),
    //         question_id: this.state.question_id,
    //         answer: playerAnswer,
    //         query: query,
    //         evidence: evidence,
    //         stop_position: this.state.sentenceIndex,
    //     };
    //     console.log(answer_data);
    //     // log data: session, email, questionID, answer, query, evidence
    //     fetch('/api/qanta/v1/post_data', {
    //         method: 'POST', // or 'PUT'
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify(answer_data),
    //         })
    //         .then(response => response.json())
    //         .then(data => {
    //         console.log('Post Success:', data);
    //         })
    //         .catch((error) => {
    //         console.error('Error:', error);
    //         });

    //     if (question_idx < this.question_ids.length){
    //         console.log("Question " + question_idx);
    //         let question_id = this.question_ids[question_idx];
    //         setTimeout(this.fetchData(question_id), 2000);

    //     } else {
    //         alert('Test Completed. Thank you for your time!')
    //     }

    // }

    finishQuestionBackend(playerAnswer) {
    }
    // parse answer form, record data, get score
    finishQuestion(playerAnswer) {
        let state = this.state;
        let question_idx = this.state.question_idx + 1; //state won't update immediately
        
        // parse answer for correctness
        if (this.cleanText(playerAnswer) == this.cleanText(this.state.page)) {
            let points = state.tokenizations.length - state.sentenceIndex;
            alert("Correct. Answer is " + this.state.page + ". Points added: " + points);
            // console.log('correct');
            this.setState({
                score: this.state.score + points
            });
        } else { // wrong answer
            console.log("Attempts", this.state.numAttempts, this.maxAttempts)
            if (this.state.numAttempts < this.maxAttempts) {
                alert(`Incorrect. Tries left: ${this.maxAttempts-this.state.numAttempts}`);
                this.setState({numAttempts: this.state.numAttempts + 1});
                return;
            } else {
                alert("Incorrect. Answer is " + this.state.page);
            }
        }

        this.setState({
            numAttempts: 1, interrupted: false, numSeen: this.state.numSeen + 1, question: "", question_idx: this.state.question_idx + 1
        });
        console.log(question_idx)
        console.log("data: ", this.queryData);

        let answer_data = {
            session_id: window.sessionStorage.getItem("token"),
            question_id: this.state.question_id,
            answer: playerAnswer,
            // query: query,
            // evidence: evidence,
            stop_position: this.state.sentenceIndex,
        };
        console.log(answer_data);
        // log data: session, email, questionID, answer, query, evidence
        // fetch('/api/qanta/v1/post_data', {
        //     method: 'POST', // or 'PUT'
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify(answer_data),
        //     })
        //     .then(response => response.json())
        //     .then(data => {
        //     console.log('Post Success:', data);
        //     })
        //     .catch((error) => {
        //     console.error('Error:', error);
        //     });

        //load the next question (on a time delay)
        if (question_idx < this.question_ids.length) {
            console.log("Question " + question_idx);
            let question_id = this.question_ids[question_idx];
            setTimeout(this.fetchData(question_id), 2000);

        } else {
            alert('Test Completed. Thank you for your time!')
        }

    }

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
        // console.log('rendering...')
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
                            {/* <Buzzer onClick={this.handleBuzz} onTimeout={this.finishQuestion} style={{flex: 1}} /> */}
                            
                            <div className="flex-container" style={{"display": "flex", "align-items": "center"}}>
                                <div style={{padding: 10}}>
                                    <AnswerForm onSubmit={this.finishQuestion} label="Answer" />
                                    {/* <AnswerForm onSubmit={this.finishQuestion_multi} label="Answer_multi" /> */}
                                </div>
                                <div style={{padding: 10}}>
                                    <Button variant="contained" color="secondary" onClick={this.skipQuestion}>
                                        Skip
                                    </Button>
                                </div>
                            </div>
                                                        
                        </Grid>

                        {/* question display */}
                        <Grid item xs={12}>
                            <Paper className={classes.paperBig} style={{ "textAlign": "left" }}>
                                {this.state.question.length ?
                                    <QuestionDisplay
                                        text={this.state.question}
                                        tokenizations={this.state.tokenizations}
                                        updateSentencePosition={(index) => this.setState({ sentenceIndex: index })} />
                                    : "Waiting"
                                }
                            </Paper>
                        </Grid>
                        
                        {/* document search */}
                        <Grid item xs={12}>
                            {/* <Paper className={classes.paperBig}> */}
                            <Searcher sendData={this.logQueryData} />
                            {/* </Paper> */}
                        </Grid>
                        

                        <Grid item xs={4}>
                            <Paper className={classes.paper}>
                                Statistics <br /><br />
                            Category: {this.state.category} <br />
                                {/* Answer: {this.state.page} <br /> */}
                            Score: {this.state.score} <br />
                            Number of Questions seen: {this.state.numSeen} <br />
                                {this.state.tournament} {this.state.year}

                            </Paper>
                        </Grid>
                        <Grid item xs={4}>
                            <Paper className={classes.paper}>
                                Instructions <br /><br />
                            Try to answer the quizbowl question using as few clues as possible. Fewer clues = higher score. <br />
                            You may use the internal search engine to search Wikipedia articles.
                            Using the keyword search is encouraged! <br />
                            Keyboard shortcuts: <br />
                            Document search: Ctrl-D <br />
                            Keyword search: Ctrl-F <br />
                            Answer: Ctrl-A <br />
                            {/* Highlight helpful text (if any). <br /> */}
                            Hit <code>Continue</code> to reveal the next clue. <br />
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
