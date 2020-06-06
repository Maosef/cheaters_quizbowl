import React, { useState } from 'react';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import CircularProgress from '@material-ui/core/CircularProgress';

import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import AnswerForm from './AnswerForm';
import Buzzer from './Buzzer';
// import SelectionHighlighter from "react-highlight-selection";
import HighLighter from './Highlighter';

import { withStyles } from '@material-ui/core/styles';
import useStyles from './Styles';

//search bar, and display results

class Searcher extends React.Component {
    constructor(props) {
        super(props);
        // this.handleBuzz = this.handleBuzz.bind(this);

        this.fetchWikiData = this.fetchWikiData.bind(this);
        this.handleHighlight = this.handleHighlight.bind(this);

        this.state = {
            curQuery: "",
            curTitle: "",
            titles: [],
            summaries: [],
            selectedDoc: "",
            isLoading: false,
            pageLimit: 8
        };

        this.queryData = new Map()
    }

    // fetch data and log query
    fetchWikiData(query) {
        this.setState({
            curQuery: query,
            isLoading: true
        })
        this.queryData.set(query, new Map());

        console.log("query: ", query);
        fetch(`/search_wiki?query=${query}&limit=${this.state.pageLimit}`)
            // fetch(this.props.server_url + "/search_wiki")
            .then(res => res.json())
            // .then(res => console.log(res))
            .then(
                (result) => {
                    console.log('Result: ', result);
                    this.setState({
                        titles: result.titles,
                        summaries: result.summaries,
                        isLoading: false
                        // content: result.content
                    });
                },
                (error) => {
                    console.log('error');
                    this.setState({
                        error
                    });
                }
            )
    }

    // display doc content, log title
    displayText(e, title) {
        // const state = this.state;
        this.queryData.get(this.state.curQuery).set(title, []);
        let idx = this.state.titles.indexOf(title);
        // console.log(this.state.summaries[idx]);
        this.setState({
            selectedDoc: this.state.summaries[idx],
            curTitle: title
        });
        // console.log(this.queryData);
    }

    handleHighlight(selection) {
        //do something with selection
        console.log(selection);
        // console.log(this);
        // console.log(this.queryData);
        // console.log(this.queryData.get(this.state.curQuery));
        // console.log(this.queryData.get(this.state.curQuery).get(this.state.curTitle));
        this.queryData.get(this.state.curQuery).get(this.state.curTitle).push(selection);
        this.props.sendData(this.queryData);
        // console.log(this.queryData);
    }

    render() {
        const { classes } = this.props;
        const listItems = this.state.titles.map((title) =>
            // <li key={title.toString()}>{title.slice(0,100)}</li>
            <ListItem button onClick={(e) => this.displayText(e, title)} key={title.toString()}>
                <ListItemText primary={title} />
            </ListItem>
        );
        let loadingIcon;
        if (this.state.isLoading) {
            loadingIcon = <CircularProgress style={{margin: 20}}/>;
        }
        return (

            // <div className={classes.root}>
            <ExpansionPanel>
                <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <Typography className={classes.heading}>Search Engine</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    

                    {/* <Paper className={classes.paperBig} style={{ height: 500 }}> */}
                        <Grid container spacing={3}
                            // height={500}
                            // display="flex"
                            // flexDirection="row"
                            // flexWrap="wrap"
                            // p={1}
                            // m={1}
                            bgcolor="background.paper"
                        >

                            <Grid item xs={4}>
                                <AnswerForm onSubmit={(query) => this.fetchWikiData(query)} label="Search..." />
                                {loadingIcon}
                                <List component="nav" aria-label="search results">
                                    {listItems}
                                </List>
                                {/* <p>{this.state.titles}</p> */}
                            </Grid>
                            <Divider orientation="vertical" flexItem />
                            <Grid item xs={7} >

                                <div style={{ maxHeight: 500, overflow: "scroll", whiteSpace: "pre-wrap", textAlign: "left" }}>
                                    {/* {console.log(this.state.selectedDoc)} */}
                                    {/* {this.state.selectedDoc} */}
                                    <HighLighter
                                        text={this.state.selectedDoc}
                                        // text={"Let there be light, let there be Sun."}
                                        selectionHandler={this.handleHighlight}
                                        customClass="highlight-class"
                                    />
                                </div>




                            </Grid>
                        </Grid>
                    {/* </Paper> */}
                </ExpansionPanelDetails>
            </ExpansionPanel>

            // </div>
        );
    }
}

export default withStyles(useStyles)(Searcher);