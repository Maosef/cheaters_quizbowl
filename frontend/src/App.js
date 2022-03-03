import * as React from "react";
import * as s from "./App.css";
// import Dashboard from './Views/Dashboard';
import Dashboard from './Views/Dashboard_intro';
import Home from './Views/Home';

// import Dashboard_incremental from './Views/Dashboard_incremental';
// import Dashboard_static from './Views/Dashboard_static';
// import Dashboard_passage from './Views/Dashboard_passage';


import Login from "./Login_dummy";
// import Login from "./Login";
// import Register from "./Views/Register";
import Register from "./Views/RegisterEmail";

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
        {/* <Route path="/passage">
          <Dashboard_passage />
        </Route>
        <Route path="/static">
          <Dashboard_static />
        </Route> */}
        {/* <Route path="/play">
          <Dashboard />
        </Route> */}
        <Route path="/play">
          <Dashboard />
        </Route>
        <Route path="/">
          <Home />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;