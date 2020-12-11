import React, { Component } from 'react';
import $ from 'jquery';

import "mark.js"
import "mark.js/src/jquery.js"

import TextField from '@material-ui/core/TextField';

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
    
    this.searchVals = []
    this.state = {
      searchTerms: "",
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
      if (prevProps.searchTerms !== this.props.searchTerms) {
        this.setState({ searchTerms: this.props.searchTerms });
      }
      
      // log stored search terms
      // this.props.
      this.words = [];

      // trigger search
      // this.search(this.props.searchTerms);
      $("input[type='search']").val(this.props.searchTerms).trigger("input");

      // typeset math
      window.MathJax.typeset()
    }
  }

  componentWillUnmount() {
    // this.$el.off('change', this.handleInputChange);
    window.removeEventListener('keydown', this.captureSearch);
  }


  async recordKeywordSearch() {

    const response = await fetch(`/record_keyword_search`, {
      method: 'POST',
      body: JSON.stringify(this.words)
    });
    return response.json(); // parses JSON response into native JavaScript objects
  }

  handleInputChange(event) {
    // this.props.onChange(e.target.value);
    this.setState({ searchTerms: event.target.value });

    // trigger highlight
    let searchVal = event.target.value;
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
    function search(e) {
      var searchVal = e.target.value;
      // console.log(searchVal);
      // let cleaned_words = this.extractKeywords(searchVal);

      if (searchVal.length >= 3){ // min search length for performance
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
        <div className="keyword-search-navbar">
            <input type="search"  
              placeholder="Search keywords" 
              ref={(input) => { this.searchBar = input; }}
              // value={this.state.searchTerms}
              // onChange={this.handleInputChange}
               />
            <button data-search="next">&darr;</button>
            <button data-search="prev">&uarr;</button>
            <button data-search="clear">✖</button>
        </div>


        {/* content display */}
        <div className="content bordered" 
          dangerouslySetInnerHTML={{ __html: this.props.text }}
          style={{ 
          maxHeight: 480, 
          overflow: "scroll", 
          whiteSpace: "pre-wrap", 
          textAlign: "left", 
          }}>

        </div>
      </div>
      );
    }
  }

  export default DocumentDisplay;