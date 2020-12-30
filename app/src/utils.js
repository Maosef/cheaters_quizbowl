export async function getRequest(url) {
        
    const response = await fetch(url, {
        method: 'GET',
        // body: JSON.stringify(data)
      });
      return response.json(); // parses JSON response into native JavaScript objects
}

export async function postRequest(url, body={}) {
        
    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(body)
      });
      return response.json(); // parses JSON response into native JavaScript objects
}


export function KeyboardShortcutHandler(keyCode, searchCallback) {

  let activated = false;

  // listen for shortcut key and highlight
  // Ctrl + S
  function captureSearch(e) {
      if (!activated && (e.ctrlKey || e.metaKey) && e.keyCode === keyCode) { 
      // if (!activated && e.keyCode === 83) { 
          e.preventDefault();
          activated = true;
          // this.searchBar.focus();

          searchCallback();
      }
  }
  
  function deactivateShortcut(e) {
      activated = false;
  }
  
  document.onkeydown = captureSearch;
  document.onkeyup = deactivateShortcut;
}
