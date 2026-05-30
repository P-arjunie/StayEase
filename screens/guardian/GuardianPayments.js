/**
 * @file GuardianPayments.js
 * @description Renders the GuardianPayments screen for the guardian role.
 * 
 * @module screens/guardian/GuardianPayments
 */

import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from "../../config/firebase";

/**
 * Main Component: GuardianPayments
 * @param {object} props - Component props
 * @param {object} props.navigation - React Navigation object
 */
const GuardianPayments = ({ navigation, route }) => {
	const { studentId, studentName } = route.params || {};
	
	const [payments, setPayments] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadPayments();
	}, [studentId]);

	const loadPayments = async () => {
		if (!studentId) return;
		try {
			setLoading(true);
			const q = query(collection(db, 'payments'), where('studentId', '==', studentId));
			const snapshot = await getDocs(q);
			
			const paymentsList = [];
			snapshot.forEach(doc => {
				paymentsList.push({ id: doc.id, ...doc.data() });
			});
			paymentsList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
			setPayments(paymentsList);
		} catch (error) {
			console.error("Error loading payments:", error);
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
					<Text style={styles.headerTitle}>Payment History</Text>
					<Text style={styles.headerSubtitle}>{studentName}</Text>
				</View>
			</View>

			<ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
				{loading ? (
					<View style={styles.centerContainer}>
						<ActivityIndicator size="large" color="#2E7D32" />
					</View>
				) : payments.length === 0 ? (
					<Text style={styles.emptyText}>No payments submitted yet.</Text>
				) : (
					payments.map(payment => (
						<View key={payment.id} style={styles.card}>
							<View style={styles.cardHeader}>
								<Text style={styles.paymentType}>
									{payment.type === 'rent' ? '🏠 Rent' : payment.type === 'deposit' ? '💰 Deposit' : '⚡ Utility'}
								</Text>
								<View style={[styles.statusBadge, payment.status === 'verified' ? styles.statusVerified : styles.statusPending]}>
									<Text style={styles.statusText}>{payment.status.toUpperCase()}</Text>
								</View>
							</View>
							
							<Text style={styles.amount}>Rs {payment.amount?.toLocaleString()}</Text>
							<Text style={styles.reference}>Ref: {payment.reference}</Text>
							<Text style={styles.date}>Submitted: {new Date(payment.createdAt).toLocaleDateString()}</Text>

							{payment.proofImage && (
								<View style={styles.proofContainer}>
									<Text style={styles.proofLabel}>Proof Image:</Text>
									<Image 
										source={{ uri: payment.proofImage }} 
										style={styles.proofImage} 
										resizeMode="cover"
									/>
								</View>
							)}
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
	backButtonText: { color: '#2E7D32', fontSize: 16, fontWeight: 'bold' },
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
		shadowColor: '#000',
		shadowOpacity: 0.05,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 8,
		elevation: 2,
		borderLeftWidth: 4,
		borderLeftColor: '#2E7D32'
	},
	cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
	paymentType: { fontSize: 16, fontWeight: 'bold', color: '#36454F' },
	statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
	statusVerified: { backgroundColor: '#E8F5E9' },
	statusPending: { backgroundColor: '#FFF3E0' },
	statusText: { fontSize: 11, fontWeight: 'bold', color: '#36454F' },
	amount: { fontSize: 24, fontWeight: 'bold', color: '#2E7D32', marginBottom: 4 },
	reference: { fontSize: 14, color: '#36454F', marginBottom: 4 },
	date: { fontSize: 12, color: '#757575', marginBottom: 12 },
	proofContainer: { marginTop: 10 },
	proofLabel: { fontSize: 13, color: '#757575', marginBottom: 6 },
	proofImage: { width: '100%', height: 150, borderRadius: 8, backgroundColor: '#E0E0E0' },
});

export default GuardianPayments;
