import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './Login';
import RoleSelection from './RoleSelection';
import StudentRegistration from './StudentRegistration';
import LandlordRegistration from './LandlordRegistration';
import StudentDashboard from './StudentDashboard';
import LandlordDashboard from './LandlordDashboard';
import AddProperty from './AddProperty';
import PropertyDetail from './PropertyDetail';
import EditProperty from './EditProperty';
import BrowseProperties from './BrowseProperties';

enableScreens();
const Stack = createNativeStackNavigator();

export default function App() {
	return (
		<SafeAreaProvider>
			<NavigationContainer>
				<Stack.Navigator initialRouteName="Login">
					<Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
					<Stack.Screen name="RoleSelection" component={RoleSelection} options={{ title: 'Sign Up' }} />
					<Stack.Screen name="StudentRegistration" component={StudentRegistration} options={{ title: 'Student Registration' }} />
					<Stack.Screen name="LandlordRegistration" component={LandlordRegistration} options={{ title: 'Landlord Registration' }} />
					<Stack.Screen name="StudentDashboard" component={StudentDashboard} options={{ title: 'Dashboard' }} />
					<Stack.Screen name="BrowseProperties" component={BrowseProperties} options={{ title: 'Browse Properties', headerBackTitle: 'Back' }} />
					<Stack.Screen name="LandlordDashboard" component={LandlordDashboard} options={{ headerShown: false }} />
					<Stack.Screen name="AddProperty" component={AddProperty} options={{ title: 'Add Property', headerBackTitle: 'Back' }} />
					<Stack.Screen name="PropertyDetail" component={PropertyDetail} options={{ title: 'Property Details', headerBackTitle: 'Back' }} />
					<Stack.Screen name="EditProperty" component={EditProperty} options={{ title: 'Edit Property', headerBackTitle: 'Back' }} />
				</Stack.Navigator>
			</NavigationContainer>
		</SafeAreaProvider>
	);
}
