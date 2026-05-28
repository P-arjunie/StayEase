import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { collection, getDocs } from 'firebase/firestore';
import { db } from "./config/firebase";

const BrowseProperties = ({ navigation }) => {
	const [properties, setProperties] = useState([]);
	const [filteredProperties, setFilteredProperties] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');

	useEffect(() => {
		loadAllProperties();
	}, []);

	const loadAllProperties = async () => {
		try {
			setLoading(true);
			const allProperties = [];

			// Get all documents from users collection to find landlords
			const usersSnapshot = await getDocs(collection(db, 'users'));
			console.log('Users found:', usersSnapshot.docs.length);

			// For each user who is a landlord, get their properties
			for (const userDoc of usersSnapshot.docs) {
				const userData = userDoc.data();
				
				// Only process landlords
				if (userData.role !== 'landlord') {
					continue;
				}

				console.log(`Processing landlord: ${userDoc.id}`);
				
				try {
					const propertiesSnapshot = await getDocs(
						collection(db, 'landlords', userDoc.id, 'properties')
					);

					console.log(`Properties for landlord ${userDoc.id}:`, propertiesSnapshot.docs.length);

					propertiesSnapshot.forEach(propDoc => {
						const propertyData = propDoc.data();
						console.log('Property data:', propertyData);
						allProperties.push({
							id: propDoc.id,
							landlordId: userDoc.id,
							...propertyData,
						});
					});
				} catch (err) {
					console.log(`No properties found for landlord ${userDoc.id}:`, err.message);
				}
			}

			console.log('Total properties loaded:', allProperties.length);

			// Filter only active properties with available slots
			const activeProperties = allProperties.filter(p => {
				const isActive = p.status === 'active';
				const hasAvailable = (p.availableTenants || 0) > 0;
				console.log(`Property ${p.name}: active=${isActive}, available=${hasAvailable}`);
				return isActive && hasAvailable;
			});

			console.log('Active properties with availability:', activeProperties.length);
			
			// If no active properties found, show all properties for debugging
			const propertiesToShow = activeProperties.length > 0 ? activeProperties : allProperties;
			setProperties(propertiesToShow);
			setFilteredProperties(propertiesToShow);
		} catch (error) {
			console.error('Error loading properties:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleSearch = (query) => {
		setSearchQuery(query);
		if (query.trim() === '') {
			setFilteredProperties(properties);
		} else {
			const filtered = properties.filter(p =>
				p.name.toLowerCase().includes(query.toLowerCase()) ||
				p.address.toLowerCase().includes(query.toLowerCase())
			);
			setFilteredProperties(filtered);
		}
	};

	const handleViewProperty = (property) => {
		navigation.navigate('PropertyDetail', { property });
	};

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
				{/* Header */}
				<View style={styles.header}>
					<Text style={styles.headerTitle}>Browse Properties</Text>
					<Text style={styles.headerSubtitle}>Find your perfect accommodation</Text>
				</View>

				{/* Search Bar */}
				<View style={styles.searchContainer}>
					<TextInput
						style={styles.searchInput}
						placeholder="Search by name or location..."
						value={searchQuery}
						onChangeText={handleSearch}
						placeholderTextColor="#BDBDBD"
					/>
					<Text style={styles.searchIcon}>🔍</Text>
				</View>

				{/* Properties Count */}
				<View style={styles.countContainer}>
					<Text style={styles.countText}>
						{filteredProperties.length} properties available
					</Text>
				</View>

				{/* Loading State */}
				{loading ? (
					<View style={styles.centerContainer}>
						<ActivityIndicator size="large" color="#FFA500" />
						<Text style={styles.loadingText}>Loading properties...</Text>
					</View>
				) : filteredProperties.length === 0 ? (
					<View style={styles.emptyState}>
						<Text style={styles.emptyIcon}>🏠</Text>
						<Text style={styles.emptyText}>
							{properties.length === 0 ? 'No properties available yet' : 'No properties match your search'}
						</Text>
						<Text style={styles.emptySubtext}>
							{properties.length === 0 ? 'Check back soon!' : 'Try adjusting your search'}
						</Text>
					</View>
				) : (
					<View style={styles.propertiesContainer}>
						{filteredProperties.map((property, index) => (
							<TouchableOpacity
								key={index}
								style={styles.propertyCard}
								onPress={() => handleViewProperty(property)}
								activeOpacity={0.9}
							>
								<Image
									source={{ uri: property.image || "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0G0oCbffgQ/conpoajh_expires_30_days.png" }}
									resizeMode="cover"
									style={styles.propertyImage}
								/>

								{/* Available Badge */}
								<View style={styles.availableBadge}>
									<Text style={styles.availableText}>
										{property.availableTenants} Available
									</Text>
								</View>

								<View style={styles.propertyContent}>
									<Text style={styles.propertyName}>{property.name}</Text>
									<Text style={styles.propertyLocation}>📍 {property.address}</Text>

									<View style={styles.propertyMetaRow}>
										<View style={styles.metaItem}>
											<Text style={styles.metaIcon}>🛏️</Text>
											<Text style={styles.metaText}>{property.bedrooms} Bed</Text>
										</View>
										<View style={styles.metaItem}>
											<Text style={styles.metaIcon}>🚿</Text>
											<Text style={styles.metaText}>{property.bathrooms} Bath</Text>
										</View>
										<View style={styles.metaItem}>
											<Text style={styles.metaIcon}>👥</Text>
											<Text style={styles.metaText}>{property.availableTenants}/{property.totalTenants}</Text>
										</View>
									</View>

									<Text style={styles.propertyPrice}>
										Rs {property.monthlyRent?.toLocaleString()}/month
									</Text>

									<TouchableOpacity
										style={styles.viewButton}
										onPress={() => handleViewProperty(property)}
									>
										<Text style={styles.viewButtonText}>View Details</Text>
									</TouchableOpacity>
								</View>
							</TouchableOpacity>
						))}
					</View>
				)}
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
	},
	header: {
		paddingHorizontal: 20,
		paddingVertical: 20,
	},
	headerTitle: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#36454F',
		marginBottom: 4,
	},
	headerSubtitle: {
		fontSize: 14,
		color: '#757575',
	},
	searchContainer: {
		paddingHorizontal: 20,
		marginBottom: 16,
		position: 'relative',
	},
	searchInput: {
		backgroundColor: '#FFFFFF',
		borderColor: '#E0E0E0',
		borderRadius: 10,
		borderWidth: 1,
		paddingVertical: 12,
		paddingHorizontal: 14,
		paddingRight: 40,
		fontSize: 14,
		color: '#36454F',
	},
	searchIcon: {
		position: 'absolute',
		right: 32,
		top: 12,
		fontSize: 18,
	},
	countContainer: {
		paddingHorizontal: 20,
		marginBottom: 12,
	},
	countText: {
		fontSize: 13,
		color: '#757575',
		fontWeight: '500',
	},
	centerContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 60,
	},
	loadingText: {
		marginTop: 12,
		fontSize: 14,
		color: '#757575',
	},
	emptyState: {
		alignItems: 'center',
		paddingVertical: 60,
	},
	emptyIcon: {
		fontSize: 56,
		marginBottom: 12,
	},
	emptyText: {
		fontSize: 16,
		fontWeight: '600',
		color: '#36454F',
		marginBottom: 6,
	},
	emptySubtext: {
		fontSize: 13,
		color: '#757575',
	},
	propertiesContainer: {
		paddingHorizontal: 20,
		paddingBottom: 20,
	},
	propertyCard: {
		backgroundColor: '#FFFFFF',
		borderRadius: 12,
		marginBottom: 16,
		overflow: 'hidden',
		shadowColor: '#000',
		shadowOpacity: 0.08,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 8,
		elevation: 3,
	},
	propertyImage: {
		width: '100%',
		height: 180,
		backgroundColor: '#E0E0E0',
	},
	availableBadge: {
		position: 'absolute',
		top: 12,
		right: 12,
		backgroundColor: '#FFA500',
		paddingVertical: 8,
		paddingHorizontal: 12,
		borderRadius: 8,
	},
	availableText: {
		color: '#FFFFFF',
		fontSize: 12,
		fontWeight: 'bold',
	},
	propertyContent: {
		padding: 14,
	},
	propertyName: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#36454F',
		marginBottom: 4,
	},
	propertyLocation: {
		fontSize: 13,
		color: '#757575',
		marginBottom: 10,
	},
	propertyMetaRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 10,
	},
	metaItem: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	metaIcon: {
		fontSize: 16,
	},
	metaText: {
		fontSize: 12,
		color: '#757575',
		fontWeight: '500',
	},
	propertyPrice: {
		fontSize: 15,
		fontWeight: 'bold',
		color: '#FFA500',
		marginBottom: 10,
	},
	viewButton: {
		backgroundColor: '#FFA500',
		paddingVertical: 10,
		borderRadius: 8,
		alignItems: 'center',
	},
	viewButtonText: {
		color: '#FFFFFF',
		fontSize: 13,
		fontWeight: 'bold',
	},
});

export default BrowseProperties;
