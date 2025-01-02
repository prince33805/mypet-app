'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { FormErrors, schema } from '@/utils';

interface Pet {
    id: string;
    petName: string;
    ownerName: string;
    contactNumber: string;
    medicalHistory: string;
    dateOfBirth: string;
    weight: string;
    petPhoto: File | null;
    createdDate: string;
}

const Dashboard: React.FC = () => {
    const [pets, setPets] = useState<Pet[]>([]);
    const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [loading, setLoading] = useState(true); // Track loading state
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [errors, setErrors] = useState<FormErrors>({});
    const [error, setError] = useState<String | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null); // Reference to the file input
    const [itemToDelete, setItemToDelete] = useState(null);

    useEffect(() => {
        const authToken = localStorage.getItem('authToken'); // Retrieve the token from localStorage

        if (!authToken) {
            setError('Missing auth token. Please log in.');
            setLoading(false);
            return;
        }

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/pets`, {
            headers: {
                Authorization: `Bearer ${authToken}`
            }
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to fetch pets');
                }
                return response.json();
            })
            .then((data) => setPets(data))
            .catch((error) => {
                console.error('Error fetching data:', error);
                setError('Failed to fetch pets Please Login Or Wrong AuthToken'); // Set a meaningful error message
                setPets([]); // Set pets to an empty array as a fallback
            })
            .finally(() => setLoading(false));

    }, []);

    const handleShow = (pet: Pet) => {
        setSelectedPet(pet);
        setShowPopup(true);
        setIsEditMode(false);
    };

    const handleEdit = (pet: Pet) => {
        setSelectedPet({
            ...pet,
            weight: String(pet.weight)
        });
        setFilePreview(null); // Reset file preview
        setShowPopup(true);
        setIsEditMode(true);
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const target = e.target;

        if (target instanceof HTMLInputElement && target.type === 'file' && target.files && target.files[0]) {
            const file = target.files[0];
            setFilePreview(URL.createObjectURL(file));
            setSelectedPet((prev) => (prev ? { ...prev, [target.name]: file } : prev)); // Update selectedPet
        } else {
            const { name, value } = target;
            if (isEditMode && selectedPet) {
                setSelectedPet((prev) => (prev ? { ...prev, [name]: value } : prev));
            } else {
                console.warn('Cannot edit, not in edit mode.');
            }
        }
    };

    const handleSave = async () => {
        if (selectedPet) {
            console.log("first")

            const validation = schema.safeParse(selectedPet);
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
                const authToken = localStorage.getItem('authToken'); // Retrieve the token from localStorage

                console.log("selectedPet", selectedPet)
                const formDataToSend = new FormData();
                // Append fields to FormData
                formDataToSend.append('petName', selectedPet.petName);
                formDataToSend.append('ownerName', selectedPet.ownerName);
                formDataToSend.append('contactNumber', selectedPet.contactNumber);
                formDataToSend.append('dateOfBirth', selectedPet.dateOfBirth.toString());
                formDataToSend.append('weight', selectedPet.weight.toString());
                formDataToSend.append('medicalHistory', selectedPet.medicalHistory);
                if (selectedPet.petPhoto) {
                    formDataToSend.append('petPhoto', selectedPet.petPhoto);
                }
                console.log("formDataToSend", formDataToSend)
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pets/${selectedPet.id}`, {
                    method: 'PATCH',
                    body: formDataToSend,
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    }
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const updatedPet = await response.json();
                // Update the pets state with the modified pet
                setPets((prev) =>
                    prev.map((pet) => (pet.id === updatedPet.id ? updatedPet : pet))
                );

                setShowPopup(false);
                alert('Pet details updated successfully!');
            } catch (error) {
                console.error('Error saving data:', error);
                alert('Error updating pet details.');
            }
        }
    };

    const handleClose = () => {
        setShowPopup(false);
        setShowDeleteDialog(false);
        setSelectedPet(null);
        setFilePreview(null);
    };

    const handleDelete = (id: any) => {
        setShowPopup(false);
        setShowDeleteDialog(true);
        setItemToDelete(id);
        setSelectedPet(null);
        setFilePreview(null);
    };

    const handleConfirmDelete = async () => {
        setShowDeleteDialog(false);
        if (!itemToDelete) return;
        try {
            const authToken = localStorage.getItem('authToken'); // Retrieve the token from localStorage
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pets/${itemToDelete}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            });
            if (res.ok) {
                console.log("Item deleted successfully");
                window.location.reload();
            } else {
                console.error("Failed to delete item");
            }
        } catch (error) {
            console.error("Error deleting item:", error);
        } finally {
            setItemToDelete(null);
        }
    };

    if (loading) {
        return <div className="dashboard-container">
            <div className="flex items-center space-x-4">
                <span className="text-black px-4 py-2">Loading...</span>
            </div>
        </div>;
    }

    return (
        <div className="dashboard-container">
            {error ? (<div>Error : {error}</div>) : (
                <>
                    <h1 className="dashboard-header">Pet Dashboard</h1>
                    <table className="dashboard-table">
                        <thead>
                            <tr>
                                <th>Pet Name</th>
                                <th>Owner Name</th>
                                <th>Contact Number</th>
                                <th>Create Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pets.map((pet) => (
                                <tr key={pet.id}>
                                    <td>{pet.petName}</td>
                                    <td>{pet.ownerName}</td>
                                    <td>{pet.contactNumber}</td>
                                    <td>{pet.createdDate}</td>
                                    <td>
                                        <button
                                            onClick={() => handleShow(pet)}
                                            className="dashboard-button-show"
                                        >
                                            Show
                                        </button>
                                        <button
                                            onClick={() => handleEdit(pet)}
                                            className="dashboard-button-edit"
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}

            {showPopup && selectedPet && (
                <div className="popup-overlay">
                    <div className="popup-container flex">
                        <div className="popup-image flex-1 p-4">

                            {filePreview ? (
                                <img src={filePreview} alt="Preview" className="mt-2 max-h-[450px]" />
                            ) : (
                                selectedPet?.petPhoto ? (
                                    <Image
                                        // src={imageSrc}
                                        src={`${process.env.NEXT_PUBLIC_API_URL}/pets/photo/${selectedPet.petPhoto.toString().split('/').pop()}`}
                                        alt="Pet Photo"
                                        width={450}
                                        height={450}
                                        style={{ width: '450px', height: '450px', objectFit: 'cover' }} // Force width and height
                                    />
                                ) : (
                                    <p className="mt-2 text-gray-500">No photo available</p> // Fallback text when no photo
                                )
                            )}

                            {isEditMode && (
                                <>
                                    <input
                                        type="file"
                                        name="petPhoto"
                                        accept="image/*"
                                        onChange={handleChange}
                                        className="form-input"
                                        ref={fileInputRef} // Attach the ref here
                                    />
                                    {errors.petPhoto && <p className="form-error">{errors.petPhoto}</p>}
                                </>
                            )}
                        </div>

                        {/* Details Column */}
                        <div className="popup-details flex-1 p-4">
                            <h2 className="popup-header">
                                {isEditMode ? 'Edit Pet Details' : 'Pet Details'}
                            </h2>
                            <form className="popup-form">
                                <label>
                                    Pet Name:
                                    <input
                                        type="text"
                                        name="petName"
                                        value={selectedPet.petName}
                                        onChange={(e) => handleChange(e)}
                                        disabled={!isEditMode}
                                    />
                                    {errors.petName && <p className="form-error">{errors.petName}</p>}
                                </label>
                                <label>
                                    Owner Name:
                                    <input
                                        type="text"
                                        name="ownerName"
                                        value={selectedPet.ownerName}
                                        onChange={(e) =>
                                            isEditMode
                                                ? handleChange(e)
                                                : setSelectedPet({ ...selectedPet, ownerName: e.target.value })
                                        }
                                        disabled={!isEditMode}
                                    />
                                    {errors.ownerName && <p className="form-error">{errors.ownerName}</p>}
                                </label>
                                <label>
                                    Weight (kg):
                                    <input
                                        type="number"
                                        name="weight"
                                        value={selectedPet.weight.toString()}
                                        onChange={(e) =>
                                            isEditMode
                                                ? handleChange(e)
                                                : setSelectedPet({ ...selectedPet, weight: e.target.value })
                                        }
                                        disabled={!isEditMode}
                                    />
                                    {errors.weight && <p className="form-error">{errors.weight}</p>}
                                </label>
                                <label>
                                    Date of Birth:
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        value={selectedPet.dateOfBirth}
                                        onChange={(e) =>
                                            isEditMode
                                                ? handleChange(e)
                                                : setSelectedPet({ ...selectedPet, dateOfBirth: e.target.value })
                                        }
                                        disabled={!isEditMode}
                                    />
                                    {errors.dateOfBirth && <p className="form-error">{errors.dateOfBirth}</p>}
                                </label>
                                <label>
                                    Contact Number:
                                    <input
                                        type="text"
                                        name="contactNumber"
                                        value={selectedPet.contactNumber}
                                        onChange={(e) =>
                                            isEditMode
                                                ? handleChange(e)
                                                : setSelectedPet({ ...selectedPet, contactNumber: e.target.value })
                                        }
                                        disabled={!isEditMode}
                                    />
                                    {errors.contactNumber && <p className="form-error">{errors.contactNumber}</p>}
                                </label>
                                <label>
                                    Medical History:
                                    <textarea
                                        value={selectedPet.medicalHistory}
                                        name="medicalHistory"
                                        onChange={(e) =>
                                            isEditMode
                                                ? handleChange(e)
                                                : setSelectedPet({ ...selectedPet, medicalHistory: e.target.value })
                                        }
                                        disabled={!isEditMode}
                                    />
                                    {errors.medicalHistory && <p className="form-error">{errors.medicalHistory}</p>}
                                </label>
                                <div className="popup-actions">
                                    {isEditMode && (
                                        <>
                                            <button type="button" className='save' onClick={handleSave}>
                                                Save
                                            </button>
                                            <button type="button" className='delete' onClick={() => handleDelete(selectedPet.id)}>
                                                Delete
                                            </button>
                                        </>
                                    )}
                                    <button type="button" onClick={handleClose} className="close">
                                        Close
                                    </button>
                                </div>

                            </form>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteDialog && (
                <div className="popup-overlay">
                    <div className="popup-container-delete flex">
                        <div className="popup-details flex-1 p-4">
                            <h2 className="popup-header-delete">
                                Are you sure to Delete ?
                            </h2>
                            <div className="popup-actions-delete">
                                <>
                                    <button type="button" className='delete' onClick={handleConfirmDelete}>
                                        Delete
                                    </button>
                                    <button type="button" className='close' onClick={handleClose}>
                                        Cancel
                                    </button>
                                </>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Dashboard;
