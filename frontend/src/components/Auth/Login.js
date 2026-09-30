import api from '../../api';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';

const Login = () => {
  // --- FIX IS ON THIS LINE ---
  const { register, handleSubmit, formState: { errors }, setError } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const res = await api.post('/users/login', data);
      
      login(res.data.user, res.data.token);

      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/contractor');
      }
    } catch (err) {
      setError("root", {
        type: "manual",
        message: "Invalid email or password",
      });
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit(onSubmit)} className="login-form">
        <h2>Portal Login</h2>
        <div className="form-group">
          <label>Email</label>
          <input {...register("email", { required: "Email is required" })} />
          {errors.email && <p className="error">{errors.email.message}</p>}
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" {...register("password", { required: "Password is required" })} />
          {errors.password && <p className="error">{errors.password.message}</p>}
        </div>
        {errors.root && <p className="error center">{errors.root.message}</p>}
        <button type="submit">Login</button>
        
        <div className="register-link">
          <p>New Contractor? <Link to="/register">Register Here</Link></p>
        </div>
      </form>
    </div>
  );
};

export default Login;