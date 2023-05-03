import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, View, ImageBackground, Image, TouchableOpacity, TextInput, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { styles } from './../styles/loginStyles';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Locale from './../locale';
import axios from 'axios';
import { connect } from "react-redux";
import { setUser, setLanguageEs, setLanguageEn } from "./../actions";
import { HeaderButtons, HeaderButton, Item, } from 'react-navigation-header-buttons';
import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Camera } from 'expo-camera';

const MaterialHeaderButton = (props) => (
    <HeaderButton IconComponent={MaterialIcon} iconSize={23} color="black" {...props} />
);

const MaterialHeaderButtons = (props) => {
    return <HeaderButtons HeaderButtonComponent={MaterialHeaderButton} {...props} />;
};

const loc = new Locale();

const Login = (props) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [formMsg, setFormMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        props.navigation.setOptions({
            headerRight: () => (
                <MaterialHeaderButtons>
                    <TouchableOpacity
                        activeOpacity={0.5}
                        style={{
                            width: 30,
                            height: 30,
                            padding: 0,
                            borderWidth: 2,
                            borderColor: '#D8D8D8',
                            borderRadius: 15
                        }}
                        // onPress={() => { props.setLanguageEs() }}
                    >
                        <Image
                            source={require('./../../assets/es-flag.png')}
                            style={{
                                width: '100%',
                                height: '100%'
                            }} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.5}
                        style={{
                            width: 30,
                            height: 30,
                            padding: 0,
                            borderWidth: 2,
                            borderColor: '#D8D8D8',
                            borderRadius: 15,
                            marginLeft: 20,
                            marginRight: 10
                        }}
                        onPress={() => { props.setLanguageEn() }}
                    >
                        <Image
                            source={require('./../../assets/us-flag.png')}
                            style={{
                                width: '100%',
                                height: '100%'
                            }} />
                    </TouchableOpacity>
                </MaterialHeaderButtons>
            )
        })
    })

    useEffect(() => {
        _getStoragePermissions();
    }, []);

    const _getStoragePermissions = async () => {
        // const { status } = await Camera.requestCameraPermissionsAsync();
        // if (status !== 'granted') {
        //     // display an error
        // }
    }

    const goToRegistration = () => {
        props.navigation.navigate('Register');
    }

    const goToPasswordRecovery = () => {
        props.navigation.navigate('PasswordRecovery');
    }

    const validateEmail = (email) => {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email.trim());
    }

    const submitLogin = async () => {
        await setFormMsg('');

        if (email.trim() === '') {
            setFormMsg(loc.emptyEmailMsg(props.lang));
            return;
        }

        if (password.trim() === '') {
            setFormMsg(loc.emptyPasswordMsg(props.lang));
            return;
        }

        if (!validateEmail(email)) {
            setFormMsg(loc.invalidEmailMsg(props.lang));
            return;
        }

        setIsLoading(true);

        axios.post(props.serverUrl + '/validateLogin', {
            email: email,
            password: password
        },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        ).then(async (res) => {
            let { result, user } = res.data;

            if (result === 'OK') {
                await setIsLoading(false);
                await AsyncStorage.setItem('@user', JSON.stringify(user));
                props.setUser(user)
                return;
            }

            if (result === 'INVALID') {
                await setIsLoading(false);
                setFormMsg(loc.invalidCredentials(props.lang));
                return;
            }

            if (result === 'ERROR') {
                await setIsLoading(false);
                setFormMsg(loc.erroOccurred(props.lang));
                return;
            }

            if (result === 'VALIDATE') {
                await setIsLoading(false);
                props.navigation.navigate('RegisterValidation', { email: email });
                return;
            }
        }).catch(e => {
            setIsLoading(false);
            setFormMsg(loc.erroOccurred(props.lang));
            console.log(e)
        });
    }

    return (
        <ImageBackground
            style={[styles.bg, {
                position: 'relative'
            }]}
            source={require('./../../assets/bg-500.jpg')}>
            {
                isLoading &&
                <View style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 5
                }}>
                    <ActivityIndicator size='large' color='white' />
                </View>
            }

            <StatusBar style="dark" />
            <View style={styles.logoView}>
                <Image source={require('./../../assets/logo2.png')} style={styles.logo} />
            </View>

            <View style={styles.body}>
                <ScrollView style={{ width: '100%' }} contentContainerStyle={{ alignItems: 'center' }}>
                    <View style={styles.formContainer}>
                        <View style={styles.formInputContainer}>
                            <TextInput
                                textContentType="emailAddress"
                                keyboardType="email-address"
                                autoCompleteType="email"
                                autoCapitalize='none'
                                placeholder={loc.emailField(props.lang)}
                                editable={!isLoading}
                                style={[
                                    styles.formInput,
                                    {
                                        backgroundColor: props.isLoading ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.4)'
                                    }
                                ]}
                                onChangeText={(email) => { setEmail(email) }}
                                value={email}
                            />

                            <TextInput
                                textContentType="password"
                                secureTextEntry={true}
                                placeholder={loc.passwordField(props.lang)}
                                editable={!isLoading}
                                style={[
                                    styles.formInput,
                                    {
                                        marginBottom: 0,
                                        backgroundColor: props.isLoading ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.4)'
                                    }
                                ]}
                                onChangeText={(password) => { setPassword(password) }}
                                value={password}
                            />

                            <Text
                                style={{
                                    padding: formMsg === '' ? 0 : 5,
                                    backgroundColor: formMsg === '' ? 'transparent' : 'rgba(255,255,255,0.3)',
                                    width: '100%',
                                    color: 'darkred',
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    borderRadius: 5,
                                    marginTop: 10
                                }}
                            >
                                {formMsg}
                            </Text>
                        </View>

                        <TouchableOpacity style={styles.submitButton} onPress={() => { submitLogin() }}>
                            <Text style={{ color: 'white', fontSize: 18, textTransform: 'uppercase' }}>{loc.submitButton(props.lang)}</Text>
                        </TouchableOpacity>

                        <View>
                            <Text
                                style={{ marginBottom: 15, color: 'white', textDecorationLine: 'underline', fontWeight: 'bold', fontSize: 18 }}
                                onPress={() => { goToPasswordRecovery() }} >
                                {loc.forgotPasswordButton(props.lang)}
                            </Text>
                        </View>

                        <View style={styles.formFooter}>
                            <Text style={{ fontSize: 18, fontStyle: 'italic', textAlign: 'center', fontWeight: 'bold' }}>
                                {loc.noAccountText(props.lang) + ' '}

                                <Text style={{ color: 'white', textDecorationLine: 'underline', fontWeight: 'bold' }} onPress={() => { goToRegistration() }} >
                                    {loc.registerButton(props.lang)}
                                </Text>
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </ImageBackground>
    )
}

const mapStateToProps = (state) => {
    return {
        lang: state.appReducer.lang,
        serverUrl: state.appReducer.serverUrl,
        user: state.userReducer.user,
    }
}

export default connect(mapStateToProps, {
    setUser,
    setLanguageEs,
    setLanguageEn
})(Login)