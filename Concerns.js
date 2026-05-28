import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, TouchableOpacity, TextInput, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from "./config/firebase";
import SelectPicker from './components/SelectPicker';

const Concerns = ({ navigation }) => {
	const [concerns, setConcerns] = useState([]);
	const [loading, setLoading] = useState(true);
	
	// Form states
	const [type, setType] = useState('maintenance');
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [submitting, setSubmitting] = useState(false);

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
				where('studentId', '==', currentUserId)
			);
			const snapshot = await getDocs(q);
			const concernsList = [];
			snapshot.forEach(doc => {
				concernsList.push({ id: doc.id, ...doc.data() });
			});
			// Sort by date descending
			concernsList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
			setConcerns(concernsList);
		} catch (error) {
			console.error("Error loading concerns:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleSubmitConcern = async () => {
		if (!title || !description) {
			Alert.alert('Missing Fields', 'Please provide a title and description for your concern.');
			return;
		}

		try {
			setSubmitting(true);
			await addDoc(collection(db, 'concerns'), {
				studentId: currentUserId,
				type,
				title,
				description,
				status: 'pending',
				createdAt: new Date().toISOString()
			});
			
			Alert.alert('Success', 'Concern submitted successfully. The landlord has been notified.');
			setTitle('');
			setDescription('');
			loadConcerns();
		} catch (error) {
			Alert.alert('Error', 'Failed to submit concern.');
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
					<Text style={styles.headerTitle}>Concerns & Maintenance</Text>
				</View>

				{/* Submit Concern Form */}
				<View style={styles.card}>
					<Text style={styles.cardTitle}>Submit New Concern</Text>
					
					<View style={styles.field}>
						<Text style={styles.label}>Concern Type</Text>
						<SelectPicker
							selectedValue={type}
							onValueChange={setType}
							items={[
								{ label: 'Maintenance Issue', value: 'maintenance' },
								{ label: 'Safety/Security', value: 'safety' },
								{ label: 'Other', value: 'other' },
							]}
							containerStyle={styles.pickerContainer}
							style={styles.picker}
						/>
					</View>

					<View style={styles.field}>
						<Text style={styles.label}>Title</Text>
						<TextInput
							style={styles.input}
							placeholder="e.g. Leaking Faucet"
							value={title}
							onChangeText={setTitle}
						/>
					</View>

					<View style={styles.field}>
						<Text style={styles.label}>Description</Text>
						<TextInput
							style={[styles.input, styles.textArea]}
							placeholder="Please provide details about the issue..."
							value={description}
							onChangeText={setDescription}
							multiline
							numberOfLines={4}
						/>
					</View>

					<TouchableOpacity 
						style={[styles.submitButton, submitting && styles.disabledButton]} 
						onPress={handleSubmitConcern}
						disabled={submitting}
					>
						<Text style={styles.submitButtonText}>
							{submitting ? 'Submitting...' : 'Submit Concern'}
						</Text>
					</TouchableOpacity>
				</View>

				{/* Concerns History */}
				<View style={styles.historySection}>
					<Text style={styles.sectionTitle}>My Concerns</Text>
					
					{loading ? (
						<Text style={styles.emptyText}>Loading concerns...</Text>
					) : concerns.length === 0 ? (
						<Text style={styles.emptyText}>No concerns found.</Text>
					) : (
						concerns.map(concern => (
							<View key={concern.id} style={styles.historyCard}>
								<View style={styles.historyRow}>
									<Text style={styles.historyType}>
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
								<Text style={styles.historyTitle}>{concern.title}</Text>
								<Text style={styles.historyDesc}>{concern.description}</Text>
								<Text style={styles.historyDate}>{new Date(concern.createdAt).toLocaleDateString()}</Text>
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
	backButtonText: { color: '#E74C3C', fontSize: 16, fontWeight: 'bold' },
	headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#36454F' },
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
	textArea: { height: 100, textAlignVertical: 'top' },
	pickerContainer: {
		backgroundColor: '#F5F7FA',
		borderColor: '#E0E0E0',
		borderWidth: 1,
		borderRadius: 8,
		height: 48,
		justifyContent: 'center',
	},
	picker: { height: 48, width: '100%' },
	submitButton: {
		backgroundColor: '#E74C3C',
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
		borderLeftColor: '#E74C3C',
		shadowColor: '#000',
		shadowOpacity: 0.03,
		shadowOffset: { width: 0, height: 1 },
		shadowRadius: 5,
		elevation: 2,
	},
	historyRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
	historyType: { fontSize: 14, fontWeight: 'bold', color: '#36454F' },
	statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
	statusResolved: { backgroundColor: '#E8F5E9' },
	statusProgress: { backgroundColor: '#E3F2FD' },
	statusPending: { backgroundColor: '#FFF3E0' },
	statusText: { fontSize: 10, fontWeight: 'bold', color: '#36454F' },
	historyTitle: { fontSize: 16, fontWeight: 'bold', color: '#E74C3C', marginVertical: 5 },
	historyDesc: { fontSize: 13, color: '#555', marginBottom: 8 },
	historyDate: { fontSize: 11, color: '#999', textAlign: 'right' },
});

export default Concerns;
