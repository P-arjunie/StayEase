import React, { useState } from "react";
import { View, ScrollView, Text, TouchableOpacity, StyleSheet, TextInput, Alert, ActivityIndicator, Switch, KeyboardAvoidingView, Platform } from "react-native";
import Toast from 'react-native-toast-message';
import { SafeAreaView } from "react-native-safe-area-context";
import { updateProperty } from "./config/firebase";
import { handleError } from "./utils/errorHandler";

const EditProperty = ({ navigation, route }) => {
	const { property } = route.params;
	const userId = route?.params?.userId;

	const [propertyName, setPropertyName] = useState(property.name);
	const [address, setAddress] = useState(property.address);
	const [monthlyRent, setMonthlyRent] = useState(String(property.monthlyRent));
	const [deposit, setDeposit] = useState(String(property.deposit));
	const [bedrooms, setBedrooms] = useState(String(property.bedrooms));
	const [bathrooms, setBathrooms] = useState(String(property.bathrooms));
	const [totalTenants, setTotalTenants] = useState(String(property.totalTenants || ''));
	const [availableTenants, setAvailableTenants] = useState(String(property.availableTenants || ''));
	const [description, setDescription] = useState(property.description);
	const [isActive, setIsActive] = useState(property.status === 'active');
	const [loading, setLoading] = useState(false);

	const handleSave = async () => {
		if (!propertyName || !address || !monthlyRent || !deposit || !bedrooms || !bathrooms || !description || !totalTenants || !availableTenants) {
			Alert.alert('Missing Fields', 'Please fill all required fields');
			return;
		}

		const total = parseInt(totalTenants);
		const available = parseInt(availableTenants);

		if (available > total) {
			Alert.alert('Invalid Capacity', 'Available tenants cannot exceed total capacity');
			return;
		}

		try {
			setLoading(true);
			await updateProperty(userId, property.id, {
				name: propertyName,
				address,
				monthlyRent: parseInt(monthlyRent),
				deposit: parseInt(deposit),
				bedrooms: parseInt(bedrooms),
				bathrooms: parseInt(bathrooms),
				totalTenants: total,
				availableTenants: available,
				description,
				status: isActive ? 'active' : 'inactive',
				updatedAt: new Date().toISOString(),
			});
			Toast.show({ type: 'success', text1: 'Success', text2: 'Property updated successfully!' });
			navigation.goBack();
		} catch (err) {
			const errorMsg = handleError(err, 'Update Property');
			Alert.alert('Update Failed', errorMsg);
		} finally {
			setLoading(false);
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<KeyboardAvoidingView 
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				style={{ flex: 1 }}
			>
				<ScrollView style={styles.scrollView}>
					<View style={styles.header}>
						<Text style={styles.headerTitle}>Edit Property</Text>
					</View>

					<View style={styles.formContainer}>
						{/* Property Name */}
						<View style={styles.inputGroup}>
							<Text style={styles.label}>Property Name *</Text>
							<TextInput
								style={styles.input}
								placeholder="Property name"
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
									placeholder="25000"
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
									placeholder="50000"
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
									placeholder="1"
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
									placeholder="1"
									value={bathrooms}
									onChangeText={setBathrooms}
									keyboardType="numeric"
									placeholderTextColor="#BDBDBD"
								/>
							</View>
						</View>

						{/* Tenant Capacity */}
						<View style={styles.rowContainer}>
							<View style={styles.halfInput}>
								<Text style={styles.label}>Total Capacity *</Text>
								<TextInput
									style={styles.input}
									placeholder="4"
									value={totalTenants}
									onChangeText={setTotalTenants}
									keyboardType="numeric"
									placeholderTextColor="#BDBDBD"
								/>
							</View>
							<View style={styles.halfInput}>
								<Text style={styles.label}>Available Slots *</Text>
								<TextInput
									style={styles.input}
									placeholder="2"
									value={availableTenants}
									onChangeText={setAvailableTenants}
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
								placeholder="Property description"
								value={description}
								onChangeText={setDescription}
								multiline
								numberOfLines={4}
								placeholderTextColor="#BDBDBD"
							/>
						</View>

						{/* Status Toggle */}
						<View style={styles.inputGroup}>
							<View style={styles.toggleContainer}>
								<View>
									<Text style={styles.label}>Listing Status</Text>
									<Text style={styles.toggleSubtext}>
										{isActive ? 'Property is visible to students' : 'Property is hidden from searches'}
									</Text>
								</View>
								<Switch
									trackColor={{ false: "#767577", true: "#FFA500" }}
									thumbColor={isActive ? "#FFFFFF" : "#f4f3f4"}
									ios_backgroundColor="#3e3e3e"
									onValueChange={setIsActive}
									value={isActive}
								/>
							</View>
						</View>

						{/* Action Buttons */}
						<View style={styles.actionContainer}>
							<TouchableOpacity
								style={[styles.button, loading && styles.buttonDisabled]}
								onPress={handleSave}
								disabled={loading}
							>
								<Text style={styles.buttonText}>
									{loading ? 'Saving...' : 'Save Changes'}
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
			</KeyboardAvoidingView>
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
	toggleContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		backgroundColor: '#F5F7FA',
		padding: 14,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: '#E0E0E0',
	},
	toggleSubtext: {
		fontSize: 12,
		color: '#757575',
		marginTop: 4,
	},
});

export default EditProperty;
