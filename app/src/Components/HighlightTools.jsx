
export default function HighlightTools(keyCode, callback) {

    let activated = false;

    // listen for shortcut key and highlight
    function captureSearch(e) {
        let selectedText = getSelectedText();
        // console.log('highlighted: ', selectedText);
        // console.log('key down: ', e.keyCode);
        if (!activated && (e.ctrlKey || e.metaKey) && e.keyCode === keyCode) { 
            e.preventDefault();
            activated = true;
            // this.searchBar.focus();
            console.log('calling callback with ', selectedText);
            callback(selectedText);
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

