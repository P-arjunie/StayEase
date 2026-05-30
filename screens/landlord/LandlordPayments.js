/**
 * @file LandlordPayments.js
 * @description Renders the LandlordPayments screen for the landlord role.
 * 
 * @module screens/landlord/LandlordPayments
 */

import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image, RefreshControl } from "react-native";
import Toast from 'react-native-toast-message';
import { SafeAreaView } from "react-native-safe-area-context";
import { collection, query, where, getDocs, doc, updateDoc, limit, startAfter, orderBy } from 'firebase/firestore';
import { auth, db } from "../../config/firebase";

/**
 * Main Component: LandlordPayments
 * @param {object} props - Component props
 * @param {object} props.navigation - React Navigation object
 */
const LandlordPayments = ({ navigation }) => {
	const [payments, setPayments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const [lastVisible, setLastVisible] = useState(null);
	const [hasMore, setHasMore] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const PAGE_SIZE = 10;

	const currentUserId = auth.currentUser?.uid;

	useEffect(() => {
		loadPayments();
	}, []);

	const loadPayments = async (isRefresh = false) => {
		if (!currentUserId) return;
		try {
			if (!isRefresh) setLoading(true);
			const q = query(
				collection(db, 'payments'), 
				where('landlordId', '==', currentUserId),
				orderBy('createdAt', 'desc'),
				limit(PAGE_SIZE)
			);
			const snapshot = await getDocs(q);
			
			const paymentsList = [];
			snapshot.forEach(doc => {
				paymentsList.push({ id: doc.id, ...doc.data() });
			});
			
			if (snapshot.docs.length > 0) {
				setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
			}
			if (snapshot.docs.length < PAGE_SIZE) {
				setHasMore(false);
			}
			
			setPayments(paymentsList);
		} catch (error) {
			console.error("Error loading payments:", error);
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	};

	const onRefresh = () => {
		setRefreshing(true);
		setHasMore(true);
		setLastVisible(null);
		loadPayments(true);
	};

	const loadMorePayments = async () => {
		if (!currentUserId || !lastVisible || loadingMore || !hasMore) return;
		try {
			setLoadingMore(true);
			const q = query(
				collection(db, 'payments'), 
				where('landlordId', '==', currentUserId),
				orderBy('createdAt', 'desc'),
				startAfter(lastVisible),
				limit(PAGE_SIZE)
			);
			const snapshot = await getDocs(q);
			
			const paymentsList = [];
			snapshot.forEach(doc => {
				paymentsList.push({ id: doc.id, ...doc.data() });
			});
			
			if (snapshot.docs.length > 0) {
				setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
			}
			if (snapshot.docs.length < PAGE_SIZE) {
				setHasMore(false);
			}
			
			setPayments(prev => [...prev, ...paymentsList]);
		} catch (error) {
			console.error("Error loading more payments:", error);
		} finally {
			setLoadingMore(false);
		}
	};

	const handleVerify = async (paymentId) => {
		try {
			const reqRef = doc(db, 'payments', paymentId);
			await updateDoc(reqRef, { status: 'verified' });
			
			Toast.show({ type: 'success', text1: 'Success', text2: 'Payment verified successfully.' });
			loadPayments();
		} catch (error) {
			Alert.alert('Error', 'Failed to verify payment.');
			console.error(error);
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
					<Text style={styles.backButtonText}>← Back</Text>
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Tenant Payments</Text>
			</View>

			<ScrollView 
				style={styles.scrollView} 
				showsVerticalScrollIndicator={false}
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#FFA500"]} />}
			>
				{loading ? (
					<View style={styles.centerContainer}>
						<ActivityIndicator size="large" color="#FFA500" />
						<Text style={styles.loadingText}>Loading payments...</Text>
					</View>
				) : payments.length === 0 ? (
					<Text style={styles.emptyText}>No payments received yet.</Text>
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
									<Text style={styles.proofLabel}>Payment Proof:</Text>
									<Image 
										source={{ uri: payment.proofImage }} 
										style={styles.proofImage} 
										resizeMode="cover"
									/>
								</View>
							)}

							{payment.status === 'pending' && (
								<TouchableOpacity 
									style={styles.verifyButton} 
									onPress={() => handleVerify(payment.id)}
								>
									<Text style={styles.verifyButtonText}>✓ Verify Payment</Text>
								</TouchableOpacity>
							)}
						</View>
					))
				)}

				{!loading && hasMore && payments.length > 0 && (
					<TouchableOpacity 
						style={styles.loadMoreButton} 
						onPress={loadMorePayments}
						disabled={loadingMore}
					>
						{loadingMore ? (
							<ActivityIndicator size="small" color="#FFA500" />
						) : (
							<Text style={styles.loadMoreText}>Load More</Text>
						)}
					</TouchableOpacity>
				)}
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#F8F9FA' },
	header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#FFFFFF' },
	backButton: { paddingRight: 15 },
	backButtonText: { color: '#FFA500', fontSize: 16, fontWeight: 'bold' },
	headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#36454F' },
	scrollView: { flex: 1, padding: 20 },
	centerContainer: { paddingVertical: 40, alignItems: 'center' },
	loadingText: { marginTop: 10, color: '#757575' },
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
	},
	cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
	paymentType: { fontSize: 16, fontWeight: 'bold', color: '#36454F' },
	statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
	statusVerified: { backgroundColor: '#E8F5E9' },
	statusPending: { backgroundColor: '#FFF3E0' },
	statusText: { fontSize: 11, fontWeight: 'bold', color: '#36454F' },
	amount: { fontSize: 24, fontWeight: 'bold', color: '#FFA500', marginBottom: 4 },
	reference: { fontSize: 14, color: '#36454F', marginBottom: 4 },
	date: { fontSize: 12, color: '#757575', marginBottom: 12 },
	proofContainer: { marginTop: 10, marginBottom: 16 },
	proofLabel: { fontSize: 13, color: '#757575', marginBottom: 6 },
	proofImage: { width: '100%', height: 150, borderRadius: 8, backgroundColor: '#E0E0E0' },
	verifyButton: {
		backgroundColor: '#4CAF50',
		paddingVertical: 12,
		borderRadius: 8,
		alignItems: 'center',
	},
	verifyButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
	loadMoreButton: {
		paddingVertical: 14,
		alignItems: 'center',
		backgroundColor: '#FFFFFF',
		borderRadius: 8,
		borderWidth: 1,
		borderColor: '#FFA500',
		marginVertical: 20,
	},
	loadMoreText: {
		color: '#FFA500',
		fontSize: 14,
		fontWeight: 'bold',
	},
});

export default LandlordPayments;
