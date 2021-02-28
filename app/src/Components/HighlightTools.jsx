
export default function HighlightTools(keyCode, callback, expand=false) {

    // expand: if we also record the expanded selection 

    let activated = false;

    // listen for shortcut key and highlight
    function captureSearch(e) {
        // console.log('highlighted: ', selectedText);
        // console.log('key down: ', e.keyCode);
        if (!activated && (e.ctrlKey || e.metaKey) && e.keyCode === keyCode) { 
            e.preventDefault();
            activated = true;
            // this.searchBar.focus();

            let selectedText = getSelectedText();
            
            if (expand) {
                let expandedText = getExpandedText();
                console.log('calling callback with ', selectedText, expandedText);
                callback(selectedText, expandedText);
            } else {
                console.log('calling callback with ', selectedText);
                callback(selectedText);
            }
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
        

        const expandOffset = 50;
        let range = new Range();
        // selectionObj.getRangeAt(0).cloneContents()
        if (forward) {
            range.setStart(anchorNode, Math.max(anchorOffset-expandOffset, 0));
            range.setEnd(focusNode, Math.min(focusOffset+expandOffset, focusNode.length));
        } else {
            range.setStart(focusNode, Math.max(focusOffset-expandOffset, 0));
            range.setEnd(anchorNode, Math.min(anchorOffset+expandOffset, anchorNode.length));
        }
        
        console.log(`expanded range: ${range}`);
    
        return range.toString();
    }
    
    function doSomethingWithSelectedText() {
        var selectedText = getSelectedText();
        if (selectedText) {
            console.log("Got selected text: " + selectedText);
        }
    }
    
    // window.onkeydown = captureSearch;
    // window.onkeyup = deactivateShortcut;

    window.addEventListener("keydown", event => {captureSearch(event)});
    window.addEventListener("keyup", event => {deactivateShortcut(event)});
}

