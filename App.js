import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

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
import Payments from './Payments';
import Concerns from './Concerns';
import MyBookings from './MyBookings';
import LandlordRequests from './LandlordRequests';
import LandlordPayments from './LandlordPayments';
import LandlordConcerns from './LandlordConcerns';
import GuardianLogin from './GuardianLogin';
import GuardianDashboard from './GuardianDashboard';
import GuardianBookings from './GuardianBookings';
import GuardianPayments from './GuardianPayments';
import GuardianConcerns from './GuardianConcerns';

enableScreens();
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function StudentTabs() {
	return (
		<Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: '#FFA500' }}>
			<Tab.Screen name="Browse" component={BrowseProperties} options={{ tabBarLabel: 'Search', tabBarIcon: ({color, size}) => <Ionicons name="search" size={size} color={color} /> }} />
			<Tab.Screen name="MyBookings" component={MyBookings} options={{ tabBarLabel: 'Bookings', tabBarIcon: ({color, size}) => <Ionicons name="calendar" size={size} color={color} /> }} />
			<Tab.Screen name="Payments" component={Payments} options={{ tabBarLabel: 'Payments', tabBarIcon: ({color, size}) => <Ionicons name="card" size={size} color={color} /> }} />
			<Tab.Screen name="Profile" component={StudentDashboard} options={{ tabBarLabel: 'Profile', tabBarIcon: ({color, size}) => <Ionicons name="person" size={size} color={color} /> }} />
		</Tab.Navigator>
	);
}

function LandlordTabs() {
	return (
		<Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: '#FFA500' }}>
			<Tab.Screen name="DashboardTab" component={LandlordDashboard} options={{ tabBarLabel: 'Dashboard', tabBarIcon: ({color, size}) => <Ionicons name="grid" size={size} color={color} /> }} />
			<Tab.Screen name="RequestsTab" component={LandlordRequests} options={{ tabBarLabel: 'Requests', tabBarIcon: ({color, size}) => <Ionicons name="document-text" size={size} color={color} /> }} />
			<Tab.Screen name="FinancesTab" component={LandlordPayments} options={{ tabBarLabel: 'Finances', tabBarIcon: ({color, size}) => <Ionicons name="cash" size={size} color={color} /> }} />
		</Tab.Navigator>
	);
}

export default function App() {
	return (
		<SafeAreaProvider>
			<NavigationContainer>
				<Stack.Navigator initialRouteName="Login">
					<Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
					<Stack.Screen name="RoleSelection" component={RoleSelection} options={{ title: 'Sign Up' }} />
					<Stack.Screen name="StudentRegistration" component={StudentRegistration} options={{ title: 'Student Registration' }} />
					<Stack.Screen name="LandlordRegistration" component={LandlordRegistration} options={{ title: 'Landlord Registration' }} />
					{/* Tab Navigators */}
					<Stack.Screen name="StudentDashboard" component={StudentTabs} options={{ headerShown: false }} />
					<Stack.Screen name="LandlordDashboard" component={LandlordTabs} options={{ headerShown: false }} />

					{/* Shared / Deep Screens */}
					<Stack.Screen name="AddProperty" component={AddProperty} options={{ title: 'Add Property', headerBackTitle: 'Back' }} />
					<Stack.Screen name="PropertyDetail" component={PropertyDetail} options={{ title: 'Property Details', headerBackTitle: 'Back' }} />
					<Stack.Screen name="EditProperty" component={EditProperty} options={{ title: 'Edit Property', headerBackTitle: 'Back' }} />
					<Stack.Screen name="Concerns" component={Concerns} options={{ headerShown: false }} />
					<Stack.Screen name="LandlordConcerns" component={LandlordConcerns} options={{ headerShown: false }} />
					
					{/* Guardian Screens */}
					<Stack.Screen name="GuardianLogin" component={GuardianLogin} options={{ headerShown: false }} />
					<Stack.Screen name="GuardianDashboard" component={GuardianDashboard} options={{ headerShown: false }} />
					<Stack.Screen name="GuardianBookings" component={GuardianBookings} options={{ headerShown: false }} />
					<Stack.Screen name="GuardianPayments" component={GuardianPayments} options={{ headerShown: false }} />
					<Stack.Screen name="GuardianConcerns" component={GuardianConcerns} options={{ headerShown: false }} />
				</Stack.Navigator>
			</NavigationContainer>
			<Toast />
		</SafeAreaProvider>
	);
}
