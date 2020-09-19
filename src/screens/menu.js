import React, { Component } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, View, ImageBackground, StyleSheet, TouchableHighlight, ScrollView, Image, Alert } from 'react-native';
import Locale from './../locale';
import axios from 'axios';
import Login from './login';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import CommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import { connect } from 'react-redux';
import { setLanguageEs,setLanguageEn, setUser } from "./../actions";
import AsyncStorage from "@react-native-community/async-storage";

const loc = new Locale();
const Stack = new createStackNavigator();

class Menu extends Component {

    constructor(props) {
        super(props);
    }

    logout = () => {
        Alert.alert(
            loc.logoutLabelText(this.props.lang),
            loc.logoutPromptMessage(this.props.lang),
            [
                {
                    text: loc.cancelButtonLabel(this.props.lang),
                    onPress: () => console.log('Cancel Pressed!')
                },
                {
                    text: loc.acceptButtonLabel(this.props.lang),
                    onPress: this.clearUser 
                }
            ],
            {
                cancelable: false
            }
        )
    }

    clearUser = async () => {
        await AsyncStorage.removeItem('@user');
        this.props.setUser(null)
    }

    render() {
        return (

            <ImageBackground source={require('./../../assets/bg.jpg')} style={styles.bg}>
                <View style={styles.header}>
                    <View style={styles.profileImageContainer}>
                        <SimpleLineIcons name='user' size={45} color='gray' />
                    </View>

                    <View style={styles.profileUserContainer}>
                        <View>
                            <Text style={styles.profileUserNameText}>{this.props.user.name}</Text>
                        </View>

                        <View>
                            <Text style={styles.profileUserEmailText}>{this.props.user.email}</Text>
                        </View>
                    </View>

                    <TouchableHighlight
                        underlayColor='#151E4499'
                        style={[
                            styles.profileLangEsButton, 
                            { 
                                backgroundColor: this.props.lang === 'es' ? '#151E44' : 'transparent'
                            }
                        ]}
                        onPress={() => this.props.setLanguageEs()} >
                        <Image source={require('./../../assets/es-flag.png')} style={{ width: 20, height: 20 }} />
                    </TouchableHighlight>

                    <TouchableHighlight
                        underlayColor='#151E4499'
                        style={[
                            styles.profileLangEnButton, 
                            { 
                                backgroundColor: this.props.lang === 'en' ? '#151E44' : 'transparent'
                            }
                        ]}
                        onPress={() => this.props.setLanguageEn()} >
                        <Image source={require('./../../assets/us-flag.png')} style={{ width: 20, height: 20 }} />
                    </TouchableHighlight>

                    <TouchableHighlight underlayColor='#151E4499' style={styles.profileEditButton} onPress={() => this.props.navigation.navigate('Profile')} >
                        <CommunityIcon name="settings" size={20} color='white' />
                    </TouchableHighlight>
                </View>

                <ScrollView style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.8)' }}>

                    <TouchableHighlight underlayColor='rgba(0,0,0,0.2)' style={[styles.drawerItemContainer, { borderTopWidth: 1 }]} onPress={() => this.props.navigation.navigate('Main')}>
                        <View style={styles.drawerItemContent}>
                            <CommunityIcon style={styles.drawerItemContentIcon} name='home-map-marker' size={25} color='#151E44' />
                            <Text style={styles.drawerItemContentLabel}>{loc.homeTitle(this.props.lang)}</Text>
                            <Icon name='chevron-right' size={15} color='#151E44' />
                        </View>
                    </TouchableHighlight>

                    <TouchableHighlight underlayColor='rgba(0,0,0,0.2)' style={[styles.drawerItemContainer]} onPress={() => this.props.navigation.navigate('Devices', {groupId: 0, geofenceId: 0, origin: 'devices'})}>
                        <View style={styles.drawerItemContent}>
                            <CommunityIcon style={styles.drawerItemContentIcon} name='eight-track' size={25} color='#151E44' />
                            <Text style={styles.drawerItemContentLabel}>{loc.devicesLabelText(this.props.lang)}</Text>
                            <Icon name='chevron-right' size={15} color='#151E44' />
                        </View>
                    </TouchableHighlight>

                    <TouchableHighlight underlayColor='rgba(0,0,0,0.2)' style={styles.drawerItemContainer} onPress={() => this.props.navigation.navigate('Groups')}>
                        <View style={styles.drawerItemContent}>
                            <CommunityIcon style={styles.drawerItemContentIcon} name='select-group' size={25} color='#151E44' />
                            <Text style={styles.drawerItemContentLabel}>{loc.groupsLabelText(this.props.lang)}</Text>
                            <Icon name='chevron-right' size={15} color='#151E44' />
                        </View>
                    </TouchableHighlight>

                    <TouchableHighlight underlayColor='rgba(0,0,0,0.2)' style={styles.drawerItemContainer} onPress={() => this.props.navigation.navigate('History')}>
                        <View style={styles.drawerItemContent}>
                            <CommunityIcon style={styles.drawerItemContentIcon} name='map-clock' size={25} color='#151E44' />
                            <Text style={styles.drawerItemContentLabel}>{loc.historyLabelText(this.props.lang)}</Text>
                            <Icon name='chevron-right' size={15} color='#151E44' />
                        </View>
                    </TouchableHighlight>

                    <TouchableHighlight underlayColor='rgba(0,0,0,0.2)' style={styles.drawerItemContainer} onPress={() => this.props.navigation.navigate('Geofences')}>
                        <View style={styles.drawerItemContent}>
                            <CommunityIcon style={styles.drawerItemContentIcon} name='vector-polygon' size={25} color='#151E44' />
                            <Text style={styles.drawerItemContentLabel}>{loc.geofencesLabel(this.props.lang)}</Text>
                            <Icon name='chevron-right' size={15} color='#151E44' />
                        </View>
                    </TouchableHighlight>

                    <TouchableHighlight underlayColor='rgba(0,0,0,0.2)' style={styles.drawerItemContainer} onPress={() => this.props.navigation.navigate('Tools')}>
                        <View style={styles.drawerItemContent}>
                            <CommunityIcon style={styles.drawerItemContentIcon} name='card-bulleted-settings' size={25} color='#151E44' />
                            <Text style={styles.drawerItemContentLabel}>{loc.toolsLabelText(this.props.lang)}</Text>
                            <Icon name='chevron-right' size={15} color='#151E44' />
                        </View>
                    </TouchableHighlight>

                    <TouchableHighlight underlayColor='rgba(0,0,0,0.2)' style={styles.drawerItemContainer} onPress={() => this.props.navigation.navigate('Suggestions')}>
                        <View style={styles.drawerItemContent}>
                            <CommunityIcon style={styles.drawerItemContentIcon} name='message-bulleted' size={25} color='#151E44' />
                            <Text style={styles.drawerItemContentLabel}>{loc.suggestionsLabelText(this.props.lang)}</Text>
                            <Icon name='chevron-right' size={15} color='#151E44' />
                        </View>
                    </TouchableHighlight>

                    <TouchableHighlight underlayColor='rgba(0,0,0,0.2)' style={[styles.drawerItemContainer, { backgroundColor: 'rgba(255,0,0,0.2)' }]} onPress={this.logout}>
                        <View style={styles.drawerItemContent}>
                            <CommunityIcon style={styles.drawerItemContentIcon} name='logout-variant' size={25} color='#151E44' />
                            <Text style={styles.drawerItemContentLabel}>{loc.logoutLabelText(this.props.lang)}</Text>
                            <Icon name='chevron-right' size={15} color='#151E44' />
                        </View>
                    </TouchableHighlight>
                </ScrollView>
            </ImageBackground>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        lang: state.appReducer.lang,
        user: state.userReducer.user
    }
}

export default connect(mapStateToProps, {
    setLanguageEn,
    setLanguageEs,
    setUser
})(Menu)

const styles = StyleSheet.create({
    bg: {
        flex: 1,
        flexDirection: 'column'
    },
    header: {
        backgroundColor: '#F2F2F2',
        paddingTop: 30,
        paddingLeft: 15,
        paddingRight: 15,
        paddingBottom: 30,
        alignItems: 'center',
        flexDirection: 'row',
        position: 'relative'
    },
    profileImageContainer: {
        width: 70,
        height: 70,
        backgroundColor: 'darkgray',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 35,
        elevation: 5,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.3)'
    },
    profileUserContainer: {
        flexDirection: 'column',
        marginLeft: 15
    },
    profileUserNameText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#151E44'
    },
    profileUserEmailText: {
        fontSize: 16,
        fontWeight: 'bold',
        fontStyle: 'italic',
        color: 'gray'
    },
    profileEditButton: {
        position: 'absolute',
        bottom: 5,
        right: 10,
        width: 26,
        height: 26,
        borderRadius: 15,
        backgroundColor: '#151E44',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        borderColor: '#151E44',
        borderWidth: 1
    },
    profileLangEnButton: {
        position: 'absolute',
        bottom: 5,
        right: 55,
        width: 26,
        height: 26,
        borderRadius: 15,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        borderColor: '#151E44',
        borderWidth: 1
    },
    profileLangEsButton: {
        position: 'absolute',
        bottom: 5,
        right: 90,
        width: 26,
        height: 26,
        borderRadius: 15,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        borderColor: '#151E44',
        borderWidth: 1
    },
    drawerItemContainer: {
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderBottomWidth: 1,
        borderColor: '#151E4440'
    },
    drawerItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 15,
        paddingBottom: 15,
        paddingLeft: 20,
        paddingRight: 10,
    },
    drawerItemContentIcon: {
        marginRight: 15
    },
    drawerItemContentLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#151E44',
        flex: 1
    }
})