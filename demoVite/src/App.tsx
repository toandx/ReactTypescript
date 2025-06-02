import { BrowserRouter, Routes, Route, Navigate} from "react-router-dom"
import HomePage from './pages/Home'
import LoginPage from './pages/Login'

function App() {
  const loggedIn : boolean = false;
  return (
    <BrowserRouter>
      <Routes>
        { loggedIn ? (
          <>
            <Route path='/'  element={<HomePage />}/>
            <Route path='*' element={<HomePage />} />
          </>
        ) : (
          <>
            <Route path='/login' element={<LoginPage />}/>
            <Route path='/*' element={<Navigate to='/login'/>} />
          </>
        )} 
      </Routes>
    </BrowserRouter>
  )
}

export default App
