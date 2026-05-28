import React, { useState } from "react";
import { View, ScrollView, Text, TouchableOpacity, TextInput, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { registerWithEmail, createUserProfile } from './config/firebase';
import SelectPicker from './components/SelectPicker';
import AnimatedButton from './components/AnimatedButton';
import { LinearGradient } from 'expo-linear-gradient';
import { validateEmail, validateMobile, validatePassword, validateBudgetRange, validateStudentID } from './utils/validations';
import { handleError } from './utils/errorHandler';

const StudentRegistration = ({ navigation }) => {
	const [fullName, setFullName] = useState('');
	const [email, setEmail] = useState('');
	const [mobile, setMobile] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [university, setUniversity] = useState('');
	const [faculty, setFaculty] = useState('');
	const [studentId, setStudentId] = useState('');
	const [location, setLocation] = useState('');
	const [minBudget, setMinBudget] = useState('');
	const [maxBudget, setMaxBudget] = useState('');
	const [accommodation, setAccommodation] = useState('room');
	const [genderPreference, setGenderPreference] = useState('any');
	const [maxDistance, setMaxDistance] = useState('');
	const [idCardImage, setIdCardImage] = useState(null);
	const [guardianName, setGuardianName] = useState('');
	const [guardianMobile, setGuardianMobile] = useState('');
	const [guardianRelation, setGuardianRelation] = useState('');
	const [termsAccepted, setTermsAccepted] = useState(false);
	const [loading, setLoading] = useState(false);
	const [step, setStep] = useState(1);

	const pickImage = async () => {
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ['images'],
			allowsEditing: true,
			aspect: [4, 3],
			quality: 1,
		});

		if (!result.canceled) {
			setIdCardImage(result.assets[0].uri);
		}
	};

	const handleRegister = async () => {
		if (!fullName || !email || !mobile || !password || !confirmPassword) {
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
		
		if (university && university.trim().length < 2) {
			Alert.alert('Invalid University', 'University name must be valid');
			return;
		}
		
		if (studentId && !validateStudentID(studentId)) {
			Alert.alert('Invalid Student ID', 'Student ID must contain at least 3 alphanumeric characters');
			return;
		}
		
		const budget = `${minBudget}-${maxBudget}`;
		if (budget && !validateBudgetRange(budget)) {
			Alert.alert('Invalid Budget', 'Budget must be a number or range (e.g., 5000 or 5000-10000)');
			return;
		}
		
		if (location && location.trim().length < 2) {
			Alert.alert('Invalid Location', 'Location must be valid');
			return;
		}
		
		if (!idCardImage) {
			Alert.alert('Missing ID Card', 'Please upload your Student ID Card');
			return;
		}

		if (!guardianName || !guardianMobile || !guardianRelation) {
			Alert.alert('Missing Guardian Details', 'Please fill all guardian details');
			return;
		}
		
		if (!validateMobile(guardianMobile)) {
			Alert.alert('Invalid Guardian Mobile', 'Please enter a valid mobile number for guardian');
			return;
		}

		if (!termsAccepted) {
			Alert.alert('Terms Required', 'Please accept terms and conditions');
			return;
		}

		const parsedMinBudget = parseInt(minBudget) || 0;
		const parsedMaxBudget = parseInt(maxBudget) || 0;

		if (parsedMinBudget > parsedMaxBudget) {
			Alert.alert('Invalid Budget', 'Min budget cannot be greater than Max budget');
			return;
		}

		try {
			setLoading(true);
			const user = await registerWithEmail(email, password);
			const profile = {
				role: 'student',
				fullName,
				email,
				mobile,
				university,
				faculty,
				studentId,
				idCardImage,
				guardian: {
					name: guardianName,
					mobile: guardianMobile,
					relationship: guardianRelation,
				},
				preferredLocation: location,
				minBudget: parsedMinBudget,
				maxBudget: parsedMaxBudget,
				accommodationType: accommodation,
				genderPreference,
				maxDistance,
				status: 'Pending Verification',
				createdAt: new Date().toISOString(),
			};
			await createUserProfile(user.uid, profile);
			alert('Student registration successful');
			navigation.navigate('Login');
		} catch (err) {
			const errorMsg = handleError(err, 'Student Registration');
			Alert.alert('Registration Failed', errorMsg);
		} finally {
			setLoading(false);
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
							<Text style={styles.text2}>{"StayEase Registration"}</Text>
							<Text style={styles.stepText}>Step {step} of 3</Text>
						</View>
						
						{/* Progress Bar */}
						<View style={styles.progressBarContainer}>
							<View style={[styles.progressBarFilled, { width: `${(step / 3) * 100}%` }]} />
						</View>

						<View style={styles.column2}>
							<View style={styles.column3}>
								{/* Step 1: Account Details */}
								{step === 1 && (<>
								<View style={styles.field}>
									<Text style={styles.label}>Full Name *</Text>
									<TextInput
										style={styles.input}
										placeholder="Enter your full name"
										value={fullName}
										onChangeText={setFullName}
									/>
								</View>
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
								<View style={styles.field}>
									<Text style={styles.label}>Password *</Text>
									<TextInput
										style={styles.input}
										placeholder="Enter your password"
										value={password}
										onChangeText={setPassword}
										secureTextEntry
									/>
								</View>
								<View style={styles.field}>
									<Text style={styles.label}>Confirm Password *</Text>
									<TextInput
										style={styles.input}
										placeholder="Re-enter password"
										value={confirmPassword}
										onChangeText={setConfirmPassword}
										secureTextEntry
									/>
								</View>
								
								<View style={styles.wizardNav}>
									<AnimatedButton style={{ flex: 1 }} onPress={() => setStep(2)}>
										<LinearGradient colors={['#FFB75E', '#ED8F03']} style={styles.nextButton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
											<Text style={styles.buttonText}>Next →</Text>
										</LinearGradient>
									</AnimatedButton>
								</View>
								</>)}

								{/* Step 2: University Details */}
								{step === 2 && (<>
								<View style={styles.field}>
									<Text style={styles.label}>University Name *</Text>
									<TextInput
										style={styles.input}
										placeholder="Enter university name"
										value={university}
										onChangeText={setUniversity}
									/>
								</View>
								<View style={styles.field}>
									<Text style={styles.label}>Faculty / Department</Text>
									<TextInput
										style={styles.input}
										placeholder="Enter faculty/department (optional)"
										value={faculty}
										onChangeText={setFaculty}
									/>
								</View>
								<View style={styles.field}>
									<Text style={styles.label}>Student ID Number</Text>
									<TextInput
										style={styles.input}
										placeholder="Enter student ID"
										value={studentId}
										onChangeText={setStudentId}
									/>
								</View>
								<View style={styles.field}>
									<Text style={styles.label}>Student ID Card Image *</Text>
									<TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
										<Text style={styles.imagePickerText}>{idCardImage ? 'Change ID Image' : 'Upload ID Image'}</Text>
									</TouchableOpacity>
									{idCardImage && <Text style={styles.imageUploadedText}>Image selected</Text>}
								</View>
								
								<View style={styles.wizardNav}>
									<AnimatedButton style={{ flex: 1 }} onPress={() => setStep(3)}>
										<LinearGradient colors={['#FFB75E', '#ED8F03']} style={styles.nextButton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
											<Text style={styles.buttonText}>Next →</Text>
										</LinearGradient>
									</AnimatedButton>
									<TouchableOpacity style={styles.prevButton} onPress={() => setStep(1)}>
										<Text style={styles.prevButtonText}>← Back</Text>
									</TouchableOpacity>
								</View>
								</>)}

								{/* Step 3: Preferences & Guardian */}
								{step === 3 && (<>
								<View style={styles.field}>
									<Text style={styles.label}>Guardian Name *</Text>
									<TextInput
										style={styles.input}
										placeholder="Enter guardian's full name"
										value={guardianName}
										onChangeText={setGuardianName}
									/>
								</View>
								<View style={styles.field}>
									<Text style={styles.label}>Guardian Mobile *</Text>
									<TextInput
										style={styles.input}
										placeholder="Enter guardian's mobile"
										value={guardianMobile}
										onChangeText={setGuardianMobile}
										keyboardType="phone-pad"
									/>
								</View>
								<View style={styles.field}>
									<Text style={styles.label}>Guardian Relationship *</Text>
									<TextInput
										style={styles.input}
										placeholder="e.g., Parent, Sibling"
										value={guardianRelation}
										onChangeText={setGuardianRelation}
									/>
								</View>
								<View style={styles.field}>
									<Text style={styles.label}>Preferred Location *</Text>
									<TextInput
										style={styles.input}
										placeholder="Enter preferred location"
										value={location}
										onChangeText={setLocation}
									/>
								</View>
								<View style={styles.rowContainer}>
									<View style={styles.halfInput}>
										<Text style={styles.label}>Min Budget (Rs) *</Text>
										<TextInput
											style={styles.input}
											placeholder="e.g., 5000"
											value={minBudget}
											onChangeText={setMinBudget}
											keyboardType="numeric"
										/>
									</View>
									<View style={styles.halfInput}>
										<Text style={styles.label}>Max Budget (Rs) *</Text>
										<TextInput
											style={styles.input}
											placeholder="e.g., 15000"
											value={maxBudget}
											onChangeText={setMaxBudget}
											keyboardType="numeric"
										/>
									</View>
								</View>
								<View style={styles.field}>
									<Text style={styles.label}>Gender-based Boarding *</Text>
									<SelectPicker
										selectedValue={genderPreference}
										onValueChange={setGenderPreference}
										items={[
											{ label: 'Any', value: 'any' },
											{ label: 'Male Only', value: 'male_only' },
											{ label: 'Female Only', value: 'female_only' },
										]}
										style={styles.picker}
										containerStyle={styles.pickerContainer}
									/>
								</View>
								<View style={styles.field}>
									<Text style={styles.label}>Max Distance to University (km) *</Text>
									<TextInput
										style={styles.input}
										placeholder="e.g., 5"
										value={maxDistance}
										onChangeText={setMaxDistance}
										keyboardType="numeric"
									/>
								</View>
								<View style={styles.field}>
									<Text style={styles.label}>Accommodation Type *</Text>
									<SelectPicker
										selectedValue={accommodation}
										onValueChange={setAccommodation}
										items={[
											{ label: 'Room', value: 'room' },
											{ label: 'Boarding', value: 'boarding' },
											{ label: 'Apartment', value: 'apartment' },
										]}
										style={styles.picker}
										containerStyle={styles.pickerContainer}
									/>
								</View>
								<TouchableOpacity style={styles.checkbox} onPress={() => setTermsAccepted(!termsAccepted)}>
									<Text style={termsAccepted ? styles.checkboxChecked : styles.checkboxUnchecked}>
										{termsAccepted ? '☑' : '☐'}
									</Text>
									<Text style={styles.checkboxText}> I accept the Terms & Conditions *</Text>
								</TouchableOpacity>
								<View style={styles.wizardNav}>
									<AnimatedButton style={{ flex: 1 }} onPress={handleRegister} disabled={loading}>
										<LinearGradient colors={['#FFB75E', '#ED8F03']} style={[styles.button, loading && styles.buttonDisabled]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
											<Text style={styles.buttonText}>{loading ? 'Registering...' : 'Complete Registration'}</Text>
										</LinearGradient>
									</AnimatedButton>
									<TouchableOpacity style={styles.prevButton} onPress={() => setStep(2)}>
										<Text style={styles.prevButtonText}>← Back</Text>
									</TouchableOpacity>
								</View>
								</>)}
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
	button: {
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 12,
		paddingVertical: 15,
		shadowColor: '#ED8F03',
		shadowOpacity: 0.3,
		shadowOffset: { width: 0, height: 4 },
		shadowRadius: 8,
		elevation: 6,
		flex: 1,
	},
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
		paddingTop: 13,
		paddingBottom: 14,
		paddingHorizontal: 16,
		fontSize: 13,
		color: "#36454F",
	},
	pickerContainer: {
		backgroundColor: "#F5F5F5",
		borderColor: "#D3D3D3",
		borderRadius: 8,
		borderWidth: 1,
		height: 50,
		justifyContent: 'center',
	},
	picker: { height: 50, width: '100%', color: "#36454F" },
	checkbox: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 26, marginBottom: 20 },
	checkboxChecked: { fontSize: 18, color: '#FFA500' },
	checkboxUnchecked: { fontSize: 18, color: '#D3D3D3' },
	checkboxText: { fontSize: 13, color: '#36454F' },
	buttonDisabled: {
		opacity: 0.6,
		backgroundColor: "#CCCCCC",
	},
	buttonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "bold" },
	imagePickerButton: {
		backgroundColor: "#F5F5F5",
		borderColor: "#D3D3D3",
		borderRadius: 8,
		borderWidth: 1,
		paddingVertical: 12,
		alignItems: "center",
		marginTop: 5,
	},
	imagePickerText: { color: "#36454F", fontSize: 13 },
	imageUploadedText: { color: "green", fontSize: 12, marginTop: 5, alignSelf: 'center' },
	view2: { paddingTop: 15, paddingBottom: 16 },
	text2: { color: "#FFA500", fontSize: 20, fontWeight: "bold" },
	stepText: { color: "#757575", fontSize: 14, marginTop: 4 },
	progressBarContainer: {
		height: 6,
		backgroundColor: '#E0E0E0',
		borderRadius: 3,
		marginHorizontal: 26,
		marginBottom: 10,
	},
	progressBarFilled: {
		height: '100%',
		backgroundColor: '#FFA500',
		borderRadius: 3,
	},
	wizardNav: {
		paddingHorizontal: 26,
		marginBottom: 10,
		flexDirection: 'row',
		gap: 10,
	},
	nextButton: {
		flex: 1,
		alignItems: "center",
		justifyContent: 'center',
		borderRadius: 12,
		paddingVertical: 15,
		shadowColor: '#ED8F03',
		shadowOpacity: 0.3,
		shadowOffset: { width: 0, height: 4 },
		shadowRadius: 8,
		elevation: 6,
	},
	prevButton: {
		alignItems: "center",
		backgroundColor: "#FFFFFF",
		borderColor: "#D3D3D3",
		borderWidth: 1,
		borderRadius: 8,
		paddingVertical: 12,
	},
	prevButtonText: { color: "#36454F", fontSize: 14, fontWeight: "bold" },
	rowContainer: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 26, marginBottom: 19 },
	halfInput: { flex: 1, marginHorizontal: 5 },
	backText: { color: "#FFA500", fontSize: 13, textDecorationLine: 'underline' },
});

export default StudentRegistration;