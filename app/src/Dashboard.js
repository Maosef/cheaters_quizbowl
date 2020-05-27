import React, { useState } from 'react';
import { Redirect } from "react-router-dom";

import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import AnswerForm from './AnswerForm_multi';
import Buzzer from './Buzzer';
import ContinueButton from './ContinueButton';

import QuestionDisplay from './QuestionDisplayUntimed';
import Searcher from './Searcher';

import { withStyles } from '@material-ui/core/styles';
import useStyles from './Styles';

import './App.css';

// import {floor, random} from Math;
// main Dashboard. Load question, handle interrupt, load next question

let server_url = "http://127.0.0.1:8000";
// let server_url = "http://127.0.0.1:8000/api/qanta/v1/random"

let num_questions = 20408;


class Dashboard extends React.Component {
    constructor(props) {
        super(props);
        this.handleBuzz = this.handleBuzz.bind(this);

        this.fetchData = this.fetchData.bind(this);
        this.finishQuestion = this.finishQuestion.bind(this);
        this.finishQuestion_multi = this.finishQuestion_multi.bind(this);
        this.cleanText = this.cleanText.bind(this);
        

        this.state = {
            sessionToken: "",
            question_id: -1,
            question: "",
            category: "",


            interrupted: false,
            finished: false,
            numSeen: 0,
            score: 0,
            isLoaded: false,
            sentenceIndex: 0,
        }
    }
    
    // on init: authenticate, grab the user data, fetch first question
    componentDidMount() {
        
        this.fetchData();
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

    // handleContinue() {

    // }

    // fetch data from server
    fetchData() {
        // let id = Math.floor(Math.random() * num_questions);
        
        // fetch(server_url + "/get_question/")
        fetch(server_url + "/api/qanta/v1/random")
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
                        category: result.category
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

    cleanText(text){
        let cleanText = text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
        // alert(cleanText)
        return cleanText;
    }

    finishQuestion_multi(query,evidence,playerAnswer){
        this.setState({
            interrupted: false, numSeen: this.state.numSeen + 1, question: ""
        });
        if (this.cleanText(playerAnswer) == this.cleanText(this.state.answer)) {
            alert("Correct");
            // console.log('correct');
            this.setState({
                score: this.state.score + 1
            });
        } else {
            alert("Incorrect");
            // console.log('incorrect');
        }
        let answer_data = {
            session_id: window.sessionStorage.getItem("token"),
            question_id: this.state.question_id,
            answer: playerAnswer,
            query: query,
            evidence: evidence,
            stop_position: this.state.sentenceIndex,
        };
        console.log(answer_data);
        // log data: session, email, questionID, answer, query, evidence
        fetch('/api/qanta/v1/post_data', {
            method: 'POST', // or 'PUT'
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(answer_data),
            })
            .then(response => response.json())
            .then(data => {
            console.log('Success:', data);
            })
            .catch((error) => {
            console.error('Error:', error);
            });

        setTimeout(this.fetchData, 2000);
    }
    // check answer, record data
    finishQuestion(playerAnswer) {
        this.setState({
            interrupted: false, numSeen: this.state.numSeen + 1, question: ""
        });
        // todo: stop the countdown timer
        // check with the answer (lowercased, no punctuation). TODO: edit distance
        if (this.cleanText(playerAnswer) == this.cleanText(this.state.answer)) {
            alert("Correct");
            // console.log('correct');
            this.setState({
                score: this.state.score + 1
            });
        } else {
            alert("Incorrect");
            // console.log('incorrect');
        }

        //display the correct answer
        setTimeout(this.fetchData, 2000); //wait a little before starting next question

        // restart
    }

    render() {
        
        if (window.sessionStorage.getItem("token") == null) {
            return <Redirect to="/login" />;
        }
        const { classes } = this.props;
        // console.log('rendering...')
        return (
            <div className={classes.root}>
                <Grid container spacing={3}>
                    <Grid item xs={6}>

                        <Paper className={classes.paper}>
                            {this.state.question.length ?
                                // <QuestionDisplay text={this.state.question} interrupted={this.state.interrupted} />
                                <QuestionDisplay text={this.state.question} 
                                updateSentencePosition={(index)=>this.setState({sentenceIndex: index})}/>
                                : "Waiting"
                            }
                            {/* {console.log(this.state.sentenceIndex)} */}
                        </Paper>
                    </Grid>
                    <Grid item xs={6}>

                        <Paper className={classes.paper}>
                            <Searcher server_url = "http://127.0.0.1:8000"/>
                        </Paper>
                        
                    </Grid>
                    <Grid item xs={6}>
                        {/* <div className="flex-container" style={{"display": "flex","justify-content": "center"}}> */}
                            {/* <Buzzer onClick={this.handleBuzz} onTimeout={this.finishQuestion} style={{flex: 1}} /> */}
                            {/* <ContinueButton onClick={this.handleBuzz} style={{flex: 1}}/> */}
                            {/* <AnswerForm onSubmit={this.finishQuestion} label="Answer"/> */}
                            <AnswerForm onSubmit={this.finishQuestion_multi} label="Answer_multi"/>
                        {/* </div> */}


                    </Grid>
                    <Grid item xs={3}>
                        <Paper className={classes.paper}>
                            Statistics <br /><br />
                            Category: {this.state.category} <br />
                            Answer: {this.state.answer} <br />
                            Score: {this.state.score} <br />
                            Number of Questions seen: {this.state.numSeen} <br />

                        </Paper>
                    </Grid>
                    <Grid item xs={3}>
                        <Paper className={classes.paper}>
                            Instructions <br /><br />
                            Press <code>space</code> to buzz.
                        </Paper>
                    </Grid>
                    {/* <Grid item xs={3}>
          <Paper className={classes.paper}>xs=3</Paper>
        </Grid>
        <Grid item xs={3}>
          <Paper className={classes.paper}>xs=3</Paper>
        </Grid> */}
                </Grid>
            </div>
        );
    }
}

export default withStyles(useStyles)(Dashboard);
