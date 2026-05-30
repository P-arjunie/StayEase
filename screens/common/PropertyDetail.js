/**
 * @file PropertyDetail.js
 * @description Shows in-depth details, images, and actions for a specific property.
 * 
 * @module screens/common/PropertyDetail
 */

import React, { useState } from "react";
import { View, ScrollView, Text, TouchableOpacity, StyleSheet, Image, Dimensions, Alert, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../../config/firebase";
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

/**
 * Main Component: PropertyDetail
 * @param {object} props - Component props
 * @param {object} props.navigation - React Navigation object
 */
const PropertyDetail = ({ navigation, route }) => {
	const { property, landlordId } = route.params;
	const [currentImageIndex, setCurrentImageIndex] = useState(0);

	const images = property.images || [property.image];
	const occupiedSlots = (property.totalTenants || 0) - (property.availableTenants || 0);
	const currentUserId = auth.currentUser?.uid;
	// Use landlordId from route params first, then fall back to property.landlordId
	const propertyLandlordId = landlordId || property.landlordId;
	const isLandlord = propertyLandlordId && currentUserId === propertyLandlordId;

	const [showPicker, setShowPicker] = useState(false);
	const [pickerMode, setPickerMode] = useState('date');
	const [visitDate, setVisitDate] = useState(new Date());
	const [dateSelected, setDateSelected] = useState(false);
	const [showVisitWarning, setShowVisitWarning] = useState(false);

	const handleEdit = () => {
		navigation.navigate('EditProperty', { property, userId: currentUserId });
	};

	const handleBack = () => {
		navigation.goBack();
	};

	const handleRequestVisit = async () => {
		if (!dateSelected) {
			setPickerMode('date');
			setShowPicker(true);
			return;
		}

		try {
			await addDoc(collection(db, 'visits'), {
				propertyId: property.id,
				propertyName: property.name,
				landlordId: propertyLandlordId,
				studentId: currentUserId,
				visitDate: visitDate.toISOString(),
				status: 'pending',
				createdAt: new Date().toISOString()
			});
			Toast.show({ type: 'success', text1: 'Success', text2: 'Visit requested successfully!' });
			setDateSelected(false);
		} catch (e) {
			Alert.alert('Error', 'Failed to request visit.');
		}
	};

	const onDateChange = (event, selectedDate) => {
		setShowPicker(false);
		if (selectedDate) {
			setVisitDate(selectedDate);
			if (pickerMode === 'date') {
				setPickerMode('time');
				setTimeout(() => setShowPicker(true), 300);
			} else {
				setDateSelected(true);
				Alert.alert('Date & Time Selected', 'Press "Request Visit" again to confirm booking.');
			}
		}
	};

	const handleRequestBooking = async () => {
		try {
			// Check for visit first
			const vq = query(collection(db, 'visits'), where('studentId', '==', currentUserId), where('propertyId', '==', property.id));
			const vSnap = await getDocs(vq);
			
			if (vSnap.empty) {
				setShowVisitWarning(true);
				return;
			}
			
			await proceedWithBooking();
		} catch (e) {
			console.error(e);
			Alert.alert('Error', 'Failed to check visit status.');
		}
	};

	const proceedWithBooking = async () => {
		try {
			setShowVisitWarning(false);
			await addDoc(collection(db, 'bookings'), {
				propertyId: property.id,
				propertyName: property.name,
				landlordId: propertyLandlordId,
				studentId: currentUserId,
				status: 'pending',
				createdAt: new Date().toISOString()
			});
			Toast.show({ type: 'success', text1: 'Success', text2: 'Booking requested successfully!' });
		} catch (e) {
			Alert.alert('Error', 'Failed to request booking.');
		}
	};

	const handleMarkVisitAndBook = async () => {
		try {
			// Mark as visited now (auto approved)
			await addDoc(collection(db, 'visits'), {
				propertyId: property.id,
				propertyName: property.name,
				landlordId: propertyLandlordId,
				studentId: currentUserId,
				visitDate: new Date().toISOString(),
				status: 'approved', 
				createdAt: new Date().toISOString()
			});
			await proceedWithBooking();
		} catch (e) {
			Alert.alert('Error', 'Failed to mark visit.');
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
				{/* Image Carousel */}
				<View style={styles.imageCarousel}>
					<ScrollView
						horizontal
						pagingEnabled
						showsHorizontalScrollIndicator={false}
						onMomentumScrollEnd={(e) => {
							const index = Math.round(e.nativeEvent.contentOffset.x / width);
							setCurrentImageIndex(index);
						}}
						scrollEventThrottle={16}
					>
						{images.map((image, index) => (
							<Image
								key={index}
								source={{ uri: image }}
								style={[styles.propertyImage, { width: width - 40 }]}
								resizeMode="cover"
							/>
						))}
					</ScrollView>

					{/* Image Counter */}
					<View style={styles.imageCounter}>
						<Text style={styles.imageCounterText}>
							{currentImageIndex + 1} / {images.length}
						</Text>
					</View>
				</View>

				{/* Property Header */}
				<View style={styles.header}>
					<View style={styles.headerTop}>
						<View style={styles.titleSection}>
							<Text style={styles.propertyName}>{property.name}</Text>
							<Text style={styles.propertyLocation}>📍 {property.address}</Text>
						</View>
						<View style={styles.headerBadges}>
							<View style={[styles.statusBadge, property.status === 'active' ? styles.activeBadge : styles.inactiveBadge]}>
								<Text style={styles.statusText}>
									{property.status === 'active' ? '✓ Active' : '○ Inactive'}
								</Text>
							</View>
							<View style={styles.availableBadge}>
								<Text style={styles.availableBadgeText}>
									{property.availableTenants} Available
								</Text>
							</View>
						</View>
					</View>
					<Text style={styles.propertyPrice}>Rs {property.monthlyRent?.toLocaleString()}/month</Text>
				</View>

				{/* Key Details Grid */}
				<View style={styles.detailsGrid}>
					<View style={styles.detailCard}>
						<Text style={styles.detailIcon}>🛏️</Text>
						<Text style={styles.detailValue}>{property.bedrooms}</Text>
						<Text style={styles.detailLabel}>Bedrooms</Text>
					</View>
					<View style={styles.detailCard}>
						<Text style={styles.detailIcon}>🚿</Text>
						<Text style={styles.detailValue}>{property.bathrooms}</Text>
						<Text style={styles.detailLabel}>Bathrooms</Text>
					</View>
					<View style={styles.detailCard}>
						<Text style={styles.detailIcon}>👥</Text>
						<Text style={styles.detailValue}>{property.totalTenants}</Text>
						<Text style={styles.detailLabel}>Total Capacity</Text>
					</View>
					<View style={styles.detailCard}>
						<Text style={styles.detailIcon}>✨</Text>
						<Text style={styles.detailValue}>{property.availableTenants}</Text>
						<Text style={styles.detailLabel}>Available</Text>
					</View>
				</View>

				{/* Occupancy Status */}
				<View style={styles.occupancySection}>
					<Text style={styles.sectionTitle}>Occupancy Status</Text>
					<View style={styles.occupancyBar}>
						<View
							style={[
								styles.occupancyFilled,
								{
									width: `${(occupiedSlots / (property.totalTenants || 1)) * 100}%`,
								},
							]}
						/>
					</View>
					<Text style={styles.occupancyText}>
						{occupiedSlots} occupied • {property.availableTenants} available
					</Text>
				</View>

				{/* Financial Details */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Financial Details</Text>
					<View style={styles.detailRow}>
						<Text style={styles.detailRowLabel}>Monthly Rent:</Text>
						<Text style={styles.detailRowValue}>Rs {property.monthlyRent?.toLocaleString()}</Text>
					</View>
					<View style={styles.detailRow}>
						<Text style={styles.detailRowLabel}>Security Deposit:</Text>
						<Text style={styles.detailRowValue}>Rs {property.deposit?.toLocaleString()}</Text>
					</View>
				</View>

				{/* Description */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Description</Text>
					<Text style={styles.descriptionText}>{property.description}</Text>
				</View>

				{/* Facilities */}
				{property.facilities && property.facilities.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Facilities</Text>
						<View style={styles.facilitiesList}>
							{property.facilities.map((facility, index) => (
								<View key={index} style={styles.facilityTag}>
									<Text style={styles.facilityTagText}>{facility}</Text>
								</View>
							))}
						</View>
					</View>
				)}

				{/* Visit Times */}
				{property.visitTimes && property.visitTimes.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Available Visit Times</Text>
						<View style={styles.visitTimesList}>
							{property.visitTimes.map((time, index) => (
								<View key={index} style={styles.visitTimeTag}>
									<Text style={styles.visitTimeText}>🕐 {time}</Text>
								</View>
							))}
						</View>
					</View>
				)}

				{/* Action Buttons */}
				<View style={styles.actionButtons}>
					{isLandlord ? (
						<TouchableOpacity style={styles.editButton} onPress={handleEdit}>
							<Text style={styles.editButtonText}>✎ Edit Property</Text>
						</TouchableOpacity>
					) : (
						<View style={styles.studentActions}>
							<TouchableOpacity style={styles.visitButton} onPress={handleRequestVisit}>
								<Text style={styles.visitButtonText}>📅 Request Visit</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.bookButton} onPress={handleRequestBooking}>
								<Text style={styles.bookButtonText}>🏠 Request Booking</Text>
							</TouchableOpacity>
						</View>
					)}
					<TouchableOpacity 
						style={[styles.backButton, !isLandlord && styles.backButtonFull]} 
						onPress={handleBack}
					>
						<Text style={styles.backButtonText}>← Back</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>

			{showVisitWarning && (
				<Modal visible={showVisitWarning} transparent={true} animationType="fade">
					<View style={styles.modalOverlay}>
						<View style={styles.warningModalContent}>
							<Text style={styles.warningModalTitle}>⚠️ Precaution Check</Text>
							<Text style={styles.warningModalText}>
								It appears you have not recorded a physical visit to this property yet. For your safety, we highly recommend visiting the property before booking.
							</Text>
							<Text style={styles.warningModalText}>
								Have you already visited this property in person?
							</Text>
							
							<TouchableOpacity style={styles.primaryModalButton} onPress={handleMarkVisitAndBook}>
								<Text style={styles.primaryModalButtonText}>Yes, I have visited it</Text>
							</TouchableOpacity>
							
							<TouchableOpacity style={styles.secondaryModalButton} onPress={proceedWithBooking}>
								<Text style={styles.secondaryModalButtonText}>No, but Request Booking anyway</Text>
							</TouchableOpacity>
							
							<TouchableOpacity style={styles.cancelModalButton} onPress={() => setShowVisitWarning(false)}>
								<Text style={styles.cancelModalButtonText}>Cancel</Text>
							</TouchableOpacity>
						</View>
					</View>
				</Modal>
			)}

			{showPicker && (
				<DateTimePicker
					value={visitDate}
					mode={pickerMode}
					is24Hour={false}
					display="default"
					onChange={onDateChange}
					minimumDate={new Date()}
				/>
			)}
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F8F9FA',
	},
	scrollView: {
		flex: 1,
	},
	imageCarousel: {
		position: 'relative',
		marginBottom: 20,
	},
	propertyImage: {
		height: 300,
		marginHorizontal: 20,
		borderRadius: 12,
		backgroundColor: '#E0E0E0',
	},
	imageCounter: {
		position: 'absolute',
		bottom: 12,
		right: 32,
		backgroundColor: 'rgba(0,0,0,0.6)',
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 16,
	},
	imageCounterText: {
		color: '#FFFFFF',
		fontSize: 12,
		fontWeight: '600',
	},
	header: {
		paddingHorizontal: 20,
		marginBottom: 20,
	},
	headerTop: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		marginBottom: 8,
	},
	titleSection: {
		flex: 1,
	},
	propertyName: {
		fontSize: 22,
		fontWeight: '700',
		color: '#36454F',
		marginBottom: 4,
	},
	propertyLocation: {
		fontSize: 14,
		color: '#757575',
	},
	headerBadges: {
		flexDirection: 'column',
		gap: 8,
		alignItems: 'flex-end',
	},
	statusBadge: {
		paddingVertical: 6,
		paddingHorizontal: 12,
		borderRadius: 12,
	},
	activeBadge: {
		backgroundColor: '#E8F5E9',
	},
	inactiveBadge: {
		backgroundColor: '#FCE4EC',
	},
	statusText: {
		fontSize: 12,
		fontWeight: '600',
		color: '#36454F',
	},
	availableBadge: {
		backgroundColor: '#FFA500',
		paddingVertical: 8,
		paddingHorizontal: 14,
		borderRadius: 8,
		minWidth: 110,
		alignItems: 'center',
	},
	availableBadgeText: {
		fontSize: 13,
		fontWeight: 'bold',
		color: '#FFFFFF',
	},
	propertyPrice: {
		fontSize: 20,
		fontWeight: 'bold',
		color: '#FFA500',
	},
	detailsGrid: {
		paddingHorizontal: 20,
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 12,
		marginBottom: 20,
	},
	detailCard: {
		flex: 1,
		minWidth: '22%',
		backgroundColor: '#FFFFFF',
		borderRadius: 12,
		paddingVertical: 14,
		paddingHorizontal: 10,
		alignItems: 'center',
		shadowColor: '#000',
		shadowOpacity: 0.08,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 8,
		elevation: 3,
	},
	detailIcon: {
		fontSize: 24,
		marginBottom: 4,
	},
	detailValue: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#FFA500',
	},
	detailLabel: {
		fontSize: 10,
		color: '#757575',
		marginTop: 4,
		textAlign: 'center',
	},
	occupancySection: {
		paddingHorizontal: 20,
		marginBottom: 24,
		backgroundColor: '#FFFFFF',
		paddingVertical: 16,
		borderRadius: 12,
		marginHorizontal: 20,
		shadowColor: '#000',
		shadowOpacity: 0.08,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 8,
		elevation: 3,
	},
	section: {
		paddingHorizontal: 20,
		marginBottom: 20,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#36454F',
		marginBottom: 12,
	},
	occupancyBar: {
		height: 8,
		backgroundColor: '#E0E0E0',
		borderRadius: 4,
		overflow: 'hidden',
		marginBottom: 8,
	},
	occupancyFilled: {
		height: '100%',
		backgroundColor: '#FFA500',
	},
	occupancyText: {
		fontSize: 12,
		color: '#757575',
		fontWeight: '500',
	},
	detailRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingVertical: 10,
		borderBottomWidth: 1,
		borderBottomColor: '#E0E0E0',
	},
	detailRowLabel: {
		fontSize: 14,
		color: '#757575',
		fontWeight: '500',
	},
	detailRowValue: {
		fontSize: 14,
		fontWeight: 'bold',
		color: '#36454F',
	},
	descriptionText: {
		fontSize: 14,
		color: '#757575',
		lineHeight: 20,
	},
	facilitiesList: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	facilityTag: {
		backgroundColor: '#FFA500',
		paddingVertical: 6,
		paddingHorizontal: 12,
		borderRadius: 16,
	},
	facilityTagText: {
		color: '#FFFFFF',
		fontSize: 12,
		fontWeight: '600',
	},
	visitTimesList: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	visitTimeTag: {
		backgroundColor: '#F5F7FA',
		borderColor: '#FFA500',
		borderWidth: 1,
		paddingVertical: 8,
		paddingHorizontal: 12,
		borderRadius: 8,
	},
	visitTimeText: {
		color: '#FFA500',
		fontSize: 13,
		fontWeight: '600',
	},
	actionButtons: {
		paddingHorizontal: 20,
		paddingVertical: 20,
		gap: 10,
	},
	editButton: {
		backgroundColor: '#FFA500',
		paddingVertical: 14,
		borderRadius: 8,
		alignItems: 'center',
		shadowColor: '#FFA500',
		shadowOpacity: 0.3,
		shadowOffset: { width: 0, height: 4 },
		shadowRadius: 8,
		elevation: 6,
	},
	editButtonText: {
		color: '#FFFFFF',
		fontSize: 15,
		fontWeight: 'bold',
	},
	studentActions: {
		flexDirection: 'row',
		gap: 10,
		marginBottom: 10,
	},
	visitButton: {
		flex: 1,
		backgroundColor: '#FFFFFF',
		borderColor: '#FFA500',
		borderWidth: 2,
		paddingVertical: 14,
		borderRadius: 8,
		alignItems: 'center',
	},
	visitButtonText: {
		color: '#FFA500',
		fontSize: 14,
		fontWeight: 'bold',
	},
	bookButton: {
		flex: 1,
		backgroundColor: '#FFA500',
		paddingVertical: 14,
		borderRadius: 8,
		alignItems: 'center',
		shadowColor: '#FFA500',
		shadowOpacity: 0.3,
		shadowOffset: { width: 0, height: 4 },
		shadowRadius: 8,
		elevation: 6,
	},
	bookButtonText: {
		color: '#FFFFFF',
		fontSize: 14,
		fontWeight: 'bold',
	},
	backButton: {
		backgroundColor: '#FFFFFF',
		borderColor: '#E0E0E0',
		borderWidth: 2,
		paddingVertical: 12,
		borderRadius: 8,
		alignItems: 'center',
		flex: 1,
	},
	backButtonFull: {
		flex: 1,
	},
	backButtonText: {
		color: '#FFA500',
		fontSize: 15,
		fontWeight: 'bold',
	},
	modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
	warningModalContent: { backgroundColor: '#FFF', padding: 25, borderRadius: 12, width: '85%', elevation: 5 },
	warningModalTitle: { fontSize: 20, fontWeight: 'bold', color: '#D32F2F', marginBottom: 15, textAlign: 'center' },
	warningModalText: { fontSize: 14, color: '#333', marginBottom: 15, lineHeight: 20, textAlign: 'center' },
	primaryModalButton: { backgroundColor: '#4CAF50', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
	primaryModalButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
	secondaryModalButton: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#FFA500', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
	secondaryModalButtonText: { color: '#FFA500', fontWeight: 'bold', fontSize: 14 },
	cancelModalButton: { padding: 10, alignItems: 'center' },
	cancelModalButtonText: { color: '#757575', fontWeight: 'bold' },
});

export default PropertyDetail;
