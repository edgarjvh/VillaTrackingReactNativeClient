import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { connect } from 'react-redux';
import Locale from './../locale.ts';
import { HeaderButtons, HeaderButton, Item } from 'react-navigation-header-buttons';
import { setUser } from "./../actions";

const MaterialHeaderButton = (props) => (
    <HeaderButton IconComponent={MaterialIcon} iconSize={23} color="black" {...props} />
);

const MaterialHeaderButtons = (props) => {
    return <HeaderButtons HeaderButtonComponent={MaterialHeaderButton} {...props} />;
};

const loc = new Locale();

class Profile extends Component {

    constructor(props){
        super(props);

        this.props.navigation.setOptions({

            headerRight: () => (
                <MaterialHeaderButtons>
                    <Item title="save" iconName="content-save-edit" onPress={() => this.props.navigation.toggleDrawer()} />
                    <Item title="add" iconName="menu" onPress={() => this.props.navigation.toggleDrawer()} />
                </MaterialHeaderButtons>
            )
        })
    }

    componentDidUpdate() {
        this.props.navigation.setOptions({            
            headerTitle: loc.myProfileTitle(this.props.lang)
        })
    }
    
    
    componentDidMount() {
        this.props.navigation.setOptions({            
            headerTitle: loc.myProfileTitle(this.props.lang)
        })
    }
    
    render() {
        return (  
            <View style={styles.container}>
                <View style={styles.stackHeader}>
                    <Text>My Profile Screen</Text>
                </View>
            </View>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        lang: state.appReducer.lang,
        user: state.userReducer.user
    }
}

export default connect(mapStateToProps, null)(Profile)

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