// Validation utilities for registration forms

export const validateEmail = (email) => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
};

export const validateMobile = (mobile) => {
	// Accept various formats: +94XXXXXXXXX, 0XXXXXXXXX, XXXXXXXXXX
	const mobileRegex = /^(\+94|0)?\d{9,10}$/;
	return mobileRegex.test(mobile.replace(/\s|-/g, ''));
};

export const validatePassword = (password) => {
	// At least 8 chars, 1 uppercase, 1 lowercase, 1 number
	const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(.{8,})$/;
	return passwordRegex.test(password);
};

export const validateBudgetRange = (budget) => {
	// Check if it's a valid range format or single number
	const budgetRegex = /^\d+(-\d+)?$/;
	return budgetRegex.test(budget.replace(/[,\s]/g, ''));
};

export const validateNIC = (nic) => {
	// Sri Lankan NIC format: 9 digits + V or X, or 12 digits
	const nicRegex = /^(\d{9}[VX]|\d{12})$/i;
	return nicRegex.test(nic.replace(/\s|-/g, ''));
};

export const validateStudentID = (studentId) => {
	// Check if it contains at least 3 alphanumeric characters
	return studentId.length >= 3 && /^[a-zA-Z0-9]+$/.test(studentId);
};
