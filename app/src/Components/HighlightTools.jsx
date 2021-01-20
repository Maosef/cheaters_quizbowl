
export default function HightlightTools(callback) {

    let activated = false;

    // listen for shortcut key and highlight
    // Ctrl + S
    function captureSearch(e) {
        var selectedText = getSelectedText();
        console.log('key down');
        if (!activated && (e.ctrlKey || e.metaKey) && e.keyCode === 83) { 
        // if (!activated && e.keyCode === 83) { 
            e.preventDefault();
            activated = true;
            // this.searchBar.focus();
            console.log('searching highlight...');
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
    
    window.onkeydown = captureSearch;
    window.onkeyup = deactivateShortcut;

    // eventTarget.addEventListener("keydown", event => {
    //     if (event.isComposing || event.keyCode === 229) {
    //       return;
    //     }
    //     // do something
    //   });
}

