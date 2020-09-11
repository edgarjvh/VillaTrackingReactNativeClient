import React, { Component } from 'react'
import { connect } from "react-redux";
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import { createDrawerNavigator } from '@react-navigation/drawer';
import AsyncStorage from "@react-native-community/async-storage";
import { FontAwesome, MaterialCommunityIcons, FontAwesome5 } from 'react-native-vector-icons';

import Login from './screens/login';
import Register from './screens/register';
import PasswordRecovery from './screens/passwordRecovery';
import RegisterValidation from './screens/registerValidation';
import Main from './screens/main';
import Menu from './screens/menu';
import Devices from './screens/devices';
import DeviceMaintainer from './screens/deviceMaintainer';
import Groups from './screens/groups';
import GroupMaintainer from './screens/groupMaintainer';
import History from './screens/history';
import HistoryDetails from "./screens/historyDetails";
import Alerts from './screens/alerts';
import Tools from './screens/tools';
import Settings from './screens/settings';
import Suggestions from './screens/suggestions';
import Profile from './screens/profile';
import Locale from "./locale";

import { setUser } from "./actions";
import historyDetails from './screens/historyDetails';

const loc = new Locale();
const Stack = new createStackNavigator();
const Drawer = new createDrawerNavigator();
const BottomTabs = new createMaterialBottomTabNavigator();

class Root extends Component {

    constructor(props) {
        super(props)

        this.checkUser();
    }

    checkUser = async () => {
        try {
            let storedUser = await AsyncStorage.getItem('@user');

            if (storedUser !== undefined) {
                let user = JSON.parse(storedUser);
                this.props.setUser(user);
            }
        }
        catch (e) {
            console.log(e);
        }
    }

    mainStack = () =>
        <Stack.Navigator
            initialRouteName="Main"
            headerMode="float"
            animation="fade"

            screenOptions={{
                ...TransitionPresets.SlideFromRightIOS,
                headerShown: false,
                headerStyle: {
                }
            }}>

            <Stack.Screen
                name="Main"
                component={Main}
                options={{
                    title: loc.homeTitle(this.props.lang)
                }}
            />

            <Stack.Screen
                name="Profile"
                component={Profile}
                options={{
                    title: loc.myProfileTitle(this.props.lang),
                    headerShown: true
                }}
            />

            <Stack.Screen
                name="Devices"
                component={Devices}
                options={{
                    title: loc.devicesLabelText(this.props.lang),
                    headerShown: true
                }}
            />

            <Stack.Screen
                name="DeviceMaintainer"
                component={DeviceMaintainer}
                options={{
                    headerShown: true
                }}
            />

            <Stack.Screen
                name="Groups"
                component={Groups}
                options={{
                    title: loc.groupsLabelText(this.props.lang),
                    headerShown: true
                }}
            />

            <Stack.Screen
                name="GroupMaintainer"
                component={GroupMaintainer}
                options={{                    
                    headerShown: true
                }}
            />

            <Stack.Screen
                name="History"
                component={History}
                options={{
                    title: loc.historyLabelText(this.props.lang),
                    headerShown: true
                }}
            />

            <Stack.Screen
                name="HistoryDetails"
                component={historyDetails}
                options={{
                    title: loc.historyDetailsTitle(this.props.lang),
                    headerShown: true
                }}
            />

            <Stack.Screen
                name="Alerts"
                component={Alerts}
                options={{
                    title: loc.alertsLabelText(this.props.lang),
                    headerShown: true
                }}
            />

            <Stack.Screen
                name="Tools"
                component={Tools}
                options={{
                    title: loc.toolsLabelText(this.props.lang),
                    headerShown: true
                }}
            />

            <Stack.Screen
                name="Settings"
                component={Settings}
                options={{
                    title: loc.settingsLabelText(this.props.lang),
                    headerShown: true
                }}
            />

            <Stack.Screen
                name="Suggestions"
                component={Suggestions}
                options={{
                    title: loc.suggestionsLabelText(this.props.lang),
                    headerShown: true
                }}
            />

        </Stack.Navigator>

    render() {
        return (
            <NavigationContainer>
                {!this.props.user ?

                    <Stack.Navigator
                        initialRouteName="Login"
                        headerMode="float"
                        animation="fade"
                        screenOptions={{
                            ...TransitionPresets.SlideFromRightIOS
                        }}
                    >
                        <Stack.Screen
                            name="Login"
                            component={Login}
                            options={{
                                title: loc.loginTitle(this.props.lang)
                            }}
                        />

                        <Stack.Screen
                            name="Register"
                            component={Register}
                            options={{
                                title: loc.registerTitle(this.props.lang)
                            }}
                        />

                        <Stack.Screen
                            name="PasswordRecovery"
                            component={PasswordRecovery}
                            options={{
                                title: loc.passwordRecoveryTitle(this.props.lang)
                            }}
                        />

                        <Stack.Screen
                            name="RegisterValidation"
                            component={RegisterValidation}
                            options={{
                                title: loc.registerValidationTitle(this.props.lang)
                            }}
                        />
                    </Stack.Navigator>

                    :

                    <Drawer.Navigator
                        drawerContent={(props) => <Menu {...props} />}

                        drawerStyle={{
                            width: '90%',
                            maxWidth: 380
                        }} >
                        <Drawer.Screen name="Home" children={this.mainStack} />
                    </Drawer.Navigator>

                }
            </NavigationContainer>
        )
    }
}

const mapStateToProps = state => {
    return {
        user: state.userReducer.user,
        lang: state.appReducer.lang
    }
}

export default connect(mapStateToProps, {
    setUser
})(Root)
