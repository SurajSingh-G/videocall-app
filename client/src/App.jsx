import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Auth from './pages/auth/Auth.jsx'
import Dashboard from './pages/dashboard/Dashboard.jsx'
import IsLogin from './pages/auth/IsLogin.jsx'


function App() {

  return (
    <Router>
      <Routes>
            <Route element={< IsLogin />} > 
              <Route path='/' element={<Dashboard />} /> 
              </Route>
            
            <Route path='/signup' element={<Auth type="signup" />} />
            <Route path='/login' element={<Auth type="login" />} />
      </Routes>
    </Router>
  )
}

export default App
