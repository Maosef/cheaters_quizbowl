import React, { useState } from 'react';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';


// detects selections, creates tooltip with shortcuts
export default function HighlightToolbar(props) {

    const [selectedText, setSelectedText] = useState('');
    // x and y coords of tooltip
    const [x, setX] = useState(0);
    const [y, setY] = useState(0);
    const [textElement, setTextElement] = useState(''); // selected element
    const shorcutKeyCode = 69; //e

    let activated = false;

    // handle keyboard shortcut
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

        if (e.target.parentNode.id === 'questionText' || e.target.closest('#contentfullSearch') !== null
        || e.target.closest('#contentpassageSearch') !== null) {
            if (e.target.parentNode.id === 'questionText') {
                setTextElement('questionText');
            } else {
                setTextElement('');
            }

            let selectedText = getSelectedText();

            setSelectedText(selectedText);
            setX(e.clientX);
            setY(Math.min(e.clientY, window.innerHeight-300)); // prevent exceeding bottom of page
        } else { // close tooltip. bug, because then clicking on button fails
            // setSelectedText('');
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

    let selected_text = getSelectedText();
    let search_documents_button;
    let record_evidence_button;
    let answer_button;
    let tooltip;
    if (selectedText != '') {
        if (textElement !== 'questionText') {
            record_evidence_button = 
            <Button variant="contained" color="default" style={{margin: 10}} onClick={() => {props.callback(selected_text)}}>
                                    Record as evidence (Ctrl-e)
                                </Button>
            answer_button = 
            <Button variant="contained" color="secondary" style={{margin: 10}} onClick={() => {props.answer(selected_text)}}>
                Answer as "{selected_text}" (Ctrl-a)
            </Button>
        }
        search_documents_button = <Button variant="contained" color="primary" style={{margin: 10}} onClick={() => {props.searchDocuments(selected_text)}}>
                                    Search as query (Ctrl-s)
                                </Button>

        tooltip = <Box border={1} style={{
            'position':'absolute',
            'top': y, 
            'left': x, 
            'backgroundColor': 'white', 
            'display': 'flex',
            'flexDirection': 'column',
            'maxWidth':'15rem',
            'padding': '0.5rem',
            'zIndex': 2}}>
            <p>Highlighted: <b>{selectedText}</b></p>
            {search_documents_button}
            {record_evidence_button}
            {answer_button}
        </Box>

    }

    return (
        <div>
            {tooltip}
            </div>
        
        
    );
    {/* <div>
            <h3>Highlighted text: </h3>
            <Box border={1} 
                style={{ 
                    maxHeight: 500, 
                    overflow: "scroll", 
                    // whiteSpace: "pre-wrap",  
                    // textAlign: "left", 
                    }}>
                <h4>{selectedText}</h4>
            </Box>

            {record_evidence_button}
            {search_documents_button}
            <br/>
            Ctrl-space to submit as answer
        </div> */}
}

