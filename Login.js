import React, { useState } from "react";
import { View, ScrollView, Text, TouchableOpacity, StyleSheet, TextInput } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { loginWithEmail } from './config/firebase';

const Login = ({ navigation }) => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const handleSignIn = async () => {
		try {
			const user = await loginWithEmail(email, password);
			alert('Signed in: ' + (user.email || user.uid));
			navigation.navigate('RoleSelection');
		} catch (err) {
			console.error(err);
			alert('Sign-in failed: ' + (err.message || err));
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView  style={styles.scrollView}>
				<View style={styles.column}>
					<View style={styles.view2}>
						<Text style={styles.text2}>
							{"StayEase"}
						</Text>
					</View>
					<View style={styles.column2}>
						<View style={styles.row}>
							<View style={styles.view3}>
								<Text style={styles.text3}>
									{"Student"}
								</Text>
							</View>
							<View style={styles.view3}>
								<Text style={styles.text4}>
									{"Landlord"}
								</Text>
							</View>
						</View>
						<View style={styles.column3}>
							<View style={styles.column4}>
								<View style={styles.view4}>
									<Text style={styles.text5}>
										{"Email Address"}
									</Text>
								</View>
								<View style={styles.view5}>
									<TextInput
										style={styles.input}
										placeholder="your.email@example.com"
										value={email}
										onChangeText={setEmail}
										keyboardType="email-address"
										autoCapitalize="none"
									/>
								</View>
							</View>
							<View style={styles.column5}>
								<View style={styles.view4}>
									<Text style={styles.text5}>
										{"Phone Number"}
									</Text>
								</View>
								<View style={styles.view5}>
									<Text style={styles.text7}>
										{"+94 XX XXX XXXX"}
									</Text>
								</View>
							</View>
							<View style={styles.column4}>
								<View style={styles.view4}>
									<Text style={styles.text5}>
										{"Password"}
									</Text>
								</View>
								<View style={styles.view5}>
									<TextInput
										style={styles.input}
										placeholder="Enter your password"
										value={password}
										onChangeText={setPassword}
										secureTextEntry
									/>
								</View>
							</View>
							<View style={styles.view6}>
								<View style={styles.view7}>
									<Text style={styles.text8}>
										{"Forgot Password?"}
									</Text>
								</View>
							</View>
							<TouchableOpacity style={styles.button} onPress={handleSignIn}>
								<Text style={styles.text9}>
									{"Sign In"}
								</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.button2} onPress={()=>alert('Pressed!')}>
								<Text style={styles.text10}>
									{"Verify via OTP"}
								</Text>
							</TouchableOpacity>
						</View>
						<View style={styles.row2}>
							<Text style={styles.text11}>
								{"Don't have an account? "}
							</Text>
							<TouchableOpacity style={styles.view8} onPress={() => navigation.navigate('RoleSelection')}>
								<Text style={styles.text8}>
									{"Sign Up"}
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#FFFFFF",
	},
	button: {
		alignItems: "center",
		backgroundColor: "#FFA500",
		borderRadius: 8,
		paddingVertical: 12,
		marginBottom: 9,
		marginHorizontal: 26,
	},
	button2: {
		alignItems: "center",
		borderColor: "#FFA500",
		borderRadius: 8,
		borderWidth: 2,
		paddingVertical: 14,
		marginHorizontal: 26,
	},
	column: {
		backgroundColor: "#F5F5F5",
		padding: 20,
	},
	column2: {
		alignItems: "center",
		paddingVertical: 39,
	},
	column3: {
		alignSelf: "stretch",
		backgroundColor: "#FFFFFF",
		borderColor: "#D3D3D3",
		borderRadius: 12,
		borderWidth: 1,
		paddingVertical: 26,
		marginBottom: 20,
	},
	column4: {
		marginBottom: 19,
		marginHorizontal: 26,
	},
	column5: {
		marginBottom: 18,
		marginHorizontal: 26,
	},
	row: {
		alignSelf: "stretch",
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 30,
	},
	row2: {
		flexDirection: "row",
		alignItems: "center",
	},
	scrollView: {
		flex: 1,
		backgroundColor: "#F5F5F5",
		borderRadius: 20,
		shadowColor: "#0000001A",
		shadowOpacity: 0.1,
		shadowOffset: {
		    width: 0,
		    height: 10
		},
		shadowRadius: 30,
		elevation: 30,
	},
	text2: {
		color: "#FFA500",
		fontSize: 24,
		fontWeight: "bold",
	},
	text3: {
		color: "#FFA500",
		fontSize: 16,
		fontWeight: "bold",
	},
	text4: {
		color: "#36454F",
		fontSize: 16,
		fontWeight: "bold",
	},
	text5: {
		color: "#36454F",
		fontSize: 14,
		fontWeight: "bold",
	},
	text6: {
		color: "#D3D3D3",
		fontSize: 13,
	},
	text7: {
		color: "#D3D3D3",
		fontSize: 14,
	},
	text8: {
		color: "#FFA500",
		fontSize: 13,
	},
	text9: {
		color: "#FFFFFF",
		fontSize: 14,
		fontWeight: "bold",
	},
	text10: {
		color: "#FFA500",
		fontSize: 13,
		fontWeight: "bold",
	},
	text11: {
		color: "#36454F",
		fontSize: 14,
		marginRight: 6,
	},
	view2: {
		paddingTop: 15,
		paddingBottom: 16,
	},
	view3: {
		flex: 1,
		alignItems: "center",
		paddingVertical: 13,
	},
	view4: {
		paddingBottom: 1,
		marginBottom: 8,
	},
	view5: {
		backgroundColor: "#F5F5F5",
		borderColor: "#D3D3D3",
		borderRadius: 8,
		borderWidth: 1,
		paddingTop: 13,
		paddingBottom: 14,
		paddingHorizontal: 16,
	},
	view6: {
		alignItems: "flex-end",
		marginBottom: 9,
	},
	view7: {
		paddingBottom: 1,
		marginRight: 29,
	},
	view8: {
		paddingBottom: 1,
	},
});

export default Login;