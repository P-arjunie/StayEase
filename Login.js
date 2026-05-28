import React, { useState } from "react";
import { View, ScrollView, Text, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { loginWithEmail, getUserProfile } from './config/firebase';
import { getAuth, signOut } from 'firebase/auth';
import { handleError } from './utils/errorHandler';

const auth = getAuth();

const Login = ({ navigation }) => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);

	const handleSignIn = async () => {
		try {
			setLoading(true);
			const user = await loginWithEmail(email, password);
			
			// Get user profile to determine role
			const profile = await getUserProfile(user.uid);
			
			if (profile && profile.role) {
				if (profile.status === 'Pending Verification' || profile.status === 'Pending Admin Approval') {
					Alert.alert('Account Pending', 'Your account is pending verification by the admin. Please wait for approval.');
					await signOut(auth); // ensure they don't stay logged in behind the scenes
					return;
				}

				if (profile.role === 'landlord') {
					navigation.navigate('LandlordDashboard');
				} else if (profile.role === 'student') {
					navigation.navigate('StudentDashboard');
				}
			} else {
				// Fallback to role selection if profile not found
				navigation.navigate('RoleSelection');
			}
		} catch (err) {
			const errorMsg = handleError(err, 'Login');
			Alert.alert('Sign In Failed', errorMsg);
		} finally {
			setLoading(false);
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
				<View style={styles.header}>
					<Text style={styles.logo}>🏠 StayEase</Text>
					<Text style={styles.subtitle}>Find Your Perfect Stay</Text>
				</View>

				<View style={styles.formContainer}>
					<View style={styles.inputGroup}>
						<Text style={styles.label}>📧 Email Address</Text>
						<TextInput
							style={styles.input}
							placeholder="your.email@example.com"
							value={email}
							onChangeText={setEmail}
							keyboardType="email-address"
							autoCapitalize="none"
							placeholderTextColor="#BDBDBD"
						/>
					</View>

					<View style={styles.inputGroup}>
						<Text style={styles.label}>🔒 Password</Text>
						<TextInput
							style={styles.input}
							placeholder="Enter your password"
							value={password}
							onChangeText={setPassword}
							secureTextEntry
							placeholderTextColor="#BDBDBD"
						/>
					</View>

					<TouchableOpacity>
						<Text style={styles.forgotPassword}>Forgot Password?</Text>
					</TouchableOpacity>

					<TouchableOpacity 
						style={[styles.button, loading && styles.buttonDisabled]} 
						onPress={handleSignIn} 
						disabled={loading}
						activeOpacity={0.8}
					>
						<Text style={styles.buttonText}>
							{loading ? "Signing In..." : "Sign In"}
						</Text>
					</TouchableOpacity>

					<View style={styles.divider}>
						<View style={styles.dividerLine}></View>
						<Text style={styles.dividerText}>or</Text>
						<View style={styles.dividerLine}></View>
					</View>

					<View style={styles.signupContainer}>
						<Text style={styles.signupText}>Don't have an account? </Text>
						<TouchableOpacity onPress={() => navigation.navigate('RoleSelection')}>
							<Text style={styles.signupLink}>Sign Up</Text>
						</TouchableOpacity>
					</View>

					<TouchableOpacity 
						style={styles.guardianLoginButton} 
						onPress={() => navigation.navigate('GuardianLogin')}
					>
						<Text style={styles.guardianLoginText}>🛡️ Guardian Login (OTP)</Text>
					</TouchableOpacity>
				</View>

				<View style={styles.footer}>
					<Text style={styles.footerText}>Secure login powered by Firebase</Text>
				</View>
			</ScrollView>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F8F9FA",
	},
	scrollView: {
		flex: 1,
		paddingHorizontal: 20,
	},
	header: {
		paddingVertical: 60,
		paddingHorizontal: 20,
		alignItems: 'center',
		justifyContent: 'center',
	},
	logo: {
		fontSize: 36,
		fontWeight: 'bold',
		color: '#FFA500',
		marginBottom: 8,
		letterSpacing: 1,
	},
	subtitle: {
		fontSize: 16,
		color: '#36454F',
		fontWeight: '500',
		letterSpacing: 0.5,
	},
	formContainer: {
		backgroundColor: '#FFFFFF',
		borderRadius: 16,
		padding: 24,
		marginBottom: 30,
		shadowColor: '#000',
		shadowOpacity: 0.08,
		shadowOffset: { width: 0, height: 4 },
		shadowRadius: 12,
		elevation: 8,
	},
	inputGroup: {
		marginBottom: 20,
	},
	label: {
		fontSize: 14,
		fontWeight: '600',
		color: '#36454F',
		marginBottom: 10,
		letterSpacing: 0.3,
	},
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
	forgotPassword: {
		fontSize: 13,
		color: '#FFA500',
		fontWeight: '600',
		marginBottom: 20,
		textAlign: 'right',
		textDecorationLine: 'underline',
	},
	button: {
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#FFA500',
		borderRadius: 12,
		paddingVertical: 15,
		marginBottom: 20,
		shadowColor: '#FFA500',
		shadowOpacity: 0.3,
		shadowOffset: { width: 0, height: 4 },
		shadowRadius: 8,
		elevation: 6,
	},
	buttonDisabled: {
		backgroundColor: '#CCCCCC',
		opacity: 0.7,
	},
	buttonText: {
		color: '#FFFFFF',
		fontSize: 15,
		fontWeight: '700',
		letterSpacing: 0.5,
	},
	divider: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 24,
	},
	dividerLine: {
		flex: 1,
		height: 1,
		backgroundColor: '#E0E0E0',
	},
	dividerText: {
		marginHorizontal: 12,
		color: '#999999',
		fontSize: 12,
		fontWeight: '500',
	},
	signupContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	signupText: {
		fontSize: 14,
		color: '#36454F',
	},
	signupLink: {
		fontSize: 14,
		color: '#FFA500',
		fontWeight: '700',
		textDecorationLine: 'underline',
	},
	guardianLoginButton: {
		marginTop: 24,
		paddingVertical: 12,
		backgroundColor: '#F1F8E9',
		borderRadius: 10,
		borderWidth: 1,
		borderColor: '#C5E1A5',
		alignItems: 'center',
	},
	guardianLoginText: {
		color: '#2E7D32',
		fontSize: 14,
		fontWeight: '700',
	},
	footer: {
		alignItems: 'center',
		paddingVertical: 20,
		paddingBottom: 40,
	},
	footerText: {
		fontSize: 12,
		color: '#999999',
		fontStyle: 'italic',
	},
});

export default Login;