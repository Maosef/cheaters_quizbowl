import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
// import Dashboard from './Dashboard_flex';
import Dashboard from './Dashboard';


function App() {
  return (
    <div className="App">
      <header className="App-header">
        {/* <img src={logo} className="App-logo" alt="logo" /> */}
        <h1>
          Quizbowl <b />
        </h1>

        {<Dashboard />}

      </header>
    </div>
  );
}

export default App;
