import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
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

class Suggestions extends Component {

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
            headerTitle: loc.suggestionsLabelText(this.props.lang)
        })
    }

    componentDidMount() {
        this.props.navigation.setOptions({            
            headerTitle: loc.suggestionsLabelText(this.props.lang)
        })
    }
    
    render() {
        return (
            <View style={styles.container}>
                <View style={styles.stackHeader}>
                    <Text>Suggestions Screen</Text>
                </View>
            </View>
        )
    }
}

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

const mapStateToProps = (state) => {
    return {
        lang: state.appReducer.lang,
        isLoading: state.appReducer.isLoading
    }
}

export default connect(mapStateToProps, null)(Suggestions)

