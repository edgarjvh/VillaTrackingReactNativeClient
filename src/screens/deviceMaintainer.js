import React, { Component } from 'react';
import { View, Text, StyleSheet, TextInput, ActivityIndicator, Modal, ScrollView, Picker, Alert, Image, TouchableOpacity } from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { connect } from 'react-redux';
import Locale from './../locale.ts';
import { HeaderButtons, HeaderButton, Item } from 'react-navigation-header-buttons';
import axios from 'axios';
import { 
    setDevices, 
    setDevicesModels,
    setGroups,
    setIsLoading
 } from './../actions';


const MaterialHeaderButton = (props) => (
    <HeaderButton IconComponent={MaterialIcon} iconSize={23} color="black" {...props} />
);

const MaterialHeaderButtons = (props) => {
    return <HeaderButtons HeaderButtonComponent={MaterialHeaderButton} {...props} />;
};

const loc = new Locale();

class DeviceMaintainer extends Component {

    constructor(props) {
        super(props)

        this.state = {
            deviceId: this.props.route.params.deviceId,
            deviceModelId: '0',
            deviceImei: '',
            deviceExpirationDate: '',
            simcardNumber: '',
            simcardCarrier: '',
            simcardApn: '',
            simcardUser: '',
            simcardPass: '',
            vehicleDescription: '',
            vehicleLicensePlate: '',
            vehicleDriverName: '',
            vehicleSpeedLimit: '0',
            vehicleFuelConsumption: '0',
            vehicleFuelConsumptionCost: '0',
            vehicleTailColor: 'GREEN',
            additionalInfo: '',
            isModalVisible: false,
            markerIconType: 'default'
        }

        this.props.navigation.setOptions({
            headerRight: () => (
                <MaterialHeaderButtons>
                    <Item title="save" iconName="content-save-edit" onPress={() => this.saveDevice()} />
                    <Item title="menu" iconName="menu" onPress={() => this.props.navigation.toggleDrawer()} />
                </MaterialHeaderButtons>
            )
        })
    }

    componentDidUpdate() {
        this.props.navigation.setOptions({
            headerTitle: this.props.route.params.type === 'add' ? loc.addNewDeviceTitle(this.props.lang) : loc.editDeviceTitle(this.props.lang)
        })
    }


    componentDidMount() {
        this.props.navigation.setOptions({
            headerTitle: this.props.route.params.type === 'add' ? loc.addNewDeviceTitle(this.props.lang) : loc.editDeviceTitle(this.props.lang)
        })        

        if (this.props.route.params.deviceId > 0) {

            this.props.devices.map(device => {
                if (device.id === this.props.route.params.deviceId) {
                    this.setState({
                        deviceId: device.id,
                        deviceModelId: device.device_model_id.toString(),
                        deviceImei: device.imei,
                        deviceExpirationDate: device.expiration_date,
                        simcardNumber: device.simcard_number,
                        simcardCarrier: device.simcard_carrier,
                        simcardApn: device.simcard_apn_name,
                        simcardUser: device.simcard_apn_user,
                        simcardPass: device.simcard_apn_pass,
                        vehicleDescription: device.vehicle,
                        vehicleLicensePlate: device.license_plate,
                        vehicleDriverName: device.driver_name,
                        vehicleSpeedLimit: device.speed_limit.toString(),
                        vehicleFuelConsumption: device.km_per_lt.toString(),
                        vehicleFuelConsumptionCost: device.cost_per_lt.toString(),
                        vehicleTailColor: 'GREEN',
                        additionalInfo: device.additional_info,
                        isModalVisible: false,
                        markerIconType: device.marker_icon_type
                    })
                }

                return device;
            })
        } else {
            this.setState({
                deviceId: this.props.route.params.deviceId,
                deviceModelId: '0',
                deviceImei: '',
                deviceExpirationDate: '',
                simcardNumber: '',
                simcardCarrier: '',
                simcardApn: '',
                simcardUser: '',
                simcardPass: '',
                vehicleDescription: '',
                vehicleLicensePlate: '',
                vehicleDriverName: '',
                vehicleSpeedLimit: '0',
                vehicleFuelConsumption: '0',
                vehicleFuelConsumptionCost: '0',
                vehicleTailColor: 'GREEN',
                additionalInfo: '',
                isModalVisible: false,
                markerIconType: 'default'
            })
        }
    }

    saveDevice = () => {
        let {
            deviceId,
            deviceModelId,
            deviceImei,
            simcardNumber,
            simcardCarrier,
            simcardApn,
            simcardUser,
            simcardPass,
            vehicleDescription,
            vehicleLicensePlate,
            vehicleDriverName,
            vehicleSpeedLimit,
            vehicleFuelConsumption,
            vehicleFuelConsumptionCost,
            markerIconType,
            additionalInfo
        } = this.state;

        if (deviceModelId === '0') {
            Alert.alert('VillaTracking', loc.noDeviceModelSelectedMsg(this.props.lang));
            return;
        }

        if (deviceImei.trim() === '') {
            Alert.alert('VillaTracking', loc.emptyDeviceImeiFieldMsg(this.props.lang));
            return;
        }

        if (simcardNumber.trim() === '') {
            Alert.alert('VillaTracking', loc.emptySimcardGsmNumberFieldMsg(this.props.lang));
            return;
        }

        if (simcardCarrier.trim() === '') {
            Alert.alert('VillaTracking', loc.emptySimcardCarrierFieldMsg(this.props.lang));
            return;
        }

        if (simcardApn.trim() === '') {
            Alert.alert('VillaTracking', loc.emptySimcardApnFieldMsg(this.props.lang));
            return;
        }

        if (vehicleDescription.trim() === '') {
            Alert.alert('VillaTracking', loc.emptyVehicleDescriptionFieldMsg(this.props.lang));
            return;
        }

        if (vehicleLicensePlate.trim() === '') {
            Alert.alert('VillaTracking', loc.emptyVehicleLicensePlateFieldMsg(this.props.lang));
            return;
        }

        this.props.setIsLoading(true);

        axios.post(this.props.serverUrl + '/saveDevice', {
            id: this.props.user.id,
            deviceId: deviceId,
            deviceModelId: deviceModelId,
            deviceImei: deviceImei,
            simcardNumber: simcardNumber,
            simcardCarrier: simcardCarrier,
            simcardApn: simcardApn,
            simcardUser: simcardUser,
            simcardPass: simcardPass,
            vehicleDescription: vehicleDescription,
            vehicleLicensePlate: vehicleLicensePlate,
            vehicleDriverName: vehicleDriverName,
            vehicleSpeedLimit: vehicleSpeedLimit,
            vehicleFuelConsumption: vehicleFuelConsumption,
            VehicleFuelConsumptionCost: vehicleFuelConsumptionCost,
            markerIconType: markerIconType,
            additionalInfo: additionalInfo
        },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            })
            .then(res => {
                switch (res.data.result) {
                    case 'SAVED':
                        this.props.setIsLoading(false);
                        this.props.setDevices(res.data.devices);
                        this.props.setDevicesModels(res.data.deviceModels);
                        this.props.setGroups(res.data.groups);

                        Alert.alert('VillaTracking', loc.deviceSavedSuccessfullyMsg(this.props.lang));
                        this.props.navigation.goBack();
                        break;
                    case 'UPDATED':
                        this.props.setIsLoading(false);
                        this.props.setDevices(res.data.devices);
                        this.props.setDevicesModels(res.data.deviceModels);
                        this.props.setGroups(res.data.groups);
                        Alert.alert('VillaTracking', loc.deviceUpdatedSuccessfullyMsg(this.props.lang));
                        this.props.navigation.goBack();
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

    markerIconTypeChanged = (type) => {
        console.log(type)
    }


    render() {
        return (
            <View style={styles.container}>
                <Modal animationType={'fade'} visible={this.state.isModalVisible} transparent={true} onRequestClose={() => this.setState({ isModalVisible: false })}  >
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
                        <Text style={styles.formSectionTitleText}>{loc.deviceInfoTitle(this.props.lang)}</Text>
                    </View>

                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>{loc.deviceModelLabel(this.props.lang)} *</Text>
                        <Picker
                            style={styles.fieldInput}
                            selectedValue={this.state.deviceModelId}
                            onValueChange={(value, index) => this.setState({ deviceModelId: value })}
                        >
                            <Picker.Item label={loc.selectPickerItemLabel(this.props.lang)} value='0' />

                            {
                                (this.props.deviceModels || []).map(item => {
                                    return (
                                        <Picker.Item label={item.brand + ' ' + item.model} value={item.id.toString()} key={item.id} />
                                    )
                                })
                            }
                        </Picker>
                    </View>

                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>{loc.deviceImeiLabel(this.props.lang)} *</Text>
                        <TextInput style={styles.fieldInput} maxLength={15} keyboardType={'numeric'}
                            onChangeText={(deviceImei) => this.setState({ deviceImei })}
                            value={this.state.deviceImei} />
                    </View>

                    <View style={styles.formSectionTitleContainer}>
                        <Text style={styles.formSectionTitleText}>{loc.simcardSectionTitle(this.props.lang)}</Text>
                    </View>

                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>{loc.simcardGsmNumberLabel(this.props.lang)} *</Text>
                        <TextInput style={styles.fieldInput} maxLength={15} keyboardType={'numeric'}
                            onChangeText={(simcardNumber) => this.setState({ simcardNumber })}
                            value={this.state.simcardNumber} />
                    </View>

                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>{loc.simcardCarrierLabel(this.props.lang)} *</Text>
                        <TextInput style={styles.fieldInput}
                            onChangeText={(simcardCarrier) => this.setState({ simcardCarrier: simcardCarrier.toUpperCase() })}
                            value={this.state.simcardCarrier} />
                    </View>

                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>{loc.simcardApnAddressLabel(this.props.lang)} *</Text>
                        <TextInput style={styles.fieldInput}
                            onChangeText={(simcardApn) => this.setState({ simcardApn: simcardApn.toLowerCase() })}
                            value={this.state.simcardApn} />
                    </View>

                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>{loc.simcardApnUserLabel(this.props.lang)}</Text>
                        <TextInput style={styles.fieldInput}
                            onChangeText={(simcardUser) => this.setState({ simcardUser })}
                            value={this.state.simcardUser} />
                    </View>

                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>{loc.simcardApnPassLabel(this.props.lang)}</Text>
                        <TextInput style={styles.fieldInput}
                            onChangeText={(simcardPass) => this.setState({ simcardPass })}
                            value={this.state.simcardPass} />
                    </View>

                    <View style={styles.formSectionTitleContainer}>
                        <Text style={styles.formSectionTitleText}>{loc.vehicleSectionTitle(this.props.lang)}</Text>
                    </View>

                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>{loc.vehicleDescriptionLabel(this.props.lang)} *</Text>
                        <TextInput style={styles.fieldInput} maxLength={200}
                            onChangeText={(vehicleDescription) => this.setState({ vehicleDescription })}
                            value={this.state.vehicleDescription} />
                    </View>

                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>{loc.vehicleLicensePlateLabel(this.props.lang)} *</Text>
                        <TextInput style={styles.fieldInput} maxLength={20}
                            onChangeText={(vehicleLicensePlate) => this.setState({ vehicleLicensePlate: vehicleLicensePlate.toUpperCase() })}
                            value={this.state.vehicleLicensePlate} />
                    </View>

                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>{loc.vehicleDriverNameLabel(this.props.lang)}</Text>
                        <TextInput style={styles.fieldInput} maxLength={150} textContentType={'name'}
                            onChangeText={(vehicleDriverName) => this.setState({ vehicleDriverName })}
                            value={this.state.vehicleDriverName} />
                    </View>

                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>{loc.vehicleSpeedLimitLabel(this.props.lang)} (Km/H)</Text>
                        <TextInput style={styles.fieldInput} maxLength={3} keyboardType={'numeric'}
                            onChangeText={(vehicleSpeedLimit) => this.setState({ vehicleSpeedLimit })}
                            value={this.state.vehicleSpeedLimit} />
                    </View>

                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>{loc.vehicleFuelConsumptionLabel(this.props.lang)}</Text>
                        <TextInput style={styles.fieldInput} maxLength={3} keyboardType={'numeric'}
                            onChangeText={(vehicleFuelConsumption) => this.setState({ vehicleFuelConsumption })}
                            value={this.state.vehicleFuelConsumption} />
                    </View>

                    {/* <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>{loc.vehicleFuelCostLabel(this.props.lang)}</Text>
                        <TextInput style={styles.fieldInput} keyboardType={'numeric'}
                            onChangeText={(VehicleFuelConsumptionCost) => this.setState({ vehicleFuelConsumptionCost })}
                            value={this.state.vehicleFuelConsumptionCost} />
                    </View> */}

                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>{loc.markerIconLabel(this.props.lang)}</Text>
                        <View style={styles.markerIconContainer}>
                            <TouchableOpacity activeOpacity={1} style={{width: '100%', borderRadius: 5, padding: 2, backgroundColor: this.state.markerIconType === 'default' ? 'rgba(0,0,0,0.3)' : 'transparent' }} onPress={() => this.setState({ markerIconType: 'default' })}>
                                <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                                    <Image source={require('./../../assets/defaultmove.png')} style={styles.markerIconBtn} />
                                    <Image source={require('./../../assets/defaultstop.png')} style={styles.markerIconBtn} />
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={1} style={{ borderRadius: 5, padding: 2, backgroundColor: this.state.markerIconType === 'sedan1' ? 'rgba(0,0,0,0.3)' : 'transparent' }} onPress={() => this.setState({ markerIconType: 'sedan1' })}>
                                <Image source={require('./../../assets/sedan1.png')} style={styles.markerIconBtn} />
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={1} style={{ borderRadius: 5, padding: 2, backgroundColor: this.state.markerIconType === 'sedan2' ? 'rgba(0,0,0,0.3)' : 'transparent' }} onPress={() => this.setState({ markerIconType: 'sedan2' })}>
                                <Image source={require('./../../assets/sedan2.png')} style={styles.markerIconBtn} />
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={1} style={{ borderRadius: 5, padding: 2, backgroundColor: this.state.markerIconType === 'sedan3' ? 'rgba(0,0,0,0.3)' : 'transparent' }} onPress={() => this.setState({ markerIconType: 'sedan3' })}>
                                <Image source={require('./../../assets/sedan3.png')} style={styles.markerIconBtn} />
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={1} style={{ borderRadius: 5, padding: 2, backgroundColor: this.state.markerIconType === 'pickup1' ? 'rgba(0,0,0,0.3)' : 'transparent' }} onPress={() => this.setState({ markerIconType: 'pickup1' })}>
                                <Image source={require('./../../assets/pickup1.png')} style={styles.markerIconBtn} />
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={1} style={{ borderRadius: 5, padding: 2, backgroundColor: this.state.markerIconType === 'wagon1' ? 'rgba(0,0,0,0.3)' : 'transparent' }} onPress={() => this.setState({ markerIconType: 'wagon1' })}>
                                <Image source={require('./../../assets/wagon1.png')} style={styles.markerIconBtn} />
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={1} style={{ borderRadius: 5, padding: 2, backgroundColor: this.state.markerIconType === 'wagon2' ? 'rgba(0,0,0,0.3)' : 'transparent' }} onPress={() => this.setState({ markerIconType: 'wagon2' })}>
                                <Image source={require('./../../assets/wagon2.png')} style={styles.markerIconBtn} />
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={1} style={{ borderRadius: 5, padding: 2, backgroundColor: this.state.markerIconType === 'wagon3' ? 'rgba(0,0,0,0.3)' : 'transparent' }} onPress={() => this.setState({ markerIconType: 'wagon3' })}>
                                <Image source={require('./../../assets/wagon3.png')} style={styles.markerIconBtn} />
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={1} style={{ borderRadius: 5, padding: 2, backgroundColor: this.state.markerIconType === 'moto1' ? 'rgba(0,0,0,0.3)' : 'transparent' }} onPress={() => this.setState({ markerIconType: 'moto1' })}>
                                <Image source={require('./../../assets/moto1.png')} style={styles.markerIconBtn} />
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={1} style={{ borderRadius: 5, padding: 2, backgroundColor: this.state.markerIconType === 'van1' ? 'rgba(0,0,0,0.3)' : 'transparent' }} onPress={() => this.setState({ markerIconType: 'van1' })}>
                                <Image source={require('./../../assets/van1.png')} style={styles.markerIconBtn} />
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={1} style={{ borderRadius: 5, padding: 2, backgroundColor: this.state.markerIconType === 'truck1' ? 'rgba(0,0,0,0.3)' : 'transparent' }} onPress={() => this.setState({ markerIconType: 'truck1' })}>
                                <Image source={require('./../../assets/truck1.png')} style={styles.markerIconBtn} />
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={1} style={{ borderRadius: 5, padding: 2, backgroundColor: this.state.markerIconType === 'truck2' ? 'rgba(0,0,0,0.3)' : 'transparent' }} onPress={() => this.setState({ markerIconType: 'truck2' })}>
                                <Image source={require('./../../assets/truck2.png')} style={styles.markerIconBtn} />
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={1} style={{ borderRadius: 5, padding: 2, backgroundColor: this.state.markerIconType === 'truck3' ? 'rgba(0,0,0,0.3)' : 'transparent' }} onPress={() => this.setState({ markerIconType: 'truck3' })}>
                                <Image source={require('./../../assets/truck3.png')} style={styles.markerIconBtn} />
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={1} style={{ borderRadius: 5, padding: 2, backgroundColor: this.state.markerIconType === 'boat1' ? 'rgba(0,0,0,0.3)' : 'transparent' }} onPress={() => this.setState({ markerIconType: 'boat1' })}>
                                <Image source={require('./../../assets/boat1.png')} style={styles.markerIconBtn} />
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={1} style={{ borderRadius: 5, padding: 2, backgroundColor: this.state.markerIconType === 'bus1' ? 'rgba(0,0,0,0.3)' : 'transparent' }} onPress={() => this.setState({ markerIconType: 'bus1' })}>
                                <Image source={require('./../../assets/bus1.png')} style={styles.markerIconBtn} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.formSectionTitleContainer}>
                        <Text style={styles.formSectionTitleText}>{loc.additionalInfoSectionTitle(this.props.lang)}</Text>
                    </View>

                    <View style={styles.fieldContainer}>
                        <TextInput style={[styles.fieldInput, { height: 60 }]} multiline={true}
                            onChangeText={(additionalInfo) => this.setState({ additionalInfo })}
                            value={this.state.additionalInfo} />
                    </View>

                </ScrollView>
            </View>
        )
    }
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
        devices: state.devicesReducer.devices,
        deviceModels: state.devicesReducer.deviceModels,
        user: state.userReducer.user,
        isLoading: state.appReducer.isLoading
    }
}

export default connect(mapStateToProps, { 
    setDevices,
    setDevicesModels,
    setGroups,
    setIsLoading
 })(DeviceMaintainer)
