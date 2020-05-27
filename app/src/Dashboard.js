import React, { useState } from 'react';
import { Redirect } from "react-router-dom";

import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import AnswerForm from './AnswerForm';
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

let questionText = `With the assistence of his chief minister, the Duc de Sully, 
he lowered taxes on peasantry, promoted economic recovery, and instituted a tax on the Paulette. ||| 
Victor at Ivry and Arquet, he was excluded from succession by the Treaty of Nemours, but won a great 
victory at Coutras. ||| His excommunication was lifted by Clement VIII, but that pope later claimed 
to be crucified when this monarch promulgated the Edict of Nantes. ||| For 10 points, name this 
French king, the first Bourbon who admitted that ""Paris is worth a mass"" when he converted 
following the War of the Three Henrys.`;
let answerText = "Henry IV of France";


class Dashboard extends React.Component {
    constructor(props) {
        super(props);
        this.handleBuzz = this.handleBuzz.bind(this);

        this.fetchData = this.fetchData.bind(this);
        this.finishQuestion = this.finishQuestion.bind(this);
        this.cleanText = this.cleanText.bind(this);

        this.state = {
            sessionToken: "",
            question: "",
            answer: "",
            category: "",
            interrupted: false,
            finished: false,
            numSeen: 0,
            score: 0,
            isLoaded: false,
        }
    }
    // authenticate, grab the user data, fetch first question
    componentDidMount() {
        if (window.sessionStorage.getItem("token") == null) {
            return <Redirect to="/login" />;
        }
        
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
        // log data
        

        //display the correct answer
        setTimeout(this.fetchData, 2000); //wait a little before starting next question

        // restart
    }


    render() {
        

        const { classes } = this.props;
        // console.log('rendering...')
        return (
            <div className={classes.root}>
                <Grid container spacing={3}>
                    <Grid item xs={6}>

                        <Paper className={classes.paper}>
                            {this.state.question.length ?
                                <QuestionDisplay text={this.state.question} interrupted={this.state.interrupted} />
                                : "Waiting"
                            }
                        </Paper>
                    </Grid>
                    <Grid item xs={6}>

                        <Paper className={classes.paper}>
                            <Searcher server_url = "http://127.0.0.1:8000"/>
                        </Paper>
                        
                    </Grid>
                    <Grid item xs={6}>
                        <div className="flex-container" style={{"display": "flex","justify-content": "center"}}>
                            {/* <Buzzer onClick={this.handleBuzz} onTimeout={this.finishQuestion} style={{flex: 1}} /> */}
                            <ContinueButton onClick={this.handleBuzz} style={{flex: 1}}/>
                            <AnswerForm onSubmit={this.finishQuestion} label="Answer"/>
                        </div>


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
