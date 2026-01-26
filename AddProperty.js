import React, { useState } from "react";
import { View, ScrollView, Text, TouchableOpacity, StyleSheet, TextInput, Alert, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createProperty } from "./config/firebase";
import { handleError } from "./utils/errorHandler";
import { pickImage, convertToBase64 } from "./utils/imagePicker";

const AddProperty = ({ navigation, route }) => {
	const userId = route?.params?.userId;
	
	const [propertyName, setPropertyName] = useState('');
	const [address, setAddress] = useState('');
	const [monthlyRent, setMonthlyRent] = useState('');
	const [deposit, setDeposit] = useState('');
	const [bedrooms, setBedrooms] = useState('');
	const [bathrooms, setBathrooms] = useState('');
	const [totalTenants, setTotalTenants] = useState('');
	const [availableTenants, setAvailableTenants] = useState('');
	const [description, setDescription] = useState('');
	const [selectedFacilities, setSelectedFacilities] = useState([]);
	const [selectedTimes, setSelectedTimes] = useState([]);
	const [propertyImages, setPropertyImages] = useState([]);
	const [uploadingImages, setUploadingImages] = useState(false);
	const [loading, setLoading] = useState(false);

	const facilities = ['WiFi', 'AC', 'Parking', 'Furnished', 'Kitchen', 'Laundry'];
	const visitTimes = ['10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'];
	const MAX_IMAGES = 5;
	const MIN_IMAGES = 2;

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

	const pickPropertyImage = async () => {
		if (propertyImages.length >= MAX_IMAGES) {
			Alert.alert('Maximum Limit', `You can only add up to ${MAX_IMAGES} images`);
			return;
		}

		try {
			setUploadingImages(true);
			const image = await pickImage();
			
			if (image) {
				// Upload to ImgBB
				const uploadedUrl = await uploadImageToImgBB(image.uri);
				setPropertyImages([...propertyImages, uploadedUrl]);
				Alert.alert('Success', 'Image added successfully');
			}
		} catch (err) {
			const errorMsg = handleError(err, 'Image Upload');
			Alert.alert('Upload Failed', errorMsg);
		} finally {
			setUploadingImages(false);
		}
	};

	const uploadImageToImgBB = async (imageUri) => {
		try {
			const base64String = await convertToBase64(imageUri);
			const apiKey = process.env.EXPO_PUBLIC_IMG_BB_API_KEY || 'ec57b3b05e75c3c3108da45bf5ba9052';
			
			const formData = new FormData();
			formData.append('image', base64String);
			
			const uploadResponse = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
				method: 'POST',
				body: formData,
			});
			
			const uploadData = await uploadResponse.json();
			
			if (uploadData.success) {
				return uploadData.data.url;
			} else {
				throw new Error(uploadData.error.message || 'Image upload failed');
			}
		} catch (err) {
			throw new Error('Image upload error: ' + (err.message || err));
		}
	};

	const removeImage = (index) => {
		const updatedImages = propertyImages.filter((_, i) => i !== index);
		setPropertyImages(updatedImages);
	};

	const handlePublish = async () => {
		if (!propertyName || !address || !monthlyRent || !deposit || !bedrooms || !bathrooms || !description || !totalTenants || !availableTenants) {
			Alert.alert('Missing Fields', 'Please fill all required fields');
			return;
		}

		if (propertyImages.length < MIN_IMAGES) {
			Alert.alert('Insufficient Images', `Please add at least ${MIN_IMAGES} property images`);
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
			await createProperty(userId, {
				name: propertyName,
				address,
				monthlyRent: parseInt(monthlyRent),
				deposit: parseInt(deposit),
				bedrooms: parseInt(bedrooms),
				bathrooms: parseInt(bathrooms),
				totalTenants: total,
				availableTenants: available,
				description,
				facilities: selectedFacilities,
				visitTimes: selectedTimes,
				images: propertyImages,
				image: propertyImages[0] || 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0G0oCbffgQ/conpoajh_expires_30_days.png',
				status: 'active',
				createdAt: new Date().toISOString(),
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

					{/* Tenant Capacity */}
					<View style={styles.rowContainer}>
						<View style={styles.halfInput}>
							<Text style={styles.label}>Total Capacity *</Text>
							<TextInput
								style={styles.input}
								placeholder="e.g., 4"
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
								placeholder="e.g., 2"
								value={availableTenants}
								onChangeText={setAvailableTenants}
								keyboardType="numeric"
								placeholderTextColor="#BDBDBD"
							/>
						</View>
					</View>
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

					{/* Property Images */}
					<View style={styles.inputGroup}>
						<View style={styles.labelContainer}>
							<Text style={styles.label}>Property Photos *</Text>
							<Text style={styles.imageCounter}>{propertyImages.length}/{MAX_IMAGES}</Text>
						</View>
						<Text style={styles.imageHint}>Add at least {MIN_IMAGES} images (up to {MAX_IMAGES})</Text>

						{/* Image Thumbnails */}
						{propertyImages.length > 0 && (
							<View style={styles.imageThumbnailsContainer}>
								{propertyImages.map((imageUri, index) => (
									<View key={index} style={styles.imageThumbnailWrapper}>
										<Image
											source={{ uri: imageUri }}
											style={styles.imageThumbnail}
										/>
										<TouchableOpacity
											style={styles.removeImageButton}
											onPress={() => removeImage(index)}
										>
											<Text style={styles.removeImageText}>✕</Text>
										</TouchableOpacity>
									</View>
								))}
							</View>
						)}

						{/* Upload Button */}
						<TouchableOpacity
							style={[styles.uploadButton, uploadingImages && styles.uploadButtonDisabled]}
							onPress={pickPropertyImage}
							disabled={uploadingImages || propertyImages.length >= MAX_IMAGES}
						>
							{uploadingImages ? (
								<ActivityIndicator size="small" color="#FFA500" />
							) : (
								<>
									<Text style={styles.uploadButtonText}>📷 Add Image</Text>
									<Text style={styles.uploadButtonSubtext}>
										{propertyImages.length >= MAX_IMAGES ? 'Maximum images reached' : `${MAX_IMAGES - propertyImages.length} more`}
									</Text>
								</>
							)}
						</TouchableOpacity>
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
	labelContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 8,
	},
	imageCounter: {
		fontSize: 12,
		fontWeight: '600',
		color: '#FFA500',
		backgroundColor: '#FFF3E0',
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 12,
	},
	imageHint: {
		fontSize: 12,
		color: '#999999',
		marginBottom: 12,
		fontStyle: 'italic',
	},
	imageThumbnailsContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 10,
		marginBottom: 16,
	},
	imageThumbnailWrapper: {
		position: 'relative',
		width: '23%',
		aspectRatio: 1,
	},
	imageThumbnail: {
		width: '100%',
		height: '100%',
		borderRadius: 8,
		backgroundColor: '#E0E0E0',
	},
	removeImageButton: {
		position: 'absolute',
		top: -8,
		right: -8,
		width: 28,
		height: 28,
		borderRadius: 14,
		backgroundColor: '#FF5252',
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: '#000',
		shadowOpacity: 0.3,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 4,
		elevation: 4,
	},
	removeImageText: {
		color: '#FFFFFF',
		fontSize: 16,
		fontWeight: 'bold',
	},
	uploadButton: {
		backgroundColor: '#F5F7FA',
		borderColor: '#FFA500',
		borderRadius: 8,
		borderWidth: 2,
		borderStyle: 'dashed',
		paddingVertical: 20,
		paddingHorizontal: 16,
		alignItems: 'center',
		justifyContent: 'center',
	},
	uploadButtonDisabled: {
		opacity: 0.6,
		backgroundColor: '#EFEFEF',
		borderColor: '#CCCCCC',
	},
	uploadButtonText: {
		fontSize: 16,
		fontWeight: '600',
		color: '#FFA500',
		marginBottom: 4,
	},
	uploadButtonSubtext: {
		fontSize: 12,
		color: '#999999',
		fontWeight: '500',
	},
});

export default AddProperty;
