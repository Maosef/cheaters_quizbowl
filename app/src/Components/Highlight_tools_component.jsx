import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import Fab from '@material-ui/core/Fab';
import DeleteIcon from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';


class Highlight_tools extends React.Component {
    constructor(props) {
      super(props);
    //   this.state = {isToggled: false};
  
      this.captureHighlight = this.captureHighlight.bind(this);
      this.getSelectedText = this.getSelectedText.bind(this);

    }
    
    componentDidMount() {
        // this.$el = $(this.el);
        
        // document.onmouseup = doSomethingWithSelectedText;
        // document.onkeyup = doSomethingWithSelectedText;

        window.addEventListener("mouseup", this.captureHighlight);
        window.addEventListener("keyup", this.captureHighlight);
        // this.display();
      }
    
    // when query or document changes, update terms in keyword search box, trigger search
    // componentDidUpdate(prevProps) {
    // if (prevProps !== this.props) {
    //     // console.log("new props", this.props);
    //     if (prevProps.searchTerms !== this.props.searchTerms) {
    //     this.setState({ searchTerms: this.props.searchTerms });
    //     }
        
    //     // this.search(this.props.searchTerms);
    //     $("input[type='search']").val(this.props.searchTerms).trigger("input");
    // }
    // }

    componentWillUnmount() {
    // this.$el.off('change', this.handleInputChange);
        window.removeEventListener("mouseup", this.captureHighlight);
        window.removeEventListener("keyup", this.captureHighlight);
    }

    getSelectedText() {
        var text = "";
        if (typeof window.getSelection != "undefined") {
            text = window.getSelection().toString();
        } else if (typeof document.selection != "undefined" && document.selection.type == "Text") {
            text = document.selection.createRange().text;
        }
        return text;
    }
    
    captureHighlight() {
        var selectedText = this.getSelectedText();
        if (selectedText) {
            console.log("selected text: " + selectedText);
        }
    }
    

    render() {
        return <Tooltip title="Add" aria-label="add">
            <Fab color="primary">
            <AddIcon />
            </Fab>
        </Tooltip>

    }
  }


export default Highlight_tools;