import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "./config/firebase";
import { getLandlordProperties } from "./config/firebase";

const LandlordDashboard = ({ navigation }) => {
	const [properties, setProperties] = useState([]);
	const [loading, setLoading] = useState(true);
	const [stats, setStats] = useState({
		activeProperties: 0,
		pendingVisits: 0,
		unresolvedIssues: 0,
		totalTenants: 0,
	});

	useEffect(() => {
		loadProperties();
		const unsubscribe = navigation.addListener('focus', loadProperties);
		return unsubscribe;
	}, [navigation]);

	const loadProperties = async () => {
		try {
			setLoading(true);
			const userId = auth.currentUser?.uid;
			if (userId) {
				const landlordProperties = await getLandlordProperties(userId);
				setProperties(landlordProperties);
				
				// Update stats based on properties
				const activeCount = landlordProperties.filter(p => p.status === 'active').length;
				setStats({
					activeProperties: activeCount,
					pendingVisits: Math.max(0, landlordProperties.length * 2),
					unresolvedIssues: Math.max(0, landlordProperties.length - 1),
					totalTenants: Math.max(0, landlordProperties.length * 2),
				});
			}
		} catch (error) {
			console.error('Error loading properties:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleAddProperty = () => {
		navigation.navigate('AddProperty', { userId: auth.currentUser?.uid });
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
			<ScrollView style={styles.scrollView}>
				{/* Header */}
				<View style={styles.header}>
					<View style={styles.headerContent}>
						<Text style={styles.headerTitle}>🏠 StayEase</Text>
						<Text style={styles.headerSubtitle}>Manage your properties and tenants</Text>
					</View>
					<TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
						<Text style={styles.logoutText}>Logout</Text>
					</TouchableOpacity>
				</View>

				{/* Stats Cards */}
				<View style={styles.statsContainer}>
					<View style={styles.statCard}>
						<Text style={styles.statNumber}>{stats.activeProperties}</Text>
						<Text style={styles.statLabel}>Active Properties</Text>
					</View>
					<TouchableOpacity 
						style={styles.statCard} 
						onPress={() => navigation.navigate('LandlordRequests')}
					>
						<Text style={styles.statNumber}>{stats.pendingVisits}</Text>
						<Text style={styles.statLabel}>Pending Visits</Text>
					</TouchableOpacity>
					<View style={styles.statCard}>
						<Text style={styles.statNumber}>{stats.unresolvedIssues}</Text>
						<Text style={styles.statLabel}>Unresolved Issues</Text>
					</View>
					<View style={styles.statCard}>
						<Text style={styles.statNumber}>{stats.totalTenants}</Text>
						<Text style={styles.statLabel}>Total Tenants</Text>
					</View>
				</View>

				{/* Add Property Button */}
				<TouchableOpacity style={styles.addButton} onPress={handleAddProperty}>
					<Text style={styles.addButtonText}>+ Add New Property</Text>
				</TouchableOpacity>

				{/* Properties Section */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Your Properties ({properties.length})</Text>
				</View>

				{loading ? (
					<View style={styles.centerContainer}>
						<ActivityIndicator size="large" color="#FFA500" />
					</View>
				) : properties.length === 0 ? (
					<View style={styles.emptyState}>
						<Text style={styles.emptyText}>No properties yet</Text>
						<Text style={styles.emptySubtext}>Add your first property to get started</Text>
					</View>
				) : (
					properties.map((property, index) => (
						<View key={index} style={styles.propertyCard}>
							<Image
								source={{ uri: property.image || "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0G0oCbffgQ/conpoajh_expires_30_days.png" }}
								resizeMode="cover"
								style={styles.propertyImage}
							/>
							<View style={styles.propertyContent}>
								<Text style={styles.propertyName}>{property.name}</Text>
								<View style={styles.propertyMeta}>
									<Text style={styles.propertyLocation}>📍 {property.address}</Text>
									<View style={[styles.statusBadge, property.status === 'active' ? styles.activeBadge : styles.inactiveBadge]}>
										<Text style={styles.statusText}>
											{property.status === 'active' ? '✓ Active' : '○ Inactive'}
										</Text>
									</View>
								</View>
								<Text style={styles.propertyPrice}>Rs {property.monthlyRent?.toLocaleString()}/month</Text>
								<View style={styles.propertyDetails}>
									<Text style={styles.detailText}>🛏️ {property.bedrooms} Bed</Text>
									<Text style={styles.detailText}>🚿 {property.bathrooms} Bath</Text>
								</View>
								<View style={styles.actionButtons}>
									<TouchableOpacity
										style={styles.editButton}
										onPress={() => navigation.navigate('EditProperty', { property, userId: auth.currentUser?.uid })}
									>
										<Text style={styles.editButtonText}>Edit</Text>
									</TouchableOpacity>
									<TouchableOpacity
										style={styles.viewButton}
										onPress={() => navigation.navigate('PropertyDetail', { property, landlordId: auth.currentUser?.uid })}
									>
										<Text style={styles.viewButtonText}>View</Text>
									</TouchableOpacity>
								</View>
							</View>
						</View>
					))
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
		backgroundColor: '#36454F',
		paddingHorizontal: 20,
		paddingVertical: 16,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	headerContent: {
		flex: 1,
	},
	headerTitle: {
		fontSize: 22,
		fontWeight: 'bold',
		color: '#FFFFFF',
		marginBottom: 4,
	},
	headerSubtitle: {
		fontSize: 13,
		color: '#B0B0B0',
	},
	logoutButton: {
		backgroundColor: '#FF5252',
		paddingVertical: 8,
		paddingHorizontal: 12,
		borderRadius: 6,
	},
	logoutText: {
		color: '#FFFFFF',
		fontSize: 12,
		fontWeight: '600',
	},
	statsContainer: {
		paddingHorizontal: 20,
		paddingVertical: 20,
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
		gap: 12,
	},
	statCard: {
		flex: 1,
		minWidth: '45%',
		backgroundColor: '#FFFFFF',
		borderRadius: 12,
		paddingVertical: 16,
		paddingHorizontal: 12,
		alignItems: 'center',
		shadowColor: '#000',
		shadowOpacity: 0.08,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 8,
		elevation: 4,
	},
	statNumber: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#FFA500',
		marginBottom: 6,
	},
	statLabel: {
		fontSize: 12,
		color: '#757575',
		textAlign: 'center',
		fontWeight: '500',
	},
	addButton: {
		backgroundColor: '#FFA500',
		marginHorizontal: 20,
		marginBottom: 20,
		paddingVertical: 14,
		borderRadius: 8,
		alignItems: 'center',
		shadowColor: '#FFA500',
		shadowOpacity: 0.3,
		shadowOffset: { width: 0, height: 4 },
		shadowRadius: 8,
		elevation: 6,
	},
	addButtonText: {
		color: '#FFFFFF',
		fontSize: 15,
		fontWeight: 'bold',
	},
	section: {
		paddingHorizontal: 20,
		marginBottom: 16,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#36454F',
	},
	centerContainer: {
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 40,
	},
	emptyState: {
		paddingVertical: 40,
		alignItems: 'center',
	},
	emptyText: {
		fontSize: 16,
		fontWeight: '600',
		color: '#36454F',
		marginBottom: 8,
	},
	emptySubtext: {
		fontSize: 13,
		color: '#999999',
	},
	propertyCard: {
		marginHorizontal: 20,
		marginBottom: 16,
		backgroundColor: '#FFFFFF',
		borderRadius: 12,
		overflow: 'hidden',
		shadowColor: '#000',
		shadowOpacity: 0.08,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 8,
		elevation: 4,
	},
	propertyImage: {
		width: '100%',
		height: 180,
		backgroundColor: '#E0E0E0',
	},
	propertyContent: {
		padding: 16,
	},
	propertyName: {
		fontSize: 16,
		fontWeight: '700',
		color: '#36454F',
		marginBottom: 8,
	},
	propertyMeta: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 8,
	},
	propertyLocation: {
		fontSize: 13,
		color: '#757575',
		flex: 1,
	},
	statusBadge: {
		paddingVertical: 4,
		paddingHorizontal: 10,
		borderRadius: 12,
		marginLeft: 8,
	},
	activeBadge: {
		backgroundColor: '#E8F5E9',
	},
	inactiveBadge: {
		backgroundColor: '#FCE4EC',
	},
	statusText: {
		fontSize: 11,
		fontWeight: '600',
		color: '#36454F',
	},
	propertyPrice: {
		fontSize: 15,
		fontWeight: 'bold',
		color: '#FFA500',
		marginBottom: 8,
	},
	propertyDetails: {
		flexDirection: 'row',
		gap: 16,
		marginBottom: 12,
	},
	detailText: {
		fontSize: 12,
		color: '#757575',
		fontWeight: '500',
	},
	actionButtons: {
		flexDirection: 'row',
		gap: 10,
	},
	editButton: {
		flex: 1,
		paddingVertical: 10,
		borderRadius: 6,
		borderColor: '#FFA500',
		borderWidth: 2,
		alignItems: 'center',
	},
	editButtonText: {
		color: '#FFA500',
		fontSize: 13,
		fontWeight: 'bold',
	},
	viewButton: {
		flex: 1,
		paddingVertical: 10,
		borderRadius: 6,
		backgroundColor: '#FFA500',
		alignItems: 'center',
	},
	viewButtonText: {
		color: '#FFFFFF',
		fontSize: 13,
		fontWeight: 'bold',
	},
});

export default LandlordDashboard;
