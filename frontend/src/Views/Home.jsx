// Home, start game, leaderboard

import React, { useState, useEffect } from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";

import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';

import Button from '@material-ui/core/Button';
import { Redirect } from "react-router-dom";


import Navbar from '../Components/Navbar'

import { postRequest, getRequest, getScheduleInfo } from '../utils';

import '../App.css';
import { createMuiTheme, withStyles, makeStyles, ThemeProvider } from '@material-ui/core/styles';
import useStyles from '../Styles';
// import { green, purple } from '@material-ui/core/colors';

// import { Steps, Hints } from 'intro.js-react';
// import introJs from 'intro.js';
// import 'intro.js/introjs.css';

import { DataGrid } from '@material-ui/data-grid';



export default withStyles(useStyles)(function Home(props) {

    // Declare a new state variable, which we'll call "count"
    const [leaderboard, setLeaderboard] = useState("Loading Leaderboard...");
    const [playerData, setPlayerData] = useState({});
    const [playerStats, setPlayerStats] = useState("Loading Player Statistics...");
    const [schedule, setSchedule] = useState("Loading Schedule...")
    const [roundInProgress, setRoundInProgress] = useState(false)

    const { classes } = props;

    const leaderboard_columns = [
        { field: 'username', headerName: 'Username', width: 130 },
        { field: 'score', headerName: 'Total Score', width: 130 },
        { field: 'num_questions', headerName: 'Current Question', width: 200 },
        { field: 'score1', headerName: 'Packet 1 Score', width: 150},
        { field: 'score2', headerName: 'Packet 2 Score', width: 150 },
        { field: 'score3', headerName: 'Packet 3 Score', width: 150 },
        { field: 'score4', headerName: 'Packet 4 Score', width: 150 },

    ]

    const game_time_columns = [
        { field: 'start_datetime', headerName: 'Start Time (EST)', width: 200 },
        { field: 'end_datetime', headerName: 'End Time (EST)', width: 200 },
    ]

    // let is_valid_playing_time;
    let playing_times;

    // leaderboard = DataTable(rows, columns)
    // Similar to componentDidMount and componentDidUpdate:
    useEffect(() => {
        async function fetchData() {
            const player_info = await getRequest(`/get_player_info?username=${window.sessionStorage.getItem("username")}`);
            console.log('player info', player_info);
            setPlayerData(player_info);
            
            let packet_num = player_info.packets.indexOf(player_info.packet_number)+1;
            const player_stats = 
            <ul>
                {/* <li>Current Packet Number: {player_info.packet_number}</li>
                <li>Packets Remaining: {player_info.packet_scores.length - player_info.packet_number}</li> */}
                <li>Current Packet Number: {packet_num}</li>
                <li>Packets Remaining: {player_info.packets.length - packet_num}</li>
                <li>Total Score: {player_info.score}</li>
                <li>Current Question: {player_info.question_number}</li>
            </ul>
            setPlayerStats(player_stats)

            // const rows = await getRequest(`/get_leaderboard`);
            // console.log('leaderboard', rows)
            // setPlayerData(<div>{resp}</div>)
            // setLeaderboard(DataTable(rows, leaderboard_columns))

            const resp = await getScheduleInfo();
            console.log('resp', resp)
            setRoundInProgress(resp['is_valid_playing_time'])
            resp['valid_times'].forEach(function (round, i) {
                // console.log('%d: %s', i, value);
                round.id = i
            });
            playing_times = resp['valid_times']
            setSchedule(DataTable(playing_times, game_time_columns))
            // schedule = DataTable(playing_times, game_time_columns)
        }
        // check if user is logged in
        if (window.sessionStorage.getItem("token") == null) {
            return
        }
        fetchData();
    }, []); // Or [] if effect doesn't need props or state

    // check if user is logged in
    if (window.sessionStorage.getItem("token") == null) {
        return <Redirect to="/login" />;
    }

    function DataTable(rows, columns) {
        return (
            <div style={{ height: 400, width: '100%' }}>
                <DataGrid rows={rows} columns={columns} pageSize={5} />
            </div>
        );
    }

    let play_button;
    
    if (playerData.game_over) {
        play_button = <Link to="/play">
            <Button variant="contained" color="primary" className={classes.margin} disabled>
                Game Finished!
            </Button>
        </Link>
    } else if (!roundInProgress) {
        play_button = <Link to="/play">
            <Button variant="contained" color="primary" className={classes.margin} disabled>
                Waiting for Round to Start...
            </Button>
        </Link>
    } else if (playerData.question_number === 0 && roundInProgress) {
        play_button = <Link to="/play">
            <Button variant="contained" color="primary" className={classes.margin}>
                Start Game!
            </Button>
        </Link>
    } else {
        play_button = <Link to="/play">
            <Button variant="contained" color="primary" className={classes.margin}>
                Resume Game!
            </Button>
        </Link>
    }
    
    return (

        // <div className={classes.root}>
        <div className={classes.root}>

            {/* <Steps
            enabled={stepsEnabled}
            steps={steps}
            initialStep={initialStep}
            onExit={this.onExit}
        /> */}

            <Navbar/>

            <div className={classes.body} style={{ maxWidth: 1500, margin: "auto" }}>

            <h2>Welcome, {window.sessionStorage.getItem("username")}</h2>
            {/* <h2>Game Will Start on May 15th!</h2> */}
            {play_button}

            <h2>Game Stats</h2>
            {playerStats}


            <h2>Leaderboard</h2>
            {leaderboard}

            <h2>Schedule</h2>
            {schedule}

                <Grid container spacing={1}
                    bgcolor="background.paper"
                >
                    <Grid item xs={9} style={{ 'justifyContent': 'flex-start' }}>
                    </Grid>
                </Grid>
            </div>
        </div>
    )
})