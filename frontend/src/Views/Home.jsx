// Home, start game, leaderboard

import React, { useState, useEffect  } from 'react';
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


// import Searcher from '../Components/SearcherControlled';
// import SearcherTfidf from '../Components/SearcherTfidf';
import SearcherPassage from '../Components/SearcherPassage';

import { postRequest, getRequest } from '../utils';

import '../App.css';
// import HighlightTool from '../Components/HighlightTool';
// import HighlightAnswerTool from '../Components/HighlightRecorder';

import { createMuiTheme, withStyles, makeStyles, ThemeProvider } from '@material-ui/core/styles';
import useStyles from '../Styles';
// import { green, purple } from '@material-ui/core/colors';

// import { Steps, Hints } from 'intro.js-react';
// import introJs from 'intro.js';
// import 'intro.js/introjs.css';

import { DataGrid } from '@material-ui/data-grid';



export default withStyles(useStyles)(function Home(props) {
    // Declare a new state variable, which we'll call "count"
    const [count, setCount] = useState(0);

    const { classes } = props;

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'firstName', headerName: 'First name', width: 130 },
        { field: 'lastName', headerName: 'Last name', width: 130 },
        {
            field: 'age',
            headerName: 'Age',
            type: 'number',
            width: 90,
        },
        {
            field: 'fullName',
            headerName: 'Full name',
            description: 'This column has a value getter and is not sortable.',
            sortable: false,
            width: 160,
            valueGetter: (params) =>
            `${params.getValue('firstName') || ''} ${params.getValue('lastName') || ''}`,
        },
        ];
    
        const rows = [
        { id: 1, lastName: 'Snow', firstName: 'Jon', age: 35 },
        { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 42 },
        { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 45 },
        { id: 4, lastName: 'Stark', firstName: 'Arya', age: 16 },
        { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', age: null },
        { id: 6, lastName: 'Melisandre', firstName: null, age: 150 },
        { id: 7, lastName: 'Clifford', firstName: 'Ferrara', age: 44 },
        { id: 8, lastName: 'Frances', firstName: 'Rossini', age: 36 },
        { id: 9, lastName: 'Roxie', firstName: 'Harvey', age: 65 },
        ];

    let leaderboard;
    // Similar to componentDidMount and componentDidUpdate:
    useEffect(() => {
        async function fetchData() {
          // You can await here
            const resp = await getRequest(`/get_leaderboard`);
            console.log('leaderboard', resp)
            // leaderboard = <div>{resp}</div>
            leaderboard = DataTable(rows, columns)
          // ...
        }
        fetchData();
    }, []); // Or [] if effect doesn't need props or state


    

    function DataTable(rows, columns) {
    return (
        <div style={{ height: 400, width: '100%' }}>
        <DataGrid rows={rows} columns={columns} pageSize={5} checkboxSelection />
        </div>
    );
    }
    

    return (

        // <div className={classes.root}>
        <div>

            {/* <Steps
            enabled={stepsEnabled}
            steps={steps}
            initialStep={initialStep}
            onExit={this.onExit}
        /> */}

            <Navbar text="CheatBowl" />


            <h2>Leaderboard</h2>
            {leaderboard}


            <p>You clicked {count} times</p>
            <button onClick={() => setCount(count + 1)}>
                Click me
            </button>

            <div className={classes.body} style={{ maxWidth: 1500, margin: "auto" }}>
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