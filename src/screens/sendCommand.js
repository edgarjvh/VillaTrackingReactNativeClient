import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, ImageBackground } from 'react-native';
import { FontAwesome, MaterialCommunityIcons, FontAwesome5 } from 'react-native-vector-icons';
import { connect } from 'react-redux';
import Locale from './../locale.ts';
import { HeaderButtons, HeaderButton, Item } from 'react-navigation-header-buttons';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/es';
import { TouchableOpacity } from 'react-native-gesture-handler';

const MaterialHeaderButton = (props) => (
    <HeaderButton IconComponent={MaterialCommunityIcons} iconSize={23} color="black" {...props} />
);

const MaterialHeaderButtons = (props) => {
    return <HeaderButtons HeaderButtonComponent={MaterialHeaderButton} {...props} />;
};

const loc = new Locale();

const sendCommand = (props) => {
    useEffect(() => {
        props.navigation.setOptions({
            headerRight: () => (
                <MaterialHeaderButtons>
                    <Item title="menu" iconName="menu" onPress={() => props.navigation.toggleDrawer()} />
                </MaterialHeaderButtons>
            )
        });

        props.navigation.setOptions({
            headerTitle: loc.sendCommandTitle(props.lang)
        })
    })

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.buttonContainer} onPress={() => {
                if (props.socket){
                    props.socket.emit('send command', { imei: props.route.params.imei, action: 1 });
                    console.log('start engine sent!');
                }
            }}>
                <ImageBackground source={require('./../../assets/start_engine_button.png')} style={{
                    width: 150,
                    height: 150
                }}>
                    <View style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        justifyContent: 'center',
                        alignItems: 'center',
                        overflow: 'hidden',
                        padding: 15
                    }}>
                        <Text style={{ fontSize: 30, textAlign: 'center', fontWeight: 'bold' }}>
                            {loc.startEngineButtonTitle(props.lang)}
                        </Text>
                    </View>

                </ImageBackground>
            </TouchableOpacity>

            <TouchableOpacity style={styles.buttonContainer} onPress={() => {
                if (props.socket){
                    props.socket.emit('send command', { imei: props.route.params.imei, action: 0 });
                    console.log('stop engine sent!');
                }
            }}>
                <ImageBackground source={require('./../../assets/stop_engine_button.png')} style={{
                    width: 150,
                    height: 150
                }}>
                    <View style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        justifyContent: 'center',
                        alignItems: 'center',
                        overflow: 'hidden',
                        padding: 15
                    }}>
                        <Text style={{ fontSize: 30, textAlign: 'center', fontWeight: 'bold' }}>
                            {loc.stopEngineButtonTitle(props.lang)}
                        </Text>
                    </View>

                </ImageBackground>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#f1f1f1',
        padding: 10,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonContainer: {
        display: 'flex',
        position: 'relative',
        width: 150,
        height: 150,
        margin: 20
    },
    button: {
        width: 100,
        height: 100,
        resizeMode: 'contain',
        transform: [
            { scale: 1 }
        ],
        borderRadius: 100 / 2
    },
    buttonText: {
        position: 'absolute',
        zIndex: 2,
        fontSize: 24
    }
})

const mapStateToProps = (state) => {
    return {
        lang: state.appReducer.lang,
        serverUrl: state.appReducer.serverUrl,
        user: state.userReducer.user,
        socket: state.appReducer.socket
    }
}

export default connect(mapStateToProps, null)(sendCommand)