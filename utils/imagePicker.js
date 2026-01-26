import { Platform } from 'react-native';
import * as ExpoImagePicker from 'expo-image-picker';

export const pickImage = async () => {
	if (Platform.OS === 'web') {
		// Web: Use file input
		return new Promise((resolve) => {
			try {
				const input = document.createElement('input');
				input.type = 'file';
				input.accept = 'image/*';
				input.style.display = 'none';
				document.body.appendChild(input);
				
				input.onchange = (e) => {
					const file = e.target.files[0];
					if (file) {
						const reader = new FileReader();
						reader.onload = (event) => {
							document.body.removeChild(input);
							resolve({
								uri: event.target.result,
								name: file.name,
								type: file.type,
							});
						};
						reader.readAsDataURL(file);
					} else {
						document.body.removeChild(input);
						resolve(null);
					}
				};
				
				input.click();
			} catch (err) {
				console.error('Error picking image on web:', err);
				resolve(null);
			}
		});
	} else {
		// Mobile: Use expo-image-picker
		try {
			// Request permissions first
			const { status } = await ExpoImagePicker.requestMediaLibraryPermissionsAsync();
			if (status !== 'granted') {
				alert('Permission to access photo library is required');
				return null;
			}
			
			let result = await ExpoImagePicker.launchImageLibraryAsync({
				mediaTypes: ['images'],
				allowsEditing: true,
				aspect: [4, 3],
				quality: 1,
			});
			if (!result.canceled) {
				return {
					uri: result.assets[0].uri,
					name: 'proof',
					type: 'image/jpeg',
				};
			}
			return null;
		} catch (err) {
			console.error('Error picking image on mobile:', err);
			return null;
		}
	}
};

export const convertToBase64 = async (imageUri) => {
	if (Platform.OS === 'web' && imageUri.startsWith('data:')) {
		// Already base64 on web
		return imageUri.split(',')[1];
	}
	
	try {
		// Mobile or fetch-based: fetch and convert
		const response = await fetch(imageUri);
		const blob = await response.blob();
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => {
				const result = reader.result.split(',')[1];
				resolve(result);
			};
			reader.onerror = () => reject(new Error('Failed to read image'));
			reader.readAsDataURL(blob);
		});
	} catch (err) {
		console.error('Error converting to base64:', err);
		throw err;
	}
};
