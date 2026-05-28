import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, Alert } from "react-native";
import Toast from 'react-native-toast-message';
import { SafeAreaView } from "react-native-safe-area-context";
import { getAuth } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { db } from './config/firebase';
import SelectPicker from './components/SelectPicker';

const GuardianDashboard = ({ navigation }) => {
	const [loading, setLoading] = useState(true);
	const [student, setStudent] = useState(null);
	const [guardianProfile, setGuardianProfile] = useState(null);
	
	// Override form state
	const [overrideBudget, setOverrideBudget] = useState('');
	const [overrideGender, setOverrideGender] = useState('any');
	const [updating, setUpdating] = useState(false);

	const auth = getAuth();

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		const uid = auth.currentUser?.uid;
		if (!uid) return;

		try {
			setLoading(true);
			// 1. Get Guardian Profile
			const gDoc = await getDoc(doc(db, 'users', uid));
			if (gDoc.exists()) {
				const gData = gDoc.data();
				setGuardianProfile(gData);

				// 2. Find Linked Student
				const sq = query(
					collection(db, 'users'), 
					where('role', '==', 'student'),
					where('guardian.mobile', '==', gData.mobile)
				);
				const sSnap = await getDocs(sq);
				
				if (!sSnap.empty) {
					const sData = { id: sSnap.docs[0].id, ...sSnap.docs[0].data() };
					setStudent(sData);
					setOverrideBudget(sData.maxBudget ? String(sData.maxBudget) : '');
					setOverrideGender(sData.genderPreference || 'any');
				}
			}
		} catch (error) {
			console.error("Error loading guardian data:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleOverrideRules = async () => {
		if (!student) return;
		try {
			setUpdating(true);
			const studentRef = doc(db, 'users', student.id);
			await updateDoc(studentRef, {
				maxBudget: parseInt(overrideBudget) || 0,
				genderPreference: overrideGender,
				guardianOverridden: true // flag to indicate rules are locked by guardian
			});
			
			Toast.show({ type: 'success', text1: 'Success', text2: 'Student rules have been overridden and locked.' });
			loadData();
		} catch (error) {
			Alert.alert('Error', 'Failed to update rules.');
			console.error(error);
		} finally {
			setUpdating(false);
		}
	};

	const handleLogout = async () => {
		try {
			await auth.signOut();
			navigation.navigate('Login');
		} catch (error) {
			console.error('Logout error:', error);
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<View style={styles.headerContent}>
					<Text style={styles.headerTitle}>🛡️ Guardian Portal</Text>
					<Text style={styles.headerSubtitle}>Monitor student activity</Text>
				</View>
				<TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
					<Text style={styles.logoutText}>Logout</Text>
				</TouchableOpacity>
			</View>

			<ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
				{loading ? (
					<View style={styles.centerContainer}>
						<ActivityIndicator size="large" color="#2E7D32" />
						<Text style={styles.loadingText}>Locating your student...</Text>
					</View>
				) : !student ? (
					<View style={styles.emptyState}>
						<Text style={styles.emptyTitle}>No Student Found</Text>
						<Text style={styles.emptyText}>No student has registered using your mobile number ({guardianProfile?.mobile}) as their guardian.</Text>
					</View>
				) : (
					<View style={styles.content}>
						{/* Linked Student Card */}
						<View style={styles.card}>
							<Text style={styles.cardTitle}>🎓 Linked Student</Text>
							<Text style={styles.studentName}>{student.fullName}</Text>
							<Text style={styles.detailText}>University: {student.university}</Text>
							<Text style={styles.detailText}>Student ID: {student.studentId}</Text>
							
							<View style={styles.statusRow}>
								<Text style={styles.statusLabel}>Account Status:</Text>
								<View style={[styles.statusBadge, student.status === 'Verified' ? styles.statusVerified : styles.statusPending]}>
									<Text style={styles.statusText}>{student.status.toUpperCase()}</Text>
								</View>
							</View>
						</View>

						{/* Guardian Rules Override Form */}
						<View style={styles.card}>
							<Text style={styles.cardTitle}>⚙️ Manage Housing Rules</Text>
							<Text style={styles.helperText}>
								As a guardian, you can override and lock the student's preferences for safety and budget.
							</Text>

							<View style={styles.marketHintBox}>
								<Text style={styles.marketHintIcon}>💡</Text>
								<Text style={styles.marketHintText}>
									Market Context: Average boarding house rent near most state universities ranges from Rs 10,000 to Rs 25,000 per month.
								</Text>
							</View>

							<View style={styles.field}>
								<Text style={styles.label}>Maximum Budget Limit (Rs)</Text>
								<TextInput
									style={styles.input}
									value={overrideBudget}
									onChangeText={setOverrideBudget}
									placeholder="e.g. 15000"
									keyboardType="numeric"
								/>
							</View>

							<View style={styles.field}>
								<Text style={styles.label}>Strict Gender Rule</Text>
								<SelectPicker
									selectedValue={overrideGender}
									onValueChange={setOverrideGender}
									items={[
										{ label: 'Any', value: 'any' },
										{ label: 'Male Only', value: 'male_only' },
										{ label: 'Female Only', value: 'female_only' },
									]}
									containerStyle={styles.pickerContainer}
									style={styles.picker}
								/>
							</View>

							{student.guardianOverridden && (
								<Text style={styles.lockedText}>🔒 Rules are currently locked by you.</Text>
							)}

							<TouchableOpacity 
								style={[styles.saveButton, updating && styles.disabledButton]} 
								onPress={handleOverrideRules}
								disabled={updating}
							>
								<Text style={styles.saveButtonText}>
									{updating ? 'Saving...' : 'Override & Lock Rules'}
								</Text>
							</TouchableOpacity>
						</View>
						{/* Tracking Links */}
						<View style={styles.card}>
							<Text style={styles.cardTitle}>📊 Activity Tracking</Text>
							
							<TouchableOpacity 
								style={styles.trackingButton}
								onPress={() => navigation.navigate('GuardianBookings', { studentId: student.id, studentName: student.fullName })}
							>
								<Text style={styles.trackingIcon}>📅</Text>
								<View style={styles.trackingTextContainer}>
									<Text style={styles.trackingTitle}>Requested Visits & Bookings</Text>
									<Text style={styles.trackingSubtitle}>Monitor requested properties and statuses</Text>
								</View>
								<Text style={styles.trackingArrow}>→</Text>
							</TouchableOpacity>

							<TouchableOpacity 
								style={styles.trackingButton}
								onPress={() => navigation.navigate('GuardianPayments', { studentId: student.id, studentName: student.fullName })}
							>
								<Text style={styles.trackingIcon}>💳</Text>
								<View style={styles.trackingTextContainer}>
									<Text style={styles.trackingTitle}>Rent & Utility Payments</Text>
									<Text style={styles.trackingSubtitle}>Review payment proofs and history</Text>
								</View>
								<Text style={styles.trackingArrow}>→</Text>
							</TouchableOpacity>

							<TouchableOpacity 
								style={styles.trackingButton}
								onPress={() => navigation.navigate('GuardianConcerns', { studentId: student.id, studentName: student.fullName })}
							>
								<Text style={styles.trackingIcon}>⚠️</Text>
								<View style={styles.trackingTextContainer}>
									<Text style={styles.trackingTitle}>Maintenance & Safety</Text>
									<Text style={styles.trackingSubtitle}>Track unresolved issues and concerns</Text>
								</View>
								<Text style={styles.trackingArrow}>→</Text>
							</TouchableOpacity>
						</View>
					</View>
				)}
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#F8F9FA' },
	header: {
		backgroundColor: '#2E7D32',
		paddingHorizontal: 20,
		paddingVertical: 16,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	headerContent: { flex: 1 },
	headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
	headerSubtitle: { fontSize: 13, color: '#E8F5E9' },
	logoutButton: { backgroundColor: '#FFFFFF', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6 },
	logoutText: { color: '#2E7D32', fontSize: 12, fontWeight: 'bold' },
	scrollView: { flex: 1, padding: 20 },
	centerContainer: { paddingVertical: 50, alignItems: 'center' },
	loadingText: { marginTop: 10, color: '#2E7D32' },
	emptyState: { padding: 20, alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, marginTop: 20 },
	emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#36454F', marginBottom: 10 },
	emptyText: { textAlign: 'center', color: '#757575', lineHeight: 22 },
	content: { paddingBottom: 40 },
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
		borderTopWidth: 4,
		borderTopColor: '#2E7D32'
	},
	cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#2E7D32', marginBottom: 15 },
	studentName: { fontSize: 22, fontWeight: 'bold', color: '#36454F', marginBottom: 8 },
	detailText: { fontSize: 14, color: '#555', marginBottom: 4 },
	statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#EEEEEE' },
	statusLabel: { fontSize: 14, fontWeight: '600', color: '#36454F', marginRight: 10 },
	statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
	statusVerified: { backgroundColor: '#E8F5E9' },
	statusPending: { backgroundColor: '#FFF3E0' },
	statusText: { fontSize: 11, fontWeight: 'bold', color: '#36454F' },
	helperText: { fontSize: 13, color: '#757575', marginBottom: 20, lineHeight: 20 },
	field: { marginBottom: 15 },
	label: { fontSize: 14, fontWeight: '600', color: '#36454F', marginBottom: 8 },
	marketHintBox: {
		flexDirection: 'row',
		backgroundColor: '#E3F2FD',
		padding: 12,
		borderRadius: 8,
		marginBottom: 16,
		alignItems: 'center',
	},
	marketHintIcon: { fontSize: 18, marginRight: 8 },
	marketHintText: { fontSize: 12, color: '#1565C0', flex: 1, lineHeight: 18 },
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
	lockedText: { color: '#E74C3C', fontSize: 13, fontWeight: 'bold', marginBottom: 15, fontStyle: 'italic' },
	saveButton: {
		backgroundColor: '#2E7D32',
		padding: 15,
		borderRadius: 8,
		alignItems: 'center',
		marginTop: 10,
	},
	disabledButton: { opacity: 0.7 },
	saveButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
	trackingButton: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#F5F7FA',
		padding: 15,
		borderRadius: 10,
		marginBottom: 10,
		borderWidth: 1,
		borderColor: '#E0E0E0'
	},
	trackingIcon: { fontSize: 24, marginRight: 15 },
	trackingTextContainer: { flex: 1 },
	trackingTitle: { fontSize: 15, fontWeight: 'bold', color: '#36454F', marginBottom: 2 },
	trackingSubtitle: { fontSize: 12, color: '#757575' },
	trackingArrow: { fontSize: 20, color: '#2E7D32', fontWeight: 'bold' }
});

export default GuardianDashboard;
