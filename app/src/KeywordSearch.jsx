import React, { Component } from 'react';
import $ from 'jquery';

import "mark.js"
import "mark.js/src/jquery.js"

import TextField from '@material-ui/core/TextField';


class KeywordSearch extends React.Component {
  constructor(props) {
    super(props);

    this.MIN_KEYWORD_LENGTH = 4;

    // not following good code practice

    // this.search_mode = true;
    // this.characters = [];
    // this.words = [];

    this.handleInputChange = this.handleInputChange.bind(this);
    this.captureSearch = this.captureSearch.bind(this);
    this.display = this.display.bind(this);
    
    this.state = {
      searchTerms: "",
      // search_mode: false,
      // characters: [],
    };
  }

  componentDidMount() {
    this.$el = $(this.el);

    // this.$el.on('change', this.handleInputChange);

    window.addEventListener("keydown", this.captureSearch);
    this.display();
  }

  componentDidUpdate(prevProps) {
    // if (prevProps.children !== this.props.children) {
    //   this.$el.trigger("chosen:updated");
    // }

    // update search terms in keyword search box
    if (prevProps.searchTerms !== this.props.searchTerms) {
      console.log("new search terms", this.props.searchTerms);
      this.setState({ searchTerms: this.props.searchTerms });
    }
  }

  componentWillUnmount() {
    this.$el.off('change', this.handleInputChange);
    window.removeEventListener('keydown', this.captureSearch);
  }

  handleInputChange(event) {
    // this.props.onChange(e.target.value);
    this.setState({ searchTerms: event.target.value });

    // trigger highlight
    // let searchVal = event.target.value;
  }

  // listen for F3 or ctrl F or command F
  captureSearch(e) {
    if (e.keyCode === 114 || ((e.ctrlKey || e.metaKey) && e.keyCode === 70)) {
      e.preventDefault();
      this.searchBar.focus();
    }
  }

  // jquery display for text search. Temporary
  display() {

    // the input field
    var $input = $("input[type='search']"),
      // clear button
      $clearBtn = $("button[data-search='clear']"),
      // prev button
      $prevBtn = $("button[data-search='prev']"),
      // next button
      $nextBtn = $("button[data-search='next']"),
      // the context where to search
      $content = $(".content"),
      // jQuery object to save <mark> elements
      $results,
      // the class that will be appended to the current
      // focused element
      currentClass = "current",
      // top offset for the jump (the search bar)
      offsetTop = 50,
      // the current index of the focused element
      currentIndex = 0;


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
    // function searchTerms() {

    // }
    function search(e) {
      // var searchVal = this.value;
      
      var searchVal = e.target.value;
      console.log(searchVal);
      if (searchVal.length >= 3){ // min search length for performance
        // this.words.push(searchVal); 
        $content.unmark({
          done: function () {
            $content.mark(searchVal, {
              separateWordSearch: true,
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
    $input.on("input", search);

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

  render() {
    return (
      <div className="keyword-search" 
        ref={el => this.el = el} 
        style={{maxWidth: 600}}>
        
        {/* search bar */}
        <div class="keyword-search-navbar">
          Search:
            <input type="search"  
              placeholder="Search keywords" 
              ref={(input) => { this.searchBar = input; }}
              value={this.state.searchTerms}
              onChange={this.handleInputChange}
               />
            <button data-search="next">&darr;</button>
            <button data-search="prev">&uarr;</button>
            <button data-search="clear">✖</button>
        </div>
        {/* <form onSubmit={this.handleSubmit} noValidate autoComplete="off" 
                style={{"display": "flex", "align-items": "center"}}>
                <TextField 
                    inputRef={this.textInput}
                    value={this.state.searchTerms} 
                    onChange={this.handleInputChange} 
                    id="answer_box" 
                    label={this.props.label} 
                    variant="outlined" 
                />
                <div style={{padding: 20}}>
                    <Button variant="contained" color="primary" onClick={this.handleSubmit}>
                        Submit
                    </Button>
                </div>
            </form> */}

        {/* content display */}
        <div class="content bordered" 
          dangerouslySetInnerHTML={{ __html: this.props.text }}
          style={{ 
          maxHeight: 480, 
          overflow: "scroll", 
          whiteSpace: "pre-wrap", 
          textAlign: "left", 
          }}>
          {/* {this.props.text} */}

        </div>
      </div>
      );
    }
  }

  export default KeywordSearch;