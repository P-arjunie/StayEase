import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const SelectPicker = ({ selectedValue, onValueChange, items, style, containerStyle }) => {
	if (Platform.OS === 'web') {
		return (
			<View style={containerStyle}>
				<select
					value={selectedValue}
					onChange={(e) => onValueChange(e.target.value)}
					style={{
						padding: '13px 16px',
						fontSize: 13,
						color: '#36454F',
						border: '1px solid #D3D3D3',
						borderRadius: 8,
						width: '100%',
						backgroundColor: '#F5F5F5',
						fontFamily: 'System',
					}}
				>
					{items.map((item) => (
						<option key={item.value} value={item.value}>
							{item.label}
						</option>
					))}
				</select>
			</View>
		);
	}

	// Mobile: use React Native Picker
	return (
		<View style={containerStyle}>
			<Picker
				selectedValue={selectedValue}
				onValueChange={onValueChange}
				style={style}
			>
				{items.map((item) => (
					<Picker.Item key={item.value} label={item.label} value={item.value} />
				))}
			</Picker>
		</View>
	);
};

export default SelectPicker;
