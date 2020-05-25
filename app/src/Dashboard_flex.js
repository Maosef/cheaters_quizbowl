import React, { useState } from 'react';
import Box from '@material-ui/core/Box';

import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import AnswerForm from './AnswerForm';
import Buzzer from './Buzzer';
import QuestionDisplay from './QuestionDisplay';
import Searcher from './Searcher';

import { withStyles } from '@material-ui/core/styles';
import useStyles from './Styles';

// import './App.css';

// import {floor, random} from Math;
// main Dashboard. Load question, handle interrupt, load next question

let server_url = "http://127.0.0.1:8000";
// let server_url = "";

let num_questions = 20408;

let questionText = `With the assistence of his chief minister, the Duc de Sully, 
he lowered taxes on peasantry, promoted economic recovery, and instituted a tax on the Paulette. ||| 
Victor at Ivry and Arquet, he was excluded from succession by the Treaty of Nemours, but won a great 
victory at Coutras. ||| His excommunication was lifted by Clement VIII, but that pope later claimed 
to be crucified when this monarch promulgated the Edict of Nantes. ||| For 10 points, name this 
French king, the first Bourbon who admitted that ""Paris is worth a mass"" when he converted 
following the War of the Three Henrys.`;
let answerText = "Henry IV of France";


// export default function Dashboard() {
//     const classes = useStyles();
//     const [interrupted, setInterrupted] = useState(false);

class Dashboard extends React.Component {
    constructor(props) {
        super(props);
        this.handleBuzz = this.handleBuzz.bind(this);

        this.fetchData = this.fetchData.bind(this);
        this.finishQuestion = this.finishQuestion.bind(this);
        this.cleanText = this.cleanText.bind(this);

        this.state = {
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
    // initial fetch
    componentDidMount() {
        this.fetchData();
    }
    // componentWillUnmount() {
    //     alert('unmounting');
    // }

    handleBuzz() {
        console.log(this.state);
        this.setState({
            interrupted: !this.state.interrupted
        });
    }

    // fetch data from server
    fetchData() {
        let id = Math.floor(Math.random() * num_questions);
        fetch(server_url + "/get_question/" + id)
            .then(res => res.json())
            .then(
                (result) => {
                    // console.log('Result: ', result.question);
                    this.setState({
                        isLoaded: true,
                        question: result.question.replace(/\|\|\|/g, ""),
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

    cleanText(text) {
        let cleanText = text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
        // alert(cleanText)
        return cleanText;
    }
    // check if question answered correctly
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
        setTimeout(this.fetchData, 2000); //wait a little

        // restart
    }


    render() {
        const { classes } = this.props;
        // console.log('rendering...')
        return (
            // <div className={classes.root}>
                <Box
                    height="1000px"
                    display="flex"
                    flex-direction="column"
                    // flexWrap="wrap"
                    // p={1}
                    // m={1}
                    bgcolor="background.paper"
                    // css={{ maxHeight: 1000 }}
                >
                    <Box className={classes.paper}>
                        {this.state.question.length ?
                            <QuestionDisplay text={this.state.question} interrupted={this.state.interrupted} />
                            : "Waiting"
                        }
                    </Box>
                    {/* <div className="flex-container" style={{ "display": "flex", "justify-content": "center" }}>

                        <Buzzer onClick={this.handleBuzz} onTimeout={this.finishQuestion} style={{ flex: 1 }} />
                        <AnswerForm onSubmit={this.finishQuestion} label="Answer" />
                    </div> */}
                    {/* {/* <Paper className={classes.paper}>null</Paper> */}
                    <Box className={classes.paper}>null</Box>
                    <Box className={classes.paper}>
                        Statistics <br /><br />
                            Category: {this.state.category} <br />
                            Answer: {this.state.answer} <br />
                            Score: {this.state.score} <br />
                            Number of Questions seen: {this.state.numSeen} <br />

                    </Box>
                    <Box className={classes.paper}>
                        <Searcher server_url="http://127.0.0.1:8000" />
                    </Box>

                </Box>


            // </div>
        );
    }
}

export default withStyles(useStyles)(Dashboard);
