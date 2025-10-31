
import { z } from 'zod';

// Password validation regexes
const hasUpperCase = /(?=.*[A-Z])/;
const hasNumber = /(?=.*\d)/;
const hasSpecialChar = /(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/;
const noConsecutiveChars = /^(?!.*(.)\1)/;

const passwordSchema = z.string()
    .min(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
    .regex(hasUpperCase, { message: 'Debe contener al menos una letra mayúscula.' })
    .regex(hasNumber, { message: 'Debe contener al menos un número.' })
    .regex(hasSpecialChar, { message: 'Debe contener al menos un símbolo especial.' })
    .regex(noConsecutiveChars, { message: 'No debe contener caracteres consecutivos idénticos.' });


// Schema for Personal Registration
export const PersonalRegistrationSchema = z.object({
    fullName: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres.' }),
    email: z.string().email({ message: 'Correo electrónico inválido.' }),
    password: passwordSchema,
    confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'], // Set the error on the confirmation field
});

// Schema for Company Registration
export const CompanyRegistrationSchema = z.object({
    companyName: z.string().min(3, { message: 'El nombre de la empresa debe tener al menos 3 caracteres.' }),
    rfc: z.string().regex(/^[A-Z&Ñ]{3,4}\d{6}[A-V1-9][A-Z\d]{2}$/, { message: 'RFC inválido.' }),
    phone: z.string().regex(/^\d{10}$/, { message: 'El teléfono debe tener 10 dígitos.' }),
    email: z.string().email({ message: 'Correo electrónico inválido.' }),
    password: passwordSchema,
    confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'], // Set the error on the confirmation field
});
