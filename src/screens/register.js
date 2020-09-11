import React, { Component } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, View, ImageBackground, Image, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { styles } from './../styles/registerStyles';
import Locale from './../locale';
import axios from 'axios';
import { connect } from "react-redux";
import { setIsLoading, setLanguageEn, setLanguageEs } from "./../actions";
import { HeaderButtons, HeaderButton, Item, } from 'react-navigation-header-buttons';

const MaterialHeaderButton = (props) => (
    <HeaderButton IconComponent={MaterialIcon} iconSize={23} color="black" {...props} />
);

const MaterialHeaderButtons = (props) => {
    return <HeaderButtons HeaderButtonComponent={MaterialHeaderButton} {...props} />;
};

const loc = new Locale();

class Register extends Component {

    constructor(props) {
        super(props);

        this.state = {            
            name: '',
            email: '',
            password: '',
            passwordConfirmation: '',
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

    goToLogin = () => {
        this.props.navigation.navigate('Login')
    }

    onInputName = async (e) => {
        await this.setState({
            name: e.nativeEvent.text
        });
    }

    onInputEmail = async (e) => {
        await this.setState({
            email: e.nativeEvent.text
        });
    }

    onInputPassword = async (e) => {
        await this.setState({
            password: e.nativeEvent.text
        });
    }

    onInputPasswordConfirmation = async (e) => {
        await this.setState({
            passwordConfirmation: e.nativeEvent.text
        });
    }

    validateEmail = (email) => {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email.trim());
    }

    sendingForm = async () => {
        this.setState({
            formMsg: ''
        });

        let { name, email, password, passwordConfirmation } = this.state

        if (name.trim() === '') {
            this.setState({
                formMsg: loc.emptyNameMsg(this.props.lang)
            });
            return;
        }

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

        if (password.trim().length < 8) {
            this.setState({
                formMsg: loc.noLengthPasswordMsg(this.props.lang)
            });
            return;
        }

        if (password.trim() !== passwordConfirmation.trim()) {
            this.setState({
                formMsg: loc.notMatchingPasswordsMsg(this.props.lang)
            });
            return;
        }

        await this.props.setIsLoading(true);

        axios.post(
            loc.serverUrl() + '/registerUser',
            {
                name: name.trim(),
                email: email.trim(),
                password: password.trim()
            },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        )
            .then(res => {
                let { result } = res.data;

                if (result === 'EXIST') {
                    this.props.setIsLoading(false);
                    this.setState({
                        formMsg: loc.emailAlreadyRegisteredMsg(this.props.lang)
                    })

                    return;
                }

                if (result === 'VALIDATE') {
                    this.props.navigation.replace('RegisterValidation', { email: this.state.email })
                }
            })
            .catch(e => {
                this.props.setIsLoading(false);
                this.setState({
                    formMsg: loc.erroOccurred(this.props.lang)
                })
            })
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
                                    placeholder={loc.nameField(this.props.lang)}
                                    style={[styles.formInput]}
                                    onChangeText={(name) => this.setState({ name })}
                                    value={this.state.name}
                                />

                                <TextInput
                                    keyboardType="email-address" 
                                    textContentType="emailAddress"
                                    autoCompleteType="email"  
                                    placeholder={loc.emailField(this.props.lang)}
                                    style={[styles.formInput, styles.lowercase]}
                                    onChangeText={(email) => this.setState({ email })}
                                    value={this.state.email}
                                />

                                <TextInput
                                    textContentType="password"
                                    secureTextEntry={true}
                                    placeholder={loc.passwordField(this.props.lang)}
                                    style={styles.formInput}
                                    onChangeText={(password) => this.setState({ password })}
                                    value={this.state.password}
                                />

                                <TextInput
                                    textContentType="password"
                                    secureTextEntry={true}
                                    placeholder={loc.passwordConfirmationField(this.props.lang)}
                                    style={styles.formInput}
                                    onChangeText={(passwordConfirmation) => this.setState({ passwordConfirmation })}
                                    value={this.state.passwordConfirmation}
                                />

                                <Text
                                    style={{
                                        padding: this.state.formMsg === '' ? 0 : 5,
                                        backgroundColor: this.state.formMsg === '' ? 'transparent' : 'rgba(255,255,255,0.3)',
                                        width: '100%',
                                        color: 'darkred',
                                        fontWeight: 'bold',
                                        textAlign: 'center',
                                        borderRadius: 5
                                    }}
                                >
                                    {this.state.formMsg}
                                </Text>

                            </View>



                            <TouchableOpacity style={styles.submitButton} onPress={this.sendingForm}>
                                <Text style={{ color: 'white', fontSize: 18, textTransform: 'uppercase' }}>{loc.submitButton(this.props.lang)}</Text>
                            </TouchableOpacity>

                            <View style={styles.formFooter}>
                                <Text style={{ fontSize: 18, fontStyle: 'italic', textAlign: 'center', fontWeight: 'bold' }}>
                                    {loc.alreadyAccountText(this.props.lang) + ' '}

                                    <Text style={{ color: 'white', textDecorationLine: 'underline', fontWeight: 'bold' }} onPress={this.goToLogin}>
                                        {loc.loginTitle(this.props.lang)}
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
        isLoading: state.appReducer.isLoading
    }
}

export default connect(mapStateToProps, {
    setIsLoading,
    setLanguageEn,
    setLanguageEs
})(Register)