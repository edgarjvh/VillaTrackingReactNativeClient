import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { connect } from 'react-redux';
import Locale from './../locale.ts';
import { HeaderButtons, HeaderButton, Item } from 'react-navigation-header-buttons';

const MaterialHeaderButton = (props) => (
    <HeaderButton IconComponent={MaterialIcon} iconSize={23} color="black" {...props} />
);

const MaterialHeaderButtons = (props) => {
    return <HeaderButtons HeaderButtonComponent={MaterialHeaderButton} {...props} />;
};

const loc = new Locale();

class Alerts extends Component {

    constructor(props){
        super(props);

        this.props.navigation.setOptions({

            headerRight: () => (
                <MaterialHeaderButtons>
                    <Item title="add" iconName="menu" onPress={() => this.props.navigation.toggleDrawer()} />
                </MaterialHeaderButtons>
            )
        })
    }

    componentDidUpdate() {
        this.props.navigation.setOptions({            
            headerTitle: loc.alertsLabelText(this.props.lang)
        })
    }

    componentDidMount() {
        this.props.navigation.setOptions({            
            headerTitle: loc.alertsLabelText(this.props.lang)
        })
    }
    
    render() {
        return (
            <View style={styles.container}>
                <View style={styles.stackHeader}>
                    <Text>Alerts Screen</Text>
                </View>
            </View>
        )
    }
}

function mapStateToProps(state){
    return {
        lang: state.appReducer.lang,
        devices: state.devicesReducer.devices
    }
}

export default connect(mapStateToProps, null)(Alerts)

const styles = StyleSheet.create({
    container : {
        flex:1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    stackHeader: {
        flexDirection: 'row',
        justifyContent: 'center'
    }
})