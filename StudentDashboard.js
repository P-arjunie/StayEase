import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, getUserProfile } from "./config/firebase";

const StudentDashboard = ({ navigation }) => {
	const [userProfile, setUserProfile] = useState(null);

	useEffect(() => {
		const fetchProfile = async () => {
			if (auth.currentUser) {
				const profile = await getUserProfile(auth.currentUser.uid);
				setUserProfile(profile);
			}
		};
		fetchProfile();
	}, []);
	return (
		<SafeAreaView style={styles.container}>
			<ScrollView style={styles.scrollView}>
				<View style={styles.column}>
					<View style={styles.view}>
						<Text style={styles.text}>
							{userProfile ? `Welcome, ${userProfile.fullName.split(' ')[0]}` : "Student Dashboard"}
						</Text>
					</View>
					<View style={styles.view2}>
						<Text style={styles.text2}>
							{"Find your perfect accommodation"}
						</Text>
					</View>
				</View>

				{userProfile?.guardianOverridden && (
					<View style={styles.guardianAlert}>
						<Text style={styles.guardianAlertIcon}>🛡️</Text>
						<View style={styles.guardianAlertTextContainer}>
							<Text style={styles.guardianAlertTitle}>Guardian Linked & Active</Text>
							<Text style={styles.guardianAlertText}>
								Your guardian has locked your search rules for safety. Properties violating these rules are hidden.
							</Text>
						</View>
					</View>
				)}

				<View style={styles.column2}>
					<View style={styles.row}>
						<View style={styles.column3}>
							<View style={styles.view3}>
								<Text style={styles.text3}>
									{"12"}
								</Text>
							</View>
							<View style={styles.view4}>
								<Text style={styles.text4}>
									{"Saved Properties"}
								</Text>
							</View>
						</View>
						<View style={styles.column4}>
							<View style={styles.view3}>
								<Text style={styles.text3}>
									{"5"}
								</Text>
							</View>
							<View style={styles.view4}>
								<Text style={styles.text4}>
									{"Pending Visits"}
								</Text>
							</View>
						</View>
					</View>
					<View style={styles.row2}>
						<View style={styles.column3}>
							<View style={styles.view3}>
								<Text style={styles.text3}>
									{"2"}
								</Text>
							</View>
							<View style={styles.view4}>
								<Text style={styles.text4}>
									{"Applications"}
								</Text>
							</View>
						</View>
						<View style={styles.column4}>
							<View style={styles.view3}>
								<Text style={styles.text3}>
									{"1"}
								</Text>
							</View>
							<View style={styles.view4}>
								<Text style={styles.text4}>
									{"Messages"}
								</Text>
							</View>
						</View>
					</View>
				</View>



				<TouchableOpacity style={styles.buttonLogout} onPress={() => navigation.navigate('Login')}>
					<Text style={styles.text6}>
						{"Logout"}
					</Text>
				</TouchableOpacity>
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#FFFFFF",
	},
	button: {
		alignItems: "center",
		backgroundColor: "#FFA500",
		borderRadius: 8,
		paddingVertical: 14,
		marginBottom: 12,
		marginHorizontal: 20,
	},
	buttonLogout: {
		alignItems: "center",
		backgroundColor: "#E74C3C",
		borderRadius: 8,
		paddingVertical: 12,
		marginBottom: 20,
		marginHorizontal: 20,
		marginTop: 10,
	},
	column: {
		backgroundColor: "#FFFFFF",
		borderRadius: 12,
		padding: 20,
		marginBottom: 17,
		marginHorizontal: 20,
	},
	column2: {
		marginBottom: 36,
		marginHorizontal: 20,
	},
	guardianAlert: {
		flexDirection: 'row',
		backgroundColor: '#E8F5E9',
		borderColor: '#2E7D32',
		borderWidth: 1,
		borderRadius: 12,
		padding: 15,
		marginHorizontal: 20,
		marginBottom: 20,
		alignItems: 'center',
	},
	guardianAlertIcon: {
		fontSize: 24,
		marginRight: 10,
	},
	guardianAlertTextContainer: {
		flex: 1,
	},
	guardianAlertTitle: {
		fontSize: 14,
		fontWeight: 'bold',
		color: '#2E7D32',
		marginBottom: 2,
	},
	guardianAlertText: {
		fontSize: 12,
		color: '#1B5E20',
		lineHeight: 16,
	},
	column3: {
		flex: 1,
		backgroundColor: "#FFFFFF",
		borderRadius: 12,
		padding: 20,
		marginRight: 15,
		shadowColor: "#0000000D",
		shadowOpacity: 0.1,
		shadowOffset: {
		    width: 0,
		    height: 2
		},
		shadowRadius: 8,
		elevation: 8,
	},
	column4: {
		flex: 1,
		backgroundColor: "#FFFFFF",
		borderRadius: 12,
		padding: 20,
		shadowColor: "#0000000D",
		shadowOpacity: 0.1,
		shadowOffset: {
		    width: 0,
		    height: 2
		},
		shadowRadius: 8,
		elevation: 8,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 11,
	},
	row2: {
		flexDirection: "row",
		alignItems: "center",
	},
	scrollView: {
		flex: 1,
		backgroundColor: "#F5F5F5",
		paddingTop: 20,
	},
	text: {
		color: "#36454F",
		fontSize: 20,
		fontWeight: "bold",
	},
	text2: {
		color: "#36454F",
		fontSize: 14,
	},
	text3: {
		color: "#FFA500",
		fontSize: 28,
		fontWeight: "bold",
	},
	text4: {
		color: "#36454F",
		fontSize: 12,
	},
	text5: {
		color: "#FFFFFF",
		fontSize: 14,
		fontWeight: "bold",
	},
	text6: {
		color: "#FFFFFF",
		fontSize: 13,
		fontWeight: "bold",
	},
	view: {
		paddingBottom: 1,
		marginBottom: 5,
	},
	view2: {
		paddingBottom: 1,
	},
	view3: {
		alignItems: "center",
		paddingBottom: 1,
		marginBottom: 5,
	},
	view4: {
		alignItems: "center",
	},
});

export default StudentDashboard;
