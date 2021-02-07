import React, { Component } from 'react';
import $ from 'jquery';

import "mark.js"
import "mark.js/src/jquery.js"

import {postRequest, cleanText} from '../utils';

import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import Highlighter from './HighlightRecorder';


// search and highlight keywords
class DocumentDisplay extends React.Component {
  constructor(props) {
    super(props);

    this.MIN_KEYWORD_LENGTH = 4;

    this.handleInputChange = this.handleInputChange.bind(this);
    this.captureSearch = this.captureSearch.bind(this);
    this.extractKeywords = this.extractKeywords.bind(this);
    // this.jumpTo = this.jumpTo.bind(this);
    // this.search = this.search.bind(this);
    this.display = this.display.bind(this);
    this.handleHighlight = this.handleHighlight.bind(this);
    
    this.searchVals = []
    this.state = {
      searchTerms: "",
      highlight: {}
    };
  }

  componentDidMount() {
    this.$el = $(this.el);
    window.addEventListener("keydown", this.captureSearch);
    this.display();
  }

  // when query or document changes, update terms in keyword search box, trigger search
  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      // document changed
      if (prevProps.text !== this.props.text) {
        this.setState({ searchTerms: this.props.searchTerms });
        // typeset math
        window.MathJax.typeset()
        // trigger search
        // $("input[type='search']").val(this.props.searchTerms).trigger("input");
        $(this.searchBar).val(this.props.searchTerms).trigger("input");
      }
    }
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.captureSearch);
  }


  handleInputChange(event) {
    // this.props.onChange(e.target.value);
    this.setState({ searchTerms: event.target.value });

    // trigger highlight
    // let searchVal = event.target.value;
    // this.search(searchVal);
  }

  // listen for F3 or ctrl F or command F
  captureSearch(e) {
    if (e.keyCode === 114 || ((e.ctrlKey || e.metaKey) && e.keyCode === 70)) {
      e.preventDefault();
      this.searchBar.focus();
    }
  }

  extractKeywords(searchTerms) {
    let terms = searchTerms.split(' ');
    terms = terms.filter(word => word.length > this.MIN_KEYWORD_LENGTH);
    console.log(terms);
    return terms.join(' ');
  }
  /**
     * Jumps to the element matching the currentIndex
     */
  jumpTo() {

    if (this.$results.length) {
      var position,
        $current = this.$results.eq(this.currentIndex);
      this.$results.removeClass(this.currentClass);
      if ($current.length) {
        $current.addClass(this.currentClass);
        position = $current.offset().top - this.offsetTop;
        // console.log(position, $content.parent());
        $current[0].scrollIntoView({block: 'nearest'});
        // $content.parent()[0].scrollTo(0, position);
      }
    }
  }

  // search for terms, highlight, jump to
  // search(searchVal) {    
  //     // // jQuery object to save <mark> elements
  //   let $content = $(".content")
  //   let component = this;
  //   if (searchVal.length >= 3){ // min search length for performance
  //     // this.words.push(searchVal); 
  //     $content.unmark({
  //       done: function () {
  //         $content.mark(searchVal, {
  //           separateWordSearch: false,
  //           done: function () {
  //             component.$results = $content.find("mark");
  //             component.currentIndex = 0;
  //             component.jumpTo();
  //           }
  //         });
  //       }
  //     });
  //   }
  // }

  handleHighlight(startIndex, endIndex) {
    // if answer shortcut is used
    this.setState({highlight: {startIndex:startIndex,endIndex:endIndex}})
  }
  // jquery display for text search. Temporary
  display() {

    // the input field
    // var $input = $("input[type='search']"),
    var $input = $("#" + this.props.searchType),
      // clear button
      $clearBtn = $("button[data-search='clear']"),
      // prev button
      $prevBtn = $("button[data-search='prev']"),
      // next button
      $nextBtn = $("button[data-search='next']"),
      // the context where to search
      // $content = $(".content"),
      $content = $("#content" + this.props.searchType),
      // jQuery object to save <mark> elements
      $results = [],
      // the class that will be appended to the current
      // focused element
      currentClass = "current",
      // top offset for the jump (the search bar)
      offsetTop = 50,
      // the current index of the focused element
      currentIndex = 0;

    console.log('input', $input);

    /**
     * Jumps to the element matching the currentIndex
     */
    function jumpTo() {
      if ($results.length) {
        var position,
          $current = $results.eq(currentIndex);
        $results.removeClass(currentClass);
        if ($current.length) {
          $current.addClass(currentClass);
          position = $current.offset().top - offsetTop;
          // console.log(position, $content.parent());
          $current[0].scrollIntoView({block: 'nearest'});
          // $content.parent()[0].scrollTo(0, position);
        }
      }
    }

    /**
     * Searches for the entered keyword in the
     * specified context on input
     */
    $input.on("input", (e)=>{
      {
        let searchVal = e.target.value;
        let separateWordSearch = this.props.separateWordSearch;
        if (searchVal.length >= 3){ // min search length for performance reasons
          // console.log('search vals: ', this.searchVals);
          console.log('keyword search ', this.props.searchType)
          this.props.recordKeywordSearchTerms(searchVal);

          // clean the text for searching
          if (this.props.cleanText){
            searchVal = cleanText(searchVal);
          }

          // marking
          $content.unmark({
            done: function () {
              $content.mark(searchVal, {
                separateWordSearch: separateWordSearch,
                done: function () {
                  $results = $content.find("mark");
                  currentIndex = 0;
                  jumpTo();
                }
              });
            }
          });
        }
      }
    });

    /**
     * Clears the search
     */
    $clearBtn.on("click", function () {
      $content.unmark();
      $input.val("").focus();
    });

    /**
     * Next and previous search jump to
     */
    $nextBtn.add($prevBtn).on("click", function () {
      if ($results.length) {
        currentIndex += $(this).is($prevBtn) ? -1 : 1;
        if (currentIndex < 0) {
          currentIndex = $results.length - 1;
        }
        if (currentIndex > $results.length - 1) {
          currentIndex = 0;
        }
        jumpTo();
      }
    });
  }

  // onMouseUpHandler(){
  //   const selectionObj = (window.getSelection && window.getSelection());
  //   const selection = selectionObj.toString();
  //   console.log(selection)
  // }

  render() {
    return (
      <Box className="keyword-search" border={1}
        ref={el => this.el = el} 
        // style={{maxWidth: 600}}
        >
        
        {/* search bar */}
        <div className="keyword-search-navbar">
            <input 
              type="search"  
              placeholder="Search keywords (Ctrl-f)" 
              ref={(input) => { this.searchBar = input; }}
              style={{width: "50%"}}
              id={this.props.searchType}
              // value={this.state.searchTerms}
              // onChange={this.handleInputChange}
               />
            <button data-search="next">&darr;</button>
            <button data-search="prev">&uarr;</button>
            <button data-search="clear">✖</button>
        </div>


        {/* content display */}
        <div className="content bordered" 
          id={"content" + this.props.searchType}
          style={{ 
            maxHeight: 500, 
            overflow: "scroll", 
            whiteSpace: "pre-wrap", 
            textAlign: "left", 
            padding: 20
          }}
          dangerouslySetInnerHTML={{ __html: this.props.text }}
          // onMouseUp={this.onMouseUpHandler}
        >
              {/* <Highlighter
                  text={this.props.text}
                  selectionHandler={this.handleHighlight}
                  customClass="highlight-class"
              /> */}
              {/* {this.props.text} */}
        </div>
      </Box>
      );
    }
  }


  export default DocumentDisplay;