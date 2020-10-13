import React, { Component } from 'react';
import $ from 'jquery';

import "mark.js"
import "mark.js/src/jquery.js"


class KeywordSearch extends React.Component {
  componentDidMount() {
    this.$el = $(this.el);

    // this.handleChange = this.handleChange.bind(this);
    // this.$el.on('change', this.handleChange);

    this.MIN_KEYWORD_LENGTH = 4;
    this.display();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.children !== this.props.children) {
      this.$el.trigger("chosen:updated");
    }
  }

  componentWillUnmount() {
    this.$el.off('change', this.handleChange);
  }

  handleChange(e) {
    this.props.onChange(e.target.value);
  }

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


    console.log($content.parent());
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
          console.log(position, $content.parent());
          $current[0].scrollIntoView({block: 'nearest'});
          // $content.parent()[0].scrollTo(0, position);
        }
      }
    }

    /**
     * Searches for the entered keyword in the
     * specified context on input
     */
    $input.on("input", function () {
      var searchVal = this.value;
      if (searchVal.length >= 4){
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

  render() {
    return (
      <div className="keyword-search" ref={el => this.el = el} style={{maxWidth: 600}}>

        <div class="keyword-search-navbar">
          Search:
            <input type="search" placeholder="Lorem" />
            <button data-search="next">&darr;</button>
            <button data-search="prev">&uarr;</button>
            <button data-search="clear">✖</button>
        </div>

          <div class="content bordered" style={{ 
            maxHeight: 500, 
            overflow: "scroll", 
            whiteSpace: "pre-wrap", 
            textAlign: "left", 
            }}>
            {this.props.text}

          </div>
        </div>
      );
    }
  }

  export default KeywordSearch;