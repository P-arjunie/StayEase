import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, TouchableOpacity, TextInput, StyleSheet, Alert, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore';
import { auth, db } from "./config/firebase";
import SelectPicker from './components/SelectPicker';

const Payments = ({ navigation }) => {
	const [payments, setPayments] = useState([]);
	const [loading, setLoading] = useState(true);
	
	// Form states
	const [paymentType, setPaymentType] = useState('rent');
	const [amount, setAmount] = useState('');
	const [reference, setReference] = useState('');
	const [proofImage, setProofImage] = useState(null);
	const [submitting, setSubmitting] = useState(false);

	const currentUserId = auth.currentUser?.uid;

	useEffect(() => {
		loadPayments();
	}, []);

	const loadPayments = async () => {
		if (!currentUserId) return;
		try {
			setLoading(true);
			const q = query(
				collection(db, 'payments'),
				where('studentId', '==', currentUserId)
			);
			const snapshot = await getDocs(q);
			const paymentsList = [];
			snapshot.forEach(doc => {
				paymentsList.push({ id: doc.id, ...doc.data() });
			});
			// Sort by date descending
			paymentsList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
			setPayments(paymentsList);
		} catch (error) {
			console.error("Error loading payments:", error);
		} finally {
			setLoading(false);
		}
	};

	const pickImage = async () => {
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ['images'],
			allowsEditing: true,
			aspect: [3, 4],
			quality: 0.8,
		});

		if (!result.canceled) {
			setProofImage(result.assets[0].uri);
		}
	};

	const handleSubmitPayment = async () => {
		if (!amount || !reference || !proofImage) {
			Alert.alert('Missing Fields', 'Please fill all fields and upload a proof image.');
			return;
		}

		try {
			setSubmitting(true);
			
			// Find the student's approved booking to get landlordId and propertyId
			const bq = query(collection(db, 'bookings'), where('studentId', '==', currentUserId), where('status', '==', 'approved'));
			const bSnap = await getDocs(bq);
			let landlordId = 'unknown';
			let propertyId = 'unknown';
			
			if (!bSnap.empty) {
				const bookingData = bSnap.docs[0].data();
				landlordId = bookingData.landlordId;
				propertyId = bookingData.propertyId;
			}

			await addDoc(collection(db, 'payments'), {
				studentId: currentUserId,
				landlordId,
				propertyId,
				type: paymentType,
				amount: parseFloat(amount),
				reference: reference,
				proofImage: proofImage, // In a real app, upload this to Firebase Storage first
				status: 'pending',
				createdAt: new Date().toISOString()
			});
			
			Alert.alert('Success', 'Payment proof submitted successfully for verification.');
			setAmount('');
			setReference('');
			setProofImage(null);
			loadPayments();
		} catch (error) {
			Alert.alert('Error', 'Failed to submit payment.');
			console.error(error);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
				<View style={styles.header}>
					<TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
						<Text style={styles.backButtonText}>← Back</Text>
					</TouchableOpacity>
					<Text style={styles.headerTitle}>Payments</Text>
				</View>

				{/* Upload Payment Form */}
				<View style={styles.card}>
					<Text style={styles.cardTitle}>Submit Payment Proof</Text>
					
					<View style={styles.field}>
						<Text style={styles.label}>Payment Type</Text>
						<SelectPicker
							selectedValue={paymentType}
							onValueChange={setPaymentType}
							items={[
								{ label: 'Rent', value: 'rent' },
								{ label: 'Utility (Electricity/Water)', value: 'utility' },
								{ label: 'Security Deposit', value: 'deposit' },
							]}
							containerStyle={styles.pickerContainer}
							style={styles.picker}
						/>
					</View>

					<View style={styles.field}>
						<Text style={styles.label}>Amount (LKR)</Text>
						<TextInput
							style={styles.input}
							placeholder="e.g. 15000"
							value={amount}
							onChangeText={setAmount}
							keyboardType="numeric"
						/>
					</View>

					<View style={styles.field}>
						<Text style={styles.label}>Reference / Month</Text>
						<TextInput
							style={styles.input}
							placeholder="e.g. Rent for May 2026"
							value={reference}
							onChangeText={setReference}
						/>
					</View>

					<View style={styles.field}>
						<Text style={styles.label}>Proof Image (Receipt/Slip)</Text>
						<TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
							{proofImage ? (
								<Text style={styles.imagePickerTextSuccess}>✓ Image Selected</Text>
							) : (
								<Text style={styles.imagePickerText}>Upload Image</Text>
							)}
						</TouchableOpacity>
					</View>

					<TouchableOpacity 
						style={[styles.submitButton, submitting && styles.disabledButton]} 
						onPress={handleSubmitPayment}
						disabled={submitting}
					>
						<Text style={styles.submitButtonText}>
							{submitting ? 'Submitting...' : 'Submit Payment Proof'}
						</Text>
					</TouchableOpacity>
				</View>

				{/* Payment History */}
				<View style={styles.historySection}>
					<Text style={styles.sectionTitle}>Payment History</Text>
					
					{loading ? (
						<Text style={styles.emptyText}>Loading history...</Text>
					) : payments.length === 0 ? (
						<Text style={styles.emptyText}>No payment history found.</Text>
					) : (
						payments.map(payment => (
							<View key={payment.id} style={styles.historyCard}>
								<View style={styles.historyRow}>
									<Text style={styles.historyType}>
										{payment.type === 'rent' ? '🏠 Rent' : payment.type === 'deposit' ? '💰 Deposit' : '⚡ Utility'}
									</Text>
									<View style={[styles.statusBadge, payment.status === 'verified' ? styles.statusVerified : styles.statusPending]}>
										<Text style={styles.statusText}>{payment.status.toUpperCase()}</Text>
									</View>
								</View>
								<Text style={styles.historyAmount}>Rs {payment.amount}</Text>
								<Text style={styles.historyRef}>{payment.reference}</Text>
								<Text style={styles.historyDate}>{new Date(payment.createdAt).toLocaleDateString()}</Text>
							</View>
						))
					)}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#F8F9FA' },
	scrollView: { flex: 1, padding: 20 },
	header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
	backButton: { padding: 10, marginRight: 10 },
	backButtonText: { color: '#FFA500', fontSize: 16, fontWeight: 'bold' },
	headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#36454F' },
	card: {
		backgroundColor: '#FFFFFF',
		padding: 20,
		borderRadius: 12,
		marginBottom: 20,
		shadowColor: '#000',
		shadowOpacity: 0.05,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 8,
		elevation: 3,
	},
	cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#36454F', marginBottom: 15 },
	field: { marginBottom: 15 },
	label: { fontSize: 14, fontWeight: '600', color: '#36454F', marginBottom: 8 },
	input: {
		backgroundColor: '#F5F7FA',
		borderColor: '#E0E0E0',
		borderWidth: 1,
		borderRadius: 8,
		padding: 12,
		fontSize: 14,
	},
	pickerContainer: {
		backgroundColor: '#F5F7FA',
		borderColor: '#E0E0E0',
		borderWidth: 1,
		borderRadius: 8,
		height: 48,
		justifyContent: 'center',
	},
	picker: { height: 48, width: '100%' },
	imagePicker: {
		backgroundColor: '#F5F7FA',
		borderColor: '#E0E0E0',
		borderWidth: 1,
		borderStyle: 'dashed',
		borderRadius: 8,
		padding: 16,
		alignItems: 'center',
	},
	imagePickerText: { color: '#757575', fontSize: 14 },
	imagePickerTextSuccess: { color: 'green', fontSize: 14, fontWeight: 'bold' },
	submitButton: {
		backgroundColor: '#FFA500',
		padding: 15,
		borderRadius: 8,
		alignItems: 'center',
		marginTop: 10,
	},
	disabledButton: { opacity: 0.7 },
	submitButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
	historySection: { marginBottom: 40 },
	sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#36454F', marginBottom: 15 },
	emptyText: { color: '#757575', fontStyle: 'italic', textAlign: 'center', marginTop: 20 },
	historyCard: {
		backgroundColor: '#FFFFFF',
		padding: 15,
		borderRadius: 10,
		marginBottom: 10,
		borderLeftWidth: 4,
		borderLeftColor: '#FFA500',
		shadowColor: '#000',
		shadowOpacity: 0.03,
		shadowOffset: { width: 0, height: 1 },
		shadowRadius: 5,
		elevation: 2,
	},
	historyRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
	historyType: { fontSize: 15, fontWeight: 'bold', color: '#36454F' },
	statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
	statusVerified: { backgroundColor: '#E8F5E9' },
	statusPending: { backgroundColor: '#FFF3E0' },
	statusText: { fontSize: 10, fontWeight: 'bold', color: '#36454F' },
	historyAmount: { fontSize: 18, fontWeight: 'bold', color: '#FFA500', marginVertical: 5 },
	historyRef: { fontSize: 13, color: '#757575' },
	historyDate: { fontSize: 11, color: '#999', marginTop: 5, textAlign: 'right' },
});

export default Payments;
