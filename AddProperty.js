import React, { useState } from "react";
import { View, ScrollView, Text, TouchableOpacity, StyleSheet, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createProperty } from "./config/firebase";
import { handleError } from "./utils/errorHandler";

const AddProperty = ({ navigation, route }) => {
	const userId = route?.params?.userId;
	
	const [propertyName, setPropertyName] = useState('');
	const [address, setAddress] = useState('');
	const [monthlyRent, setMonthlyRent] = useState('');
	const [deposit, setDeposit] = useState('');
	const [bedrooms, setBedrooms] = useState('');
	const [bathrooms, setBathrooms] = useState('');
	const [description, setDescription] = useState('');
	const [selectedFacilities, setSelectedFacilities] = useState([]);
	const [selectedTimes, setSelectedTimes] = useState([]);
	const [loading, setLoading] = useState(false);

	const facilities = ['WiFi', 'AC', 'Parking', 'Furnished', 'Kitchen', 'Laundry'];
	const visitTimes = ['10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'];

	const toggleFacility = (facility) => {
		if (selectedFacilities.includes(facility)) {
			setSelectedFacilities(selectedFacilities.filter(f => f !== facility));
		} else {
			setSelectedFacilities([...selectedFacilities, facility]);
		}
	};

	const toggleTime = (time) => {
		if (selectedTimes.includes(time)) {
			setSelectedTimes(selectedTimes.filter(t => t !== time));
		} else {
			setSelectedTimes([...selectedTimes, time]);
		}
	};

	const handlePublish = async () => {
		if (!propertyName || !address || !monthlyRent || !deposit || !bedrooms || !bathrooms || !description) {
			Alert.alert('Missing Fields', 'Please fill all required fields');
			return;
		}

		try {
			setLoading(true);
			await createProperty(userId, {
				name: propertyName,
				address,
				monthlyRent: parseInt(monthlyRent),
				deposit: parseInt(deposit),
				bedrooms: parseInt(bedrooms),
				bathrooms: parseInt(bathrooms),
				description,
				facilities: selectedFacilities,
				visitTimes: selectedTimes,
				status: 'active',
				createdAt: new Date().toISOString(),
				image: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0G0oCbffgQ/conpoajh_expires_30_days.png', // Default image
			});
			Alert.alert('Success', 'Property published successfully!');
			navigation.goBack();
		} catch (err) {
			const errorMsg = handleError(err, 'Add Property');
			Alert.alert('Publication Failed', errorMsg);
		} finally {
			setLoading(false);
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView style={styles.scrollView}>
				<View style={styles.header}>
					<Text style={styles.headerTitle}>Add New Property</Text>
				</View>

				<View style={styles.formContainer}>
					{/* Property Name */}
					<View style={styles.inputGroup}>
						<Text style={styles.label}>Property Name *</Text>
						<TextInput
							style={styles.input}
							placeholder="e.g., Modern Studio Apartment"
							value={propertyName}
							onChangeText={setPropertyName}
							placeholderTextColor="#BDBDBD"
						/>
					</View>

					{/* Address */}
					<View style={styles.inputGroup}>
						<Text style={styles.label}>Address *</Text>
						<TextInput
							style={styles.input}
							placeholder="Full address with city"
							value={address}
							onChangeText={setAddress}
							placeholderTextColor="#BDBDBD"
						/>
					</View>

					{/* Rent and Deposit */}
					<View style={styles.rowContainer}>
						<View style={styles.halfInput}>
							<Text style={styles.label}>Monthly Rent (Rs) *</Text>
							<TextInput
								style={styles.input}
								placeholder="e.g., 25000"
								value={monthlyRent}
								onChangeText={setMonthlyRent}
								keyboardType="numeric"
								placeholderTextColor="#BDBDBD"
							/>
						</View>
						<View style={styles.halfInput}>
							<Text style={styles.label}>Deposit (Rs) *</Text>
							<TextInput
								style={styles.input}
								placeholder="e.g., 50000"
								value={deposit}
								onChangeText={setDeposit}
								keyboardType="numeric"
								placeholderTextColor="#BDBDBD"
							/>
						</View>
					</View>

					{/* Bedrooms and Bathrooms */}
					<View style={styles.rowContainer}>
						<View style={styles.halfInput}>
							<Text style={styles.label}>Bedrooms *</Text>
							<TextInput
								style={styles.input}
								placeholder="e.g., 1"
								value={bedrooms}
								onChangeText={setBedrooms}
								keyboardType="numeric"
								placeholderTextColor="#BDBDBD"
							/>
						</View>
						<View style={styles.halfInput}>
							<Text style={styles.label}>Bathrooms *</Text>
							<TextInput
								style={styles.input}
								placeholder="e.g., 1"
								value={bathrooms}
								onChangeText={setBathrooms}
								keyboardType="numeric"
								placeholderTextColor="#BDBDBD"
							/>
						</View>
					</View>

					{/* Description */}
					<View style={styles.inputGroup}>
						<Text style={styles.label}>Description *</Text>
						<TextInput
							style={[styles.input, styles.textarea]}
							placeholder="Describe your property, features, and nearby amenities..."
							value={description}
							onChangeText={setDescription}
							multiline
							numberOfLines={4}
							placeholderTextColor="#BDBDBD"
						/>
					</View>

					{/* Facilities */}
					<View style={styles.inputGroup}>
						<Text style={styles.label}>Facilities (Select all that apply)</Text>
						<View style={styles.facilitiesContainer}>
							{facilities.map((facility, index) => (
								<TouchableOpacity
									key={index}
									style={[
										styles.facilityButton,
										selectedFacilities.includes(facility) && styles.facilityButtonSelected
									]}
									onPress={() => toggleFacility(facility)}
								>
									<Text style={[
										styles.facilityText,
										selectedFacilities.includes(facility) && styles.facilityTextSelected
									]}>
										{facility}
									</Text>
								</TouchableOpacity>
							))}
						</View>
					</View>

					{/* Visit Times */}
					<View style={styles.inputGroup}>
						<Text style={styles.label}>Set Available Visit Times</Text>
						<View style={styles.timesContainer}>
							{visitTimes.map((time, index) => (
								<TouchableOpacity
									key={index}
									style={[
										styles.timeButton,
										selectedTimes.includes(time) && styles.timeButtonSelected
									]}
									onPress={() => toggleTime(time)}
								>
									<Text style={[
										styles.timeText,
										selectedTimes.includes(time) && styles.timeTextSelected
									]}>
										{time}
									</Text>
								</TouchableOpacity>
							))}
						</View>
					</View>

					{/* Action Buttons */}
					<View style={styles.actionContainer}>
						<TouchableOpacity
							style={[styles.button, loading && styles.buttonDisabled]}
							onPress={handlePublish}
							disabled={loading}
						>
							<Text style={styles.buttonText}>
								{loading ? 'Publishing...' : 'Publish Property'}
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.buttonSecondary}
							onPress={() => navigation.goBack()}
							disabled={loading}
						>
							<Text style={styles.buttonSecondaryText}>Cancel</Text>
						</TouchableOpacity>
					</View>
				</View>
			</ScrollView>
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
		paddingHorizontal: 20,
	},
	header: {
		paddingVertical: 20,
		marginBottom: 20,
	},
	headerTitle: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#36454F',
	},
	formContainer: {
		backgroundColor: '#FFFFFF',
		borderRadius: 12,
		padding: 20,
		marginBottom: 30,
		shadowColor: '#000',
		shadowOpacity: 0.08,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 8,
		elevation: 6,
	},
	inputGroup: {
		marginBottom: 20,
	},
	label: {
		fontSize: 14,
		fontWeight: '600',
		color: '#36454F',
		marginBottom: 8,
	},
	input: {
		backgroundColor: '#F5F7FA',
		borderColor: '#E0E0E0',
		borderRadius: 8,
		borderWidth: 1,
		paddingVertical: 12,
		paddingHorizontal: 14,
		fontSize: 14,
		color: '#36454F',
	},
	textarea: {
		paddingTop: 12,
		paddingBottom: 60,
		textAlignVertical: 'top',
	},
	rowContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 20,
	},
	halfInput: {
		flex: 1,
		marginHorizontal: 5,
	},
	facilitiesContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 10,
	},
	facilityButton: {
		backgroundColor: '#F5F7FA',
		borderColor: '#D3D3D3',
		borderRadius: 20,
		borderWidth: 1,
		paddingVertical: 8,
		paddingHorizontal: 14,
		marginBottom: 8,
	},
	facilityButtonSelected: {
		backgroundColor: '#FFA500',
		borderColor: '#FFA500',
	},
	facilityText: {
		color: '#36454F',
		fontSize: 13,
		fontWeight: '500',
	},
	facilityTextSelected: {
		color: '#FFFFFF',
	},
	timesContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 10,
	},
	timeButton: {
		flex: 1,
		minWidth: '45%',
		backgroundColor: '#F5F7FA',
		borderColor: '#FFA500',
		borderRadius: 8,
		borderWidth: 1,
		paddingVertical: 12,
		alignItems: 'center',
	},
	timeButtonSelected: {
		backgroundColor: '#FFA500',
	},
	timeText: {
		color: '#FFA500',
		fontSize: 13,
		fontWeight: '600',
	},
	timeTextSelected: {
		color: '#FFFFFF',
	},
	actionContainer: {
		flexDirection: 'row',
		gap: 10,
		marginTop: 20,
	},
	button: {
		flex: 1,
		backgroundColor: '#FFA500',
		borderRadius: 8,
		paddingVertical: 14,
		alignItems: 'center',
		shadowColor: '#FFA500',
		shadowOpacity: 0.3,
		shadowOffset: { width: 0, height: 4 },
		shadowRadius: 8,
		elevation: 6,
	},
	buttonDisabled: {
		opacity: 0.6,
		backgroundColor: '#CCCCCC',
	},
	buttonText: {
		color: '#FFFFFF',
		fontSize: 14,
		fontWeight: '700',
	},
	buttonSecondary: {
		flex: 1,
		backgroundColor: '#FFFFFF',
		borderColor: '#FFA500',
		borderRadius: 8,
		borderWidth: 2,
		paddingVertical: 12,
		alignItems: 'center',
	},
	buttonSecondaryText: {
		color: '#FFA500',
		fontSize: 14,
		fontWeight: '700',
	},
});

export default AddProperty;
