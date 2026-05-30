/**
 * @file GuardianLogin.js
 * @description Renders the GuardianLogin screen for the auth role.
 * 
 * @module screens/auth/GuardianLogin
 */

import React, { useState } from "react";
import { View, ScrollView, Text, TouchableOpacity, StyleSheet, TextInput, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { handleError } from '../../utils/errorHandler';

/**
 * Main Component: GuardianLogin
 * @param {object} props - Component props
 * @param {object} props.navigation - React Navigation object
 */
const GuardianLogin = ({ navigation }) => {
	const [mobile, setMobile] = useState('');
	const [otp, setOtp] = useState('');
	const [step, setStep] = useState('phone'); // 'phone' or 'otp'
	const [loading, setLoading] = useState(false);

	const auth = getAuth();

	const handleSendOTP = () => {
		if (mobile.length < 9) {
			Alert.alert('Invalid Number', 'Please enter a valid mobile number.');
			return;
		}
		// Simulate sending OTP
		setLoading(true);
		setTimeout(() => {
			setLoading(false);
			setStep('otp');
			Alert.alert('OTP Sent', 'Use any 6-digit code for testing (e.g., 123456).');
		}, 1500);
	};

	const handleVerifyOTP = async () => {
		if (otp.length < 6) {
			Alert.alert('Invalid OTP', 'Please enter a 6-digit OTP.');
			return;
		}

		try {
			setLoading(true);
			// MOCK IMPLEMENTATION for Firebase Auth without native phone setup:
			// We map the phone number to a dummy email and standard password.
			const mockEmail = `guardian_${mobile.replace(/\D/g, '')}@stayease.local`;
			const mockPassword = `otp_${mobile.replace(/\D/g, '')}_stayease`;

			try {
				// Try logging in first
				const userCredential = await signInWithEmailAndPassword(auth, mockEmail, mockPassword);
				await checkGuardianProfile(userCredential.user.uid);
			} catch (error) {
				// If user not found, create them (simulating first time Guardian login)
				if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
					const userCredential = await createUserWithEmailAndPassword(auth, mockEmail, mockPassword);
					// Create profile
					await setDoc(doc(db, 'users', userCredential.user.uid), {
						role: 'guardian',
						mobile: mobile,
						status: 'active',
						createdAt: new Date().toISOString()
					});
					await checkGuardianProfile(userCredential.user.uid);
				} else {
					throw error;
				}
			}
		} catch (error) {
			const errorMsg = handleError(error, 'OTP Verification');
			Alert.alert('Verification Failed', errorMsg);
		} finally {
			setLoading(false);
		}
	};

	const checkGuardianProfile = async (uid) => {
		const docRef = doc(db, 'users', uid);
		const docSnap = await getDoc(docRef);
		
		if (docSnap.exists() && docSnap.data().role === 'guardian') {
			navigation.navigate('GuardianDashboard'); // We'll create this next
		} else {
			Alert.alert('Access Denied', 'This number is not registered as a Guardian.');
			auth.signOut();
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
				<View style={styles.header}>
					<TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
						<Text style={styles.backButtonText}>← Back to Main Login</Text>
					</TouchableOpacity>
					<Text style={styles.logo}>🛡️ Guardian Portal</Text>
					<Text style={styles.subtitle}>Monitor your student's boarding</Text>
				</View>

				<View style={styles.formContainer}>
					{step === 'phone' ? (
						<>
							<View style={styles.inputGroup}>
								<Text style={styles.label}>📱 Mobile Number</Text>
								<TextInput
									style={styles.input}
									placeholder="+94 7X XXX XXXX"
									value={mobile}
									onChangeText={setMobile}
									keyboardType="phone-pad"
								/>
							</View>
							
							<TouchableOpacity 
								style={[styles.button, loading && styles.buttonDisabled]} 
								onPress={handleSendOTP} 
								disabled={loading}
							>
								<Text style={styles.buttonText}>
									{loading ? "Sending OTP..." : "Send OTP"}
								</Text>
							</TouchableOpacity>
						</>
					) : (
						<>
							<Text style={styles.infoText}>Code sent to {mobile}</Text>
							
							<View style={styles.inputGroup}>
								<Text style={styles.label}>🔢 One-Time Password</Text>
								<TextInput
									style={styles.input}
									placeholder="Enter 6-digit OTP"
									value={otp}
									onChangeText={setOtp}
									keyboardType="number-pad"
									maxLength={6}
								/>
							</View>
							
							<TouchableOpacity 
								style={[styles.button, loading && styles.buttonDisabled]} 
								onPress={handleVerifyOTP} 
								disabled={loading}
							>
								<Text style={styles.buttonText}>
									{loading ? "Verifying..." : "Verify & Login"}
								</Text>
							</TouchableOpacity>
							
							<TouchableOpacity onPress={() => setStep('phone')} style={styles.resendButton}>
								<Text style={styles.resendText}>Change Number / Resend OTP</Text>
							</TouchableOpacity>
						</>
					)}
				</View>
			</ScrollView>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#F8F9FA" },
	scrollView: { flex: 1, paddingHorizontal: 20 },
	header: { paddingVertical: 40, alignItems: 'center' },
	backButton: { alignSelf: 'flex-start', marginBottom: 20 },
	backButtonText: { color: '#2E7D32', fontSize: 14, fontWeight: 'bold' },
	logo: { fontSize: 28, fontWeight: 'bold', color: '#2E7D32', marginBottom: 8 },
	subtitle: { fontSize: 14, color: '#36454F' },
	formContainer: {
		backgroundColor: '#FFFFFF',
		borderRadius: 16,
		padding: 24,
		shadowColor: '#000',
		shadowOpacity: 0.08,
		shadowOffset: { width: 0, height: 4 },
		shadowRadius: 12,
		elevation: 8,
	},
	inputGroup: { marginBottom: 20 },
	label: { fontSize: 14, fontWeight: '600', color: '#36454F', marginBottom: 10 },
	input: {
		backgroundColor: '#F5F7FA',
		borderColor: '#E0E0E0',
		borderRadius: 10,
		borderWidth: 1.5,
		paddingTop: 14,
		paddingBottom: 14,
		paddingHorizontal: 16,
		fontSize: 14,
		color: '#36454F',
		fontWeight: '500',
	},
	button: {
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#2E7D32',
		borderRadius: 12,
		paddingVertical: 15,
		marginTop: 10,
	},
	buttonDisabled: { opacity: 0.7 },
	buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
	infoText: { textAlign: 'center', color: '#757575', marginBottom: 20, fontSize: 14 },
	resendButton: { marginTop: 20, alignItems: 'center' },
	resendText: { color: '#2E7D32', fontSize: 13, textDecorationLine: 'underline' },
});

export default GuardianLogin;
