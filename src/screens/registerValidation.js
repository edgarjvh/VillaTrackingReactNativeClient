import React, { Component } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, View, ImageBackground, Image, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { styles } from './../styles/loginStyles';
import Locale from './../locale';
import Axios from 'axios';
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

class RegisterValidation extends Component {

    constructor(props) {
        super(props);

        this.state = {            
            validationCode: '',
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

    componentDidMount = () => {
        
    }

    sendCode = async () => {
        await this.setState({
            formMsg: ''
        });

        let { validationCode } = this.state;

        if (validationCode.trim().length < 8) {
            await this.setState({
                formMsg: loc.noLengthValidationCode(this.props.lang)
            });

            return;
        }

        await this.props.setIsLoading(true);

        Axios.post(loc.serverUrl() + '/validateRegistration', {
            email: this.props.route.params.email,
            validationCode: this.state.validationCode
        })
            .then( res => {
                let { result } = res.data;

                if (result === 'ERROR') {
                    this.props.setIsLoading(false);
                    this.setState({                        
                        formMsg: loc.erroOccurred(this.props.lang)
                    });

                    return;
                }

                if (result === 'INVALID') {
                    this.props.setIsLoading(false);
                    this.setState({
                        formMsg: loc.invalidCodeMsg(this.props.lang)
                    });

                    return;
                }

                this.props.setIsLoading(false);

                Alert.alert(
                    "VillaTracking",
                    loc.registerValidatedMsg(this.props.lang),
                    [
                        { text: "OK", onPress: () => this.props.navigation.navigate('Login') }
                    ],
                    { cancelable: false }
                );
            })
            .catch(e => {
                this.props.setIsLoading(false);
                this.setState({
                    formMsg: loc.erroOccurred(this.props.lang)
                });
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
                                <Text style={{
                                    fontSize: 18,
                                    color: 'black',
                                    fontWeight: 'bold',
                                    marginBottom: 10,
                                    textAlign: 'center',
                                    backgroundColor: 'rgba(255,255,255,0.5)',
                                    padding: 5,
                                    borderRadius: 5
                                }}>
                                    <Text style={{
                                        fontSize: 18,
                                        color: 'darkred',
                                        fontWeight: 'bold'
                                    }}>
                                        {this.props.route.params.email || ''}
                                    </Text>

                                    {
                                        '\n' + loc.registerValidationTitleMsg(this.props.lang)
                                    }
                                </Text>

                                <TextInput
                                    keyboardType="numeric"
                                    placeholder={loc.validationCodeField(this.props.lang)}
                                    editable={!this.props.isLoading}
                                    maxLength={8}
                                    style={[
                                        styles.formInput,
                                        styles.lowercase,
                                        {
                                            backgroundColor: this.props.isLoading ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.4)',
                                            textAlign: 'center',
                                            fontSize: 20
                                        }
                                    ]}
                                    onChangeText={(validationCode) => this.setState({ validationCode })}
                                    value={this.state.validationCode}
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

                            <TouchableOpacity style={styles.submitButton} onPress={this.sendCode}>
                                <Text style={{ color: 'white', fontSize: 18, textTransform: 'uppercase' }}>{loc.sendButton(this.props.lang)}</Text>
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
        isLoading: state.appReducer.isLoading
    }
}

export default connect(mapStateToProps, {
    setIsLoading,
    setLanguageEn,
    setLanguageEs
})(RegisterValidation)