import React, { useState } from 'react';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';


// detects selections, creates tooltip with shortcuts
export default function HighlightTool(props) {

    const [selectedText, setSelectedText] = useState('');
    // x and y coords of tooltip
    const [x, setX] = useState(0);
    const [y, setY] = useState(0);
    const [textElement, setTextElement] = useState(''); // selected element
    const [selectedPassageId, setSelectedPassageId] = useState(''); // passage id
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

        // detect if we clicked in the question or the document display
        if (e.target.parentNode.id === 'questionText' || e.target.closest('#contentfullSearch') !== null
            || e.target.closest('#contentpassageSearch') !== null) {

            if (e.target.parentNode.id === 'questionText') {
                setTextElement('questionText');
            } else if (e.target.closest('#contentpassageSearch') !== null) {
                setTextElement('contentpassageSearch');

                console.log('target id:', e.target.id)
                // console.log(/^\d+$/.test(e.target.id))
                if (/^\d+$/.test(e.target.id)) { // regex test if digits 
                    setSelectedPassageId(e.target.id)
                }
            } else {
                setTextElement('contentfullSearch');
            }

            let selectedText = getSelectedText();

            setSelectedText(selectedText);
            setX(e.clientX);
            setY(Math.min(e.clientY, window.innerHeight-300)); // prevent exceeding bottom of page
        } else if (e.target.className !== 'MuiButton-label') { // close tooltip, unless we clicked on a tooltip button
            // console.log(e.target.className)
            setSelectedText('');
            setTextElement('');
            
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
    
    function getExpandedText() {
        const selectionObj = (window.getSelection && window.getSelection());
        const selection = selectionObj.toString();
        const anchorNode = selectionObj.anchorNode;
        const focusNode = selectionObj.focusNode;
        const anchorOffset = selectionObj.anchorOffset;
        const focusOffset = selectionObj.focusOffset;
        const position = anchorNode.compareDocumentPosition(focusNode);
        let forward = false;
        
        if (position === anchorNode.DOCUMENT_POSITION_FOLLOWING) {
            forward = true;
        } else if (position === 0) {
            forward = (focusOffset - anchorOffset) > 0;
        }
        // let selectionStart = forward ? anchorOffset : focusOffset;

        const expandOffset = 10;
        let range = new Range();
        // selectionObj.getRangeAt(0).cloneContents()
        if (forward) {
            range.setStart(anchorNode, Math.max(anchorOffset-expandOffset, 0));
            range.setEnd(focusNode, Math.min(focusOffset+expandOffset, focusNode.length));
        } else {
            range.setStart(focusNode, Math.max(focusOffset-expandOffset, 0));
            range.setEnd(anchorNode, Math.min(anchorOffset+expandOffset, anchorNode.length));
        }
        
        // console.log(`expanded range: ${range}`);
    
        return range.toString();
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
            <Button variant="contained" color="default" style={{margin: 10}} onClick={() => {props.callback('record evidence', selected_text, selectedPassageId)}}>
                                    Record as evidence (Ctrl-e)
                                </Button>
            answer_button = 
            <Button variant="contained" color="secondary" style={{margin: 10}} onClick={() => {props.callback('answer', selected_text, textElement, selectedPassageId, getExpandedText())}}>
                Answer as "{selected_text}" (Ctrl-a)
            </Button>
        }
        search_documents_button = <Button variant="contained" color="primary" style={{margin: 10}} onClick={() => {props.callback('search documents', selected_text, textElement, selectedPassageId, getExpandedText())}}>
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

