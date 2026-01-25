import React from "react";
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from "react-native";

const RoleSelection = ({ navigation }) => {
	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.content}>
				<Text style={styles.title}>Choose Registration Type</Text>
				<TouchableOpacity style={styles.button} onPress={() => navigation.navigate('StudentRegistration')}>
					<Text style={styles.buttonText}>Student Registration</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.button} onPress={() => navigation.navigate('LandlordRegistration')}>
					<Text style={styles.buttonText}>Landlord Registration</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#FFFFFF",
	},
	content: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#FFA500',
		marginBottom: 40,
	},
	button: {
		backgroundColor: '#FFA500',
		paddingVertical: 15,
		paddingHorizontal: 30,
		borderRadius: 8,
		marginVertical: 10,
		width: '80%',
		alignItems: 'center',
	},
	buttonText: {
		color: '#FFFFFF',
		fontSize: 16,
		fontWeight: 'bold',
	},
});

export default RoleSelection;