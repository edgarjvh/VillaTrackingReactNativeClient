import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, TouchableOpacity, FlatList, Modal, ActivityIndicator } from 'react-native';
import { FontAwesome, MaterialCommunityIcons, FontAwesome5 } from 'react-native-vector-icons';
import { connect } from 'react-redux';
import Locale from './../locale.ts';
import { HeaderButtons, HeaderButton, Item } from 'react-navigation-header-buttons';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/es';
import { CheckBox } from "react-native-elements";

const MaterialHeaderButton = (props) => (
    <HeaderButton IconComponent={MaterialCommunityIcons} iconSize={23} color="black" {...props} />
);

const MaterialHeaderButtons = (props) => {
    return <HeaderButtons HeaderButtonComponent={MaterialHeaderButton} {...props} />;
};

const loc = new Locale();

const GeofenceDevices = (props) => {
    const [isLoading, setIsLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedGeofence, setSelectedGeofence] = useState(props.route.params.geofence);
    const [modalVisible, setModalVisible] = useState(false);
    const [devicesList, setDevicesList] = useState([]);
    const [refreshingList, setRefreshingList] = useState(true);
    const [deleteMode, setDeleteMode] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const [devicesId, setDevicesId] = useState([]);

    useEffect(() => {
        props.navigation.setOptions({
            headerRight: () => {
                return deleteMode
                    ?
                    <MaterialHeaderButtons>
                        <Item title="return" iconName="keyboard-return" onPress={() => { setDeleteMode(false); setDevicesId([]) }} />
                        <Item
                            title='ok'
                            iconName='check'
                            onPress={showDeleteFromGeofencePrompt}
                            disabled={devicesId.length === (selectedGeofence?.devices_count || 0)}
                            color={(devicesId.length === (selectedGeofence?.devices_count || 0)) ? 'rgba(0,0,0,0.3)' : 'black'}
                        />
                        <Item title="menu" iconName="menu" onPress={() => { props.navigation.toggleDrawer() }} />
                    </MaterialHeaderButtons>
                    :
                    <MaterialHeaderButtons>
                        <Item
                            title='delete'
                            iconName='minus'
                            onPress={() => {
                                setDevicesId((selectedGeofence?.devices || []).map(device => device.id))
                                setDeleteMode(true)
                            }}
                        />
                        <Item title="add" iconName="plus" onPress={() => {
                            props.navigation.navigate('GeofenceAddDevices', { geofence: selectedGeofence, updateGeofence: updateGeofence })
                        }} />
                        <Item title="menu" iconName="menu" onPress={() => { props.navigation.toggleDrawer() }} />
                    </MaterialHeaderButtons>

            }
        });

        props.navigation.setOptions({
            headerTitle: selectedGeofence.name + ' (' + selectedGeofence.devices_count + ')'
        })

        moment.locale(props.lang);
    })

    useEffect(() => {
        refreshDevicesList();
    }, []);

    useEffect(() => {
        if ((selectedGeofence?.devices || []).length > 0){
            setSelectedGeofence(selectedGeofence => {
                return {
                    ...selectedGeofence,
                    devices: (selectedGeofence?.devices || []).map(device => {
                        device.location = props.devicesLocations.find(l => l.imei === device.imei) || device?.location
                        return device;
                    })
                }
            })
        }
    }, [props.devicesLocations])

    const showDeleteFromGeofencePrompt = () => {
        Alert.alert(
            loc.geofenceDeviceDeletePromptTitle(props.lang),
            loc.geofenceDeviceDeletePromptQuestion(props.lang) + ' ' + selectedGeofence?.name + '?',
            [
                {
                    text: loc.cancelButtonLabel(props.lang),
                    onPress: () => console.log('Cancel Pressed!')
                },
                {
                    text: loc.acceptButtonLabel(props.lang),
                    onPress: deleteGeofenceDevices
                }
            ],
            {
                cancelable: false
            }
        )
    }

    const deleteGeofenceDevices = () => {
        setIsLoading(true);

        axios.post(props.serverUrl + '/saveGeofenceDevices', {
            id: selectedGeofence.id,
            user_id: props.user.id,
            devices_id: devicesId
        },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(res => {
                if (res.data.result === 'OK') {
                    props.route.params.updateGeofences(res.data.geofences);
                    setSelectedGeofence(res.data.geofence);
                }

                setDevicesId([]);
                setDeleteMode(false);
                setIsLoading(false);
            }).catch(e => {
                console.log(e);
                setDeleteMode(false);
                setIsLoading(false);
            });
    }

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
                {
                    deleteMode &&
                    <CheckBox
                        checkedIcon={<MaterialCommunityIcons name='checkbox-marked-outline' size={20} />}
                        uncheckedIcon={<MaterialCommunityIcons name='checkbox-blank-outline' size={20} />}
                        checked={!devicesId.includes(item.id)}
                        onPress={() => { handleCheckbox(item.id) }}
                        containerStyle={{ padding: 0 }}
                    />
                }
            </View>
        )
    }

    const handleCheckbox = (deviceId) => {
        if (devicesId.includes(deviceId)) {
            setDevicesId(devicesId.filter(id => id !== deviceId));
        } else {
            setDevicesId(devicesId => {
                return [
                    ...devicesId,
                    deviceId
                ]
            })
        }
    }

    const updateGeofence = (_geofences, _geofence) => {
        props.route.params.updateGeofences(_geofences);
        setSelectedGeofence(_geofence);
    }

    const refreshDevicesList = () => {
        setRefreshingList(true);
        
        axios.post(props.serverUrl + '/getGeofencesById', {
            id: (selectedGeofence?.id || 0)
        },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        ).then(res => {
            if (res.data.result === 'OK') {                
                setSelectedGeofence(res.data.geofence)
            }
            setRefreshingList(false);
        }).catch(e => {
            console.log(e);
            setRefreshingList(false);
        });
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
                    (selectedGeofence?.devices || []).filter(device => {
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
        user: state.userReducer.user,
        devicesLocations: state.devicesReducer.devicesLocations,
    }
}

export default connect(mapStateToProps, null)(GeofenceDevices)