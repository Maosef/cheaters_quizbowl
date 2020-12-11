import React, { useState } from 'react';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import CircularProgress from '@material-ui/core/CircularProgress';

import Typography from '@material-ui/core/Typography';

import DocumentSearchBox from '../DocumentSearchBox';
import HighLighter from './Highlighter';

import { withStyles } from '@material-ui/core/styles';
import useStyles from '../Styles';

import DocumentDisplay from './DocumentDisplay';
import HighlightTools from './HighlightTools';

//search bar, and display results

class Searcher extends React.Component {
    constructor(props) {
        super(props);
        // this.handleBuzz = this.handleBuzz.bind(this);

        // this.fetchWikiData = this.fetchWikiData.bind(this);
        this.processQuery = this.processQuery.bind(this);
        this.handleHighlight = this.handleHighlight.bind(this);

        this.state = {
            // pages: [],
            curPage: {'sections':[]},

            curQuery: "",
            // curTitle: "",
            titles: [],
            
            selectedDoc: '',
            isLoading: false,
            pageLimit: 8
        };

        this.queryData = new Map()

        // shortcut to search from highlight
        HighlightTools(this.processQuery);
    }

    // fetch data and log query
    processQuery(query) {
        if (!query){
            return
        }
        this.setState({
            curQuery: query,
            isLoading: true
        })
        this.queryData.set(query, new Map());

        // this.fetchWikiData(query);
        this.searchDocuments(query);
    }
    
    async postRequest(url, data={}) {
        
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(data)
          });
          return response.json(); // parses JSON response into native JavaScript objects
    }

    // fetch wikipedia data
    async searchDocuments(query) {

        console.log("query: ", query);
        fetch(`/search_wiki_titles?query=${query}`)
            .then(res => res.json())
            .then(
                (result) => {
                    console.log('Result: ', result);
                    this.setState({
                        titles: result,
                        isLoading: false,
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

    
    // fetch wikipedia data
    // fetchWikiData(query) {

    //     console.log("query: ", query);
    //     fetch(`/search_wiki?query=${query}&limit=${this.state.pageLimit}`)
    //         // fetch(this.props.server_url + "/search_wiki")
    //         .then(res => res.json())
    //         .then(
    //             (result) => {
    //                 // console.log('Result: ', result);
    //                 let pages = result.pages;
    //                 this.setState({
    //                     pages: pages,
    //                     isLoading: false,
    //                 });
    //             },
    //             (error) => {
    //                 console.log('error');
    //                 this.setState({
    //                     error
    //                 });
    //             }
    //         )
    // }

    // display doc content, log title
    displayText(e, page) {
        const title = page['title'];
        this.queryData.get(this.state.curQuery).set(title, []);
        this.setState({
            selectedDoc: page['html'],
            curPage: page,
            curTitle: title
        });
        // console.log(page['html']);
    }

    async getDocument(e, title) {
        fetch(`get_document_html/?title=${title}`)
            .then(response => response.json())
            .then(data => {
                // console.log(data);
                this.setState({
                    selectedDoc: data['html'],
                    curPage: data,
                    curTitle: title
                });
            });
    }

    handleHighlight(selection) {
        //do something with selection
        console.log(selection);
        // console.log(this);

        this.queryData.get(this.state.curQuery).get(this.state.curTitle).push(selection);
        this.props.sendData(this.queryData);
        // console.log(this.queryData);
    }

    scrollToSection(section_title) {
        let section_element = document.getElementById(section_title);
        section_element.parentNode.scrollTop = section_element.offsetTop - section_element.parentNode.offsetTop;
    }
    

    render() {
        const { classes } = this.props;

        // articles, sections
        // const listItems = this.state.pages.map((page) =>
        //     <ListItem button onClick={(e) => this.displayText(e, page)} key={page['title'].toString()}>
        //         <ListItemText primary={page['title']} />
        //     </ListItem>
        // );
        const document_titles = this.state.titles.map((title) =>
            <ListItem button onClick={(e) => this.getDocument(e, title)} key={title.toString()}>
                <ListItemText primary={title} />
            </ListItem>
        );

        const sections = this.state.curPage.sections.map((section) =>
            // <a href={"#" + section['title'] }>{section['title']}</a>
            <ListItem button onClick={(e) => this.scrollToSection(section['title'])} 
                key={section['title'].toString()}>
                <ListItemText primary={section['title']} />
            </ListItem>
        )

        // loading icon
        let loadingIcon;
        if (this.state.isLoading) {
            loadingIcon = <CircularProgress style={{margin: 20}}/>;
        }
        return (
            // <div className={classes.root}>

            <Paper className={classes.paperBig} style={{ height: 600 }}>
                <Grid container spacing={3}
                    bgcolor="background.paper"
                >
                    {/* document search */}
                    <Grid item xs={4}>
                        <Grid container spacing={3}>
                            <DocumentSearchBox onSubmit={(query) => this.processQuery(query)} label="Search Documents..." />
                            {/* article, section display */}
                            <Grid item xs={6}>
                                {loadingIcon}
                                {/* document titles */}
                                <List component="nav" aria-label="search results"
                                    style={{ 
                                        maxHeight: 500, 
                                        overflow: "scroll", 
                                        whiteSpace: "pre-wrap", 
                                        textAlign: "left", 
                                        }}>
                                    {document_titles}
                                </List>
                            </Grid>
                            
                            <Grid item xs={6}>
                                {/* document section titles */}
                                <List component="nav" aria-label="search results"
                                    style={{ 
                                        maxHeight: 500, 
                                        overflow: "scroll", 
                                        whiteSpace: "pre-wrap", 
                                        textAlign: "left", 
                                        }}>
                                    {sections}
                                </List>
                            </Grid>
                        </Grid>
                    </Grid>
                    
                    <Divider orientation="vertical" flexItem />

                    {/* text display, keyword search */}
                    <Grid item xs={7} >
                        <DocumentDisplay text={this.state.selectedDoc} searchTerms={this.state.curQuery}/>
                        {/* <DocumentDisplay text={this.state.selectedDoc} searchTerms={this.state.question}/> */}
                        {/* <Highlight_tools /> */}
                    </Grid>

                    {/* highlight text */}
                    {/* <Grid item xs={7} >
                        <div style={{ maxHeight: 500, overflow: "scroll", whiteSpace: "pre-wrap", textAlign: "left" }}>
                            <HighLighter
                                text={this.state.selectedDoc}
                                selectionHandler={this.handleHighlight}
                                customClass="highlight-class"
                            />
                        </div>
                    </Grid> */}

                </Grid>
            </Paper>

            // </div>
        );
    }
}

export default withStyles(useStyles)(Searcher);