import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, TouchableOpacity, FlatList, Modal, ActivityIndicator } from 'react-native';
import { FontAwesome, MaterialCommunityIcons, FontAwesome5 } from 'react-native-vector-icons';
import { connect } from 'react-redux';
import Locale from './../locale.ts';
import { HeaderButtons, HeaderButton, Item } from 'react-navigation-header-buttons';
import {
    setDevices,
    setDevicesShown
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

const Devices = (props) => {
    const [isLoading, setIsLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [devices, setDevices] = useState([]);
    const [refreshingList, setRefreshingList] = useState(true);

    useEffect(() => {
        props.navigation.setOptions({
            headerRight: () => {
                return (
                    <MaterialHeaderButtons>
                        <Item title="add" iconName="file-plus" onPress={() => props.navigation.navigate('DeviceMaintainer', { type: 'add', selectedDevice: null, updateDevices: updateDevices })} />
                        <Item title="menu" iconName="menu" onPress={() => { props.navigation.toggleDrawer() }} />
                    </MaterialHeaderButtons>
                )
            }
        });

        props.navigation.setOptions({
            headerTitle: loc.devicesLabelText(props.lang) + ' (' + devices.length + ')'
        })

        moment.locale(props.lang);
    })

    useEffect(() => {
        setRefreshingList(true);

        axios.post(props.serverUrl + '/getDevicesByUser', {
            user_id: props.user.id
        },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        ).then(res => {
            props.setDevices(res.data.devices);

            setRefreshingList(false);
        }).catch(e => {
            console.log(e);
            setRefreshingList(false);
        });
    }, []);

    const updateDevices = (_devices) => {
        props.setDevices(_devices);
    }

    const goToEdition = () => {
        setModalVisible(false);
        props.navigation.navigate('DeviceMaintainer', { type: 'edit', selectedDevice: selectedDevice, updateDevices: updateDevices });
    }

    const showOnMap = async () => {
        if (selectedDevice.location) {
            setModalVisible(false);

            let devicesShown = props.devicesShown;
            devicesShown.push(selectedDevice.id);

            props.setDevicesShown(devicesShown);
            props.navigation.navigate('Main', { action: 'ANIMATE_CAMERA', selectedDevice: selectedDevice });
        }
    }

    const removeFromMap = () => {
        setModalVisible(false);
        props.setDevicesShown(props.devicesShown.filter(d => d !== selectedDevice.id));
    }

    const refreshDevicesList = () => {
        setRefreshingList(true);

        axios.post(props.serverUrl + '/getDevicesByUser', {
            user_id: props.user.id
        },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        ).then(res => {
            props.setDevices(res.data.devices);

            setRefreshingList(false);
        }).catch(e => {
            console.log(e);
            setRefreshingList(false);
        });
    }

    const getTodayLocationHistory = () => {
        getDeviceHistory('locations');
    }

    const getTodayAlertHistory = () => {
        getDeviceHistory('alerts');
    }

    const getDeviceHistory = (type) => {
        if (selectedDevice) {
            let data = {
                historyType: type,
                deviceId: selectedDevice.id,
                dateFrom: moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).format('YYYY-MM-DD HH:mm:ss'),
                dateTo: moment().set({ hour: 23, minute: 59, second: 0, millisecond: 0 }).format('YYYY-MM-DD HH:mm:ss')
            }

            setIsLoading(true);

            console.log(data)

            axios.post(props.serverUrl + '/getDeviceHistory',
                data,
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            ).then(res => {
                let historyData = {
                    ...selectedDevice,
                    ...res.data,
                    type
                };

                if (res.data.result === 'OK') {
                    setIsLoading(false);

                    if (res.data.newCount > 0) {
                        setModalVisible(false)
                        props.navigation.navigate('HistoryDetails', historyData);
                    } else {
                        Alert.alert(
                            loc.noDeviceHistoryTitle(props.lang),
                            loc.noDeviceHistoryMessage(props.lang)
                        )
                    }
                } else {
                    setIsLoading(false);
                    Alert.alert(
                        'Error',
                        loc.deviceHistoryErrorMessage(props.lang)
                    )
                }
            }).catch(e => {
                console.log(e);
            });
        }
    }

    useEffect(() => {
        if ((props.devices || []).length > 0) {
            props.setDevices(props.devices.map(device => {
                device.location = props.devicesLocations.find(l => l.imei === device.imei) || device?.location
                return device;
            }))
        }
    }, [props.devicesLocations])

    const renderItem = ({ item }) => {
        return (
            <View style={styles.deviceItemContainer}>
                <View style={[
                    styles.deviceReportStatusIndicator,
                    {
                        backgroundColor: item.location
                            ? item.location.speed > 0
                                ? 'darkgreen'
                                : 'darkred'
                            : 'gray'
                    }
                ]}></View>
                <View style={[styles.deviceInfoContainer]}>
                    <View>
                        <Text style={styles.deviceInfoTextImei}>
                            <Text>{item.imei} </Text>
                            <Text style={styles.deviceInfoTextStatusExpiration}>
                                ({loc.expiresOnLabel(props.lang)}
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
                            {loc.lastReportLabel(props.lang)}:
                            <Text style={{ fontWeight: 'normal' }}> {item.location ? moment(item.location.date_time).format('YYYY/MM/DD HH:mm:ss') : loc.noReports(props.lang)}</Text>
                        </Text>
                    </View>
                </View>
                <TouchableOpacity activeOpacity={0.5} onPress={() => {
                    setModalVisible(true);
                    setSelectedDevice(item);
                }}>
                    <MaterialCommunityIcons name="dots-vertical" size={30} color="#151E44" />
                </TouchableOpacity>
            </View>
        )
    }

    const sendCommand = async () => {
        if (selectedDevice.location) {
            await setModalVisible(false)
            props.navigation.navigate('SendCommand', selectedDevice);
        }
        
    }

    const deleteDevice = () => {
        Alert.alert(
            loc.deviceDeletePromptTitle(props.lang),
            loc.deviceDeletePromptQuestion(props.lang) + ' ' + selectedDevice.imei + '?',
            [
                {
                    text: loc.cancelButtonLabel(props.lang),
                    onPress: () => console.log('Cancel Pressed!')
                },
                {
                    text: loc.acceptButtonLabel(props.lang),
                    onPress: clearDevice
                }
            ],
            {
                cancelable: false
            }
        )
    }

    const clearDevice = () => {
        setIsLoading(true);

        axios.post(props.serverUrl + '/deleteDevice', {
            id: selectedDevice.id,
            user_id: props.user.id
        },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(res => {
                switch (res.data.result) {
                    case 'OK':
                        props.setDevices(res.data.devices);

                        setSelectedDevice(null);
                        setModalVisible(false);
                        setRefreshingList(false);
                        break;
                    default:
                        Alert.alert('VillaTracking', loc.erroOccurred(props.lang));
                        console.log(res.data)
                        break;
                }

                setIsLoading(false);
            }).catch(e => {
                setIsLoading(false);
                Alert.alert('VillaTracking', loc.erroOccurred(props.lang));
                console.log(e)
            })
    }

    return (
        <View style={styles.container}>
            <Modal
                transparent={true}
                visible={isLoading}
                animationType={'slide'}
                onRequestClose={() => { setIsLoading(false) }}
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
                visible={modalVisible}
                animationType={'slide'}
                onRequestClose={() => {
                    setModalVisible(false);
                    setSelectedDevice(null);
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent} >
                        <TouchableOpacity style={styles.modalButtonContainer} onPress={goToEdition} >
                            <View style={styles.modalButtonContent}>
                                <MaterialCommunityIcons name="file-document-edit" size={25} />
                                <Text style={styles.modalButtonText}>{loc.editButtonLabel(props.lang)}</Text>
                                <MaterialCommunityIcons name="chevron-right" size={30} />
                            </View>
                        </TouchableOpacity>

                        {
                            (props.devicesShown || []).includes(selectedDevice?.id) ?
                                <TouchableOpacity style={styles.modalButtonContainer} onPress={removeFromMap}>
                                    <View style={styles.modalButtonContent}>
                                        <FontAwesome5 name="map-marked-alt" size={25} />
                                        <Text style={styles.modalButtonText}>{loc.removeFromMapButtonLabel(props.lang)}</Text>
                                        <MaterialCommunityIcons name="chevron-right" size={30} />
                                    </View>
                                </TouchableOpacity>
                                :
                                <TouchableOpacity style={styles.modalButtonContainer} onPress={showOnMap}>
                                    <View style={styles.modalButtonContent}>
                                        <FontAwesome5 name="map-marked-alt" size={25} />
                                        <Text style={styles.modalButtonText}>{loc.showOnMapButtonLabel(props.lang)}</Text>
                                        <MaterialCommunityIcons name="chevron-right" size={30} />
                                    </View>
                                </TouchableOpacity>
                        }

                        <TouchableOpacity style={styles.modalButtonContainer} onPress={getTodayLocationHistory}>
                            <View style={styles.modalButtonContent}>
                                <MaterialCommunityIcons name="history" size={25} />
                                <Text style={styles.modalButtonText}>{loc.todayLocationsHistoryButtonLabel(props.lang)}</Text>
                                <MaterialCommunityIcons name="chevron-right" size={30} />
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalButtonContainer} onPress={getTodayAlertHistory}>
                            <View style={styles.modalButtonContent}>
                                <MaterialCommunityIcons name="history" size={25} />
                                <Text style={styles.modalButtonText}>{loc.todayAlertsHistoryButtonLabel(props.lang)}</Text>
                                <MaterialCommunityIcons name="chevron-right" size={30} />
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalButtonContainer} onPress={sendCommand}>
                            <View style={styles.modalButtonContent}>
                                <MaterialCommunityIcons name="apple-keyboard-command" size={25} />
                                <Text style={styles.modalButtonText}>{loc.sendCommandButtonLabel(props.lang)}</Text>
                                <MaterialCommunityIcons name="chevron-right" size={30} />
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.modalButtonContainer, { backgroundColor: 'rgba(255,0,0,0.3)' }]} onPress={deleteDevice}>
                            <View style={styles.modalButtonContent}>
                                <MaterialCommunityIcons name="delete" size={25} />
                                <Text style={styles.modalButtonText}>{loc.deleteButtonLabel(props.lang)}</Text>
                                <MaterialCommunityIcons name="chevron-right" size={30} />
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.modalButtonContainer, { backgroundColor: 'transparent' }]}
                            onPress={() => { setModalVisible(false) }}>
                            <View style={styles.modalButtonContent}>
                                <Text style={[styles.modalButtonText, { textAlign: 'center', marginLeft: 0 }]}>{loc.cancelButtonLabel(props.lang)}</Text>
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
                    placeholder={loc.searchField(props.lang)}
                    onChangeText={(text) => { setSearchText(text) }}
                    value={searchText}
                />
                {
                    searchText.trim() !== '' &&
                    <FontAwesome style={{ marginLeft: 10 }} name="times" size={20} color="#151E4499" onPress={() => { setSearchText('') }} />
                }
            </View>

            <FlatList
                extraData={true}
                data={
                    props.devices.filter(device => {
                        let text = searchText.toLowerCase();

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
                renderItem={renderItem}
                ListEmptyComponent={() =>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Text>{loc.noDevicesToShowMessage(props.lang)}</Text>
                    </View>
                }
                ItemSeparatorComponent={() =>
                    <View style={{
                        height: 5
                    }}></View>
                }
                onRefresh={refreshDevicesList}
                refreshing={refreshingList}
                keyExtractor={(item => item.id.toString())}
            ></FlatList>
        </View>
    )
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
        devicesLocations: state.devicesReducer.devicesLocations
    }
}

export default connect(mapStateToProps, {
    setDevices,
    setDevicesShown
})(Devices)