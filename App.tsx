import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Course from './pages/Course';
import Simulator from './pages/Simulator';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/learn" element={<Course />} />
          <Route path="/simulator" element={<Simulator />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;