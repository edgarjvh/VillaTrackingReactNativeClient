import React, { Component } from 'react';
import { View, Text, StyleSheet, TextInput, Modal, ActivityIndicator, Alert, TouchableOpacity, Image } from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { connect } from 'react-redux';
import Locale from './../locale.ts';
import { HeaderButtons, HeaderButton, Item } from 'react-navigation-header-buttons';
import moment from 'moment';
import { setIsLoading } from "./../actions";
import axios from 'axios';
import FormData from 'form-data';
import * as Permissions from 'expo-permissions'
import * as ImagePicker from 'expo-image-picker'

const MaterialHeaderButton = (props) => (
    <HeaderButton IconComponent={MaterialIcon} iconSize={23} color="black" {...props} />
);

const MaterialHeaderButtons = (props) => {
    return <HeaderButtons HeaderButtonComponent={MaterialHeaderButton} {...props} />;
};

const loc = new Locale();

class Suggestions extends Component {

    constructor(props) {
        super(props);

        this.state = {
            subject: '',
            message: '',
            imageUri: null,
            imageWidth: 0,
            imageHeight: 0,
            selectingImageSource: false
        }

        this.props.navigation.setOptions({

            headerRight: () => (
                <MaterialHeaderButtons>
                    <Item title="image" iconName="image" onPress={() => this.setState({ selectingImageSource: true })} />
                    <Item
                        title="send"
                        iconName="send"
                        disabled={this.state.subject.trim() === '' || this.state.message.trim() === ''}
                        color={(this.state.subject.trim() === '' || this.state.message.trim() === '') ? 'rgba(0,0,0,0.3)' : 'black'}
                        onPress={this.sendSuggestion} />
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

    sendSuggestion = () => {
        this.props.setIsLoading(true);

        let form = new FormData();

        axios.post(this.props.serverUrl + '/sendSuggestion', {
            user_id: this.props.user.id,
            date_time: moment().format('YYYY-MM-DD HH:mm:ss'),
            subject: this.state.subject,
            msg: this.state.message
        }, {
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(res => {
                switch (res.data.result) {
                    case 'SENT':
                        this.props.setIsLoading(false);
                        this.setState({
                            subject: '',
                            message: ''
                        })
                        Alert.alert('VillaTracking', loc.suggestionSentSuccessfullyMsg(this.props.lang));
                        break;
                    default:
                        this.props.setIsLoading(false);
                        Alert.alert('VillaTracking', loc.erroOccurred(this.props.lang));
                        console.log(res.data)
                        break;
                }
            })
            .catch(e => {
                this.props.setIsLoading(false);
                Alert.alert('VillaTracking', loc.erroOccurred(this.props.lang));
                console.log(e)
            })
    }

    selectImageFromGallery = async () => {
        const { status } = await ImagePicker.requestCameraRollPermissionsAsync();

        if (status !== 'granted') {
            return;
        }

        const { uri, cancelled } = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true
        });

        if (!cancelled) {
            await this.setState({
                selectingImageSource: false,
                imageUri: uri
            })

            console.log(this.state.imageUri)
        }


    }

    selectImageFromCamera = async () => {
        const { status } = await Permissions.askAsync(Permissions.CAMERA);

        if (status !== 'granted') {
            return;
        }

        const { uri, cancelled } = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true
        });

        if (!cancelled) {
            await this.setState({
                selectingImageSource: false,
                imageUri: uri
            })


            console.log(typeof this.state.imageUri, this.state.imageUri)
        }
    }

    render() {
        return (
            <View style={styles.container}>

                <Modal
                    transparent={true}
                    visible={this.props.isLoading}
                    animationType={'slide'}
                    onRequestClose={() => this.props.setIsLoading(false)}
                >
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
                </Modal>

                <Modal
                    transparent={true}
                    visible={this.state.selectingImageSource}
                    animationType={'slide'}
                    onRequestClose={() => this.setState({ selectingImageSource: false })}>

                    <View style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        justifyContent: 'flex-end',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 5
                    }}>
                        <View style={{
                            backgroundColor: 'white',
                            padding: 15,
                            flexDirection: 'row',
                            justifyContent: 'space-evenly'
                        }}>
                            <TouchableOpacity
                                style={{
                                    borderWidth: 1,
                                    borderRadius: 10,
                                    borderColor: 'rgba(0,0,0,0.1)',
                                    paddingHorizontal: 10,
                                    paddingVertical: 5,
                                    backgroundColor: 'rgba(0,0,0,0.05)'
                                }}
                                activeOpacity={0.7}
                                onPress={this.selectImageFromGallery}>
                                <MaterialIcon name='image' size={80} color='black' />
                                <Text>{loc.fromGalleryLabel(this.props.lang)}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{
                                    borderWidth: 1,
                                    borderRadius: 10,
                                    borderColor: 'rgba(0,0,0,0.1)',
                                    paddingHorizontal: 10,
                                    paddingVertical: 5,
                                    backgroundColor: 'rgba(0,0,0,0.05)'
                                }}
                                activeOpacity={0.7}
                                onPress={this.selectImageFromCamera}>
                                <MaterialIcon name='camera' size={80} color='black' />
                                <Text>{loc.fromCameraLabel(this.props.lang)}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                </Modal>

                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>{loc.subjectTextLabel(this.props.lang)} *</Text>
                    <TextInput style={styles.fieldInput} maxLength={50}
                        onChangeText={(subject) => this.setState({ subject })}
                        value={this.state.subject} />
                </View>

                <View style={[styles.fieldContainer, {
                    flex: 1
                }]}>
                    <Text style={styles.fieldLabel}>{loc.messageTextLabel(this.props.lang)} *</Text>
                    <TextInput style={[styles.fieldInput, {
                        flex: 1,
                        textAlignVertical: 'top',
                        paddingVertical: 10
                    }]}
                        onChangeText={(message) => this.setState({ message })}
                        value={this.state.message}
                        multiline={true} />
                </View>


                {
                    this.state.imageUri &&
                    <Image
                        source={{
                            uri: this.state.imageUri
                        }}
                        style={{
                            width: 200,
                            height: 200,
                            resizeMode: 'contain'
                        }} />
                }
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: 'orange'
    },
    fieldContainer: {
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
        overflow: 'hidden',
        marginBottom: 5
    },
    fieldLabel: {
        padding: 5,
        backgroundColor: 'rgba(0,0,0,0.1)',
        fontWeight: 'bold',
        fontStyle: 'italic'
    },
    fieldInput: {
        height: 40,
        paddingLeft: 8
    }
})

const mapStateToProps = (state) => {
    return {
        lang: state.appReducer.lang,
        isLoading: state.appReducer.isLoading,
        serverUrl: state.appReducer.serverUrl,
        user: state.userReducer.user
    }
}

export default connect(mapStateToProps, {
    setIsLoading
})(Suggestions)

