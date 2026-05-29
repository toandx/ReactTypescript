import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import TestD3 from "../pages/testd3";
import TestContext from "../pages/testcontext";
import TestAxios from "../pages/testAxios";
import NavBar from "../components/NavBar";
import 'bootstrap/dist/css/bootstrap.min.css';

function AppRouter() {
  return (
    <BrowserRouter>
      <NavBar />
      <div>
        <Routes>
          <Route index  element={<Home />}/>
          <Route path='/d3' element={<TestD3 data={[1,2,3]} />}/>
          <Route path='/context' element={<TestContext />}/>
          <Route path='/axios' element={<TestAxios />}/>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default AppRouter;
