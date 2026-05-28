import React, { useRef } from 'react';
import { Animated, TouchableWithoutFeedback, StyleSheet, View } from 'react-native';

const AnimatedButton = ({ onPress, children, style, disabled = false }) => {
	const scaleValue = useRef(new Animated.Value(1)).current;

	const onPressIn = () => {
		if (disabled) return;
		Animated.spring(scaleValue, {
			toValue: 0.95,
			useNativeDriver: true,
		}).start();
	};

	const onPressOut = () => {
		if (disabled) return;
		Animated.spring(scaleValue, {
			toValue: 1,
			friction: 4,
			tension: 40,
			useNativeDriver: true,
		}).start();
	};

	return (
		<TouchableWithoutFeedback
			onPressIn={onPressIn}
			onPressOut={onPressOut}
			onPress={disabled ? null : onPress}
			disabled={disabled}
		>
			<Animated.View style={[style, { transform: [{ scale: scaleValue }] }, disabled && styles.disabled]}>
				{children}
			</Animated.View>
		</TouchableWithoutFeedback>
	);
};

const styles = StyleSheet.create({
	disabled: {
		opacity: 0.6,
	},
});

export default AnimatedButton;
