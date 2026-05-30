import React, { useState } from "react";
import { View, ScrollView, Text, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { registerWithEmail, createUserProfile } from './config/firebase';
import { pickImage, convertToBase64 } from './utils/imagePicker';
import { validateEmail, validateMobile, validatePassword, validateNIC } from './utils/validations';
import { handleError } from './utils/errorHandler';
import base64 from 'react-native-base64';

const LandlordRegistration = ({ navigation }) => {
	const [fullName, setFullName] = useState('');
	const [email, setEmail] = useState('');
	const [mobile, setMobile] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [nic, setNic] = useState('');
	const [address, setAddress] = useState('');
	const [propertyLocation, setPropertyLocation] = useState('');
	const [proofUri, setProofUri] = useState(null);
	const [proofUploaded, setProofUploaded] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [termsAccepted, setTermsAccepted] = useState(false);

	const pickProof = async () => {
		try {
			console.log('Pick proof called');
			setUploading(true);
			const image = await pickImage();
			console.log('Image picked:', image);
			if (image) {
				setProofUri(image.uri);
				// Auto-upload the image immediately
				const uploadedUrl = await uploadImageToImgBB(image.uri);
				setProofUploaded(true);
				setTimeout(() => setUploading(false), 500); // Small delay for animation
				Toast.show({ type: 'success', text1: 'Success', text2: 'Proof uploaded successfully!' });
			} else {
				setUploading(false);
			}
		} catch (err) {
			setUploading(false);
			const errorMsg = handleError(err, 'Image Upload');
			Alert.alert('Upload Failed', errorMsg);
		}
	};

	const uploadImageToImgBB = async (imageUri) => {
		try {
			const base64String = await convertToBase64(imageUri);
			const apiKey = process.env.EXPO_PUBLIC_IMG_BB_API_KEY || 'ec57b3b05e75c3c3108da45bf5ba9052';
			
			// Upload to ImgBB
			const formData = new FormData();
			formData.append('image', base64String);
			
			const uploadResponse = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
				method: 'POST',
				body: formData,
			});
			
			const uploadData = await uploadResponse.json();
			
			if (uploadData.success) {
				return uploadData.data.url;
			} else {
				throw new Error(uploadData.error.message || 'Image upload failed');
			}
		} catch (err) {
			throw new Error('Image upload error: ' + (err.message || err));
		}
	};

	const handleRegister = async () => {
		if (!fullName || !email || !mobile || !password || !confirmPassword || !nic || !address || !propertyLocation) {
			Alert.alert('Missing Fields', 'Please fill all required fields');
			return;
		}
		
		if (fullName.trim().length < 3) {
			Alert.alert('Invalid Name', 'Full name must be at least 3 characters');
			return;
		}
		
		if (!validateEmail(email)) {
			Alert.alert('Invalid Email', 'Please enter a valid email address');
			return;
		}
		
		if (!validateMobile(mobile)) {
			Alert.alert('Invalid Mobile', 'Please enter a valid mobile number (e.g., +94XXXXXXXXX or 0XXXXXXXXX)');
			return;
		}
		
		if (!validatePassword(password)) {
			Alert.alert('Weak Password', 'Password must be at least 8 characters with uppercase, lowercase, and a number');
			return;
		}
		
		if (password !== confirmPassword) {
			Alert.alert('Password Mismatch', 'Passwords do not match');
			return;
		}
		
		if (!validateNIC(nic)) {
			Alert.alert('Invalid NIC', 'Please enter a valid NIC (9 digits + V/X or 12 digits)');
			return;
		}
		
		if (address.trim().length < 5) {
			Alert.alert('Invalid Address', 'Address must be at least 5 characters');
			return;
		}
		
		if (propertyLocation.trim().length < 2) {
			Alert.alert('Invalid Location', 'Property location must be valid');
			return;
		}
		
		if (!proofUploaded) {
			Alert.alert('Proof Required', 'Please upload property ownership proof');
			return;
		}
		
		if (!termsAccepted) {
			Alert.alert('Terms Required', 'Please accept terms and conditions');
			return;
		}

		try {
			setUploading(true);
			const user = await registerWithEmail(email, password);
			const profile = {
				role: 'landlord',
				fullName,
				email,
				mobile,
				nic,
				address,
				propertyLocation,
				proofUri, // Save the ImgBB URL instead of local URI
				status: 'Pending Admin Approval',
				createdAt: new Date().toISOString(),
			};
			await createUserProfile(user.uid, profile);
			Toast.show({ type: 'success', text1: 'Success', text2: 'Landlord registration successful' });
			navigation.navigate('LandlordDashboard');
		} catch (err) {
			const errorMsg = handleError(err, 'Landlord Registration');
			Alert.alert('Registration Failed', errorMsg);
		} finally {
			setUploading(false);
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<KeyboardAvoidingView 
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				style={{ flex: 1 }}
			>
				<ScrollView style={styles.scrollView}>
					<View style={styles.column}>
					<View style={styles.view2}>
						<Text style={styles.text2}>{"StayEase - Landlord Registration"}</Text>
					</View>
					<View style={styles.column2}>
						<View style={styles.column3}>
							{/* Full Name */}
							<View style={styles.field}>
								<Text style={styles.label}>Full Name *</Text>
								<TextInput
									style={styles.input}
									placeholder="Enter your full name"
									value={fullName}
									onChangeText={setFullName}
								/>
							</View>
							{/* Email */}
							<View style={styles.field}>
								<Text style={styles.label}>Email Address *</Text>
								<TextInput
									style={styles.input}
									placeholder="your.email@example.com"
									value={email}
									onChangeText={setEmail}
									keyboardType="email-address"
								/>
							</View>
							{/* Mobile */}
							<View style={styles.field}>
								<Text style={styles.label}>Mobile Number *</Text>
								<TextInput
									style={styles.input}
									placeholder="+94 XX XXX XXXX"
									value={mobile}
									onChangeText={setMobile}
									keyboardType="phone-pad"
								/>
							</View>
							{/* Password */}
							<View style={styles.field}>
								<Text style={styles.label}>Password *</Text>
								<TextInput
									style={[styles.input, password && !validatePassword(password) ? styles.inputError : null]}
									placeholder="Enter your password"
									value={password}
									onChangeText={setPassword}
									secureTextEntry
								/>
								{password.length > 0 && !validatePassword(password) && (
									<Text style={styles.validationErrorText}>
										Must be at least 8 chars, 1 uppercase, 1 lowercase, 1 number.
									</Text>
								)}
							</View>
							{/* Confirm Password */}
							<View style={styles.field}>
								<Text style={styles.label}>Confirm Password *</Text>
								<TextInput
									style={[styles.input, confirmPassword && password !== confirmPassword ? styles.inputError : null]}
									placeholder="Confirm your password"
									value={confirmPassword}
									onChangeText={setConfirmPassword}
									secureTextEntry
								/>
								{confirmPassword.length > 0 && password !== confirmPassword && (
									<Text style={styles.validationErrorText}>
										Passwords do not match.
									</Text>
								)}
							</View>
							{/* NIC */}
							<View style={styles.field}>
								<Text style={styles.label}>NIC / National ID Number *</Text>
								<TextInput
									style={styles.input}
									placeholder="Enter NIC number"
									value={nic}
									onChangeText={setNic}
								/>
							</View>
							{/* Address */}
							<View style={styles.field}>
								<Text style={styles.label}>Address *</Text>
								<TextInput
									style={styles.input}
									placeholder="Enter your address"
									value={address}
									onChangeText={setAddress}
									multiline
								/>
							</View>
							{/* Property Location */}
							<View style={styles.field}>
								<Text style={styles.label}>Property Location *</Text>
								<TextInput
									style={styles.input}
									placeholder="Enter property location"
									value={propertyLocation}
									onChangeText={setPropertyLocation}
								/>
							</View>
							{/* Proof Upload */}
							<View style={styles.field}>
								<Text style={styles.label}>Property Ownership Proof *</Text>
								<TouchableOpacity 
									style={[
										styles.uploadButton, 
										uploading && styles.uploadButtonLoading,
										proofUploaded && styles.uploadButtonSuccess
									]} 
									onPress={pickProof}
									disabled={uploading}
								>
									{uploading ? (
										<View style={styles.uploadingContainer}>
											<ActivityIndicator size="small" color="#FFA500" />
											<Text style={styles.uploadText}>  Uploading...</Text>
										</View>
									) : proofUploaded ? (
										<Text style={[styles.uploadText, styles.uploadTextSuccess]}>
											✓ Proof Uploaded Successfully
										</Text>
									) : (
										<Text style={styles.uploadText}>
											📁 Upload Proof Document
										</Text>
									)}
								</TouchableOpacity>
							</View>
							{/* Terms */}
							<TouchableOpacity style={styles.checkbox} onPress={() => setTermsAccepted(!termsAccepted)}>
								<Text style={termsAccepted ? styles.checkboxChecked : styles.checkboxUnchecked}>
									{termsAccepted ? '☑' : '☐'}
								</Text>
								<Text style={styles.checkboxText}> I accept the Terms & Conditions *</Text>
							</TouchableOpacity>
							{/* Register Button */}
							<TouchableOpacity 
								style={[styles.button, (!proofUploaded || uploading) && styles.buttonDisabled]} 
								onPress={handleRegister}
								disabled={!proofUploaded || uploading}
							>
								<Text style={styles.buttonText}>{uploading ? 'Registering...' : 'Register as Landlord'}</Text>
							</TouchableOpacity>
						</View>
						<TouchableOpacity onPress={() => navigation.goBack()}>
							<Text style={styles.backText}>Back to Login</Text>
						</TouchableOpacity>
					</View>
				</View>
			</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#FFFFFF" },
	scrollView: {
		flex: 1,
		backgroundColor: "#F5F5F5",
		borderRadius: 20,
		shadowColor: "#0000001A",
		shadowOpacity: 0.1,
		shadowOffset: { width: 0, height: 10 },
		shadowRadius: 30,
		elevation: 30,
	},
	column: { backgroundColor: "#F5F5F5", padding: 20 },
	column2: { alignItems: "center", paddingVertical: 39 },
	column3: {
		alignSelf: "stretch",
		backgroundColor: "#FFFFFF",
		borderColor: "#D3D3D3",
		borderRadius: 12,
		borderWidth: 1,
		paddingVertical: 26,
		marginBottom: 20,
	},
	field: { marginBottom: 19, marginHorizontal: 26 },
	label: { color: "#36454F", fontSize: 14, fontWeight: "bold", marginBottom: 8 },
	input: {
		backgroundColor: "#F5F5F5",
		borderColor: "#D3D3D3",
		borderRadius: 8,
		borderWidth: 1,
		paddingVertical: 13,
		paddingHorizontal: 16,
		fontSize: 13,
		color: "#36454F",
	},
	inputError: {
		borderColor: "#E74C3C",
		borderWidth: 1.5,
	},
	validationErrorText: {
		color: "#E74C3C",
		fontSize: 11,
		marginTop: 4,
		marginLeft: 4,
	},
	uploadButton: {
		backgroundColor: "#F5F5F5",
		borderColor: "#D3D3D3",
		borderRadius: 8,
		borderWidth: 1,
		paddingVertical: 13,
		alignItems: 'center',
	},
	uploadButtonLoading: {
		backgroundColor: "#FFF8E1",
		borderColor: "#FFA500",
	},
	uploadButtonSuccess: {
		backgroundColor: "#E8F5E9",
		borderColor: "#4CAF50",
	},
	uploadingContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
	uploadText: { fontSize: 13, color: "#36454F" },
	uploadTextSuccess: { color: "#4CAF50", fontWeight: "bold" },
	checkbox: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 26, marginBottom: 20 },
	checkboxChecked: { fontSize: 18, color: '#FFA500' },
	checkboxUnchecked: { fontSize: 18, color: '#D3D3D3' },
	checkboxText: { fontSize: 13, color: '#36454F' },
	button: {
		alignItems: "center",
		backgroundColor: "#FFA500",
		borderRadius: 8,
		paddingVertical: 12,
		marginHorizontal: 26,
		marginBottom: 10,
	},
	buttonDisabled: {
		backgroundColor: "#CCCCCC",
		opacity: 0.6,
	},
	buttonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "bold" },
	view2: { paddingTop: 15, paddingBottom: 16 },
	text2: { color: "#FFA500", fontSize: 20, fontWeight: "bold" },
	backText: { color: "#FFA500", fontSize: 13, textDecorationLine: 'underline' },
});

export default LandlordRegistration;