/**
 * @file LandlordRequests.js
 * @description Renders the LandlordRequests screen for the landlord role.
 * 
 * @module screens/landlord/LandlordRequests
 */

import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Linking, RefreshControl, Modal, TextInput, Image } from "react-native";
import Toast from 'react-native-toast-message';
import { SafeAreaView } from "react-native-safe-area-context";
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { auth, db } from "../../config/firebase";

/**
 * Main Component: LandlordRequests
 * @param {object} props - Component props
 * @param {object} props.navigation - React Navigation object
 */
const LandlordRequests = ({ navigation }) => {
	const [requests, setRequests] = useState([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' or 'visits'
	
	const [contractModalVisible, setContractModalVisible] = useState(false);
	const [finalReviewModalVisible, setFinalReviewModalVisible] = useState(false);
	const [selectedRequest, setSelectedRequest] = useState(null);
	const [downPayment, setDownPayment] = useState('');
	const [contractTerms, setContractTerms] = useState('');

	const currentUserId = auth.currentUser?.uid;

	useEffect(() => {
		loadRequests();
	}, [activeTab]);

	const loadRequests = async (isRefresh = false) => {
		if (!currentUserId) return;
		try {
			if (!isRefresh) setLoading(true);
			const collectionName = activeTab === 'bookings' ? 'bookings' : 'visits';
			const q = query(collection(db, collectionName), where('landlordId', '==', currentUserId));
			const snapshot = await getDocs(q);
			
			const requestsList = [];
			for (const document of snapshot.docs) {
				const reqData = document.data();
				let studentMobile = null;
				let studentName = null;
				if (reqData.studentId) {
					try {
						const studentDoc = await getDoc(doc(db, 'users', reqData.studentId));
						if (studentDoc.exists()) {
							studentMobile = studentDoc.data().mobile;
							studentName = studentDoc.data().fullName;
						}
					} catch (err) {
						console.error("Error fetching student details", err);
					}
				}
				requestsList.push({ id: document.id, ...reqData, studentMobile, studentName });
			}
			// Sort by date descending
			requestsList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
			setRequests(requestsList);
		} catch (error) {
			console.error("Error loading requests:", error);
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	};

	const onRefresh = () => {
		setRefreshing(true);
		loadRequests(true);
	};

	const handleUpdateStatus = async (requestId, newStatus) => {
		try {
			const collectionName = activeTab === 'bookings' ? 'bookings' : 'visits';
			const reqRef = doc(db, collectionName, requestId);
			await updateDoc(reqRef, { status: newStatus });
			
			Toast.show({ type: 'success', text1: 'Success', text2: `Request marked as ${newStatus}` });
			loadRequests();
		} catch (error) {
			Alert.alert('Error', 'Failed to update request status.');
			console.error(error);
		}
	};

	const openContractModal = (req) => {
		setSelectedRequest(req);
		setDownPayment('');
		setContractTerms('1. Rent is due on the 1st of every month.\\n2. Utilities are split evenly among tenants.\\n3. No loud noises after 10 PM.');
		setContractModalVisible(true);
	};

	const sendContract = async () => {
		if (!downPayment || !contractTerms) {
			Alert.alert('Error', 'Please fill out all fields.');
			return;
		}
		try {
			const collectionName = activeTab === 'bookings' ? 'bookings' : 'visits';
			const reqRef = doc(db, collectionName, selectedRequest.id);
			await updateDoc(reqRef, { 
				status: 'in_review',
				downPaymentAmount: parseFloat(downPayment),
				contractTerms: contractTerms
			});
			Toast.show({ type: 'success', text1: 'Success', text2: `Contract sent for student review.` });
			setContractModalVisible(false);
			loadRequests();
		} catch (error) {
			Alert.alert('Error', 'Failed to send contract.');
		}
	};

	const openFinalReview = (req) => {
		setSelectedRequest(req);
		setFinalReviewModalVisible(true);
	};

	const finalApprove = async () => {
		try {
			const collectionName = activeTab === 'bookings' ? 'bookings' : 'visits';
			const reqRef = doc(db, collectionName, selectedRequest.id);
			await updateDoc(reqRef, { status: 'approved' });
			Toast.show({ type: 'success', text1: 'Success', text2: `Booking officially approved!` });
			setFinalReviewModalVisible(false);
			loadRequests();
		} catch (error) {
			Alert.alert('Error', 'Failed to approve booking.');
		}
	};

	const getStatusColor = (status) => {
		switch(status) {
			case 'approved': return '#E8F5E9';
			case 'rejected': return '#FCE4EC';
			default: return '#FFF3E0';
		}
	};

	const getStatusTextColor = (status) => {
		switch(status) {
			case 'approved': return '#2E7D32';
			case 'rejected': return '#C62828';
			default: return '#EF6C00';
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
					<Text style={styles.backButtonText}>← Back</Text>
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Student Requests</Text>
			</View>

			<View style={styles.tabContainer}>
				<TouchableOpacity 
					style={[styles.tab, activeTab === 'bookings' && styles.activeTab]} 
					onPress={() => setActiveTab('bookings')}
				>
					<Text style={[styles.tabText, activeTab === 'bookings' && styles.activeTabText]}>Bookings</Text>
				</TouchableOpacity>
				<TouchableOpacity 
					style={[styles.tab, activeTab === 'visits' && styles.activeTab]} 
					onPress={() => setActiveTab('visits')}
				>
					<Text style={[styles.tabText, activeTab === 'visits' && styles.activeTabText]}>Visits</Text>
				</TouchableOpacity>
			</View>

			<ScrollView 
				style={styles.scrollView} 
				showsVerticalScrollIndicator={false}
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#FFA500"]} />}
			>
				{loading ? (
					<View style={styles.centerContainer}>
						<ActivityIndicator size="large" color="#FFA500" />
						<Text style={styles.loadingText}>Loading requests...</Text>
					</View>
				) : requests.length === 0 ? (
					<Text style={styles.emptyText}>No {activeTab} requests found.</Text>
				) : (
					requests.map(req => (
						<View key={req.id} style={styles.card}>
							<Text style={styles.propertyTitle}>{req.propertyName || 'Unknown Property'}</Text>
							
							<View style={styles.detailsRow}>
								<View style={styles.detailItem}>
									<Text style={styles.label}>Date Requested:</Text>
									<Text style={styles.value}>{new Date(req.createdAt).toLocaleDateString()}</Text>
								</View>
								<View style={styles.detailItem}>
									<Text style={styles.label}>Current Status:</Text>
									<View style={[styles.statusBadge, { backgroundColor: getStatusColor(req.status) }]}>
										<Text style={[styles.statusText, { color: getStatusTextColor(req.status) }]}>
											{req.status.toUpperCase()}
										</Text>
									</View>
								</View>
							</View>

							{req.status === 'pending' && (
								<View style={styles.actionsRow}>
									<TouchableOpacity 
										style={styles.reviewButton} 
										onPress={() => openContractModal(req)}
									>
										<Text style={styles.reviewButtonText}>Review & Send Contract</Text>
									</TouchableOpacity>
									<TouchableOpacity 
										style={styles.rejectButton} 
										onPress={() => handleUpdateStatus(req.id, 'rejected')}
									>
										<Text style={styles.rejectButtonText}>Reject</Text>
									</TouchableOpacity>
								</View>
							)}

							{req.status === 'in_review' && (
								<View style={styles.actionsRow}>
									<Text style={styles.waitingText}>⏳ Waiting for Student Signature & Payment</Text>
								</View>
							)}

							{req.status === 'pending_final_approval' && (
								<View style={styles.actionsRow}>
									<TouchableOpacity 
										style={styles.approveButton} 
										onPress={() => openFinalReview(req)}
									>
										<Text style={styles.approveButtonText}>Verify Signed Contract & Payment</Text>
									</TouchableOpacity>
								</View>
							)}

							{req.studentMobile && (
								<TouchableOpacity 
									style={styles.callButton} 
									onPress={() => Linking.openURL(`tel:${req.studentMobile}`)}
								>
									<Text style={styles.callButtonText}>📞 Call Student ({req.studentName || 'Student'})</Text>
								</TouchableOpacity>
							)}
						</View>
					))
				)}
			</ScrollView>

			{/* Contract Generation Modal */}
			<Modal visible={contractModalVisible} transparent={true} animationType="slide">
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>Draft Lease Agreement</Text>
						
						<Text style={styles.label}>Down Payment / Security Deposit (Rs)</Text>
						<TextInput
							style={styles.input}
							placeholder="e.g. 50000"
							keyboardType="numeric"
							value={downPayment}
							onChangeText={setDownPayment}
						/>

						<Text style={styles.label}>Lease Terms & Utility Rules</Text>
						<TextInput
							style={[styles.input, styles.textArea]}
							multiline
							numberOfLines={5}
							value={contractTerms}
							onChangeText={setContractTerms}
						/>

						<TouchableOpacity style={styles.sendContractBtn} onPress={sendContract}>
							<Text style={styles.sendContractBtnText}>Send to Student for Signature</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.cancelBtn} onPress={() => setContractModalVisible(false)}>
							<Text style={styles.cancelBtnText}>Cancel</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>

			{/* Final Review Modal */}
			<Modal visible={finalReviewModalVisible} transparent={true} animationType="slide">
				<View style={styles.modalOverlay}>
					<View style={styles.modalContentLarge}>
						<Text style={styles.modalTitle}>Final Review: {selectedRequest?.studentName}</Text>
						
						<ScrollView style={styles.modalScroll}>
							<Text style={styles.sectionTitle}>Student's Signature</Text>
							{selectedRequest?.studentSignature ? (
								<Image 
									source={{ uri: selectedRequest.studentSignature }} 
									style={styles.signatureImage} 
									resizeMode="contain" 
								/>
							) : <Text>No signature provided.</Text>}

							<Text style={[styles.sectionTitle, { marginTop: 20 }]}>Payment Proof</Text>
							{selectedRequest?.paymentProofImage ? (
								<Image 
									source={{ uri: selectedRequest.paymentProofImage }} 
									style={styles.proofImage} 
									resizeMode="contain" 
								/>
							) : <Text>No payment proof provided.</Text>}
						</ScrollView>

						<TouchableOpacity style={styles.sendContractBtn} onPress={finalApprove}>
							<Text style={styles.sendContractBtnText}>✓ Officially Approve Booking</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.cancelBtn} onPress={() => setFinalReviewModalVisible(false)}>
							<Text style={styles.cancelBtnText}>Close</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>

		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#F8F9FA' },
	header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#FFFFFF' },
	backButton: { paddingRight: 15 },
	backButtonText: { color: '#FFA500', fontSize: 16, fontWeight: 'bold' },
	headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#36454F' },
	tabContainer: { flexDirection: 'row', backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingBottom: 10 },
	tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
	activeTab: { borderBottomColor: '#FFA500' },
	tabText: { fontSize: 15, color: '#757575', fontWeight: '600' },
	activeTabText: { color: '#FFA500' },
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
	propertyTitle: { fontSize: 18, fontWeight: 'bold', color: '#36454F', marginBottom: 12 },
	detailsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
	detailItem: { flex: 1 },
	label: { fontSize: 12, color: '#757575', marginBottom: 4 },
	value: { fontSize: 14, fontWeight: '600', color: '#36454F' },
	statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
	statusText: { fontSize: 11, fontWeight: 'bold' },
	actionsRow: { flexDirection: 'row', gap: 10, borderTopWidth: 1, borderTopColor: '#E0E0E0', paddingTop: 16 },
	approveButton: {
		flex: 1,
		backgroundColor: '#4CAF50',
		paddingVertical: 10,
		borderRadius: 6,
		alignItems: 'center',
	},
	approveButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' },
	reviewButton: {
		flex: 1,
		backgroundColor: '#2196F3',
		paddingVertical: 10,
		borderRadius: 6,
		alignItems: 'center',
	},
	reviewButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' },
	rejectButton: {
		flex: 0.5,
		backgroundColor: '#FFFFFF',
		borderColor: '#F44336',
		borderWidth: 1,
		paddingVertical: 10,
		borderRadius: 6,
		alignItems: 'center',
	},
	rejectButtonText: { color: '#F44336', fontSize: 13, fontWeight: 'bold' },
	callButton: {
		backgroundColor: '#F5F7FA',
		borderColor: '#E0E0E0',
		borderWidth: 1,
		paddingVertical: 10,
		borderRadius: 6,
		alignItems: 'center',
		marginTop: 10,
	},
	callButtonText: { color: '#36454F', fontSize: 13, fontWeight: 'bold' },
	waitingText: { color: '#FFA500', fontStyle: 'italic', fontSize: 13, textAlign: 'center', flex: 1 },
	modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
	modalContent: { backgroundColor: '#FFF', padding: 20, width: '90%', borderRadius: 12 },
	modalContentLarge: { backgroundColor: '#FFF', padding: 20, width: '95%', height: '85%', borderRadius: 12 },
	modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#36454F', marginBottom: 20, textAlign: 'center' },
	modalScroll: { flex: 1, marginBottom: 15 },
	input: { backgroundColor: '#F5F7FA', borderWidth: 1, borderColor: '#E0E0E0', padding: 12, borderRadius: 8, marginBottom: 15 },
	textArea: { height: 100, textAlignVertical: 'top' },
	sendContractBtn: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
	sendContractBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
	cancelBtn: { padding: 10, alignItems: 'center' },
	cancelBtnText: { color: '#757575', fontWeight: 'bold' },
	sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#36454F', marginBottom: 10 },
	signatureImage: { width: '100%', height: 150, backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8 },
	proofImage: { width: '100%', height: 300, backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8 },
});

export default LandlordRequests;
