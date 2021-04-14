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

import DocumentSearchBox from './DocumentSearchBox';

import { withStyles } from '@material-ui/core/styles';
import useStyles from '../Styles';

import DocumentDisplay from './DocumentDisplay';
import HighlightRecorder from './HighlightRecorder';

import TextField from '@material-ui/core/TextField';
import { getRequest, postRequest } from '../utils';

//search bar, and display results

class SearcherTfidf extends React.Component {
    constructor(props) {
        super(props);
        // this.handleBuzz = this.handleBuzz.bind(this);

        // this.fetchWikiData = this.fetchWikiData.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        
        this.processShortcut = this.processShortcut.bind(this);
        this.processQuery = this.processQuery.bind(this);
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
        HighlightRecorder(83, this.processShortcut);
    }

    processShortcut(query) {
        if (!query){
            this.textInput.current.focus();
        } else {
            this.processQuery(query);
        }
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
        const result = await getRequest(`/search_tfidf?query=${query}`);
        console.log('search results: ', result);
                    
        this.setState({
            titles: result.map(e => e['page']),
            passages: result,
            isLoading: false,
        });
        // fetch(`/search_tfidf?query=${query}`)
        //     .then(res => res.json())
        //     .then(
        //         (result) => {
        //             console.log('search results: ', result);
                    
        //             this.setState({
        //                 titles: result.map(e => e['page']),
        //                 passages: result,
        //                 isLoading: false,
        //             });
        //         },
        //         (error) => {
        //             console.log('error');
        //             this.setState({
        //                 error
        //             });
        //         }
        //     )
    }

    async getDocumentById(id) {
        this.props.updateCurrentDocument(id);
        console.log("doc id: ", id);

        const result = await getRequest(`/get_document_by_id/${id}`);
        this.setState({
            curPage: result,
        });
        // fetch(`/get_document_by_id/${id}`)
        //     .then(res => res.json())
        //     .then(
        //         (result) => {
        //             // console.log('doc results: ', result);
        //             this.setState({
        //                 curPage: result,
        //             });
        //         },
        //         (error) => {
        //             console.log('error');
        //         }
        //     )
    }

    // display doc content, log title
    displayText(page) {
        const title = page['title'];
        this.setState({
            curPage: page,
            curTitle: title
        });
        // console.log(page['html']);
    }


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
            <ListItem button onClick={(e) => this.getDocumentById(psg['id'])} key={psg['id'].toString()}>
                <ListItemText primary={psg['page']} />
            </ListItem>
        );

        let searchResult;
        if (this.state.isLoading) {
            searchResult = <CircularProgress style={{margin: 20}}/>;
        } else {
            searchResult = <List component="nav" aria-label="search results"
                                    style={{ 
                                        maxHeight: 500, 
                                        overflow: "scroll", 
                                        whiteSpace: "pre-wrap", 
                                        textAlign: "left", 
                                        }}>
                                    {document_titles}
                                </List>
        }

        // loading icon
        // let loadingIcon;
        // if (this.state.isLoading) {
        //     loadingIcon = <CircularProgress style={{margin: 20}}/>;
        // }
        return (
            <Paper className={classes.paperFlexVertical} >
                <h3 style={{textAlign:"left"}}>Passage Search</h3>
                <Grid container spacing={3}
                    bgcolor="background.paper"
                >
                    {/* document search */}
                    <Grid item xs={4}>
                        <Grid container spacing={3}>
                            <DocumentSearchBox onSubmit={(query) => this.processQuery(query)} 
                                label="Search Passages" 
                                curQuery={this.state.curQuery}
                                handleInputChange={this.handleInputChange}/>
                            
                            {/* article, section display */}
                            <Grid item xs={12}>
                                {searchResult}
                                {/* document titles */}
                                
                            </Grid>
                            
                        </Grid>
                    </Grid>
                    
                    {/* <Divider orientation="vertical" flexItem /> */}

                    {/* text display, keyword search */}
                    <Grid item xs={8} >
                        <DocumentDisplay 
                            text={this.state.curPage['text']} 
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

                </Grid>
            </Paper>

            // </div>
        );
    }
}

export default withStyles(useStyles)(SearcherTfidf);
