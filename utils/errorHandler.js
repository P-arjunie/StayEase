// Firebase error code to user-friendly message mapping
const errorMessages = {
	// Auth errors
	'auth/invalid-email': 'Invalid email address. Please check and try again.',
	'auth/user-disabled': 'This account has been disabled. Please contact support.',
	'auth/user-not-found': 'No account found with this email. Please sign up first.',
	'auth/wrong-password': 'Incorrect password. Please try again.',
	'auth/invalid-credential': 'Invalid email or password. Please try again.',
	'auth/email-already-in-use': 'This email is already registered. Please log in or use a different email.',
	'auth/weak-password': 'Password is too weak. Use at least 8 characters with uppercase, lowercase, and numbers.',
	'auth/operation-not-allowed': 'Email/password sign-up is not enabled. Please contact support.',
	'auth/too-many-requests': 'Too many login attempts. Please try again later.',
	'auth/network-request-failed': 'Network error. Please check your internet connection.',
	'auth/account-exists-with-different-credential': 'This email is already linked to another account.',

	// Firestore errors
	'permission-denied': 'You do not have permission to perform this action.',
	'not-found': 'The requested data was not found.',
	'already-exists': 'This document already exists.',
	'invalid-argument': 'Invalid data provided. Please check your inputs.',
	'failed-precondition': 'Operation failed. Please try again.',
	'aborted': 'Operation was aborted. Please try again.',
	'out-of-range': 'The provided value is out of range.',
	'unimplemented': 'This feature is not available.',
	'unavailable': 'Service is temporarily unavailable. Please try again later.',
	'data-loss': 'Data loss detected. Please try again.',
	'unauthenticated': 'Please log in to perform this action.',

	// Image upload errors
	'storage/object-not-found': 'Image not found.',
	'storage/bucket-not-found': 'Storage service is unavailable.',
	'storage/project-invalid': 'Project configuration error.',
	'storage/invalid-argument': 'Invalid image data.',
	'storage/unauthorized': 'You do not have permission to upload images.',
	'storage/retry-limit-exceeded': 'Upload failed. Please try again.',

	// Custom errors
	'network-error': 'Network error. Please check your internet connection.',
	'timeout': 'Request timed out. Please try again.',
	'unknown': 'An unexpected error occurred. Please try again.',
};

/**
 * Parse Firebase error and return user-friendly message
 * @param {Error|string} error - The error object or error code
 * @returns {string} - User-friendly error message
 */
export function getErrorMessage(error) {
	if (!error) {
		return errorMessages['unknown'];
	}

	let errorCode = error.code || error.message || String(error);

	// Check if we have a direct mapping
	if (errorMessages[errorCode]) {
		return errorMessages[errorCode];
	}

	// Check if error contains a recognizable Firebase error pattern
	const matches = errorCode.match(/\((\w+\/[\w-]+)\)/);
	if (matches && matches[1]) {
		const code = matches[1];
		if (errorMessages[code]) {
			return errorMessages[code];
		}
	}

	// If it's a full Firebase error string like "auth/invalid-credential"
	if (errorCode.includes('auth/')) {
		const authCode = errorCode.split('(')[1]?.replace(')', '') || errorCode;
		if (errorMessages[authCode]) {
			return errorMessages[authCode];
		}
	}

	if (errorCode.includes('storage/')) {
		const storageCode = errorCode.split('(')[1]?.replace(')', '') || errorCode;
		if (errorMessages[storageCode]) {
			return errorMessages[storageCode];
		}
	}

	// Default message if we can't match the error
	return `An error occurred: ${errorCode}. Please try again.`;
}

/**
 * Log error for debugging while showing user-friendly message
 * @param {Error|string} error - The error object or error code
 * @param {string} context - Context where error occurred (e.g., "Login", "Registration")
 * @returns {string} - User-friendly error message
 */
export function handleError(error, context = 'Operation') {
	console.error(`[${context} Error]`, error);
	return getErrorMessage(error);
}
