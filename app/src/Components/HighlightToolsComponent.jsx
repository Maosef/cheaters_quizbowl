import React, { useState } from 'react';
import Box from '@material-ui/core/Box';

export default function HightlightTools(searchCallback) {

    const [selectedText, setSelectedText] = useState('None');

    let activated = false;

    // function handleSearch(e) {
    //     let selectedText = getSelectedText();
    //     console.log('selected', selectedText);
    //     setSelectedText(selectedText);

    //     if (!activated && (e.ctrlKey || e.metaKey) && e.keyCode === 83 && selectedText) { 
    //     // if (!activated && e.keyCode === 83) { 
    //         e.preventDefault();
    //         activated = true;
    //         // this.searchBar.focus();

    //         searchCallback(selectedText);
    //     }
    // }

    // listen for shortcut key and highlight
    // Ctrl + S
    function captureSearch(e) {
        let selectedText = getSelectedText();
        console.log('selected', selectedText);
        if (selectedText === ''){
            setSelectedText('None');
        } else {
            setSelectedText(selectedText);
        }

        // if (!activated && (e.ctrlKey || e.metaKey) && e.keyCode === 83 && selectedText) { 
        // // if (!activated && e.keyCode === 83) { 
        //     e.preventDefault();
        //     activated = true;
        //     // this.searchBar.focus();

        //     searchCallback(selectedText);
        // }
    }
    
    function deactivateShortcut(e) {
        activated = false;
    }

    function getSelectedText() {
        var text = "";
        if (typeof window.getSelection != "undefined") {
            text = window.getSelection().toString();
        } else if (typeof document.selection != "undefined" && document.selection.type == "Text") {
            text = document.selection.createRange().text;
        }
        return text;
    }
    
    document.onmouseup = captureSearch;
    // document.onkeydown = captureSearch;
    // document.onkeyup = deactivateShortcut;

    return (
        <div>
            <h4>Highlighted text (Ctrl-S to auto-search): </h4>
            <Box border={1}>{selectedText}</Box>
        </div>
    );
}

