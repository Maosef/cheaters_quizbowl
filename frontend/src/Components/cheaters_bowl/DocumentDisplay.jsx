import React, { Component } from 'react';
import $ from 'jquery';

import "mark.js"
import "mark.js/src/jquery.js"

import {postRequest, cleanText, stripHtml} from '../utils';

import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import Highlighter from './HighlightRecorderBase';


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
    this.onMouseUpHandler = this.onMouseUpHandler.bind(this);
    this.handlePassageIntersection = this.handlePassageIntersection.bind(this);
    
    this.searchVals = [];
    this.matchActions = [];
    this.observe_target_ids = new Set();

    this.state = {
      searchTerms: "",
      highlight: {},

      isDirty: false,
      selection: '',
      anchorNode: '?',
      focusNode: '?',
      selectionStart: '?',
      selectionEnd: '?',
      first: '',
      middle: '',
      last: ''
    };

    // this.intersectionObserver;
    let options = {
      root: document.querySelector('#contentpassageSearch'),
      rootMargin: '0px',
      threshold: 0.5
    }
    this.intersectionObserver = new IntersectionObserver(this.handlePassageIntersection, options);
  }

  componentDidMount() {
    this.$el = $(this.el);
    window.addEventListener("keydown", this.captureSearch);
    this.display();

  }

  handlePassageIntersection(entries, observer) {

    entries.forEach(entry => {
      // console.log('intersection: ', entry.target.id, entry.isIntersecting)
      // console.log('intersection: ', entry)

      // ignore event the first time
      let passage_id = entry.target.id;
      if (this.observe_target_ids.has(passage_id)) {
        this.props.addIntersectionEvent({'passage_id': passage_id, 'time': Math.round(entry.time/1000), 'is_visible': entry.isIntersecting});
      } else if (entry.isIntersecting) {
        this.observe_target_ids.add(passage_id);
        this.props.addIntersectionEvent({'passage_id': passage_id, 'time': Math.round(entry.time/1000), 'is_visible': entry.isIntersecting});
      }
    });
  };
  // when query or document changes, update terms in keyword search box, trigger search
  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      
      // document changed
      if (prevProps.text !== this.props.text) {
        this.setState({ searchTerms: this.props.searchTerms });
        // typeset math
        // window.MathJax.typeset()
        // trigger search
        $(this.searchBar).val(this.props.searchTerms).trigger("input");
        
      }
      // passage changed, scroll to element, highlight
      if (prevProps.passage_id !== this.props.passage_id) {
        const passage_element = document.getElementById(this.props.passage_id);
        if (passage_element) {
          passage_element.scrollIntoView();
          passage_element.setAttribute("style", "background-color: #99ff99;");
        }
        // remove previous highlight
        if (prevProps.passage_id && document.getElementById(prevProps.passage_id)) {
          document.getElementById(prevProps.passage_id).setAttribute("style", "background-color: none;"); 
        }
      }

      // list of passages changed, watch the passages for intersection
      if (prevProps.passage_id_list !== this.props.passage_id_list) {
        if (prevProps.passage_id_list) { // delete old passages
          for (const passage_id of prevProps.passage_id_list) {
            if (document.getElementById(passage_id)) {
              this.intersectionObserver.unobserve(document.getElementById(passage_id));
              this.observe_target_ids.delete(passage_id)
            }
          }
        }
        
        if (this.props.passage_id_list) {
          for (const passage_id of this.props.passage_id_list) {
            // let target = document.querySelector(`#${passage_id}`);
            let target = document.getElementById(passage_id)
            this.intersectionObserver.observe(target);
          }
        }
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
  // jumpTo() {

  //   if (this.$results.length) {
  //     var position,
  //       $current = this.$results.eq(this.currentIndex);
  //     this.$results.removeClass(this.currentClass);
  //     if ($current.length) {
  //       $current.addClass(this.currentClass);
  //       position = $current.offset().top - this.offsetTop;
  //       // console.log(position, $content.parent());
  //       $current[0].scrollIntoView({block: 'nearest'});
  //       // $content.parent()[0].scrollTo(0, position);
  //     }
  //   }
  // }

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
    function jumpTo(record=false) {
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
          // console.log($current[0], $current[0].parentElement, $current[0].textContent)

          if (record) {
            postRequest(`/record_action?name=advance_keyword_match`, {data: 
              {'action': 'advance', 
              'text': $current[0].textContent, 
              'passage_id': $current[0].parentElement.id, 
              'dom_time': Math.round(performance.now()/1000)}})
          }
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
          // console.log('keyword search ', this.props.searchType)
          this.props.recordKeywordSearchTerms(searchVal);

          // clean the text for searching
          // if (this.props.cleanText){
          //   searchVal = cleanText(searchVal);
          // }

          // marking
          $content.unmark({
            done: function () {
              $content.mark(searchVal, {
                separateWordSearch: false,
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
        jumpTo(true);
      }
    });

    // advance search on Enter
    $input.on("keydown", function (event) {
      // console.log('keypress in keyword match: ', event)
      if (event.which === 13) {
        if ($results.length) {
          currentIndex += $(this).is($prevBtn) ? -1 : 1;
          if (currentIndex < 0) {
            currentIndex = $results.length - 1;
          }
          if (currentIndex > $results.length - 1) {
            currentIndex = 0;
          }
          jumpTo(true);
        }
      }
    });
  }


  onMouseUpHandler(e) {
    const selectionObj = (window.getSelection && window.getSelection());
    const selection = selectionObj.toString();
    const anchorNode = selectionObj.anchorNode;
    const focusNode = selectionObj.focusNode;
    const anchorOffset = selectionObj.anchorOffset;
    const focusOffset = selectionObj.focusOffset;
    const position = anchorNode.compareDocumentPosition(focusNode);
    let forward = false;

    const expandOffset = 50;
    console.log(`selection: ${selection}`);
    let range = new Range();
    range.setStart(anchorNode, Math.max(anchorOffset-expandOffset, 0));
    range.setEnd(focusNode, Math.min(focusOffset+expandOffset, focusNode.length));
    console.log(`range: ${range}`);


    // if (position === anchorNode.DOCUMENT_POSITION_FOLLOWING) {
    //   forward = true;
    // } else if (position === 0) {
    //     forward = (focusOffset - anchorOffset) > 0;
    // }

    // let selectionStart = forward ? anchorOffset : focusOffset;

    // if (forward) {
    //     if (anchorNode.parentNode.getAttribute('data-order')
    //         && anchorNode.parentNode.getAttribute('data-order') === 'middle') {
    //         selectionStart += this.state.selectionStart;
    //     }
    //     if (anchorNode.parentNode.getAttribute('data-order')
    //         && anchorNode.parentNode.getAttribute('data-order') === 'last') {
    //         selectionStart += this.state.selectionEnd;
    //     }
    // } else {
    //     if (focusNode.parentNode.getAttribute('data-order')
    //         && focusNode.parentNode.getAttribute('data-order') === 'middle') {
    //         selectionStart += this.state.selectionStart;
    //     }
    //     if (focusNode.parentNode.getAttribute('data-order')
    //         && focusNode.parentNode.getAttribute('data-order') === 'last') {
    //         selectionStart += this.state.selectionEnd;
    //     }
    // }

    // let strippedHtml = stripHtml(this.props.text);

    // const selectionEnd = selectionStart + selection.length;
    // const middle = strippedHtml.slice(selectionStart, selectionEnd);
    // console.log(`start: ${selectionStart}, end: ${selectionEnd}`);
    // console.log(`sliced stripped HTML: ${middle}`);

  }

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