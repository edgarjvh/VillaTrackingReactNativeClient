import React, { Component } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, TouchableOpacity, FlatList, Modal, ActivityIndicator } from 'react-native';
import { FontAwesome, MaterialCommunityIcons, FontAwesome5 } from 'react-native-vector-icons';
import { connect } from 'react-redux';
import Locale from './../locale.ts';
import { HeaderButtons, HeaderButton, Item } from 'react-navigation-header-buttons';
import {
    setIsLoading,
    setDevices,
    setDevicesModels,
    setDevicesShown,
    setAutoCenterDevice,
    setDeviceHistoryType,
    setDeviceHistory,
    setDeviceHistoryCoords,
    setDeviceHistoryHigherSpeed,
    setDeviceHistoryDistance,
    setDeviceHistoryFuelConsumption,
    setDeviceHistoryTimeMove,
    setDeviceHistoryTimeStop,
    setDeviceHistoryAlertsTime,
    setGroups
} from './../actions';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/es';

const MaterialHeaderButton = (props) => (
    <HeaderButton IconComponent={MaterialCommunityIcons} iconSize={23} color="black" {...props} />
);

const MaterialHeaderButtons = (props) => {
    return <HeaderButtons HeaderButtonComponent={MaterialHeaderButton} {...props} />;
};

const loc = new Locale();

class Devices extends Component {
    constructor(props) {
        super(props);

        this.state = {
            searchText: '',
            selectedDevice: null,
            modalVisible: false,
            devicesList: [],
            refreshingList: false
        }

        this.props.navigation.setOptions({

            headerRight: () => (
                <MaterialHeaderButtons>
                    <Item title="add" iconName="plus" onPress={() => this.props.navigation.navigate('DeviceMaintainer', { type: 'add', deviceId: 0 })} />
                    <Item title="menu" iconName="menu" onPress={() => this.props.navigation.toggleDrawer()} />
                </MaterialHeaderButtons>
            )
        });

        moment.locale(this.props.lang);
    }

    componentDidUpdate() {
        this.props.navigation.setOptions({
            headerTitle: loc.devicesLabelText(this.props.lang) + ' (' + this.props.devices.length + ')'
        })

        moment.locale(this.props.lang);
    }

    componentDidMount() {
        this.props.navigation.setOptions({
            headerTitle: loc.devicesLabelText(this.props.lang) + ' (' + this.props.devices.length + ')'
        })

        this.setState({
            devicesList: this.props.devices
        })
    }

    goToEdition = () => {
        this.setState({
            modalVisible: false
        });

        this.props.navigation.navigate('DeviceMaintainer', { type: 'edit', deviceId: this.state.selectedDevice.id });
    }

    showOnMap = () => {
        this.setState({
            modalVisible: false
        });

        let devicesShown = this.props.devicesShown;
        devicesShown.push(this.state.selectedDevice.id);
        this.props.setAutoCenterDevice(this.state.selectedDevice)
        this.props.setDevicesShown(devicesShown);
        this.props.navigation.navigate('Main', { action: 'ANIMATE_CAMERA', selectedDeviceId: this.state.selectedDevice.id });
    }

    removeFromMap = () => {
        this.setState({
            modalVisible: false
        });

        if (this.props.autoCenterDevice) {
            if (this.props.autoCenterDevice.id === this.state.selectedDevice.id) {
                this.props.setAutoCenterDevice(null);
            }
        }

        let devicesShown = this.props.devicesShown;
        devicesShown.splice(devicesShown.indexOf(this.state.selectedDevice.id), 1);

        this.props.setDevicesShown(devicesShown);
    }

    searchTextCleared = () => {
        this.setState({
            searchText: ''
        })

        this.searchTextChanged('');
    }

    refreshDevicesList = async () => {
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

                await this.props.setDevices(devices);
                await this.props.setDevicesModels(deviceModels);
                await this.props.setGroups(groups);
                this.setState({ refreshingList: false });
            })
            .catch(e => {
                console.log(e);
                this.setState({ refreshingList: false });
            });
    }

    getTodayLocationHistory = () => {
        this.getDeviceHistory('locations');
    }

    getTodayAlertHistory = () => {
        this.getDeviceHistory('alerts');
    }

    getDeviceHistory = (type) => {
        if (this.state.selectedDevice) {
            let data = {
                historyType: type,
                deviceId: this.state.selectedDevice.id,
                dateFrom: moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).format('YYYY-MM-DD HH:mm:ss'),
                dateTo: moment().set({ hour: 23, minute: 59, second: 0, millisecond: 0 }).format('YYYY-MM-DD HH:mm:ss')
            }

            this.props.setIsLoading(true);

            axios.post(this.props.serverUrl + '/getDeviceHistory',
                data,
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            ).then(async res => {
                let {
                    result,
                    newCount,
                    distance,
                    fuelConsumption,
                    traces,
                    coords,
                    timeMove,
                    timeStop,
                    higherSpeed,
                    alertsTime
                } = res.data;

                if (result === 'OK') {
                    await this.props.setIsLoading(false);

                    if (newCount > 0) {
                        await this.props.setDeviceHistoryType(type);
                        await this.props.setDeviceHistory(traces);
                        await this.props.setDeviceHistoryCoords(coords);
                        await this.props.setDeviceHistoryHigherSpeed(higherSpeed);
                        await this.props.setDeviceHistoryDistance(distance);
                        await this.props.setDeviceHistoryFuelConsumption(fuelConsumption);
                        await this.props.setDeviceHistoryTimeMove(timeMove);
                        await this.props.setDeviceHistoryTimeStop(timeStop);
                        await this.props.setDeviceHistoryAlertsTime(alertsTime);
                        await this.setState({ modalVisible: false });
                        this.props.navigation.navigate('HistoryDetails', data);
                    } else {
                        Alert.alert(
                            loc.noDeviceHistoryTitle(this.props.lang),
                            loc.noDeviceHistoryMessage(this.props.lang)
                        )
                    }
                } else {
                    await this.props.setIsLoading(false);
                    Alert.alert(
                        'Error',
                        loc.deviceHistoryErrorMessage(this.props.lang)
                    )
                }
            }).catch(e => {
                console.log(e);
            });
        }
    }

    renderItem = ({ item }) => {

        return <View style={styles.deviceItemContainer}>
            <View style={[
                styles.deviceReportStatusIndicator,
                {
                    backgroundColor: item.traces.length > 0 ?
                        item.traces[0].speed > 0 ? 'darkgreen' : 'darkred' :
                        'gray'
                }
            ]}></View>
            <View style={[styles.deviceInfoContainer, {
                backgroundColor: this.props.devicesShown.includes(item.id) ? '#F2F2F2' : '#FFF'
            }]}>
                <View>
                    <Text style={styles.deviceInfoTextImei}>
                        <Text>{item.imei} </Text>
                        <Text style={styles.deviceInfoTextStatusExpiration}>
                            ({loc.expiresOnLabel(this.props.lang)}
                            <Text> {item.expiration_date ? moment(item.expiration_date).format('YYYY/MM/DD') : ''}</Text>
                                )
                            </Text>
                    </Text>
                </View>
                <View>
                    <Text style={styles.deviceInfoTextVehicle}>{item.vehicle} ({item.license_plate})</Text>
                </View>
                <View style={styles.deviceInfoTextStatus}>
                    <Text style={styles.deviceInfoTextStatusLastReport}>
                        {loc.lastReportLabel(this.props.lang)}:
                        <Text style={{ fontWeight: 'normal' }}> {item.traces.length > 0 ? moment(item.traces[0].date_time).format('YYYY/MM/DD HH:mm:ss') : 'No report'}</Text>
                    </Text>
                </View>
            </View>
            <TouchableOpacity activeOpacity={0.5} onPress={() => this.setState({ modalVisible: true, selectedDevice: item })}>
                <MaterialCommunityIcons name="dots-vertical" size={30} color="#151E44" />
            </TouchableOpacity>
        </View>
    }

    deleteDevice = () => {
        Alert.alert(
            loc.deviceDeletePromptTitle(this.props.lang),
            loc.deviceDeletePromptQuestion(this.props.lang) + ' ' + this.state.selectedDevice.imei + '?',
            [
                {
                    text: loc.cancelButtonLabel(this.props.lang),
                    onPress: () => console.log('Cancel Pressed!')
                },
                {
                    text: loc.acceptButtonLabel(this.props.lang),
                    onPress: this.clearDevice
                }
            ],
            {
                cancelable: false
            }
        )
    }

    clearDevice = () => {
        this.props.setIsLoading(true);

        axios.post(this.props.serverUrl + '/deleteDevice', {
            deviceId: this.state.selectedDevice.id,
            userId: this.props.user.id
        },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            })
            .then(res => {
                switch (res.data.result) {
                    case 'OK':
                        this.props.setIsLoading(false);
                        this.props.setDevices(res.data.devices);
                        this.props.setDevicesModels(res.data.deviceModels);
                        this.props.setGroups(res.data.groups);

                        this.setState({
                            searchText: '',
                            selectedDevice: null,
                            modalVisible: false,
                            devicesList: [],
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

    render() {
        return (
            <View style={styles.container}>
                <Modal
                    transparent={true}
                    visible={this.props.isLoading}
                    animationType={'slide'}
                    onRequestClose={() => this.setIsLoading(false)}
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
                    visible={this.state.modalVisible}
                    animationType={'slide'}
                    onRequestClose={() => this.setState({ modalVisible: false, selectedDevice: null })}
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

                            {
                                this.props.devicesShown.includes(this.state.selectedDevice ? this.state.selectedDevice.id : null) ?
                                    <TouchableOpacity style={styles.modalButtonContainer} onPress={this.removeFromMap}>
                                        <View style={styles.modalButtonContent}>
                                            <FontAwesome5 name="map-marked-alt" size={25} />
                                            <Text style={styles.modalButtonText}>{loc.removeFromMapButtonLabel(this.props.lang)}</Text>
                                            <MaterialCommunityIcons name="chevron-right" size={30} />
                                        </View>
                                    </TouchableOpacity>
                                    :
                                    <TouchableOpacity style={styles.modalButtonContainer} onPress={this.showOnMap}>
                                        <View style={styles.modalButtonContent}>
                                            <FontAwesome5 name="map-marked-alt" size={25} />
                                            <Text style={styles.modalButtonText}>{loc.showOnMapButtonLabel(this.props.lang)}</Text>
                                            <MaterialCommunityIcons name="chevron-right" size={30} />
                                        </View>
                                    </TouchableOpacity>
                            }

                            <TouchableOpacity style={styles.modalButtonContainer} onPress={this.getTodayLocationHistory}>
                                <View style={styles.modalButtonContent}>
                                    <MaterialCommunityIcons name="history" size={25} />
                                    <Text style={styles.modalButtonText}>{loc.todayLocationsHistoryButtonLabel(this.props.lang)}</Text>
                                    <MaterialCommunityIcons name="chevron-right" size={30} />
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.modalButtonContainer} onPress={this.getTodayAlertHistory}>
                                <View style={styles.modalButtonContent}>
                                    <MaterialCommunityIcons name="history" size={25} />
                                    <Text style={styles.modalButtonText}>{loc.todayAlertsHistoryButtonLabel(this.props.lang)}</Text>
                                    <MaterialCommunityIcons name="chevron-right" size={30} />
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.modalButtonContainer}>
                                <View style={styles.modalButtonContent}>
                                    <MaterialCommunityIcons name="apple-keyboard-command" size={25} />
                                    <Text style={styles.modalButtonText}>{loc.sendCommandButtonLabel(this.props.lang)}</Text>
                                    <MaterialCommunityIcons name="chevron-right" size={30} />
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.modalButtonContainer, { backgroundColor: 'rgba(255,0,0,0.3)' }]} onPress={this.deleteDevice}>
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
                        <FontAwesome style={{ marginLeft: 10 }} name="times" size={20} color="#151E4499" onPress={this.searchTextCleared} />
                    }
                </View>

                <FlatList
                    extraData={true}
                    data={
                        this.props.devices.filter(device => {
                            let text = this.state.searchText.toLowerCase();

                            if (text.trim() === '') {
                                return device
                            } else {
                                if (device.imei.toLowerCase().includes(text.trim()) ||
                                    device.license_plate.toLowerCase().includes(text.trim()) ||
                                    device.vehicle.toLowerCase().includes(text.trim())) {
                                    return device
                                }
                            }
                        })
                    }
                    renderItem={this.renderItem}
                    ListEmptyComponent={() =>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Text>{loc.noDevicesToShowMessage(this.props.lang)}</Text>
                        </View>
                    }
                    ItemSeparatorComponent={() =>
                        <View style={{
                            height: 5
                        }}></View>
                    }
                    onRefresh={this.refreshDevicesList}
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
    addNewDeviceBtn: {
        width: 35,
        height: 35,
        borderRadius: 25,
        backgroundColor: '#151E44',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.3)'
    },
    deviceItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 8,
        overflow: 'hidden',
        elevation: 1,
        borderColor: 'rgba(0,0,0,0.2)',
        borderWidth: 1
    },
    deviceReportStatusIndicator: {
        width: 10,
        height: '100%'
    },
    deviceInfoContainer: {
        flex: 1,
        marginLeft: 5
    },
    deviceInfoTextImei: {
        fontWeight: 'bold',
        color: '#0B4C5F',
        fontSize: 16,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    deviceInfoTextVehicle: {
        fontWeight: 'bold',
        fontSize: 16
    },
    deviceInfoTextStatus: {
        fontWeight: 'bold',
        fontStyle: 'italic',
        fontSize: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingRight: 10
    },
    deviceInfoTextStatusExpiration: {
        fontWeight: 'normal',
        color: 'black',
        fontSize: 14
    },
    deviceInfoTextStatusLastReport: {
        fontWeight: 'bold',
        fontStyle: 'normal',
        paddingRight: 10
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
})

const mapStateToProps = (state) => {
    return {
        lang: state.appReducer.lang,
        serverUrl: state.appReducer.serverUrl,
        devices: state.devicesReducer.devices,
        user: state.userReducer.user,
        devicesShown: state.devicesReducer.devicesShown,
        autoCenterDevice: state.mapReducer.autoCenterDevice,
        isLoading: state.appReducer.isLoading
    }
}

export default connect(mapStateToProps, {
    setIsLoading,
    setDevices,
    setDevicesModels,
    setDevicesShown,
    setAutoCenterDevice,
    setDeviceHistoryType,
    setDeviceHistory,
    setDeviceHistoryCoords,
    setDeviceHistoryHigherSpeed,
    setDeviceHistoryDistance,
    setDeviceHistoryFuelConsumption,
    setDeviceHistoryTimeMove,
    setDeviceHistoryTimeStop,
    setDeviceHistoryAlertsTime,
    setGroups
})(Devices)