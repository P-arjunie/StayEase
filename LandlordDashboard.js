import React from "react";
import { View, ScrollView, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LandlordDashboard = ({ navigation }) => {
	return (
		<SafeAreaView style={styles.container}>
			<ScrollView style={styles.scrollView}>
				<View style={styles.column}>
					<View style={styles.view}>
						<Text style={styles.text}>
							{"Landlord Dashboard"}
						</Text>
					</View>
					<View style={styles.view2}>
						<Text style={styles.text2}>
							{"Manage your properties and tenants"}
						</Text>
					</View>
				</View>
				<View style={styles.column2}>
					<View style={styles.row}>
						<View style={styles.column3}>
							<View style={styles.view3}>
								<Text style={styles.text3}>
									{"5"}
								</Text>
							</View>
							<View style={styles.view4}>
								<Text style={styles.text4}>
									{"Active Properties"}
								</Text>
							</View>
						</View>
						<View style={styles.column4}>
							<View style={styles.view3}>
								<Text style={styles.text3}>
									{"8"}
								</Text>
							</View>
							<View style={styles.view4}>
								<Text style={styles.text4}>
									{"Pending Visits"}
								</Text>
							</View>
						</View>
					</View>
					<View style={styles.row2}>
						<View style={styles.column3}>
							<View style={styles.view3}>
								<Text style={styles.text3}>
									{"3"}
								</Text>
							</View>
							<View style={styles.view4}>
								<Text style={styles.text4}>
									{"Unresolved Issues"}
								</Text>
							</View>
						</View>
						<View style={styles.column4}>
							<View style={styles.view3}>
								<Text style={styles.text3}>
									{"12"}
								</Text>
							</View>
							<View style={styles.view4}>
								<Text style={styles.text4}>
									{"Total Tenants"}
								</Text>
							</View>
						</View>
					</View>
				</View>
				<TouchableOpacity style={styles.button} onPress={() => alert('Add Property')}>
					<Text style={styles.text5}>
						{"+ Add New Property"}
					</Text>
				</TouchableOpacity>
				<View style={styles.view5}>
					<Text style={styles.text6}>
						{"Your Properties"}
					</Text>
				</View>
				<Image
					source={{uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0G0oCbffgQ/conpoajh_expires_30_days.png"}} 
					resizeMode="stretch"
					style={styles.image}
				/>
				<View style={styles.column5}>
					<View style={styles.view6}>
						<Text style={styles.text6}>
							{"Modern Studio Near University"}
						</Text>
					</View>
					<View style={styles.row3}>
						<View style={styles.view7}>
							<Text style={styles.text7}>
								{"📍 Colombo 03"}
							</Text>
						</View>
						<View style={styles.view7}>
							<Text style={styles.text7}>
								{"✓ Occupied"}
							</Text>
						</View>
						<View style={styles.box}>
						</View>
					</View>
					<View style={styles.view6}>
						<Text style={styles.text8}>
							{"Rs 22,000/month"}
						</Text>
					</View>
					<View style={styles.row4}>
						<TouchableOpacity style={styles.button2} onPress={() => alert('Edit Property')}>
							<Text style={styles.text9}>
								{"Edit"}
							</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.button3} onPress={() => alert('View Property')}>
							<Text style={styles.text10}>
								{"View"}
							</Text>
						</TouchableOpacity>
					</View>
				</View>
				<Image
					source={{uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0G0oCbffgQ/29x0u73b_expires_30_days.png"}} 
					resizeMode="stretch"
					style={styles.image2}
				/>
				<View style={styles.column6}>
					<View style={styles.view6}>
						<Text style={styles.text6}>
							{"Kandy Shared Room"}
						</Text>
					</View>
					<View style={styles.row5}>
						<View style={styles.view8}>
							<Text style={styles.text7}>
								{"📍 Kandy"}
							</Text>
						</View>
						<View style={styles.view2}>
							<Text style={styles.text11}>
								{"○ Vacant"}
							</Text>
						</View>
					</View>
					<View style={styles.view6}>
						<Text style={styles.text8}>
							{"Rs 8,500/month"}
						</Text>
					</View>
					<View style={styles.row4}>
						<TouchableOpacity style={styles.button2} onPress={() => alert('Edit Property')}>
							<Text style={styles.text9}>
								{"Edit"}
							</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.button3} onPress={() => alert('View Property')}>
							<Text style={styles.text10}>
								{"View"}
							</Text>
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
		backgroundColor: "#FFFFFF",
	},
	box: {
		height: 16,
		flex: 1,
	},
	button: {
		alignItems: "center",
		backgroundColor: "#FFA500",
		borderRadius: 8,
		paddingVertical: 12,
		marginBottom: 40,
		marginHorizontal: 20,
	},
	button2: {
		flex: 1,
		alignItems: "center",
		borderColor: "#FFA500",
		borderRadius: 8,
		borderWidth: 2,
		paddingVertical: 14,
		marginRight: 10,
	},
	button3: {
		flex: 1,
		alignItems: "center",
		borderColor: "#FFA500",
		borderRadius: 8,
		borderWidth: 2,
		paddingVertical: 14,
	},
	column: {
		backgroundColor: "#FFFFFF",
		borderRadius: 12,
		padding: 20,
		marginBottom: 17,
		marginHorizontal: 20,
	},
	column2: {
		marginBottom: 36,
		marginHorizontal: 20,
	},
	column3: {
		flex: 1,
		backgroundColor: "#FFFFFF",
		borderRadius: 12,
		padding: 20,
		marginRight: 15,
		shadowColor: "#0000000D",
		shadowOpacity: 0.1,
		shadowOffset: {
		    width: 0,
		    height: 2
		},
		shadowRadius: 8,
		elevation: 8,
	},
	column4: {
		flex: 1,
		backgroundColor: "#FFFFFF",
		borderRadius: 12,
		padding: 20,
		shadowColor: "#0000000D",
		shadowOpacity: 0.1,
		shadowOffset: {
		    width: 0,
		    height: 2
		},
		shadowRadius: 8,
		elevation: 8,
	},
	column5: {
		marginBottom: 30,
		marginHorizontal: 35,
	},
	column6: {
		marginBottom: 44,
		marginHorizontal: 35,
	},
	image: {
		height: 180,
		marginBottom: 15,
		marginHorizontal: 22,
	},
	image2: {
		height: 173,
		marginBottom: 15,
		marginHorizontal: 22,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 11,
	},
	row2: {
		flexDirection: "row",
		alignItems: "center",
	},
	row3: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 10,
		marginRight: 17,
	},
	row4: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 10,
	},
	row5: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 10,
	},
	scrollView: {
		flex: 1,
		backgroundColor: "#F5F5F5",
		paddingTop: 20,
	},
	text: {
		color: "#36454F",
		fontSize: 20,
		fontWeight: "bold",
	},
	text2: {
		color: "#36454F",
		fontSize: 14,
	},
	text3: {
		color: "#FFA500",
		fontSize: 28,
		fontWeight: "bold",
	},
	text4: {
		color: "#36454F",
		fontSize: 12,
	},
	text5: {
		color: "#FFFFFF",
		fontSize: 13,
		fontWeight: "bold",
	},
	text6: {
		color: "#36454F",
		fontSize: 16,
		fontWeight: "bold",
	},
	text7: {
		color: "#36454F",
		fontSize: 13,
	},
	text8: {
		color: "#FFA500",
		fontSize: 18,
		fontWeight: "bold",
	},
	text9: {
		color: "#FFA500",
		fontSize: 13,
		fontWeight: "bold",
	},
	text10: {
		color: "#FFA500",
		fontSize: 12,
		fontWeight: "bold",
	},
	text11: {
		color: "#FFA500",
		fontSize: 13,
	},
	view: {
		paddingBottom: 1,
		marginBottom: 5,
	},
	view2: {
		paddingBottom: 1,
	},
	view3: {
		alignItems: "center",
		paddingBottom: 1,
		marginBottom: 5,
	},
	view4: {
		alignItems: "center",
	},
	view5: {
		alignSelf: "flex-start",
		paddingBottom: 1,
		marginBottom: 8,
		marginLeft: 20,
	},
	view6: {
		paddingBottom: 1,
		marginBottom: 10,
	},
	view7: {
		flex: 1,
		paddingBottom: 1,
		marginRight: 15,
	},
	view8: {
		paddingBottom: 1,
		marginRight: 15,
	},
});

export default LandlordDashboard;
