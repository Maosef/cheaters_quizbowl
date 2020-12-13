export async function getRequest(url) {
        
    const response = await fetch(url, {
        method: 'GET',
        // body: JSON.stringify(data)
      });
      return response.json(); // parses JSON response into native JavaScript objects
}

export async function postRequest(url, body) {
        
    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(body)
      });
      return response.json(); // parses JSON response into native JavaScript objects
}
