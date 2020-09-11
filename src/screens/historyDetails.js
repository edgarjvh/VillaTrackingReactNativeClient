import React, { Component } from "react";
import { connect } from "react-redux";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import { MaterialCommunityIcons } from 'react-native-vector-icons';
import HistoryLogs from "./../screens/historyLogs";
import HistoryMap from "./../screens/historyMap";
import historyGraphs from "./../screens/historyGraphs";
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

class HistoryDetails extends Component {
    constructor(props){
        super(props)

        this.props.navigation.setOptions({
            headerRight: () => (
                <MaterialHeaderButtons>
                    <Item title="menu" iconName="menu" onPress={() => this.props.navigation.toggleDrawer()} />
                </MaterialHeaderButtons>
            )
        });
    }

    componentDidUpdate() {
        this.props.navigation.setOptions({
            headerTitle: loc.historyTitle(this.props.lang) + ' (' + this.props.historyData[0].imei + ')'
        })
    }

    componentDidMount() {
        this.props.navigation.setOptions({
            headerTitle: loc.historyTitle(this.props.lang) + ' (' + this.props.historyData[0].imei + ')'
        })
    }

    render() {
        return (
            <BottomTabs.Navigator
                initialRouteName="Logs"
                activeColor="black"
                inactiveColor="lightgray"
                barStyle={{ backgroundColor: '#fff' }}
            >
                <BottomTabs.Screen
                    name="Logs"
                    component={HistoryLogs}
                    options={{
                        tabBarLabel: loc.tabBarLogsLabel(this.props.lang),
                        tabBarIcon: ({ color }) => (<MaterialCommunityIcons color={color} name="file-document" size={24} />)
                    }}
                />
                <BottomTabs.Screen
                    name="Graphs"
                    component={historyGraphs}
                    options={{
                        tabBarLabel: loc.tabBarGraphLabel(this.props.lang),
                        tabBarIcon: ({ color }) => (<MaterialCommunityIcons color={color} name="chart-line" size={24} />)
                    }}
                />
                <BottomTabs.Screen
                    name="Map"
                    component={HistoryMap}
                    options={{
                        tabBarLabel: loc.tabBarMapLabel(this.props.lang),
                        tabBarIcon: ({ color }) => (<MaterialCommunityIcons color={color} name="map-clock" size={24} />)
                    }}
                />                
            </BottomTabs.Navigator>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        lang: state.appReducer.lang,
        historyData: state.devicesReducer.historyData
    }
}

export default connect(mapStateToProps, null)(HistoryDetails)