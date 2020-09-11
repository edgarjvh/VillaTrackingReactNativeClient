import React, { Component } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, View, ImageBackground, Image, TouchableOpacity, TextInput, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { styles } from './../styles/loginStyles';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Locale from './../locale';
import axios from 'axios';
import { connect } from "react-redux";
import { setUser, setIsLoading, setLanguageEs, setLanguageEn } from "./../actions";
import { HeaderButtons, HeaderButton, Item, } from 'react-navigation-header-buttons';
import AsyncStorage from "@react-native-community/async-storage";
import * as Permissions from 'expo-permissions'

const MaterialHeaderButton = (props) => (
    <HeaderButton IconComponent={MaterialIcon} iconSize={23} color="black" {...props} />
);

const MaterialHeaderButtons = (props) => {
    return <HeaderButtons HeaderButtonComponent={MaterialHeaderButton} {...props} />;
};

const loc = new Locale();

class Login extends Component {

    constructor(props) {
        super(props);       

        this.state = {
            email: '',
            password: '',            
            formMsg: ''
        }

        this.props.navigation.setOptions({
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
                        onPress={() => this.props.setLanguageEs()}
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
                        onPress={() => this.props.setLanguageEn()}
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
    }

    componentDidMount() {
        this._getStoragePermissions();
    } 

    _getStoragePermissions = async () => {
        const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL)
        if (status !== 'granted') {
            // display an error
        }
    }

    goToRegistration = () => {
        this.props.navigation.navigate('Register');
    }

    goToPasswordRecovery = () => {
        this.props.navigation.navigate('PasswordRecovery');
    }

    validateEmail = (email) => {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email.trim());
    }

    submitLogin = async () => {
        await this.setState({
            formMsg: ''
        });

        let { email, password } = this.state

        if (email.trim() === '') {
            this.setState({
                formMsg: loc.emptyEmailMsg(this.props.lang)
            });
            return;
        }

        if (password.trim() === '') {
            this.setState({
                formMsg: loc.emptyPasswordMsg(this.props.lang)
            });
            return;
        }

        if (!this.validateEmail(email)) {
            this.setState({
                formMsg: loc.invalidEmailMsg(this.props.lang)
            });
            return;
        }

        this.props.setIsLoading(true);

        axios.post(this.props.serverUrl + '/validateLogin', {
            email: email,
            password: password
        },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        )
            .then(async (res) => {
                let { result, user } = res.data;                

                if (result === 'OK') {
                    await this.props.setIsLoading(false);
                    
                    await AsyncStorage.setItem('@user', JSON.stringify(user));

                    this.props.setUser(user)
                    return;
                }

                if (result === 'INVALID') {
                    await this.props.setIsLoading(false);

                    this.setState({
                        formMsg: loc.invalidCredentials(this.props.lang)
                    });
                    return;
                }

                if (result === 'ERROR') {
                    await this.props.setIsLoading(false);

                    this.setState({
                        formMsg: loc.erroOccurred(this.props.lang)
                    });
                    return;
                }

                if (result === 'VALIDATE') {
                    await this.props.setIsLoading(false);
                    
                    this.props.navigation.navigate('RegisterValidation', { email: email });
                    return;
                }
            })
            .catch(e => {
                this.props.setIsLoading(false);

                this.setState({                    
                    formMsg: loc.erroOccurred(this.props.lang)
                });
            });
    }

    render() {
        return (
            <ImageBackground
                style={[styles.bg, {
                    position: 'relative'
                }]}
                source={require('./../../assets/bg-500.jpg')}>

                {
                    this.props.isLoading &&
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

                    <ScrollView style={{
                        width: '100%'
                    }}
                        contentContainerStyle={{
                            alignItems: 'center'
                        }}
                    >


                        <View style={styles.formContainer}>

                            <View style={styles.formInputContainer}>
                                <TextInput
                                    textContentType="emailAddress"
                                    keyboardType="email-address"
                                    autoCompleteType="email"
                                    placeholder={loc.emailField(this.props.lang)}
                                    editable={!this.props.isLoading}
                                    style={[
                                        styles.formInput,
                                        styles.lowercase,
                                        {
                                            backgroundColor: this.props.isLoading ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.4)'
                                        }
                                    ]}
                                    onChangeText={(email) => this.setState({ email })}
                                    value={this.state.email}
                                />

                                <TextInput
                                    textContentType="password"
                                    secureTextEntry={true}
                                    placeholder={loc.passwordField(this.props.lang)}
                                    editable={!this.props.isLoading}
                                    style={[
                                        styles.formInput,
                                        {
                                            marginBottom: 0,
                                            backgroundColor: this.props.isLoading ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.4)'
                                        }
                                    ]}
                                    onChangeText={(password) => this.setState({ password })}
                                    value={this.state.password}
                                />

                                <Text
                                    style={{
                                        padding: this.state.formMsg === '' ? 0 : 5,
                                        backgroundColor: this.state.formMsg === '' ? 'transparent' : 'rgba(255,255,255,0.3)',
                                        width: '100%',
                                        color: 'darkred',
                                        fontWeight: 'bold',
                                        textAlign: 'center',
                                        borderRadius: 5,
                                        marginTop: 10
                                    }}
                                >
                                    {this.state.formMsg}
                                </Text>
                            </View>

                            <TouchableOpacity style={styles.submitButton} onPress={this.submitLogin}>
                                <Text style={{ color: 'white', fontSize: 18, textTransform: 'uppercase' }}>{loc.submitButton(this.props.lang)}</Text>
                            </TouchableOpacity>

                            <View>
                                <Text
                                    style={{ marginBottom: 15, color: 'white', textDecorationLine: 'underline', fontWeight: 'bold', fontSize: 18 }}
                                    onPress={this.goToPasswordRecovery} >
                                    {loc.forgotPasswordButton(this.props.lang)}
                                </Text>
                            </View>

                            <View style={styles.formFooter}>
                                <Text style={{ fontSize: 18, fontStyle: 'italic', textAlign: 'center', fontWeight: 'bold' }}>
                                    {loc.noAccountText(this.props.lang) + ' '}

                                    <Text style={{ color: 'white', textDecorationLine: 'underline', fontWeight: 'bold' }} onPress={this.goToRegistration} >
                                        {loc.registerButton(this.props.lang)}
                                    </Text>
                                </Text>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </ImageBackground>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        lang: state.appReducer.lang,
        serverUrl: state.appReducer.serverUrl,
        user: state.userReducer.user,
        isLoading: state.appReducer.isLoading
    }
}

export default connect(mapStateToProps, {
    setUser,
    setLanguageEs,
    setLanguageEn,
    setIsLoading
})(Login)