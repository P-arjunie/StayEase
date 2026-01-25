import React, { useState } from "react";
import { SafeAreaView, View, ScrollView, Text, TouchableOpacity, TextInput, StyleSheet } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { registerWithEmail, createUserProfile } from './config/firebase';

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
	const [termsAccepted, setTermsAccepted] = useState(false);

	const pickImage = async () => {
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [4, 3],
			quality: 1,
		});
		if (!result.canceled) {
			setProofUri(result.assets[0].uri);
		}
	};

	const handleRegister = async () => {
		if (!fullName || !email || !mobile || !password || !confirmPassword || !nic || !address || !propertyLocation) {
			alert('Please fill all required fields');
			return;
		}
		if (password !== confirmPassword) {
			alert('Passwords do not match');
			return;
		}
		if (!proofUri) {
			alert('Please upload property ownership proof');
			return;
		}
		if (!termsAccepted) {
			alert('Please accept terms and conditions');
			return;
		}

		try {
			const user = await registerWithEmail(email, password);
			const profile = {
				role: 'landlord',
				fullName,
				email,
				mobile,
				nic,
				address,
				propertyLocation,
				proofUri,
				createdAt: new Date().toISOString(),
			};
			await createUserProfile(user.uid, profile);
			alert('Landlord registration successful');
			navigation.navigate('Login');
		} catch (err) {
			console.error(err);
			alert('Registration failed: ' + (err.message || err));
		}
	};

	return (
		<SafeAreaView style={styles.container}>
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
								<TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
									<Text style={styles.uploadText}>
										{proofUri ? 'Proof Uploaded' : 'Upload Proof Document'}
									</Text>
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
							<TouchableOpacity style={styles.button} onPress={handleRegister}>
								<Text style={styles.buttonText}>Register as Landlord</Text>
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
	uploadButton: {
		backgroundColor: "#F5F5F5",
		borderColor: "#D3D3D3",
		borderRadius: 8,
		borderWidth: 1,
		paddingVertical: 13,
		alignItems: 'center',
	},
	uploadText: { fontSize: 13, color: "#36454F" },
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

export default LandlordRegistration;