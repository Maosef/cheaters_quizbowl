import React, { useState } from 'react';

import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import CircularProgress from '@material-ui/core/CircularProgress';
import TextField from '@material-ui/core/TextField';

import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import useStyles from '../Styles';

// import HighLighter from './Highlighter';
import DocumentDisplay from './DocumentDisplay';
import HighlightTools from './HighlightTools';
import Box from '@material-ui/core/Box';


import {getRequest, postRequest} from '../utils';

//search bar, and display results

class Searcher extends React.Component {
    constructor(props) {
        super(props);
        // this.handleBuzz = this.handleBuzz.bind(this);

        // this.fetchWikiData = this.fetchWikiData.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        // this.processQuery = this.processQuery.bind(this);
        this.processShortcut = this.processShortcut.bind(this);
        
        // this.handleHighlight = this.handleHighlight.bind(this);
        this.textInput = React.createRef();
        this.shortcutKeyCode = 68;

        this.state = {
            // pages: [],
            curPage: {'sections':[]},

            curQuery: "",
            curTitle: "",
            titles: [],
            
            selectedDoc: '', // HTML of doc
            isLoading: false,
            pageLimit: 8
        };

        this.queryData = new Map()

    }

    componentDidMount() {
        // shortcut to search from highlight
        HighlightTools(83, this.processShortcut);
    }

    componentDidUpdate(prevProps) {
        // reset state if question changed
        if (prevProps.currentQuery !== this.props.currentQuery){
            console.log('query changed');
            this.setState({
                curQuery: this.props.currentQuery
            });
        }
    }
    
    handleInputChange(event) {
        this.setState({ curQuery: event.target.value });
    }

    processShortcut(query) {
        if (!query){
            this.textInput.current.focus();
        } else {
            this.props.processQuery(query);
        }
    }
    // fetch data and log query
    // processQuery(query) {
    //     if (!query){
    //         return
    //     }
    //     this.setState({
    //         curQuery: query,
    //         isLoading: true
    //     })
    //     // this.queryData.set(query, new Map());

    //     // this.fetchWikiData(query);
    //     this.searchDocuments(query);
    // }

    // // fetch document titles, update game state
    // async searchDocuments(query) {

    //     console.log("querying: ", query);
    //     getRequest(`/search_wiki_titles?query=${query}`)
    //         .then(
    //             (result) => {
    //                 // console.log('search results: ', result);
    //                 this.props.updateGameState(result);
    //                 let titles = result['query_results_map'][query]
    //                 console.log('titles: ', titles);
    //                 this.setState({
    //                     titles: titles,
    //                     isLoading: false,
    //                 });
    //             },
    //             (error) => {
    //                 console.log('Error', error)
    //             }
    //         )
    // }

    // display doc content, log title
    async getDocument(e, title) {
        
        getRequest(`get_document_html?title=${title}`)
            .then(data => {
                // console.log(data);
                this.props.updateGameState(data);
                // this.props.updateCurrentDocument(title);
                let doc = data['cur_doc_selected']
                this.setState({
                    selectedDoc: doc['html'],
                    curPage: doc,
                    curTitle: doc['title']
                });
            });
    }


    scrollToSection(section_title) {
        let section_element = document.getElementById(section_title);
        section_element.parentNode.scrollTop = section_element.offsetTop - section_element.parentNode.offsetTop;
    }

    
    render() {
        const { classes } = this.props;

        // articles, sections
        let document_titles;
        if (typeof this.props.retrievedTitles === "undefined" || this.props.retrievedTitles.length === 0) {
            document_titles = <ListItem>
                <ListItemText primary={'No Results'} />
            </ListItem>
        } else {
            document_titles = this.props.retrievedTitles.map((title) =>
                <ListItem button onClick={(e) => this.getDocument(e, title)} key={title.toString()}>
                    <ListItemText primary={title} />
                </ListItem>
            );
        } 


        // loading icon
        let loadingIcon;
        if (this.props.searchLoading) {
            loadingIcon = <CircularProgress style={{margin: 20}}/>;
        } else {
            loadingIcon = <h4>Search Results (Page Titles)</h4>
        }
        return (
            <Paper className={classes.paperFlexVertical} >
                <h3 style={{textAlign:"left"}}>Wikipedia Passage Search</h3>
                <Grid container spacing={3}
                    bgcolor="background.paper"
                >
                    {/* document search */}
                    <Grid item xs={4}>

                            <form onSubmit={(event) => {event.preventDefault(); this.props.processQuery(this.state.curQuery)}}
                                className={classes.root} 
                                noValidate 
                                autoComplete="off" 
                                style={{"display": "flex", "alignItems": "center", "marginBottom": 10}}>
                                <TextField 
                                    inputRef={this.textInput}
                                    value={this.state.curQuery} 
                                    onChange={this.handleInputChange} 
                                    label="Search Passages (Ctrl-S)" 
                                    variant="outlined" 
                                    fullWidth
                                    // margin="normal"
                                    // defaultValue={this.props.curQuery}
                                />
                            </form>
                            
                            {/* article, section display */}
                            <Box border={1}>
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
                            </Box>
                            
                    </Grid>
                    
                    {/* <Divider orientation="vertical" flexItem /> */}

                    {/* text display, keyword search */}
                    <Grid item xs={8} >
                        <DocumentDisplay 
                            text={this.state.selectedDoc} 
                            searchTerms={this.state.curQuery} 
                            recordKeywordSearchTerms={(keywords) => this.props.recordKeywordSearchTerms(keywords, 'passage')}
                            separateWordSearch={true}
                            cleanText={true}
                            searchType={"passageSearch"}
                            recordHighlight={(startIndex, endIndex) => this.props.recordHighlight(startIndex, endIndex, 'passage')}
                            />
                        {/* <Highlight_tools /> */}

                            <Button variant="contained" 
                                color="primary" 
                                onClick={() => { this.getDocumentById(this.state.curPage['id']-1) }}
                                style={{ 
                                    margin: 10, 
                                    }}>
                                {'<<< Previous Passage'}
                            </Button>
                            <Button variant="contained" 
                                color="primary" 
                                onClick={() => { this.getDocumentById(this.state.curPage['id']+1) }}
                                style={{ 
                                    margin: 10, 
                                    }}>
                                {'Next Passage >>>'}
                            </Button>
                    </Grid>

                </Grid>
            </Paper>
        );
    }
}

export default withStyles(useStyles)(Searcher);
