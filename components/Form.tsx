"use client"

import React, { useRef } from 'react'
import { submitPetHospitalForm, PetHospitalFormData, FormErrors, schema } from '../utils';

const Form = () => {
    const fileInputRef = useRef<HTMLInputElement | null>(null); // Reference to the file input

    const [formData, setFormData] = React.useState<PetHospitalFormData>({
        ownerName: '',
        petName: '',
        dateOfBirth: '',
        weight: '',
        contactNumber: '',
        medicalHistory: '',
        petPhoto: null,
    });
    const [errors, setErrors] = React.useState<FormErrors>({});
    const [filePreview, setFilePreview] = React.useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const target = e.target;

        if (target instanceof HTMLInputElement && target.type === "file") {
            const files = target.files; // Access the files property safely
            if (files && files.length > 0) {
                const file = files[0];
                setFormData((prev) => ({ ...prev, [target.name]: file }));
                setFilePreview(URL.createObjectURL(file));
            }
        } else {
            const value = target.type === "number" ? parseFloat(target.value) : target.value;
            // console.log("value", value)
            setFormData((prev) => ({ ...prev, [target.name]: target.value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("first")

        const validation = schema.safeParse(formData);
        console.log("validation", validation)
        if (!validation.success) {
            const newErrors = validation.error.flatten().fieldErrors;
            const formattedErrors = Object.fromEntries(
                Object.entries(newErrors).map(([key, value]) => [key, value ? value[0] : null])
            );
            setErrors(formattedErrors);
            return;
        }

        setErrors({}); // Clear errors on successful validation

        try {
            console.log("try")
            const result = await submitPetHospitalForm(formData);
            console.log('Success:', result);
            alert('Form submitted successfully!');
            // Reset the form to its initial state
            setFormData({
                ownerName: '',
                petName: '',
                dateOfBirth: '',
                weight: '',
                medicalHistory: '',
                petPhoto: null,
                contactNumber: '',
            });
            setFilePreview(null); // Clear the file preview
            // Clear the file input field
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('There was an error submitting the form. Please try again.');
        }
    };

    return (
        <div className="form-container">
            <h1 className="form-header">Pet Hospital Registration</h1>
            <form onSubmit={handleSubmit} className="form">
                <div>
                    <label className="form-label">Owner Name</label>
                    <input
                        type="text"
                        name="ownerName"
                        value={formData.ownerName}
                        onChange={handleChange}
                        className="form-input"
                    />
                    {errors.ownerName && <p className="form-error">{errors.ownerName}</p>}
                </div>
                <div>
                    <label className="form-label">Pet Name</label>
                    <input
                        type="text"
                        name="petName"
                        value={formData.petName}
                        onChange={handleChange}
                        className="form-input"
                    />
                    {errors.petName && <p className="form-error">{errors.petName}</p>}
                </div>
                <div>
                    <label className="form-label">Date of Birth</label>
                    <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        className="form-input"
                    />
                    {errors.dateOfBirth && <p className="form-error">{errors.dateOfBirth}</p>}
                </div>
                <div>
                    <label className="form-label">Weight (kg)</label>
                    <input
                        type="number"
                        name="weight"
                        value={formData.weight || ""}
                        onChange={handleChange}
                        className="form-input"
                    />
                    {errors.weight && <p className="form-error">{errors.weight}</p>}
                </div>

                <div>
                    <label className="form-label">Medical History</label>
                    <textarea
                        name="medicalHistory"
                        value={formData.medicalHistory}
                        onChange={handleChange}
                        className="form-input"
                    ></textarea>
                </div>
                <div>
                    <label className="form-label">Contact Number</label>
                    <input
                        type="text"
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={handleChange}
                        className="form-input"
                    />
                    {errors.contactNumber && <p className="form-error">{errors.contactNumber}</p>}
                </div>
                <div>
                    <label className="form-label">Pet Photo</label>
                    <input
                        type="file"
                        name="petPhoto"
                        accept="image/*"
                        onChange={handleChange}
                        className="form-input"
                        ref={fileInputRef} // Attach the ref here
                    />
                    {filePreview && <img src={filePreview} alt="Preview" className="mt-2 max-h-32" />}
                    {errors.petPhoto && <p className="form-error">{errors.petPhoto}</p>}
                </div>
                <button type="submit" className="form-button">
                    Submit
                </button>
            </form>
        </div>
    )
}

export default Form