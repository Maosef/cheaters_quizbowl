import React, { useState } from 'react';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import AnswerForm from './AnswerForm';
import Buzzer from './Buzzer';
import QuestionDisplay from './QuestionDisplay';

import { withStyles } from '@material-ui/core/styles';
import useStyles from './Styles';

//search bar, and display results

class Searcher extends React.Component {
    constructor(props) {
        super(props);
        // this.handleBuzz = this.handleBuzz.bind(this);

        this.fetchWikiData = this.fetchWikiData.bind(this);

        this.state = {
            query: "",
            titles: [],
            summaries: []
        }
    }

    fetchWikiData(query) {
        console.log(query);
        fetch(this.props.server_url + "/search_wiki?query=" + query)
        // fetch(this.props.server_url + "/search_wiki")
            .then(res => res.json())
            // .then(res => console.log(res))
            .then(
                (result) => {
                    console.log('Result: ', result);
                    this.setState({
                        titles: result.summaries
                    });
                },
                (error) => {
                    console.log('error');
                    this.setState({
                        isLoaded: true,
                        error
                    });
                }
            )
    }

    render() {
        const { classes } = this.props;
        const listItems = this.state.titles.map((title) =>
            <li key={title.toString()}>{title.slice(0,100)}</li>
        );
        return (
            <div>
                <AnswerForm onSubmit={this.fetchWikiData} label="Search..." />
                <ul>{listItems}</ul>
                {/* <p>{this.state.titles}</p> */}
            </div>
        );
    }
}

export default withStyles(useStyles)(Searcher);