import { BrowserRouter, Routes, Route } from "react-router-dom";
import MasterLayout from "../components/MasterLayout";
import TestBootstrap from "../pages/testbootstrap";
import TestD3 from "../pages/testd3";
import TestContext from "../pages/testcontext";
import TestAxios from "../pages/testAxios";
import 'bootstrap/dist/css/bootstrap.min.css';

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MasterLayout />}> 
          <Route index  element={<TestBootstrap />}/>
          <Route path='/d3' element={<TestD3 data={[1,2,3]} />}/>
          <Route path='/context' element={<TestContext />}/>
          <Route path='/axios' element={<TestAxios />}/>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
