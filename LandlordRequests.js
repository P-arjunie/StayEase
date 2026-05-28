import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { auth, db } from "./config/firebase";

const LandlordRequests = ({ navigation }) => {
	const [requests, setRequests] = useState([]);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' or 'visits'

	const currentUserId = auth.currentUser?.uid;

	useEffect(() => {
		loadRequests();
	}, [activeTab]);

	const loadRequests = async () => {
		if (!currentUserId) return;
		try {
			setLoading(true);
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
		}
	};

	const handleUpdateStatus = async (requestId, newStatus) => {
		try {
			const collectionName = activeTab === 'bookings' ? 'bookings' : 'visits';
			const reqRef = doc(db, collectionName, requestId);
			await updateDoc(reqRef, { status: newStatus });
			
			Alert.alert('Success', `Request marked as ${newStatus}`);
			loadRequests();
		} catch (error) {
			Alert.alert('Error', 'Failed to update request status.');
			console.error(error);
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

			<ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
										style={styles.approveButton} 
										onPress={() => handleUpdateStatus(req.id, 'approved')}
									>
										<Text style={styles.approveButtonText}>Approve</Text>
									</TouchableOpacity>
									<TouchableOpacity 
										style={styles.rejectButton} 
										onPress={() => handleUpdateStatus(req.id, 'rejected')}
									>
										<Text style={styles.rejectButtonText}>Reject</Text>
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
	rejectButton: {
		flex: 1,
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
});

export default LandlordRequests;
