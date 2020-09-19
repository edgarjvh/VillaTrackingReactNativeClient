import React, { Component } from "react";
import { connect } from "react-redux";
import { View, Text, StyleSheet, ActivityIndicator, Modal, Alert, TouchableOpacity, FlatList, TextInput } from "react-native";
import { MaterialCommunityIcons, FontAwesome } from "react-native-vector-icons";
import Locale from './../locale';
import { HeaderButtons, HeaderButton, Item } from 'react-navigation-header-buttons';
import axios from "axios";
import { Badge } from "react-native-elements";
import {
    setDevices,
    setGeofences,
    setDevicesModels,
    setGroups,
    setIsLoading
} from "./../actions";

const MaterialHeaderButton = (props) => (
    <HeaderButton IconComponent={MaterialCommunityIcons} iconSize={23} {...props} />
);

const MaterialHeaderButtons = (props) => {
    return <HeaderButtons HeaderButtonComponent={MaterialHeaderButton} {...props} />;
};

const loc = new Locale();

class Geofences extends Component {
    constructor(props) {
        super(props)

        this.state = {
            searchText: '',
            selectedGeofence: null,
            modalVisible: false,
            refreshingList: false
        }

        this.props.navigation.setOptions({
            headerRight: () => (
                <MaterialHeaderButtons>
                    <Item title="add" iconName="file-plus" onPress={() => this.props.navigation.navigate('GeofenceMaintainer', { type: 'add', geofenceId: 0 })} />
                    <Item title="menu" iconName="menu" onPress={() => this.props.navigation.toggleDrawer()} />
                </MaterialHeaderButtons>
            )
        })
    }

    componentDidUpdate() {
        this.props.navigation.setOptions({
            headerTitle: loc.geofencesLabel(this.props.lang) + ' (' + this.props.geofences.length + ')'
        })
    }

    componentDidMount() {
        this.props.navigation.setOptions({
            headerTitle: loc.geofencesLabel(this.props.lang) + ' (' + this.props.geofences.length + ')'
        })
    }

    refreshGeofenceList = async () => {
        await this.setState({ refreshingList: true });

        axios.post(this.props.serverUrl + '/getDevicesPayload', {
            id: this.props.user.id
        },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        )
            .then(async res => {
                const deviceModels = res.data.deviceModels;
                const devices = res.data.devices;
                const groups = res.data.groups;
                const geofences = res.data.geofences;

                await this.props.setDevices(devices);
                await this.props.setDevicesModels(deviceModels);
                await this.props.setGroups(groups);
                await this.props.setGeofences(geofences);
                this.setState({ refreshingList: false });
            })
            .catch(e => {
                console.log(e);
                this.setState({ refreshingList: false });
            });
    }

    goToEdition = () => {
        this.setState({
            modalVisible: false
        });

        this.props.navigation.navigate('GeofenceMaintainer', { type: 'edit', geofenceId: this.state.selectedGeofence.id });
    }

    showGeofenceDevices = () => {
        this.setState({
            modalVisible: false
        });

        this.props.navigation.navigate('Devices', { groupId: 0, geofenceId: this.state.selectedGeofence.id, origin: 'geofences' });
    }

    deleteGeofence = () => {
        this.props.setIsLoading(true);

        axios.post(this.props.serverUrl + '/deleteGeofence', {
            userId: this.props.user.id,
            geofenceId: this.state.selectedGeofence.id
        },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            })
            .then(async res => {
                switch (res.data.result) {
                    case 'OK':
                        this.props.setIsLoading(false);
                        await this.props.setDevices(res.data.devices);
                        await this.props.setDevicesModels(res.data.deviceModels);
                        await this.props.setGeofences(res.data.geofences);

                        this.setState({
                            searchText: '',
                            selectedGeofence: null,
                            modalVisible: false,
                            refreshingList: false
                        });
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

    renderItem = ({ item }) => {
        return <View style={[styles.geofenceItemContainer, { backgroundColor: item.status === 0 ? '#F6CECE' : '#FFF' }]}>
            <View style={{ flexDirection: 'column', flex: 1 }}>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={{ marginRight: 10, fontSize: 18 }}>{item.name}</Text>
                    <Badge value={item.devices.length} status='primary' />
                </View>
                <View>
                    <Text>
                        {item.description}
                    </Text>
                </View>
            </View>
            <TouchableOpacity activeOpacity={0.5} onPress={() => this.setState({ modalVisible: true, selectedGeofence: item })}>
                <MaterialCommunityIcons name="dots-vertical" size={30} color="#151E44" />
            </TouchableOpacity>
        </View>
    }

    render() {
        return (
            <View style={styles.container}>
                <Modal
                    transparent={true}
                    visible={this.state.modalVisible}
                    animationType={'slide'}
                    onRequestClose={() => this.setState({ modalVisible: false, selectedGeofence: null })}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent} >
                            <TouchableOpacity style={styles.modalButtonContainer} onPress={this.goToEdition} >
                                <View style={styles.modalButtonContent}>
                                    <MaterialCommunityIcons name="file-document-edit" size={25} />
                                    <Text style={styles.modalButtonText}>{loc.editButtonLabel(this.props.lang)}</Text>
                                    <MaterialCommunityIcons name="chevron-right" size={30} />
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.modalButtonContainer} onPress={this.showGeofenceDevices} >
                                <View style={styles.modalButtonContent}>
                                    <MaterialCommunityIcons name="eight-track" size={25} />
                                    <Text style={styles.modalButtonText}>{loc.associatedDevicesLabel(this.props.lang)}</Text>
                                    <MaterialCommunityIcons name="chevron-right" size={30} />
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.modalButtonContainer, { backgroundColor: 'rgba(255,0,0,0.3)' }]} onPress={() => {
                                Alert.alert(
                                    loc.geofenceDeletePromptTitle(this.props.lang),
                                    loc.geofenceDeletePromptQuestion(this.props.lang) + ' ' + this.state.selectedGeofence.name + '?',
                                    [
                                        {
                                            text: loc.cancelButtonLabel(this.props.lang),
                                            onPress: () => console.log('Cancel Pressed!')
                                        },
                                        {
                                            text: loc.acceptButtonLabel(this.props.lang),
                                            onPress: this.deleteGeofence
                                        }
                                    ],
                                    {
                                        cancelable: false
                                    }
                                )
                            }}>
                                <View style={styles.modalButtonContent}>
                                    <MaterialCommunityIcons name="delete" size={25} />
                                    <Text style={styles.modalButtonText}>{loc.deleteButtonLabel(this.props.lang)}</Text>
                                    <MaterialCommunityIcons name="chevron-right" size={30} />
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.modalButtonContainer, { backgroundColor: 'transparent' }]}
                                onPress={() => this.setState({ modalVisible: false })}>
                                <View style={styles.modalButtonContent}>
                                    <Text style={[styles.modalButtonText, { textAlign: 'center', marginLeft: 0 }]}>{loc.cancelButtonLabel(this.props.lang)}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                <View style={styles.searchContainer}>
                    <FontAwesome name="search" size={20} color="#151E44" />
                    <TextInput
                        style={{ flex: 1, fontSize: 16, marginLeft: 10, color: '#151E44' }}
                        keyboardType="web-search"
                        placeholder={loc.searchField(this.props.lang)}
                        onChangeText={(text) => this.setState({ searchText: text })}
                        value={this.state.searchText}
                    />
                    {
                        this.state.searchText.trim() !== '' &&
                        <FontAwesome style={{ marginLeft: 10 }} name="times" size={20} color="#151E4499" onPress={() => this.setState({ searchText: '' })} />
                    }
                </View>

                <FlatList
                    extraData={true}
                    data={
                        this.props.geofences.filter(geofence => {
                            let text = this.state.searchText.toLowerCase();

                            if (text.trim() === '') {
                                return geofence
                            } else {
                                if (geofence.name.toLowerCase().includes(text.trim()) ||
                                    geofence.description.toLowerCase().includes(text.trim())) {
                                    return geofence
                                }
                            }
                        })
                    }
                    renderItem={this.renderItem}
                    ListEmptyComponent={() =>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Text>{loc.noGeofencesToShowMessage(this.props.lang)}</Text>
                        </View>
                    }
                    ItemSeparatorComponent={() =>
                        <View style={{
                            height: 5
                        }}></View>
                    }
                    onRefresh={this.refreshGeofenceList}
                    refreshing={this.state.refreshingList}
                    keyExtractor={(item => item.id.toString())}
                ></FlatList>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#f1f1f1',
        padding: 10,
        position: 'relative'
    },
    searchContainer: {
        flexDirection: 'row',
        borderWidth: 1,
        padding: 10,
        borderRadius: 5,
        backgroundColor: 'white',
        borderColor: 'rgba(0,0,0,0.1)',
        elevation: 2,
        alignItems: 'center',
        marginBottom: 5
    },
    geofenceItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 8,
        overflow: 'hidden',
        elevation: 1,
        borderColor: 'rgba(0,0,0,0.2)',
        borderWidth: 1,
        justifyContent: 'space-between',
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 5,
        paddingBottom: 5
    },
    modalContainer: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1
    },
    modalContent: {
        backgroundColor: 'white',
        width: '90%',
        maxWidth: 380,
        padding: 10,
        borderRadius: 10
    },
    modalButtonContainer: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 5,
        width: '100%',
        marginBottom: 10
    },
    modalButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10
    },
    modalButtonText: {
        fontSize: 18,
        marginLeft: 15,
        flex: 1,
        fontWeight: 'bold'
    }
});

const mapStateToProps = state => {
    return {
        lang: state.appReducer.lang,
        serverUrl: state.appReducer.serverUrl,
        user: state.userReducer.user,
        geofences: state.geofenceReducer.geofences
    }
}

export default connect(mapStateToProps, {
    setIsLoading,
    setDevices,
    setGeofences,
    setGroups,
    setDevicesModels
})(Geofences)