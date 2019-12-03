import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import TimeParams from "./components/userTime";

function App() {
  return (
    <Router>
      <Route path="/time/1" component={TimeParams} />
    </Router>
  );
}

export default App;
