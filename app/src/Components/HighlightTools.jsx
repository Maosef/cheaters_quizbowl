
export default function HightlightTools(searchCallback) {

    // listen for shortcut key and highlight
    // Ctrl + S
    function captureSearch(e) {
        var selectedText = getSelectedText();
        if ((e.ctrlKey || e.metaKey) && e.keyCode === 83 && selectedText) { 
            e.preventDefault();
            // this.searchBar.focus();

            searchCallback(selectedText);
        }
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
    
    // document.onmouseup = doSomethingWithSelectedText;
    // document.onkeyup = doSomethingWithSelectedText;
    window.addEventListener("keydown", captureSearch);
}
