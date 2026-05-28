import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAuth } from "firebase/auth";

const GuardianDashboard = ({ navigation }) => {
	const [loading, setLoading] = useState(false);
	const auth = getAuth();

	const handleLogout = async () => {
		try {
			await auth.signOut();
			navigation.navigate('Login');
		} catch (error) {
			console.error('Logout error:', error);
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<View style={styles.headerContent}>
					<Text style={styles.headerTitle}>🛡️ Guardian Portal</Text>
					<Text style={styles.headerSubtitle}>Monitor student activity</Text>
				</View>
				<TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
					<Text style={styles.logoutText}>Logout</Text>
				</TouchableOpacity>
			</View>

			<ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
				<Text style={styles.welcome}>Welcome to the Guardian Dashboard!</Text>
				<Text style={styles.subText}>This screen will be populated with student tracking soon.</Text>
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#F8F9FA' },
	header: {
		backgroundColor: '#2E7D32',
		paddingHorizontal: 20,
		paddingVertical: 16,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	headerContent: { flex: 1 },
	headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
	headerSubtitle: { fontSize: 13, color: '#E8F5E9' },
	logoutButton: { backgroundColor: '#FFFFFF', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6 },
	logoutText: { color: '#2E7D32', fontSize: 12, fontWeight: 'bold' },
	scrollView: { flex: 1, padding: 20 },
	welcome: { fontSize: 20, fontWeight: 'bold', color: '#36454F', marginTop: 20 },
	subText: { fontSize: 14, color: '#757575', marginTop: 10 },
});

export default GuardianDashboard;
