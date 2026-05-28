import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const SkeletonLoader = ({ width: skeletonWidth, height: skeletonHeight, style, borderRadius = 8 }) => {
	const opacity = useRef(new Animated.Value(0.3)).current;

	useEffect(() => {
		Animated.loop(
			Animated.sequence([
				Animated.timing(opacity, {
					toValue: 0.7,
					duration: 800,
					useNativeDriver: true,
				}),
				Animated.timing(opacity, {
					toValue: 0.3,
					duration: 800,
					useNativeDriver: true,
				}),
			])
		).start();
	}, [opacity]);

	return (
		<Animated.View
			style={[
				styles.skeleton,
				{
					width: skeletonWidth || '100%',
					height: skeletonHeight || 20,
					borderRadius,
					opacity,
				},
				style,
			]}
		/>
	);
};

export const PropertyCardSkeleton = () => {
	return (
		<View style={styles.card}>
			{/* Image Placeholder */}
			<SkeletonLoader height={180} borderRadius={12} style={{ marginBottom: 15 }} />
			
			{/* Title and Price */}
			<View style={styles.row}>
				<SkeletonLoader width={150} height={24} />
				<SkeletonLoader width={80} height={24} />
			</View>

			{/* Address */}
			<SkeletonLoader width={200} height={16} style={{ marginTop: 10, marginBottom: 15 }} />

			{/* Facilities row */}
			<View style={styles.facilitiesRow}>
				<SkeletonLoader width={60} height={30} borderRadius={15} style={{ marginRight: 8 }} />
				<SkeletonLoader width={60} height={30} borderRadius={15} style={{ marginRight: 8 }} />
				<SkeletonLoader width={60} height={30} borderRadius={15} />
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	skeleton: {
		backgroundColor: '#E0E0E0',
	},
	card: {
		backgroundColor: '#FFFFFF',
		borderRadius: 16,
		padding: 16,
		marginBottom: 20,
		shadowColor: '#000',
		shadowOpacity: 0.05,
		shadowOffset: { width: 0, height: 4 },
		shadowRadius: 10,
		elevation: 4,
	},
	row: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	facilitiesRow: {
		flexDirection: 'row',
		alignItems: 'center',
	}
});

export default SkeletonLoader;
