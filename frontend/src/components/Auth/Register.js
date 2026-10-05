import api from '../../api';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';


const determineContractorClass = (turnover) => {
    const turnoverNum = parseFloat(turnover);
    if (turnoverNum >= 50) return 'Class 1';
    if (turnoverNum >= 10) return 'Class 2';
    return 'Class 3';
};

const Register = () => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const navigate = useNavigate();
  const password = watch("password");

  const onSubmit = async (data) => {
    const contractorClass = determineContractorClass(data.turnover);
    
    // Note: In a real app, the file upload would be handled differently
    const certificateFile = data.certificateFile[0];

    const registrationData = {
        name: data.companyName,
        email: data.email,
        password: data.password,
        role: 'contractor',
        class: contractorClass,
        gstNumber: data.gstNumber,
        panNumber: data.panNumber,
        turnover: parseFloat(data.turnover),
        yearsExperience: parseInt(data.yearsExperience, 10),
        avgRating: parseFloat(data.avgRating),
    };

    try {
        await api.post('/users/register', registrationData);
        alert(`Registration successful for ${data.companyName}!\nCertificate Submitted: ${certificateFile.name}\nYou can now log in.`);
        navigate('/login');
    } catch (err) {
        alert('Registration failed. This email may already be in use.');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit(onSubmit)} className="login-form register-form">
        <h2>Contractor Registration & Classification</h2>
        <p className="form-description">Provide your company details to get classified and bid on eligible tenders.</p>
        
        <fieldset>
          <legend>Company & Financial Details</legend>
          <div className="form-group">
            <label>Company Name</label>
            <input {...register("companyName", { required: "Company Name is required" })} />
            {errors.companyName && <p className="error">{errors.companyName.message}</p>}
          </div>
          <div className="form-group">
            <label>GST Number</label>
            <input {...register("gstNumber", { required: "GST Number is required", pattern: { value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, message: "Invalid GST Number format" } })} placeholder="e.g., 27ABCDE1234F1Z5" />
            {errors.gstNumber && <p className="error">{errors.gstNumber.message}</p>}
          </div>
           <div className="form-group">
            <label>PAN Number</label>
            <input {...register("panNumber", { required: "PAN Number is required", pattern: { value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, message: "Invalid PAN Number format" } })} placeholder="e.g., ABCDE1234F" />
            {errors.panNumber && <p className="error">{errors.panNumber.message}</p>}
          </div>
          <div className="form-group">
            <label>Last Year's Annual Turnover (in ₹ Crores)</label>
            <input type="number" step="0.1" {...register("turnover", { required: "Turnover is required", min: { value: 0.1, message: "Turnover must be positive" } })} />
            {errors.turnover && <p className="error">{errors.turnover.message}</p>}
          </div>
        </fieldset>
        
        <fieldset>
          <legend>Experience & Credentials</legend>
          <div className="form-group">
            <label>Years in Business</label>
            <input type="number" {...register("yearsExperience", { required: "Years of experience is required", min: { value: 1, message: "Minimum 1 year of experience" } })} />
            {errors.yearsExperience && <p className="error">{errors.yearsExperience.message}</p>}
          </div>
          <div className="form-group">
            <label>Average Past Project Rating (1-5)</label>
            <input type="number" step="0.1" {...register("avgRating", { required: "Rating is required", min: { value: 1, message: "Rating must be between 1 and 5" }, max: { value: 5, message: "Rating must be between 1 and 5" } })} />
            {errors.avgRating && <p className="error">{errors.avgRating.message}</p>}
          </div>
          <div className="form-group">
            <label>Proof of Past Work (Certificate PDF/Image)</label>
            <input type="file" {...register("certificateFile", { required: "A certificate is required" })} accept=".pdf,.jpg,.jpeg,.png" />
            {errors.certificateFile && <p className="error">{errors.certificateFile.message}</p>}
          </div>
        </fieldset>

        <fieldset>
          <legend>Login Credentials</legend>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" {...register("email", { required: "Email is required" })} />
            {errors.email && <p className="error">{errors.email.message}</p>}
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" {...register("password", { required: "Password is required", minLength: { value: 8, message: "Password must be at least 8 characters" } })} />
            {errors.password && <p className="error">{errors.password.message}</p>}
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" {...register("confirmPassword", { 
                required: "Please confirm your password",
                validate: value => value === password || "The passwords do not match"
              })} 
            />
            {errors.confirmPassword && <p className="error">{errors.confirmPassword.message}</p>}
          </div>
        </fieldset>

        <button type="submit">Register and Get Classified</button>
        
        <div className="register-link">
          <p>Already have an account? <Link to="/login">Login Here</Link></p>
        </div>
      </form>
    </div>
  );
};

export default Register;