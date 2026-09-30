import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { useAuth } from '../../hooks/useAuth';

const CreateTender = () => {
    const { register, handleSubmit, control, formState: { errors } } = useForm({
        defaultValues: { milestones: [{ name: '', payoutAmount: '' }] }
    });
    const { fields, append, remove } = useFieldArray({ control, name: 'milestones' });
    const { token } = useAuth();
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('category', data.category);
        formData.append('totalValue', data.totalValue);
        formData.append('deadline', data.deadline);
        
        // --- NEW FIELDS ---
        formData.append('minTurnover', data.minTurnover);
        formData.append('minExperience', data.minExperience);

        if (data.tenderDocument && data.tenderDocument[0]) {
            formData.append('tenderDocument', data.tenderDocument[0]);
        }

        formData.append('eligibleClasses', JSON.stringify(data.eligibleClasses));
        formData.append('milestones', JSON.stringify(data.milestones));

        const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } };

        try {
            await api.post('/tenders', formData, config);
            alert('Tender created successfully!');
            navigate('/admin');
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to create tender.');
        }
    };

    return (
        <div className="page-container">
            <h1>Create a New Tender</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="create-tender-form">
                <fieldset>
                    <legend>Tender Details</legend>
                    <div className="form-group"><label>Title</label><input {...register("title", { required: true })} /></div>
                    <div className="form-group"><label>Description</label><textarea {...register("description", { required: true })} rows="4"></textarea></div>
                    
                    <div className="form-group">
                        <label>Category</label>
                        <select {...register("category", { required: true })} className="filter-select" style={{width: '100%'}}>
                            <option value="">Select Category</option>
                            <option value="Construction">Construction</option>
                            <option value="IT & Software">IT & Software</option>
                            <option value="Electrical">Electrical</option>
                            <option value="Maintenance">Maintenance</option>
                            <option value="Supply">Supply</option>
                        </select>
                    </div>

                    <div className="form-group"><label>Total Value (Max Budget ₹)</label><input type="number" {...register("totalValue", { required: true })} /></div>
                    
                    {/* --- NEW TECHNICAL REQUIREMENTS --- */}
                    <div style={{display: 'flex', gap: '20px'}}>
                        <div className="form-group" style={{flex: 1}}>
                            <label>Req. Turnover (Cr)</label>
                            <input type="number" step="0.1" {...register("minTurnover", { required: true })} placeholder="e.g. 5.0" />
                        </div>
                        <div className="form-group" style={{flex: 1}}>
                            <label>Req. Experience (Yrs)</label>
                            <input type="number" {...register("minExperience", { required: true })} placeholder="e.g. 3" />
                        </div>
                    </div>

                    <div className="form-group"><label>Bidding Deadline</label><input type="datetime-local" {...register("deadline", { required: true })} /></div>
                    
                    <div className="form-group">
                        <label>Eligible Classes (Hold Ctrl to select)</label>
                        <select multiple {...register("eligibleClasses", { required: true })} className="multi-select">
                            <option value="Class 1">Class 1</option>
                            <option value="Class 2">Class 2</option>
                            <option value="Class 3">Class 3</option>
                        </select>
                    </div>
                    <div className="form-group"><label>Official Tender PDF</label><input type="file" {...register("tenderDocument", { required: true })} accept=".pdf" /></div>
                </fieldset>

                <fieldset>
                    <legend>Milestones</legend>
                    {fields.map((field, index) => (
                        <div key={field.id} className="milestone-fields">
                            <input {...register(`milestones.${index}.name`)} placeholder="Name" />
                            <input type="number" {...register(`milestones.${index}.payoutAmount`)} placeholder="Amount" />
                            <button type="button" onClick={() => remove(index)} className="remove-btn">Remove</button>
                        </div>
                    ))}
                    <button type="button" onClick={() => append({ name: '', payoutAmount: '' })} className="add-btn">Add Milestone</button>
                </fieldset>
                <button type="submit" className="cta-button">Publish Tender</button>
            </form>
        </div>
    );
};
export default CreateTender;