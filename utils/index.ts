import { z } from 'zod';

export interface FormErrors {
    [key: string]: string | null;
}

export interface PetHospitalFormData {
    petName: string;
    ownerName: string;
    contactNumber: string;
    dateOfBirth: string,
    weight: string;
    medicalHistory: string;
    petPhoto: File | null;
}

export const submitPetHospitalForm = async (formData: PetHospitalFormData): Promise<any> => {
    const formDataToSend = new FormData();
    // Append fields to FormData
    formDataToSend.append('petName', formData.petName);
    formDataToSend.append('ownerName', formData.ownerName);
    formDataToSend.append('contactNumber', formData.contactNumber);
    formDataToSend.append('dateOfBirth', formData.dateOfBirth);
    formDataToSend.append('weight', formData.weight);
    formDataToSend.append('medicalHistory', formData.medicalHistory);
    if (formData.petPhoto) {
        formDataToSend.append('petPhoto', formData.petPhoto);
    }
    console.log("formDataToSend", formDataToSend)

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pets`, {
        method: 'POST',
        body: formDataToSend,
    });

    if (!response.ok) {
        throw new Error('Failed to submit the form');
    }

    return response.json();
};

export const submitEditPetHospitalForm = async (formData: PetHospitalFormData): Promise<any> => {
    const formDataToSend = new FormData();
    // Append fields to FormData
    formDataToSend.append('petName', formData.petName);
    formDataToSend.append('ownerName', formData.ownerName);
    formDataToSend.append('contactNumber', formData.contactNumber);
    formDataToSend.append('dateOfBirth', formData.dateOfBirth);
    formDataToSend.append('weight', formData.weight);
    formDataToSend.append('medicalHistory', formData.medicalHistory);
    if (formData.petPhoto) {
        formDataToSend.append('petPhoto', formData.petPhoto);
    }
    console.log("formDataToSend", formDataToSend)

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pets`, {
        method: 'PATCH',
        body: formDataToSend,
    });

    if (!response.ok) {
        throw new Error('Failed to submit the form');
    }

    return response.json();
};

// Validation schema using Zod
export const schema = z.object({
    petName: z.string()
        .min(2, "Pet name must be at least 2 characters long") // Ensures the string is at least 4 characters
        .regex(
            /^[a-zA-Z0-9 ]+$/,
            "Pet name must not contain special characters."
        ),
    ownerName: z.string()
        .min(2, "Owner Name must be at least 2 characters long") // Ensures the string is at least 4 characters
        .regex(
            /^[a-zA-Z0-9 ]+$/,
            "Owner Name must not contain special characters."
        ),
    contactNumber: z.string()
        .min(10, "Contact number must be exactly 10 digits") // Ensures the string has at least 10 characters
        .max(10, "Contact number must be exactly 10 digits") // Ensures the string has at most 10 characters
        .regex(
            /^\d{10}$/,
            "Contact number must contain exactly 10 digits and no other characters."
        ),
    weight: z
        .string()
        .regex(
            /^(100(\.00)?|(\d{1,2}(\.\d{2})?))$/,
            "Weight must contain only number (0 to 100) with 2 digits."
        ),
    dateOfBirth: z
        .string()
        .refine(
            (value) => !isNaN(Date.parse(value)),
            "Invalid date format. Use DD-MM-YYYY."
        )
        .refine(
            (value) => new Date(value) <= new Date(),
            "Date of birth cannot be in the future."
        ),
    medicalHistory: z.string().optional(),
    petPhoto: z
        .union([
            z.instanceof(File).refine(
                (file) => file.type.startsWith("image/"),
                "Only image files are allowed."
            ),
            z.string().optional(), // Allow string (e.g., file URL or name)
        ])
        .optional(),
});