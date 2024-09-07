import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

const UsersList = () => {
  const API = axios.create({ baseURL: process.env.REACT_APP_BASEURL });
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token === null) {
          navigate('/login');
          return;
        }
        const res = await API.get('/api/admin/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(res.data);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Error fetching users");
      }
    };

    fetchUsers();
  }, []);

  const handleEdit = (user) => {
    navigate(`/admin/users/${user._id}/edit`, { state: { user } });
  };

  const handleDelete = async (userId) => {
    const token = localStorage.getItem('token');

    try {
      const deleteUserPromise = API.delete(`/api/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.promise(
        deleteUserPromise,
        {
          loading: 'Deleting user...',
          success: (res) => {
            const message = res.data.message || 'User deleted successfully';
            setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
            return message;
          },
          error: (err) => {
            const errorMessage = err.response?.data?.message || 'Error deleting user';
            return errorMessage;
          },
        }
      );
    } catch (error) {
      toast.error('Something went wrong');
    }
  };


  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };


  return (
    <>
      <Toaster />
      <div style={{ display: "flex", flexDirection: "row", gap: "10px", justifyContent: 'center', alignItems: 'center' }}>
        <h2 style={{ textAlign: 'center' }}>
          Users List
        </h2>
        <button type='submit' onClick={handleLogout} className='submit' style={{ backgroundColor: '#dc3545', color: 'white', marginLeft: 'auto' }}>
          Logout
        </button>
      </div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow style={{ backgroundColor: "grey" }}>
              <TableCell style={{ color: "white", textAlign: 'center' }}>First Name</TableCell>
              <TableCell style={{ color: "white", textAlign: 'center' }}>Last Name</TableCell>
              <TableCell style={{ color: "white", textAlign: 'center' }}>Email</TableCell>
              <TableCell style={{ color: "white", textAlign: 'center' }}>Country</TableCell>
              <TableCell style={{ color: "white", textAlign: 'center' }}>Phone Number</TableCell>
              <TableCell style={{ color: "white", textAlign: 'center' }}>Admin</TableCell>
              <TableCell style={{ color: "white", textAlign: 'center' }}>Email Verified</TableCell>
              <TableCell style={{ color: "white", textAlign: 'center' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.firstName}</TableCell>
                <TableCell>{user.lastName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell style={{ textAlign: 'center' }}>{user.country}</TableCell>
                <TableCell style={{ textAlign: 'center' }}>{user.phoneNumber}</TableCell>
                <TableCell style={{ textAlign: 'center' }}>{user.isAdmin ? 'Yes' : 'No'}</TableCell>
                <TableCell style={{ textAlign: 'center' }}>{user.isVerified ? 'Yes' : 'No'}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(user)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(user._id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer></>
  );
};

export default UsersList;
