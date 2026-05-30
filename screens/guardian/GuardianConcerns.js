/**
 * @file GuardianConcerns.js
 * @description Renders the GuardianConcerns screen for the guardian role.
 * 
 * @module screens/guardian/GuardianConcerns
 */

import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from "../../config/firebase";

/**
 * Main Component: GuardianConcerns
 * @param {object} props - Component props
 * @param {object} props.navigation - React Navigation object
 */
const GuardianConcerns = ({ navigation, route }) => {
	const { studentId, studentName } = route.params || {};
	
	const [concerns, setConcerns] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadConcerns();
	}, [studentId]);

	const loadConcerns = async () => {
		if (!studentId) return;
		try {
			setLoading(true);
			const q = query(collection(db, 'concerns'), where('studentId', '==', studentId));
			const snapshot = await getDocs(q);
			
			const concernsList = [];
			snapshot.forEach(doc => {
				concernsList.push({ id: doc.id, ...doc.data() });
			});
			concernsList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
			setConcerns(concernsList);
		} catch (error) {
			console.error("Error loading concerns:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
					<Text style={styles.backButtonText}>← Back</Text>
				</TouchableOpacity>
				<View>
					<Text style={styles.headerTitle}>Reported Concerns</Text>
					<Text style={styles.headerSubtitle}>{studentName}</Text>
				</View>
			</View>

			<ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
				{loading ? (
					<View style={styles.centerContainer}>
						<ActivityIndicator size="large" color="#2E7D32" />
					</View>
				) : concerns.length === 0 ? (
					<Text style={styles.emptyText}>No concerns reported.</Text>
				) : (
					concerns.map(concern => (
						<View key={concern.id} style={styles.card}>
							<View style={styles.cardHeader}>
								<Text style={styles.concernType}>
									{concern.type === 'maintenance' ? '🔧 Maintenance' : concern.type === 'safety' ? '🛡️ Safety' : '📝 Other'}
								</Text>
								<View style={[
									styles.statusBadge, 
									concern.status === 'resolved' ? styles.statusResolved : 
									concern.status === 'in-progress' ? styles.statusProgress : 
									styles.statusPending
								]}>
									<Text style={styles.statusText}>{concern.status.toUpperCase()}</Text>
								</View>
							</View>
							
							<Text style={styles.title}>{concern.title}</Text>
							<Text style={styles.description}>{concern.description}</Text>
							<Text style={styles.date}>Reported: {new Date(concern.createdAt).toLocaleDateString()}</Text>
						</View>
					))
				)}
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#F8F9FA' },
	header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#FFFFFF' },
	backButton: { paddingRight: 15 },
	backButtonText: { color: '#E74C3C', fontSize: 16, fontWeight: 'bold' },
	headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#36454F' },
	headerSubtitle: { fontSize: 12, color: '#757575' },
	scrollView: { flex: 1, padding: 20 },
	centerContainer: { paddingVertical: 40 },
	emptyText: { color: '#757575', fontStyle: 'italic', textAlign: 'center', marginTop: 40 },
	card: {
		backgroundColor: '#FFFFFF',
		padding: 16,
		borderRadius: 12,
		marginBottom: 15,
		borderLeftWidth: 4,
		borderLeftColor: '#E74C3C',
		shadowColor: '#000',
		shadowOpacity: 0.05,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 8,
		elevation: 2,
	},
	cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
	concernType: { fontSize: 14, fontWeight: 'bold', color: '#36454F' },
	statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
	statusResolved: { backgroundColor: '#E8F5E9' },
	statusProgress: { backgroundColor: '#E3F2FD' },
	statusPending: { backgroundColor: '#FFF3E0' },
	statusText: { fontSize: 10, fontWeight: 'bold', color: '#36454F' },
	title: { fontSize: 18, fontWeight: 'bold', color: '#E74C3C', marginBottom: 8 },
	description: { fontSize: 14, color: '#555', marginBottom: 12, lineHeight: 20 },
	date: { fontSize: 12, color: '#999' },
});

export default GuardianConcerns;
