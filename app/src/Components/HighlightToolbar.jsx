import React, { useState } from 'react';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';

// detects selections, 
export default function HightlightToolbar(props) {

    const [selectedText, setSelectedText] = useState('None');
    const shorcutKeyCode = 69; //e

    let activated = false;

    function handleShortcut(e) {
        let selectedText = getSelectedText();
        setSelectedText(selectedText);

        if (!activated && (e.ctrlKey || e.metaKey) && e.keyCode === shorcutKeyCode && selectedText) { 
        // if (!activated && e.keyCode === 83) { 
            console.log('recording evidence');
            e.preventDefault();
            activated = true;
            // this.searchBar.focus();
            props.callback(selectedText);
        }
    }

    // listen for shortcut key and highlight
    function captureSearch(e) {
        let selectedText = getSelectedText();
        if (selectedText === ''){
            setSelectedText('None');
        } else {
            setSelectedText(selectedText);
        }

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
    document.onkeydown = handleShortcut;
    document.onkeyup = deactivateShortcut;

    let record_evidence_button;
    if (selectedText !== 'None') {
        record_evidence_button = <Button variant="contained" color="primary" style={{margin: 10}} onClick={() => {props.callback(getSelectedText())}}>
            Record as evidence (Ctrl-e)
        </Button>
    }

    return (
        <div>
            <h4>Highlighted text: </h4>
            <Box border={1} 
                style={{ 
                    maxHeight: 500, 
                    overflow: "scroll", 
                    // whiteSpace: "pre-wrap",  
                    // textAlign: "left", 
                    }}>
                {selectedText}
            </Box>

            {/* <Button onClick={search}>Search as query</Button> */}
            {/* <Button onClick={search}>Answer</Button> */}
            {record_evidence_button}

            Ctrl-s to auto-search, Ctrl-space to record answer
        </div>
    );
}

