// import React, { Component } from 'react';
// import './App.css';
// // import Dashboard from './Dashboard_flex';
// import Dashboard from './Dashboard';


// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         {/* <img src={logo} className="App-logo" alt="logo" /> */}
//         <h1>
//           Quizbowl <b />
//         </h1>

//         {<Dashboard />}

//       </header>
//     </div>
//   );
// }

// export default App;

import * as React from "react";
import * as s from "./App.css";
import Dashboard from './Dashboard_preloaded';
// import Dashboard from './Dashboard';

import FlexWrap from './flex_test';
import Login from "./Login_dummy";
import Register from "./Register";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

function App() {
  console.log("App style "+s);
  return (
    <Router>
      <Switch>
        <Route path="/login">
          <Login />
        </Route>
        <Route path="/register">
          <Register />
        </Route>
        <Route path="/">
          <Dashboard />
          {/* <FlexWrap /> */}
        </Route>
      </Switch>
    </Router>
  );
}

export default App;

