export async function getRequest(url) {
    let token = window.sessionStorage.getItem("token");
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
      });
      return response.json(); // parses JSON response into native JavaScript objects
}

export async function postRequest(url, body={}, headers={}) {
    let token = window.sessionStorage.getItem("token");
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      return response.json();;
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

// remove short words, stopwords, punctuation
export function cleanText(str) {

    let stopwords = ['i','me','my','myself','we','our','ours','ourselves','you','your','yours','yourself','yourselves','he','him','his','himself','she','her','hers','herself','it','its','itself','they','them','their','theirs','themselves','what','which','who','whom','this','that','these','those','am','is','are','was','were','be','been','being','have','has','had','having','do','does','did','doing','a','an','the','and','but','if','or','because','as','until','while','of','at','by','for','with','about','against','between','into','through','during','before','after','above','below','to','from','up','down','in','out','on','off','over','under','again','further','then','once','here','there','when','where','why','how','all','any','both','each','few','more','most','other','some','such','no','nor','not','only','own','same','so','than','too','very','s','t','can','will','just','don','should','now']
    var punct_regex = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g;

    let res = []
    let words = str.replace(punct_regex, '').split(' ')
    for(let i=0;i<words.length;i++) {
        let word_clean = words[i]
        if(!stopwords.includes(word_clean) && word_clean.length > 2) {
            res.push(word_clean)
        }
    }
    return(res.join(' '))
}

