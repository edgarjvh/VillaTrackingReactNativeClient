import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ActivityIndicator, Modal, ScrollView, Alert, Image, TouchableOpacity } from 'react-native';
import {Picker} from '@react-native-picker/picker';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { connect } from 'react-redux';
import Locale from './../locale.ts';
import { HeaderButtons, HeaderButton, Item } from 'react-navigation-header-buttons';
import axios from 'axios';

const MaterialHeaderButton = (props) => (
    <HeaderButton IconComponent={MaterialIcon} iconSize={23} color="black" {...props} />
);

const MaterialHeaderButtons = (props) => {
    return <HeaderButtons HeaderButtonComponent={MaterialHeaderButton} {...props} />;
};

const loc = new Locale();

const DeviceMaintainer = (props) => {
    const [selectedDevice, setSelectedDevice] = useState({});
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [deviceModels, setDeviceModels] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        props.navigation.setOptions({
            headerRight: () => (
                <MaterialHeaderButtons>
                    <Item title="save" iconName="content-save-edit" onPress={saveDevice} />
                    <Item title="menu" iconName="menu" onPress={() => props.navigation.toggleDrawer()} />
                </MaterialHeaderButtons>
            )
        })

        props.navigation.setOptions({
            headerTitle: props.route.params.type === 'add' ? loc.addNewDeviceTitle(props.lang) : loc.editDeviceTitle(props.lang)
        })
    })

    useEffect(() => {
        axios.post(props.serverUrl + '/getDeviceModels').then(res => {
            if (res.data.result === 'OK'){
                setDeviceModels(res.data.device_models);
                setSelectedDevice(props.route.params.selectedDevice || {});
            }
        }).catch(e => {
            console.log(e);
        }).finally(() => {
            setIsLoading(false);
        });
    }, []);

    const saveDevice = () => {
        if ((selectedDevice?.device_model_id || '0') === '0') {
            Alert.alert('VillaTracking', loc.noDeviceModelSelectedMsg(props.lang));
            return;
        }

        if ((selectedDevice?.imei || '').trim() === '') {
            Alert.alert('VillaTracking', loc.emptyDeviceImeiFieldMsg(props.lang));
            return;
        }

        if ((selectedDevice?.simcard_number || '').trim() === '') {
            Alert.alert('VillaTracking', loc.emptySimcardGsmNumberFieldMsg(props.lang));
            return;
        }

        if ((selectedDevice?.simcard_carrier || '').trim() === '') {
            Alert.alert('VillaTracking', loc.emptySimcardCarrierFieldMsg(props.lang));
            return;
        }

        if ((selectedDevice?.simcard_apn_name || '').trim() === '') {
            Alert.alert('VillaTracking', loc.emptySimcardApnFieldMsg(props.lang));
            return;
        }

        if ((selectedDevice?.vehicle || '').trim() === '') {
            Alert.alert('VillaTracking', loc.emptyVehicleDescriptionFieldMsg(props.lang));
            return;
        }

        if ((selectedDevice?.license_plate || '').trim() === '') {
            Alert.alert('VillaTracking', loc.emptyVehicleLicensePlateFieldMsg(props.lang));
            return;
        }

        setIsLoading(true);

        console.log(selectedDevice);

        axios.post(props.serverUrl + '/saveDevice', {...selectedDevice, user_id: props.user.id},
            {
                headers: {
                    "Content-Type": "application/json"
                }
            })
            .then(res => {
                switch (res.data.result) {
                    case 'SAVED':
                        setIsLoading(false);
                        props.route.params.updateDevices(res.data.devices);
                        Alert.alert('VillaTracking', loc.deviceSavedSuccessfullyMsg(props.lang));
                        props.navigation.goBack();
                        break;
                    case 'UPDATED':
                        setIsLoading(false);
                        props.route.params.updateDevices(res.data.devices);
                        Alert.alert('VillaTracking', loc.deviceUpdatedSuccessfullyMsg(props.lang));
                        props.navigation.goBack();
                        break;
                    default:
                        setIsLoading(false);
                        Alert.alert('VillaTracking', loc.erroOccurred(props.lang));
                        console.log(res.data)
                        break;
                }
            })
            .catch(e => {
                setIsLoading(false);
                Alert.alert('VillaTracking', loc.erroOccurred(props.lang));
                console.log(e)
            })
    }

    const markerIconTypeChanged = (type) => {
        console.log(type)
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

            <Modal animationType={'fade'} visible={isModalVisible} transparent={true} onRequestClose={() => setIsModalVisible(false)}  >
                <View style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <ActivityIndicator size={'large'} color="white" />
                </View>
            </Modal>


            <ScrollView >
                <View style={styles.formSectionTitleContainer}>
                    <Text style={styles.formSectionTitleText}>{loc.deviceInfoTitle(props.lang)}</Text>
                </View>

                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>{loc.deviceModelLabel(props.lang)} *</Text>
                    <Picker
                        style={styles.fieldInput}
                        selectedValue={(selectedDevice?.device_model_id || '0').toString()}
                        onValueChange={(value, index) => setSelectedDevice(prev => {
                            return {
                                ...prev,
                                device_model_id: value
                            }
                        })}
                    >
                        <Picker.Item label={loc.selectPickerItemLabel(props.lang)} value='0' />

                        {
                            (deviceModels || []).map(item => {
                                return (
                                    <Picker.Item label={item.brand + ' ' + item.model} value={item.id.toString()} key={item.id} />
                                )
                            })
                        }
                    </Picker>
                </View>

                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>{loc.deviceImeiLabel(props.lang)} *</Text>
                    <TextInput style={styles.fieldInput} maxLength={15} keyboardType={'numeric'}
                        onChangeText={(value) => setSelectedDevice(prev => {
                            return {
                                ...prev,
                                imei: value
                            }
                        })}
                        value={selectedDevice?.imei || ''} />
                </View>

                <View style={styles.formSectionTitleContainer}>
                    <Text style={styles.formSectionTitleText}>{loc.simcardSectionTitle(props.lang)}</Text>
                </View>

                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>{loc.simcardGsmNumberLabel(props.lang)} *</Text>
                    <TextInput style={styles.fieldInput} maxLength={15} keyboardType={'numeric'}
                        onChangeText={(value) => setSelectedDevice(prev => {
                            return {
                                ...prev,
                                simcard_number: value
                            }
                        })}
                        value={selectedDevice?.simcard_number || ''} />
                </View>

                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>{loc.simcardCarrierLabel(props.lang)} *</Text>
                    <TextInput style={{...styles.fieldInput}} autoCapitalize='characters'
                        onChangeText={(value) => setSelectedDevice(prev => {
                            return {
                                ...prev,
                                simcard_carrier: value
                            }
                        })}
                        value={selectedDevice?.simcard_carrier || ''} />
                </View>

                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>{loc.simcardApnAddressLabel(props.lang)} *</Text>
                    <TextInput style={styles.fieldInput} autoCapitalize='none' secureTextEntry={true} keyboardType='visible-password'
                        onChangeText={(value) => setSelectedDevice(prev => {
                            return {
                                ...prev,
                                simcard_apn_name: value.toLowerCase()
                            }
                        })}
                        value={selectedDevice?.simcard_apn_name || ''} />
                </View>

                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>{loc.simcardApnUserLabel(props.lang)}</Text>
                    <TextInput style={styles.fieldInput}
                        onChangeText={(value) => setSelectedDevice(prev => {
                            return {
                                ...prev,
                                simcard_apn_user: value
                            }
                        })}
                        value={selectedDevice?.simcard_apn_user || ''} />
                </View>

                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>{loc.simcardApnPassLabel(props.lang)}</Text>
                    <TextInput style={styles.fieldInput}
                        onChangeText={(value) => setSelectedDevice(prev => {
                            return {
                                ...prev,
                                simcard_apn_pass: value
                            }
                        })}
                        value={selectedDevice?.simcard_apn_pass || ''} />
                </View>

                <View style={styles.formSectionTitleContainer}>
                    <Text style={styles.formSectionTitleText}>{loc.vehicleSectionTitle(props.lang)}</Text>
                </View>

                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>{loc.vehicleDescriptionLabel(props.lang)} *</Text>
                    <TextInput style={styles.fieldInput} maxLength={200}
                        onChangeText={(value) => setSelectedDevice(prev => {
                            return {
                                ...prev,
                                vehicle: value
                            }
                        })}
                        value={selectedDevice?.vehicle || ''} />
                </View>

                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>{loc.vehicleLicensePlateLabel(props.lang)} *</Text>
                    <TextInput style={styles.fieldInput} maxLength={20} autoCapitalize='characters'
                        onChangeText={(value) => setSelectedDevice(prev => {
                            return {
                                ...prev,
                                license_plate: value
                            }
                        })}
                        value={selectedDevice?.license_plate || ''} />
                </View>

                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>{loc.vehicleDriverNameLabel(props.lang)}</Text>
                    <TextInput style={styles.fieldInput} maxLength={150} textContentType={'name'} autoCapitalize='words'
                        onChangeText={(value) => setSelectedDevice(prev => {
                            return {
                                ...prev,
                                driver_name: value
                            }
                        })}
                        value={selectedDevice?.driver_name || ''} />
                </View>

                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>{loc.vehicleSpeedLimitLabel(props.lang)} (Km/H)</Text>
                    <TextInput style={styles.fieldInput} maxLength={3} keyboardType={'numeric'}
                        onChangeText={(value) => setSelectedDevice(prev => {
                            return {
                                ...prev,
                                speed_limit: value
                            }
                        })}
                        value={selectedDevice?.speed_limit || 0} />
                </View>

                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>{loc.vehicleFuelConsumptionLabel(props.lang)}</Text>
                    <TextInput style={styles.fieldInput} maxLength={3} keyboardType={'numeric'}
                        onChangeText={(value) => setSelectedDevice(prev => {
                            return {
                                ...prev,
                                km_per_lt: value
                            }
                        })}
                        value={selectedDevice?.km_per_lt || 0} />
                </View>

                {/* <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>{loc.vehicleFuelCostLabel(props.lang)}</Text>
                    <TextInput style={styles.fieldInput} keyboardType={'numeric'}
                        onChangeText={(VehicleFuelConsumptionCost) => this.setState({ vehicleFuelConsumptionCost })}
                        value={this.state.vehicleFuelConsumptionCost} />
                </View> */}

                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>{loc.markerIconLabel(props.lang)}</Text>
                    <View style={styles.markerIconContainer}>
                        <TouchableOpacity activeOpacity={1} style={{ width: '100%', borderRadius: 5, padding: 2, backgroundColor: (selectedDevice?.marker_icon_type || 'default') === 'default' ? 'rgba(0,0,0,0.3)' : 'transparent' }} onPress={() => setSelectedDevice(prev => {
                            return {
                                ...prev,
                                marker_icon_type: 'default'
                            }
                        })}>
                            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                                <Image source={require('./../../assets/defaultmove.png')} style={styles.markerIconBtn} />
                                <Image source={require('./../../assets/defaultstop.png')} style={styles.markerIconBtn} />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={1} style={{ borderRadius: 5, padding: 2, backgroundColor: (selectedDevice?.marker_icon_type || 'default') === 'sedan1' ? 'rgba(0,0,0,0.3)' : 'transparent' }} onPress={() => setSelectedDevice(prev => { return { ...prev, marker_icon_type: 'sedan1' } })}>
                            <Image source={require('./../../assets/sedan1.png')} style={styles.markerIconBtn} />
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={1} style={{ borderRadius: 5, padding: 2, backgroundColor: (selectedDevice?.marker_icon_type || 'default') === 'sedan2' ? 'rgba(0,0,0,0.3)' : 'transparent' }} onPress={() => setSelectedDevice(prev => { return { ...prev, marker_icon_type: 'sedan2' } })}>
                            <Image source={require('./../../assets/sedan2.png')} style={styles.markerIconBtn} />
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={1} style={{ borderRadius: 5, padding: 2, backgroundColor: (selectedDevice?.marker_icon_type || 'default') === 'sedan3' ? 'rgba(0,0,0,0.3)' : 'transparent' }} onPress={() => setSelectedDevice(prev => { return { ...prev, marker_icon_type: 'sedan3' } })}>
                            <Image source={require('./../../assets/sedan3.png')} style={styles.markerIconBtn} />
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={1} style={{ borderRadius: 5, padding: 2, backgroundColor: (selectedDevice?.marker_icon_type || 'default') === 'pickup1' ? 'rgba(0,0,0,0.3)' : 'transparent' }} onPress={() => setSelectedDevice(prev => { return { ...prev, marker_icon_type: 'pickup1' } })}>
                            <Image source={require('./../../assets/pickup1.png')} style={styles.markerIconBtn} />
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={1} style={{ borderRadius: 5, padding: 2, backgroundColor: (selectedDevice?.marker_icon_type || 'default') === 'wagon1' ? 'rgba(0,0,0,0.3)' : 'transparent' }} onPress={() => setSelectedDevice(prev => { return { ...prev, marker_icon_type: 'wagon1' } })}>
                            <Image source={require('./../../assets/wagon1.png')} style={styles.markerIconBtn} />
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={1} style={{ borderRadius: 5, padding: 2, backgroundColor: (selectedDevice?.marker_icon_type || 'default') === 'wagon2' ? 'rgba(0,0,0,0.3)' : 'transparent' }} onPress={() => setSelectedDevice(prev => { return { ...prev, marker_icon_type: 'wagon2' } })}>
                            <Image source={require('./../../assets/wagon2.png')} style={styles.markerIconBtn} />
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={1} style={{ borderRadius: 5, padding: 2, backgroundColor: (selectedDevice?.marker_icon_type || 'default') === 'wagon3' ? 'rgba(0,0,0,0.3)' : 'transparent' }} onPress={() => setSelectedDevice(prev => { return { ...prev, marker_icon_type: 'wagon3' } })}>
                            <Image source={require('./../../assets/wagon3.png')} style={styles.markerIconBtn} />
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={1} style={{ borderRadius: 5, padding: 2, backgroundColor: (selectedDevice?.marker_icon_type || 'default') === 'moto1' ? 'rgba(0,0,0,0.3)' : 'transparent' }} onPress={() => setSelectedDevice(prev => { return { ...prev, marker_icon_type: 'moto1' } })}>
                            <Image source={require('./../../assets/moto1.png')} style={styles.markerIconBtn} />
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={1} style={{ borderRadius: 5, padding: 2, backgroundColor: (selectedDevice?.marker_icon_type || 'default') === 'van1' ? 'rgba(0,0,0,0.3)' : 'transparent' }} onPress={() => setSelectedDevice(prev => { return { ...prev, marker_icon_type: 'van1' } })}>
                            <Image source={require('./../../assets/van1.png')} style={styles.markerIconBtn} />
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={1} style={{ borderRadius: 5, padding: 2, backgroundColor: (selectedDevice?.marker_icon_type || 'default') === 'truck1' ? 'rgba(0,0,0,0.3)' : 'transparent' }} onPress={() => setSelectedDevice(prev => { return { ...prev, marker_icon_type: 'truck1' } })}>
                            <Image source={require('./../../assets/truck1.png')} style={styles.markerIconBtn} />
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={1} style={{ borderRadius: 5, padding: 2, backgroundColor: (selectedDevice?.marker_icon_type || 'default') === 'truck2' ? 'rgba(0,0,0,0.3)' : 'transparent' }} onPress={() => setSelectedDevice(prev => { return { ...prev, marker_icon_type: 'truck2' } })}>
                            <Image source={require('./../../assets/truck2.png')} style={styles.markerIconBtn} />
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={1} style={{ borderRadius: 5, padding: 2, backgroundColor: (selectedDevice?.marker_icon_type || 'default') === 'truck3' ? 'rgba(0,0,0,0.3)' : 'transparent' }} onPress={() => setSelectedDevice(prev => { return { ...prev, marker_icon_type: 'truck3' } })}>
                            <Image source={require('./../../assets/truck3.png')} style={styles.markerIconBtn} />
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={1} style={{ borderRadius: 5, padding: 2, backgroundColor: (selectedDevice?.marker_icon_type || 'default') === 'boat1' ? 'rgba(0,0,0,0.3)' : 'transparent' }} onPress={() => setSelectedDevice(prev => { return { ...prev, marker_icon_type: 'boat1' } })}>
                            <Image source={require('./../../assets/boat1.png')} style={styles.markerIconBtn} />
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={1} style={{ borderRadius: 5, padding: 2, backgroundColor: (selectedDevice?.marker_icon_type || 'default') === 'bus1' ? 'rgba(0,0,0,0.3)' : 'transparent' }} onPress={() => setSelectedDevice(prev => { return { ...prev, marker_icon_type: 'bus1' } })}>
                            <Image source={require('./../../assets/bus1.png')} style={styles.markerIconBtn} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.formSectionTitleContainer}>
                    <Text style={styles.formSectionTitleText}>{loc.additionalInfoSectionTitle(props.lang)}</Text>
                </View>

                <View style={styles.fieldContainer}>
                    <TextInput style={[styles.fieldInput, { height: 60 }]} multiline={true}
                        onChangeText={(value) => setSelectedDevice(prev => {
                            return {
                                ...prev,
                                additional_info: value
                            }
                        })}
                        value={selectedDevice?.additional_info || ''} />
                </View>

            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: '#d1d1d1',
        padding: 10
    },
    stackHeader: {
        flexDirection: 'row',
        justifyContent: 'center'
    },
    formSectionTitleContainer: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        padding: 2,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.3)',
        marginTop: 5,
        marginBottom: 5
    },
    formSectionTitleText: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold'
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
    },
    markerIconContainer: {
        flexDirection: "row",
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 5
    },
    markerIconBtn: {
        width: 100,
        height: 50,
        resizeMode: 'contain',
        margin: 5
    }
})

function mapStateToProps(state) {
    return {
        lang: state.appReducer.lang,
        serverUrl: state.appReducer.serverUrl,
        user: state.userReducer.user,
    }
}

export default connect(mapStateToProps, null)(DeviceMaintainer)
