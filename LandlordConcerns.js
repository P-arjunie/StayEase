import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { collection, query, where, getDocs, doc, updateDoc, limit, startAfter, orderBy } from 'firebase/firestore';
import { auth, db } from "./config/firebase";

const LandlordConcerns = ({ navigation }) => {
	const [concerns, setConcerns] = useState([]);
	const [loading, setLoading] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const [lastVisible, setLastVisible] = useState(null);
	const [hasMore, setHasMore] = useState(true);
	const PAGE_SIZE = 10;

	const currentUserId = auth.currentUser?.uid;

	useEffect(() => {
		loadConcerns();
	}, []);

	const loadConcerns = async () => {
		if (!currentUserId) return;
		try {
			setLoading(true);
			const q = query(
				collection(db, 'concerns'), 
				where('landlordId', '==', currentUserId),
				orderBy('createdAt', 'desc'),
				limit(PAGE_SIZE)
			);
			const snapshot = await getDocs(q);
			
			const concernsList = [];
			snapshot.forEach(doc => {
				concernsList.push({ id: doc.id, ...doc.data() });
			});
			
			if (snapshot.docs.length > 0) {
				setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
			}
			if (snapshot.docs.length < PAGE_SIZE) {
				setHasMore(false);
			}

			setConcerns(concernsList);
		} catch (error) {
			console.error("Error loading concerns:", error);
		} finally {
			setLoading(false);
		}
	};

	const loadMoreConcerns = async () => {
		if (!currentUserId || !lastVisible || loadingMore || !hasMore) return;
		try {
			setLoadingMore(true);
			const q = query(
				collection(db, 'concerns'), 
				where('landlordId', '==', currentUserId),
				orderBy('createdAt', 'desc'),
				startAfter(lastVisible),
				limit(PAGE_SIZE)
			);
			const snapshot = await getDocs(q);
			
			const concernsList = [];
			snapshot.forEach(doc => {
				concernsList.push({ id: doc.id, ...doc.data() });
			});
			
			if (snapshot.docs.length > 0) {
				setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
			}
			if (snapshot.docs.length < PAGE_SIZE) {
				setHasMore(false);
			}

			setConcerns(prev => [...prev, ...concernsList]);
		} catch (error) {
			console.error("Error loading more concerns:", error);
		} finally {
			setLoadingMore(false);
		}
	};

	const handleUpdateStatus = async (concernId, newStatus) => {
		try {
			const reqRef = doc(db, 'concerns', concernId);
			await updateDoc(reqRef, { status: newStatus });
			
			Alert.alert('Success', `Concern marked as ${newStatus}`);
			loadConcerns();
		} catch (error) {
			Alert.alert('Error', 'Failed to update concern status.');
			console.error(error);
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
					<Text style={styles.backButtonText}>← Back</Text>
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Tenant Concerns</Text>
			</View>

			<ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
				{loading ? (
					<View style={styles.centerContainer}>
						<ActivityIndicator size="large" color="#FFA500" />
						<Text style={styles.loadingText}>Loading concerns...</Text>
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
							{concern.image && (
								<View style={styles.imageContainer}>
									<Image 
										source={{ uri: concern.image }} 
										style={styles.concernImage} 
										resizeMode="cover"
									/>
								</View>
							)}

							<View style={styles.actionContainer}>
								{concern.status !== 'resolved' && (
									<TouchableOpacity 
										style={[styles.actionButton, styles.resolveButton]} 
										onPress={() => handleUpdateStatus(concern.id, 'resolved')}
									>
										<Text style={styles.actionButtonText}>Mark Resolved</Text>
									</TouchableOpacity>
								)}
								{concern.status === 'pending' && (
									<TouchableOpacity 
										style={[styles.actionButton, styles.progressButton]} 
										onPress={() => handleUpdateStatus(concern.id, 'in-progress')}
									>
										<Text style={styles.actionButtonText}>Mark In-Progress</Text>
									</TouchableOpacity>
								)}
							</View>
						</View>
					))
				)}

				{!loading && hasMore && concerns.length > 0 && (
					<TouchableOpacity 
						style={styles.loadMoreButton} 
						onPress={loadMoreConcerns}
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
	backButtonText: { color: '#E74C3C', fontSize: 16, fontWeight: 'bold' },
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
	imageContainer: { marginBottom: 12, borderRadius: 8, overflow: 'hidden' },
	concernImage: { width: '100%', height: 200 },
	actionContainer: { flexDirection: 'row', gap: 10, borderTopWidth: 1, borderTopColor: '#E0E0E0', paddingTop: 16 },
	actionButton: {
		flex: 1,
		paddingVertical: 10,
		borderRadius: 6,
		alignItems: 'center',
	},
	actionButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' },
	resolveButton: { backgroundColor: '#4CAF50' },
	progressButton: { backgroundColor: '#FFA500' },
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

export default LandlordConcerns;
