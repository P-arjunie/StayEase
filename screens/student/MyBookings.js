/**
 * @file MyBookings.js
 * @description Renders the MyBookings screen for the student role.
 * 
 * @module screens/student/MyBookings
 */

import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, TouchableOpacity, StyleSheet, RefreshControl, Modal, Alert, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import SignatureScreen from 'react-native-signature-canvas';
import { auth, db } from "../../config/firebase";

/**
 * Main Component: MyBookings
 * @param {object} props - Component props
 * @param {object} props.navigation - React Navigation object
 */
const MyBookings = ({ navigation }) => {
	const [bookings, setBookings] = useState([]);
	const [visits, setVisits] = useState([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' or 'visits'
	
	const [contractModalVisible, setContractModalVisible] = useState(false);
	const [selectedBooking, setSelectedBooking] = useState(null);
	const [paymentProof, setPaymentProof] = useState(null);

	const currentUserId = auth.currentUser?.uid;

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async (isRefresh = false) => {
		if (!currentUserId) return;
		try {
			if (!isRefresh) setLoading(true);
			
			// Load Bookings
			const bq = query(collection(db, 'bookings'), where('studentId', '==', currentUserId));
			const bSnap = await getDocs(bq);
			const bList = [];
			bSnap.forEach(doc => bList.push({ id: doc.id, ...doc.data() }));
			bList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
			setBookings(bList);

			// Load Visits
			const vq = query(collection(db, 'visits'), where('studentId', '==', currentUserId));
			const vSnap = await getDocs(vq);
			const vList = [];
			vSnap.forEach(doc => vList.push({ id: doc.id, ...doc.data() }));
			vList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
			setVisits(vList);
			
		} catch (error) {
			console.error("Error loading tracking data:", error);
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	};

	const onRefresh = () => {
		setRefreshing(true);
		loadData(true);
	};

	const openSignModal = (booking) => {
		setSelectedBooking(booking);
		setPaymentProof(null);
		setContractModalVisible(true);
	};

	const pickImage = async () => {
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ['images'],
			allowsEditing: true,
			aspect: [3, 4],
			quality: 0.8,
		});
		if (!result.canceled) {
			setPaymentProof(result.assets[0].uri);
		}
	};

	const handleSignature = async (signature) => {
		if (!paymentProof) {
			Alert.alert('Missing Payment Proof', 'Please upload your payment proof before signing the contract.');
			return;
		}

		try {
			const bRef = doc(db, 'bookings', selectedBooking.id);
			await updateDoc(bRef, {
				status: 'pending_final_approval',
				studentSignature: signature,
				paymentProofImage: paymentProof
			});
			Toast.show({ type: 'success', text1: 'Success', text2: 'Contract signed and submitted!' });
			setContractModalVisible(false);
			loadData();
		} catch (e) {
			Alert.alert('Error', 'Failed to submit contract.');
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
				<Text style={styles.headerTitle}>Tracking</Text>
			</View>

			<View style={styles.tabContainer}>
				<TouchableOpacity 
					style={[styles.tab, activeTab === 'bookings' && styles.activeTab]} 
					onPress={() => setActiveTab('bookings')}
				>
					<Text style={[styles.tabText, activeTab === 'bookings' && styles.activeTabText]}>My Bookings</Text>
				</TouchableOpacity>
				<TouchableOpacity 
					style={[styles.tab, activeTab === 'visits' && styles.activeTab]} 
					onPress={() => setActiveTab('visits')}
				>
					<Text style={[styles.tabText, activeTab === 'visits' && styles.activeTabText]}>My Visits</Text>
				</TouchableOpacity>
			</View>

			<ScrollView 
				style={styles.scrollView} 
				showsVerticalScrollIndicator={false}
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#FFA500"]} />}
			>
				{loading ? (
					<Text style={styles.emptyText}>Loading data...</Text>
				) : activeTab === 'bookings' ? (
					bookings.length === 0 ? (
						<Text style={styles.emptyText}>You haven't requested any bookings yet.</Text>
					) : (
						bookings.map(item => (
							<View key={item.id} style={styles.card}>
								<Text style={styles.propertyTitle}>{item.propertyName || 'Property Name Unknown'}</Text>
								<View style={styles.row}>
									<Text style={styles.label}>Requested On:</Text>
									<Text style={styles.value}>{new Date(item.createdAt).toLocaleDateString()}</Text>
								</View>
								<View style={styles.row}>
									<Text style={styles.label}>Status:</Text>
									<View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
										<Text style={[styles.statusText, { color: getStatusTextColor(item.status) }]}>
											{item.status.toUpperCase()}
										</Text>
									</View>
								</View>

								{item.status === 'in_review' && (
									<TouchableOpacity style={styles.signButton} onPress={() => openSignModal(item)}>
										<Text style={styles.signButtonText}>Sign Contract & Pay</Text>
									</TouchableOpacity>
								)}
							</View>
						))
					)
				) : (
					visits.length === 0 ? (
						<Text style={styles.emptyText}>You haven't requested any visits yet.</Text>
					) : (
						visits.map(item => (
							<View key={item.id} style={styles.card}>
								<Text style={styles.propertyTitle}>{item.propertyName || 'Property Name Unknown'}</Text>
								<View style={styles.row}>
									<Text style={styles.label}>Requested On:</Text>
									<Text style={styles.value}>{new Date(item.createdAt).toLocaleDateString()}</Text>
								</View>
								<View style={styles.row}>
									<Text style={styles.label}>Status:</Text>
									<View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
										<Text style={[styles.statusText, { color: getStatusTextColor(item.status) }]}>
											{item.status.toUpperCase()}
										</Text>
									</View>
								</View>
							</View>
						))
					)
				)}
			</ScrollView>

			<Modal visible={contractModalVisible} animationType="slide">
				<SafeAreaView style={styles.modalContainer}>
					<View style={styles.modalHeader}>
						<Text style={styles.modalTitle}>Lease Agreement</Text>
						<TouchableOpacity onPress={() => setContractModalVisible(false)}>
							<Text style={styles.closeText}>Cancel</Text>
						</TouchableOpacity>
					</View>

					<ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
						<View style={styles.termsBox}>
							<Text style={styles.termsTitle}>Required Down Payment:</Text>
							<Text style={styles.termsValue}>Rs {selectedBooking?.downPaymentAmount}</Text>
							
							<Text style={[styles.termsTitle, {marginTop: 15}]}>Terms & Rules:</Text>
							<Text style={styles.termsText}>{selectedBooking?.contractTerms}</Text>
						</View>

						<Text style={styles.sectionLabel}>1. Upload Payment Proof</Text>
						<TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
							{paymentProof ? (
								<Text style={styles.uploadBtnSuccess}>✓ Image Selected</Text>
							) : (
								<Text style={styles.uploadBtnText}>Select Receipt Image</Text>
							)}
						</TouchableOpacity>

						<Text style={styles.sectionLabel}>2. Draw Your Signature Below</Text>
						<View style={styles.signatureContainer}>
							<SignatureScreen
								onOK={handleSignature}
								onEmpty={() => Alert.alert("Empty", "Please provide a signature.")}
								descriptionText="Sign inside the box"
								clearText="Clear"
								confirmText="Save & Submit"
								webStyle={`.m-signature-pad {box-shadow: none; border: none; margin: 0px; padding: 0px;} 
										  .m-signature-pad--body {border: 1px solid #e8e8e8;}`}
							/>
						</View>
					</ScrollView>
				</SafeAreaView>
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
	propertyTitle: { fontSize: 18, fontWeight: 'bold', color: '#36454F', marginBottom: 10 },
	row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
	label: { fontSize: 14, color: '#757575' },
	value: { fontSize: 14, fontWeight: '600', color: '#36454F' },
	statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
	statusText: { fontSize: 11, fontWeight: 'bold' },
	signButton: { backgroundColor: '#4CAF50', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 15 },
	signButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
	modalContainer: { flex: 1, backgroundColor: '#F8F9FA' },
	modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
	modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#36454F' },
	closeText: { color: '#F44336', fontWeight: 'bold', fontSize: 16 },
	modalScroll: { flex: 1, padding: 20 },
	termsBox: { backgroundColor: '#FFF', padding: 15, borderRadius: 8, marginBottom: 20, borderWidth: 1, borderColor: '#E0E0E0' },
	termsTitle: { fontSize: 14, fontWeight: 'bold', color: '#757575', marginBottom: 5 },
	termsValue: { fontSize: 18, fontWeight: 'bold', color: '#FFA500' },
	termsText: { fontSize: 14, color: '#333', lineHeight: 22 },
	sectionLabel: { fontSize: 16, fontWeight: 'bold', color: '#36454F', marginBottom: 10, marginTop: 10 },
	uploadBtn: { backgroundColor: '#FFF', borderWidth: 2, borderColor: '#FFA500', borderStyle: 'dashed', padding: 20, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
	uploadBtnText: { color: '#757575', fontWeight: 'bold' },
	uploadBtnSuccess: { color: 'green', fontWeight: 'bold' },
	signatureContainer: { height: 300, backgroundColor: '#FFF', borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#E0E0E0', marginBottom: 40 },
});

export default MyBookings;
