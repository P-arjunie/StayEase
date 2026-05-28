import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from "./config/firebase";

const GuardianBookings = ({ navigation, route }) => {
	const { studentId, studentName } = route.params || {};
	
	const [bookings, setBookings] = useState([]);
	const [visits, setVisits] = useState([]);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState('bookings');

	useEffect(() => {
		loadData();
	}, [studentId]);

	const loadData = async () => {
		if (!studentId) return;
		try {
			setLoading(true);
			
			// Load Bookings
			const bq = query(collection(db, 'bookings'), where('studentId', '==', studentId));
			const bSnap = await getDocs(bq);
			const bList = [];
			bSnap.forEach(doc => bList.push({ id: doc.id, ...doc.data() }));
			bList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
			setBookings(bList);

			// Load Visits
			const vq = query(collection(db, 'visits'), where('studentId', '==', studentId));
			const vSnap = await getDocs(vq);
			const vList = [];
			vSnap.forEach(doc => vList.push({ id: doc.id, ...doc.data() }));
			vList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
			setVisits(vList);
			
		} catch (error) {
			console.error("Error loading tracking data:", error);
		} finally {
			setLoading(false);
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
				<View>
					<Text style={styles.headerTitle}>Student Activity</Text>
					<Text style={styles.headerSubtitle}>{studentName}</Text>
				</View>
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
						<ActivityIndicator size="large" color="#2E7D32" />
					</View>
				) : activeTab === 'bookings' ? (
					bookings.length === 0 ? (
						<Text style={styles.emptyText}>No bookings found.</Text>
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
							</View>
						))
					)
				) : (
					visits.length === 0 ? (
						<Text style={styles.emptyText}>No visits found.</Text>
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
	tabContainer: { flexDirection: 'row', backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingBottom: 10 },
	tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
	activeTab: { borderBottomColor: '#2E7D32' },
	tabText: { fontSize: 15, color: '#757575', fontWeight: '600' },
	activeTabText: { color: '#2E7D32' },
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
	propertyTitle: { fontSize: 18, fontWeight: 'bold', color: '#36454F', marginBottom: 10 },
	row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
	label: { fontSize: 14, color: '#757575' },
	value: { fontSize: 14, fontWeight: '600', color: '#36454F' },
	statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
	statusText: { fontSize: 11, fontWeight: 'bold' },
});

export default GuardianBookings;
