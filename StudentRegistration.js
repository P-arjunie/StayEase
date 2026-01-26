import React, { useState } from "react";
import { View, ScrollView, Text, TouchableOpacity, TextInput, StyleSheet } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { registerWithEmail, createUserProfile } from './config/firebase';
import SelectPicker from './components/SelectPicker';

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
	const [budget, setBudget] = useState('');
	const [accommodation, setAccommodation] = useState('room');
	const [termsAccepted, setTermsAccepted] = useState(false);

	const handleRegister = async () => {
		if (!fullName || !email || !mobile || !password || !confirmPassword) {
			alert('Please fill all required fields');
			return;
		}
		if (password !== confirmPassword) {
			alert('Passwords do not match');
			return;
		}
		if (!termsAccepted) {
			alert('Please accept terms and conditions');
			return;
		}

		try {
			const user = await registerWithEmail(email, password);
			const profile = {
				role: 'student',
				fullName,
				email,
				mobile,
				university,
				faculty,
				studentId,
				preferredLocation: location,
				budgetRange: budget,
				accommodationType: accommodation,
				createdAt: new Date().toISOString(),
			};
			await createUserProfile(user.uid, profile);
			alert('Student registration successful');
			navigation.navigate('Login');
		} catch (err) {
			console.error('Student registration error', err.code, err.message, err);
			alert('Registration failed: ' + (err.code ? err.code + ' - ' : '') + (err.message || err));
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView style={styles.scrollView}>
				<View style={styles.column}>
					<View style={styles.view2}>
						<Text style={styles.text2}>{"StayEase - Student Registration"}</Text>
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
									style={styles.input}
									placeholder="Enter your password"
									value={password}
									onChangeText={setPassword}
									secureTextEntry
								/>
							</View>
							{/* Confirm Password */}
							<View style={styles.field}>
								<Text style={styles.label}>Confirm Password *</Text>
								<TextInput
									style={styles.input}
									placeholder="Confirm your password"
									value={confirmPassword}
									onChangeText={setConfirmPassword}
									secureTextEntry
								/>
							</View>
							{/* University */}
							<View style={styles.field}>
								<Text style={styles.label}>University Name *</Text>
								<TextInput
									style={styles.input}
									placeholder="Enter university name"
									value={university}
									onChangeText={setUniversity}
								/>
							</View>
							{/* Faculty */}
							<View style={styles.field}>
								<Text style={styles.label}>Faculty / Department</Text>
								<TextInput
									style={styles.input}
									placeholder="Enter faculty/department (optional)"
									value={faculty}
									onChangeText={setFaculty}
								/>
							</View>
							{/* Student ID */}
							<View style={styles.field}>
								<Text style={styles.label}>Student ID Number</Text>
								<TextInput
									style={styles.input}
									placeholder="Enter student ID (optional)"
									value={studentId}
									onChangeText={setStudentId}
								/>
							</View>
							{/* Preferred Location */}
							<View style={styles.field}>
								<Text style={styles.label}>Preferred Location *</Text>
								<TextInput
									style={styles.input}
									placeholder="Enter preferred location"
									value={location}
									onChangeText={setLocation}
								/>
							</View>
							{/* Budget Range */}
							<View style={styles.field}>
								<Text style={styles.label}>Budget Range *</Text>
								<TextInput
									style={styles.input}
									placeholder="e.g., 5000-10000 LKR"
									value={budget}
									onChangeText={setBudget}
									keyboardType="numeric"
								/>
							</View>
							{/* Accommodation Type */}
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
							{/* Terms */}
							<TouchableOpacity style={styles.checkbox} onPress={() => setTermsAccepted(!termsAccepted)}>
								<Text style={termsAccepted ? styles.checkboxChecked : styles.checkboxUnchecked}>
									{termsAccepted ? '☑' : '☐'}
								</Text>
								<Text style={styles.checkboxText}> I accept the Terms & Conditions *</Text>
							</TouchableOpacity>
							{/* Register Button */}
							<TouchableOpacity style={styles.button} onPress={handleRegister}>
								<Text style={styles.buttonText}>Register as Student</Text>
							</TouchableOpacity>
						</View>
						<TouchableOpacity onPress={() => navigation.goBack()}>
							<Text style={styles.backText}>Back to Login</Text>
						</TouchableOpacity>
					</View>
				</View>
			</ScrollView>
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
		overflow: 'hidden',
	},
	picker: { height: 50, width: '100%', color: "#36454F" },
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
	buttonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "bold" },
	view2: { paddingTop: 15, paddingBottom: 16 },
	text2: { color: "#FFA500", fontSize: 20, fontWeight: "bold" },
	backText: { color: "#FFA500", fontSize: 13, textDecorationLine: 'underline' },
});

export default StudentRegistration;