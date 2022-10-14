import React, { useContext } from 'react'

import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom'

import AppContainer from './AppContainer'
import { AppContext } from './AppContainer'

import About from '../pages/About'
import Landing from '../pages/Landing'
import Home from '../pages/Home'
import Create from '../pages/Create'
import Profile from '../pages/Profile'

const AppRouter = () => {
    return (
        <>
            <div> 
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<AppContainer />}>
                            <Route index element={<Landing />}/>
                   
                            <Route element={<ProtectedRoute />}>
                                <Route path="create" element={<Create />} />
                                <Route path="home" element={<Home />} />
                                <Route path="profile" element={<Profile />} />
                            </Route>

                            <Route path="about" element={<About />} />
                            <Route path="*" element={<p>There's nothing here: 404!</p>} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </div>
        </>
    )
}

const ProtectedRoute = ({ redirectPath = '/', children }) => {
    const { isConnected } = useContext(AppContext);
    if (!isConnected) {
        return <Navigate to={redirectPath} replace />;
    }
    return children ? children : <Outlet />
}

export default AppRouter;