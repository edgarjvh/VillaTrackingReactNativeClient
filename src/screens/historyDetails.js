import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import { MaterialCommunityIcons } from 'react-native-vector-icons';
import HistoryLogs from "./../screens/historyLogs";
import HistoryMap from "./../screens/historyMap";
import HistoryGraphs from "./../screens/historyGraphs";
import Locate from './../locale.ts'
import { HeaderButtons, HeaderButton, Item } from 'react-navigation-header-buttons';

const BottomTabs = createMaterialBottomTabNavigator();
const loc = new Locate();

const MaterialHeaderButton = (props) => (
    <HeaderButton IconComponent={MaterialCommunityIcons} iconSize={23} color="black" {...props} />
);

const MaterialHeaderButtons = (props) => {
    return <HeaderButtons HeaderButtonComponent={MaterialHeaderButton} {...props} />;
};

const HistoryDetails = (props) => {
    useEffect(() => {
        props.navigation.setOptions({
            headerRight: () => (
                <MaterialHeaderButtons>
                    <Item title="menu" iconName="menu" onPress={() => props.navigation.toggleDrawer()} />
                </MaterialHeaderButtons>
            )
        })

        props.navigation.setOptions({
            headerTitle: loc.historyTitle(props.lang) + ` (${props.route.params.imei || ''})`
        })
    })    

    return (
        <BottomTabs.Navigator
            initialRouteName="Logs"
            activeColor="black"
            inactiveColor="lightgray"
            barStyle={{ backgroundColor: '#fff' }}
        >
            <BottomTabs.Screen
                name="Logs"
                children={() => <HistoryLogs {...props} />}
                options={{
                    tabBarLabel: loc.tabBarLogsLabel(props.lang),
                    tabBarIcon: ({ color }) => (<MaterialCommunityIcons color={color} name="file-document" size={24} />)
                }}

            />
            <BottomTabs.Screen
                name="Graphs"
                children={() => <HistoryGraphs {...props} />}
                options={{
                    tabBarLabel: loc.tabBarGraphLabel(props.lang),
                    tabBarIcon: ({ color }) => (<MaterialCommunityIcons color={color} name="chart-line" size={24} />)
                }}
            />
            <BottomTabs.Screen
                name="Map"
                children={() => <HistoryMap {...props} />}
                options={{
                    tabBarLabel: loc.tabBarMapLabel(props.lang),
                    tabBarIcon: ({ color }) => (<MaterialCommunityIcons color={color} name="map-clock" size={24} />)
                }}
            />                
        </BottomTabs.Navigator>
    )
}

const mapStateToProps = (state) => {
    return {
        lang: state.appReducer.lang,
        serverUrl: state.appReducer.serverUrl,
        user: state.userReducer.user
    }
}

export default connect(mapStateToProps, null)(HistoryDetails)