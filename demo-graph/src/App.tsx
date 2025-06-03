import React from 'react';
import TestD3 from './pages/testd3';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import TestBootstrap from './pages/testbootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import TestContext from './pages/testcontext';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index  element={<TestBootstrap />}/>
        <Route path='/d3' element={<TestD3 data={[1,2,3]} />}/>
        <Route path='/context' element={<TestContext />}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
