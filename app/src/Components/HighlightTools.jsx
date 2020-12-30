
export default function HightlightTools(searchCallback) {

    let activated = false;

    // listen for shortcut key and highlight
    // Ctrl + S
    function captureSearch(e) {
        var selectedText = getSelectedText();
        if (!activated && (e.ctrlKey || e.metaKey) && e.keyCode === 83 && selectedText) { 
        // if (!activated && e.keyCode === 83) { 
            e.preventDefault();
            activated = true;
            // this.searchBar.focus();

            searchCallback(selectedText);
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
    
    document.onkeydown = captureSearch;
    document.onkeyup = deactivateShortcut;
}

