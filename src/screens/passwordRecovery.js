import React, { Component } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, View, ImageBackground, Image, TouchableOpacity, TextInput, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { styles } from './../styles/registerStyles';
import Locale from './../locale';
import axios from 'axios';
import { connect } from "react-redux";
import { setIsLoading, setLanguageEs, setLanguageEn } from "./../actions";
import { HeaderButtons, HeaderButton, Item, } from 'react-navigation-header-buttons';

const MaterialHeaderButton = (props) => (
    <HeaderButton IconComponent={MaterialIcon} iconSize={23} color="black" {...props} />
);

const MaterialHeaderButtons = (props) => {
    return <HeaderButtons HeaderButtonComponent={MaterialHeaderButton} {...props} />;
};

const loc = new Locale();

class PasswordRecovery extends Component {

    constructor(props) {
        super(props);

        this.state = {            
            emailSent: false,
            codeValidated: false,
            email: '',
            recoveryCode: '',
            password: '',
            passwordConfirmation: '',
            formMsg: '',
            formTitle: ''
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

    componentDidMount = async () => {
        await this.setState({
            formTitle: loc.recoveryPasswordOnEmailMsg(this.props.lang)
        })
    }

    validateEmail = (email) => {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email.trim());
    }

    onSubmitForm = async () => {
        await this.props.setIsLoading(true);
        await this.setState({            
            formMsg: ''
        });

        let { emailSent, codeValidated, email, recoveryCode, password, passwordConfirmation } = this.state;

        if (!emailSent) {

            if (!this.validateEmail(email)) {
                this.props.setIsLoading(false);
                this.setState({
                    formMsg: loc.invalidEmailMsg(this.props.lang)
                })
            }

            axios.post(this.props.serverUrl + '/validateRecoveryEmail', {
                email: email
            })
                .then(res => {
                    let { result } = res.data;

                    switch (result) {
                        case 'EMAIL SENT':
                            this.props.setIsLoading(false);
                            this.setState({
                                emailSent: true,
                                formTitle: loc.recoveryPasswordOnCodeMsg(this.props.lang)
                            });
                            break;
                        case 'NOT REGISTERED':
                            this.props.setIsLoading(false);
                            this.setState({
                                formMsg: loc.emailNotRegisteredMsg(this.props.lang)
                            });
                            break;
                        default:
                            this.props.setIsLoading(false);
                            this.setState({
                                formMsg: loc.erroOccurred(this.props.lang)
                            });
                            break;
                    }
                })
                .catch(e => {
                    this.props.setIsLoading(false);
                    this.setState({
                        formMsg: loc.erroOccurred(this.props.lang)
                    });
                })

        } else {
            if (!codeValidated) {
                if (recoveryCode.trim().length < 8) {
                    this.props.setIsLoading(false);
                    this.setState({
                        formMsg: loc.noLengthRecoveryCode(this.props.lang)
                    });
                    return;
                }

                axios.post(this.props.serverUrl + '/validateRecoveryCode', {
                    email: email,
                    recoveryCode: recoveryCode
                })
                    .then(res => {
                        let { result } = res.data;

                        switch (result) {
                            case 'INVALID':
                                this.props.setIsLoading(false);
                                this.setState({
                                    formMsg: loc.invalidCodeMsg(this.props.lang)
                                });
                                break;
                            case 'VALIDATED':
                                this.props.setIsLoading(false);
                                this.setState({
                                    codeValidated: true,
                                    formTitle: loc.recoveryPasswordOnPasswordlMsg(this.props.lang)
                                });
                                break;
                            default:
                                this.props.setIsLoading(false);
                                this.setState({
                                    formMsg: loc.erroOccurred(this.props.lang)
                                });
                                break;
                        }
                    })
                    .catch(e => {
                        this.props.setIsLoading(false);
                        this.setState({
                            formMsg: loc.erroOccurred(this.props.lang)
                        });
                    })
            } else {
                if (password.trim().length < 8) {
                    this.props.setIsLoading(false);
                    this.setState({
                        formMsg: loc.noLengthPasswordMsg(this.props.lang)
                    });
                    return;
                }

                if (password.trim() !== passwordConfirmation.trim()) {
                    this.props.setIsLoading(false);
                    this.setState({
                        formMsg: loc.notMatchingPasswordsMsg(this.props.lang)
                    });
                    return;
                }

                axios.post(this.props.serverUrl + '/changePassword', {
                    email: email,
                    password: password
                })
                    .then(res => {
                        let { result } = res.data;                        

                        switch (result) {
                            case 'UPDATED':
                                this.props.setIsLoading(false);
                                Alert.alert(
                                    "VillaTracking",
                                    loc.passwordUpdatedMsg(this.props.lang),
                                    [
                                        { text: "OK", onPress: () => this.props.navigation.navigate('Login') }
                                    ],
                                    { cancelable: false }
                                );
                                break;
                            default:
                                this.props.setIsLoading(false);
                                this.setState({
                                    formMsg: loc.erroOccurred(this.props.lang)
                                });
                                break;
                        }
                    })
                    .catch(e => {
                        this.props.setIsLoading(false);
                        this.setState({
                            formMsg: loc.erroOccurred(this.props.lang)
                        });
                    })
            }
        }
    }

    render() {
        return (

            <ImageBackground style={[styles.bg, {
                position: 'relative'
            }]} source={require('./../../assets/bg-500.jpg')}>

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

                                <Text style={{
                                    fontSize: 18,
                                    color: 'black',
                                    fontWeight: 'bold',
                                    marginBottom: 10,
                                    textAlign: 'center',
                                    backgroundColor: 'rgba(255,255,255,0.5)',
                                    padding: 5,
                                    borderRadius: 5,
                                    width: '100%'
                                }}>
                                    {
                                        this.state.formTitle
                                    }
                                </Text>

                                <TextInput
                                    textContentType="emailAddress"
                                    keyboardType="email-address"
                                    autoCompleteType="email"
                                    placeholder={loc.emailField(this.props.lang)}
                                    editable={!this.state.emailSent}
                                    style={[
                                        styles.formInput,
                                        styles.lowercase,
                                        {
                                            backgroundColor: this.state.emailSent ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.4)'
                                        }
                                    ]}
                                    onChangeText={(email) => this.setState({ email })}
                                    value={this.state.email}
                                />

                                <TextInput
                                    keyboardType='numeric'
                                    placeholder={loc.recoveryCodeField(this.props.lang)}
                                    editable={!((!this.state.emailSent) || (this.state.emailSent && this.state.codeValidated))}
                                    style={[
                                        styles.formInput,
                                        styles.lowercase,
                                        {
                                            backgroundColor: (!this.state.emailSent) || (this.state.emailSent && this.state.codeValidated) ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.4)'
                                        }
                                    ]}
                                    maxLength={8}
                                    onChangeText={(recoveryCode) => this.setState({ recoveryCode })}
                                    value={this.state.recoveryCode}
                                />

                                <TextInput
                                    textContentType="password"
                                    secureTextEntry={true}
                                    placeholder={loc.newPasswordField(this.props.lang)}
                                    editable={this.state.emailSent && this.state.codeValidated}
                                    style={[
                                        styles.formInput,
                                        {
                                            backgroundColor: this.state.emailSent && this.state.codeValidated ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.7)'
                                        }
                                    ]}
                                    onChangeText={(password) => this.setState({ password })}
                                    value={this.state.password}
                                />

                                <TextInput
                                    textContentType="password"
                                    secureTextEntry={true}
                                    placeholder={loc.passwordConfirmationField(this.props.lang)}
                                    editable={this.state.emailSent && this.state.codeValidated}
                                    style={[
                                        styles.formInput,
                                        {
                                            backgroundColor: this.state.emailSent && this.state.codeValidated ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.7)'
                                        }
                                    ]}
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

                            <TouchableOpacity style={styles.submitButton} onPress={this.onSubmitForm}>
                                <Text style={{ color: 'white', fontSize: 18, textTransform: 'uppercase' }}>
                                    {loc.sendButton(this.props.lang)}
                                </Text>
                            </TouchableOpacity>
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
        isLoading: state.appReducer.isLoading,
        serverUrl: state.appReducer.serverUrl
    }
}

export default connect(mapStateToProps, {
    setIsLoading,
    setLanguageEn,
    setLanguageEs
})(PasswordRecovery)