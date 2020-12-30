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

import TextField from '@material-ui/core/TextField';

//search bar, and display results

class SearcherTfidf extends React.Component {
    constructor(props) {
        super(props);
        // this.handleBuzz = this.handleBuzz.bind(this);

        // this.fetchWikiData = this.fetchWikiData.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.processQuery = this.processQuery.bind(this);
        // this.handleHighlight = this.handleHighlight.bind(this);
        this.searchDocumentsTfidf = this.searchDocumentsTfidf.bind(this);
        this.getDocumentById = this.getDocumentById.bind(this);
        
        this.textInput = React.createRef();
        this.shortcutKeyCode = 68;

        this.state = {
            // pages: [],
            curPage: {'sections':[]},

            curQuery: "",
            curTitle: "",
            titles: [],
            passages: [],
            curPassage: {},
            
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
        this.searchDocumentsTfidf(query);
        console.log('searching...')
    }

    // fetch tfidf data
    async searchDocumentsTfidf(query) {

        console.log("querying: ", query);
        fetch(`/search_tfidf?query=${query}`)
            .then(res => res.json())
            .then(
                (result) => {
                    console.log('search results: ', result);
                    
                    this.setState({
                        titles: result.map(e => e['page']),
                        passages: result,
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

    async getDocumentById(id) {

        console.log("doc id: ", id);
        fetch(`/get_document_by_id/${id}`)
            .then(res => res.json())
            .then(
                (result) => {
                    // console.log('doc results: ', result);
                    this.setState({
                        curPage: result,
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
        this.setState({
            curPage: page,
            curTitle: title
        });
        // console.log(page['html']);
    }

    // async getDocument(e, title) {
    //     this.props.updateCurrentDocument(title);
    //     fetch(`get_document_html?title=${title}`)
    //         .then(response => response.json())
    //         .then(data => {
    //             // console.log(data);
    //             this.setState({
    //                 selectedDoc: data['html'],
    //                 curPage: data,
    //                 curTitle: title
    //             });
    //         });
    // }

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
        // const document_titles = this.state.titles.map((title) =>
        //     <ListItem button onClick={(e) => this.getDocument(e, title)} key={title.toString()}>
        //         <ListItemText primary={title} />
        //     </ListItem>
        // );
        const document_titles = this.state.passages.map((psg) =>
            <ListItem button onClick={(e) => this.displayText(e, psg)} key={psg['id'].toString()}>
                <ListItemText primary={psg['page']} />
            </ListItem>
        );

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
                            <DocumentSearchBox onSubmit={(query) => this.processQuery(query)} 
                                label="Search Documents..." 
                                curQuery={this.state.curQuery}
                                handleInputChange={this.handleInputChange}/>
                            
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
                                    {/*sections*/}
                                </List>
                            </Grid>
                        </Grid>
                    </Grid>
                    
                    <Divider orientation="vertical" flexItem />

                    {/* text display, keyword search */}
                    <Grid item xs={7} >
                        <DocumentDisplay 
                            text={this.state.curPage['text']} 
                            searchTerms={this.state.curQuery} 
                            recordKeywordSearchTerms={this.props.recordKeywordSearchTerms}/>
                        {/* <Highlight_tools /> */}

                                    <Button variant="contained" 
                                        color="primary" 
                                        onClick={() => { this.getDocumentById(this.state.curPage['id']-1) }}
                                        style={{ 
                                            margin: 10, 
                                            }}>
                                        {'<<< Previous Page'}
                                    </Button>
                                    <Button variant="contained" 
                                        color="primary" 
                                        onClick={() => { this.getDocumentById(this.state.curPage['id']+1) }}
                                        style={{ 
                                            margin: 10, 
                                            }}>
                                        {'Next Page >>>'}
                                    </Button>


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

export default withStyles(useStyles)(SearcherTfidf);
