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

import DocumentSearchBox from './DocumentSearchBox';
// import HighLighter from './Highlighter';
import DocumentDisplay from './DocumentDisplay';
import HighlightTools from './HighlightTools';

import postRequest from '../utils';

//search bar, and display results

class Searcher extends React.Component {
    constructor(props) {
        super(props);
        // this.handleBuzz = this.handleBuzz.bind(this);

        // this.fetchWikiData = this.fetchWikiData.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.processQuery = this.processQuery.bind(this);
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
        HighlightTools(this.processQuery);
    }

    handleInputChange(event) {
        this.setState({ curQuery: event.target.value });
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

    // fetch wikipedia data
    async searchDocuments(query) {

        console.log("querying: ", query);
        fetch(`/search_wiki_titles?query=${query}`)
            .then(res => res.json())
            .then(
                (result) => {
                    // console.log('search results: ', result);
                    this.props.updateGameState(result);
                    let titles = result['query_results_map'][query]
                    this.setState({
                        titles: titles,
                        isLoading: false,
                    });

                },
                (error) => {
                    console.log('error');
                }
            )
    }

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
        this.props.updateCurrentDocument(title);
        fetch(`get_document_html?title=${title}`)
            .then(response => response.json())
            .then(data => {
                // console.log(data);
                this.props.updateGameState(data);
                let doc = data['cur_doc_selected']
                this.setState({
                    selectedDoc: doc['html'],
                    curPage: doc,
                    curTitle: doc['title']
                });
            });
    }

    // handleHighlight(selection) {
    //     //do something with selection
    //     console.log(selection);
    //     // console.log(this);

    //     this.queryData.get(this.state.curQuery).get(this.state.curTitle).push(selection);
    //     this.props.sendData(this.queryData);
    //     // console.log(this.queryData);
    // }

    scrollToSection(section_title) {
        let section_element = document.getElementById(section_title);
        section_element.parentNode.scrollTop = section_element.offsetTop - section_element.parentNode.offsetTop;
    }
    
    render() {
        const { classes } = this.props;

        // articles, sections
        let document_titles;
        if (this.state.titles.length === 0) {
            document_titles = <ListItem>
                <ListItemText primary={'No Results'} />
            </ListItem>
        }
        else {
            document_titles = this.state.titles.map((title) =>
                <ListItem button onClick={(e) => this.getDocument(e, title)} key={title.toString()}>
                    <ListItemText primary={title} />
                </ListItem>
            );
        } 

        //const sections = this.state.curPage.sections.map((section) =>
            // <a href={"#" + section['title'] }>{section['title']}</a>
          //  <ListItem button onClick={(e) => this.scrollToSection(section['title'])} 
            //    key={section['title'].toString()}>
              //  <ListItemText primary={section['title']} />
            //</ListItem>
        //)

        // loading icon
        let loadingIcon;
        if (this.state.isLoading) {
            loadingIcon = <CircularProgress style={{margin: 20}}/>;
        }
        return (
            <Paper className={classes.paperFlexVertical} >
                <h4>Full Document Search</h4>
                <Grid container spacing={3}
                    bgcolor="background.paper"
                >
                    
                    {/* document search */}
                    <Grid item xs={4}>
                        <Grid container spacing={3}>
                            <DocumentSearchBox 
                                onSubmit={(query) => this.processQuery(query)} 
                                label="Search Documents (Ctrl-S)" 
                                curQuery={this.state.curQuery}
                                handleInputChange={this.handleInputChange}
                                handleKeyboardShortcut={true}/>
                            
                            {/* article, section display */}
                            <Grid item xs={8}>
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
                            
                            {/* document section titles */}
                            {/* <Grid item xs={6}>
                                <List component="nav" aria-label="search results"
                                    style={{ 
                                        maxHeight: 500, 
                                        overflow: "scroll", 
                                        whiteSpace: "pre-wrap", 
                                        textAlign: "left", 
                                        }}>
                                    sections
                                </List>
                            </Grid> */}
                        </Grid>
                    </Grid>
                    
                    {/* <Divider orientation="vertical" flexItem /> */}

                    {/* text display, keyword search */}
                    <Grid item xs={8} >
                        <DocumentDisplay 
                            text={this.state.selectedDoc} 
                            searchTerms={this.state.curQuery} 
                            recordKeywordSearchTerms={this.props.recordKeywordSearchTerms}
                            separateWordSearch={true}
                            cleanText={true}/>
                        {/* <Highlight_tools /> */}
                    </Grid>

                </Grid>
            </Paper>
        );
    }
}

export default withStyles(useStyles)(Searcher);
