import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';
import ResetPassword from './components/Profile/ResetPassword';
import UsersList from './components/Admin/UsersList';
import EditUser from './components/Admin/EditUser';
import Profile from './components/Profile/Profile';
import RequestResetLink from './components/Profile/RequestResetLink';
import EditPassword from './components/Admin/EdItUserPassword';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route
          exact
          path="/"
          element={<Home />}
        />
        <Route exact path="/register" element={<Register />} />
        <Route exact path="/login" element={<Login />} />
        <Route exact path="/profile" element={<Profile />} />
        <Route exact path="/profile" element={<Profile />} />
        <Route exact path="/profile/reset-link" element={<RequestResetLink />} />
        <Route exact path="/admin/users" element={<UsersList />} />
        <Route exact path="/admin/users/:id/edit" element={<EditUser />} />
        <Route exact path="/admin/users/:id/edit-password" element={<EditPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
    </Router>
  );
};

export default App;
