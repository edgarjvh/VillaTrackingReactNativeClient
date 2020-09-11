import React, { Component } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Image, TouchableHighlight, TouchableOpacity, ActivityIndicator, Alert, Modal, Text } from 'react-native';
import MapView, { Marker, Polyline, Callout } from 'react-native-maps';
import Locale from './../locale';
import axios from 'axios';
import { MaterialCommunityIcons, Feather, MaterialIcons } from 'react-native-vector-icons';
import SocketIOClient from 'socket.io-client/dist/socket.io';
import {
    setDevices,
    setDevicesModels,
    handleMapReady,
    setMapType,
    setAutoCenterDevice,
    setShowingMapTypes,
    setShowingMarkerTail,
    setShowingGeofences,
    setShowingPois,
    setShowingUserLocation,
    setGroups
} from './../actions';

const loc = new Locale();
import * as Permissions from 'expo-permissions'
import { connect } from 'react-redux';

class Main extends Component {
    constructor(props) {
        super(props);

        this.socket = SocketIOClient(this.props.serverUrl, { jsonp: false, agent: '-', pfx: '-', cert: '-', ca: '-', ciphers: '-', rejectUnauthorized: '-', perMessageDeflate: '-' });

        this.onNewGpsData = this.onNewGpsData.bind(this);

        this.socket.on('new gps data', this.onNewGpsData);

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
                if (res.data.result === 'OK'){
                    const deviceModels = await res.data.deviceModels;
                    const devices = await res.data.devices;
                    const geofences = await res.data.geofences;
                    const groups = await res.data.groups;
    
                    await this.props.setDevices(devices);
                    await this.props.setDevicesModels(deviceModels);
                    await this.props.setGroups(groups);
                }
            })
            .catch(e => {
                console.log(e);
            });
    }

    onNewGpsData = async (data) => {
        await this.props.setDevices(
            this.props.devices.map(device => {
                if (device.imei === data.imei) {
                    device.traces.pop();
                    device.traces.unshift(data);


                    return device;
                }

                return device;
            })
        );

        if ((this.props.autoCenterDevice && this.map) && (this.props.autoCenterDevice.imei === data.imei)) {
            this.map.animateCamera({
                center: {
                    latitude: data.latitude,
                    longitude: data.longitude
                },
                altitude: 0,
                heading: 0,
                pitch: 0,
                zoom: this.map.getCamera().zoom
            });
        }
    }

    componentDidMount() {
        this._getLocationPermissionAsync();
    }

    componentDidUpdate() {
        if (this.props.route.params?.action) {
            switch (this.props.route.params?.action) {
                case 'ANIMATE_CAMERA':
                    this.props.devices.map(device => {
                        if (this.props.route.params.selectedDeviceId === device.id) {
                            this.map.animateCamera({
                                center: {
                                    latitude: device.traces[0].latitude,
                                    longitude: device.traces[0].longitude
                                },
                                altitude: 0,
                                heading: 0,
                                pitch: 0,
                                zoom: this.map.getCamera().zoom
                            });
                        }
                        return device;
                    });

                    this.clearActionParam();
                    break;
                default:
                    console.log('default');
                    break;
            }
        }

    }

    clearActionParam = () => {
        this.props.navigation.setParams({
            action: ''
        })
    }

    _getLocationPermissionAsync = async () => {
        const { status } = await Permissions.askAsync(Permissions.LOCATION)
        if (status !== 'granted') {
            // display an error
        }
    }

    handleUserLocationChange = (e) => {

        if (this.map && !this.props.autoCenterDevice && this.props.showUserLocation) {
            this.map.animateCamera({
                center: {
                    latitude: e.nativeEvent.coordinate.latitude,
                    longitude: e.nativeEvent.coordinate.longitude
                },
                altitude: 0,
                heading: 0,
                pitch: 0,
                zoom: this.map.getCamera().zoom
            });
        }
    }

    handleZoomIn = async () => {
        let curZoom = (await this.map.getCamera()).zoom

        this.map.animateCamera({
            zoom: curZoom + 1
        })
    }

    handleZoomOut = async () => {
        let curZoom = (await this.map.getCamera()).zoom

        this.map.animateCamera({
            zoom: curZoom - 1
        })
    }

    onMapReady = () => {
        this.props.handleMapReady();

        if (this.props.autoCenterDevice && this.map) {
            this.map.animateCamera({
                center: {
                    latitude: this.props.autoCenterDevice.traces[0].latitude,
                    longitude: this.props.autoCenterDevice.traces[0].longitude
                },
                altitude: 0,
                heading: 0,
                pitch: 0,
                zoom: this.map.getCamera().zoom
            });
        }
    }

    handleShowingUserLocation = async () => {

        if (this.props.showUserLocation) {
            await this.props.setShowingUserLocation(false);
        } else {
            await this.props.setShowingUserLocation(true);
            await this.props.setAutoCenterDevice(null);
        }
    }

    onMarkerPress = (a, imei) => {
        this.props.devices.map(async device => {
            if(device.imei === imei){
                await this.props.setAutoCenterDevice(device);
            }
            return true;
        });
    }

    render() {
        return (

            <View style={styles.container}>
                <StatusBar style="dark" />
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

                <StatusBar style="auto" />

                <Modal
                    visible={this.props.showMaptypes}
                    transparent={true}
                    animationType={'slide'}
                >
                    <View style={styles.modalMaptypesContainer}>
                        <View style={styles.modalMaptypeClose}>
                            <TouchableOpacity
                                activeOpacity={0.5}
                                onPress={() => this.props.setShowingMapTypes(false)}
                            >
                                <Text
                                    style={{
                                        color: 'white',
                                        fontSize: 20
                                    }}>
                                    {
                                        loc.closeLabel(this.props.lang)
                                    }
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalMaptypesContent}>
                            <View style={styles.modalMapTypeTitle}>
                                <Text>
                                    {loc.mapTypeLabel(this.props.lang)}
                                </Text>
                            </View>
                            <View style={styles.modalMapTypesOptionsRow}>
                                <View style={[styles.modalMaptypeButton, {
                                    backgroundColor: this.props.mapType === 'standard' ? '#81BEF7' : '#F2F2F2'
                                }]}>
                                    <TouchableHighlight
                                        underlayColor="#58ACFA"
                                        onPress={() => this.props.setMapType('standard')}>
                                        <Image
                                            source={require('./../../assets/maptype_standard.jpg')}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                resizeMode: 'cover'
                                            }} />

                                    </TouchableHighlight>
                                    <View>
                                        <Text style={{ textAlign: 'center', marginTop: 10 }}>
                                            {
                                                loc.mapTypeStandardLabel(this.props.lang)
                                            }
                                        </Text>
                                    </View>
                                </View>

                                <View style={[styles.modalMaptypeButton, {
                                    backgroundColor: this.props.mapType === 'satellite' ? '#81BEF7' : '#F2F2F2'
                                }]}>
                                    <TouchableHighlight
                                        underlayColor="#58ACFA"
                                        onPress={() => this.props.setMapType('satellite')}>
                                        <Image
                                            source={require('./../../assets/maptype_satellite.jpg')}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                resizeMode: 'cover'
                                            }} />

                                    </TouchableHighlight>
                                    <View>
                                        <Text style={{ textAlign: 'center', marginTop: 10 }}>
                                            {
                                                loc.mapTypeSatelliteLabel(this.props.lang)
                                            }
                                        </Text>
                                    </View>
                                </View>

                                <View style={[styles.modalMaptypeButton, {
                                    backgroundColor: this.props.mapType === 'hybrid' ? '#81BEF7' : '#F2F2F2'
                                }]}>
                                    <TouchableHighlight
                                        underlayColor="#58ACFA"
                                        onPress={() => this.props.setMapType('hybrid')}>
                                        <Image
                                            source={require('./../../assets/maptype_hybrid.jpg')}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                resizeMode: 'cover'
                                            }} />

                                    </TouchableHighlight>
                                    <View>
                                        <Text style={{ textAlign: 'center', marginTop: 10 }}>
                                            {
                                                loc.mapTypeHybridLabel(this.props.lang)
                                            }
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <View style={[styles.modalMapTypeTitle, {
                                marginTop: 10
                            }]}>
                                <Text>
                                    {loc.mapUtilitiesLabel(this.props.lang)}
                                </Text>
                            </View>

                            <View style={[styles.modalMapTypesOptionsRow, {
                                paddingBottom: 20
                            }]}>
                                <View style={[styles.modalMaptypeButton, {
                                    backgroundColor: this.props.showMarkerTail ? '#81BEF7' : '#F2F2F2'
                                }]}>
                                    <TouchableHighlight
                                        underlayColor="#58ACFA"
                                        onPress={() => this.props.setShowingMarkerTail(!this.props.showMarkerTail)}>
                                        <Image
                                            source={require('./../../assets/markertail.png')}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                resizeMode: 'cover'
                                            }} />

                                    </TouchableHighlight>
                                    <View>
                                        <Text style={{ textAlign: 'center', marginTop: 10 }}>
                                            {
                                                loc.markerTailLabel(this.props.lang)
                                            }
                                        </Text>
                                    </View>
                                </View>

                                <View style={[styles.modalMaptypeButton, {
                                    backgroundColor: this.props.showGeofences ? '#81BEF7' : '#F2F2F2'
                                }]}>
                                    <TouchableHighlight
                                        underlayColor="#58ACFA"
                                        onPress={() => this.props.setShowingGeofences(!this.props.showGeofences)}>
                                        <Image
                                            source={require('./../../assets/mappolygon.png')}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                resizeMode: 'cover'
                                            }} />

                                    </TouchableHighlight>
                                    <View>
                                        <Text style={{ textAlign: 'center', marginTop: 10 }}>
                                            {
                                                loc.geofencesLabel(this.props.lang)
                                            }
                                        </Text>
                                    </View>
                                </View>

                                <View style={[styles.modalMaptypeButton, {
                                    backgroundColor: this.props.showPois ? '#81BEF7' : '#F2F2F2'
                                }]}>
                                    <TouchableHighlight
                                        underlayColor="#58ACFA"
                                        onPress={() => this.props.setShowingPois(!this.props.showPois)}>
                                        <Image
                                            source={require('./../../assets/mappois.png')}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                resizeMode: 'cover'
                                            }} />

                                    </TouchableHighlight>
                                    <View>
                                        <Text style={{ textAlign: 'center', marginTop: 10 }}>
                                            {
                                                loc.poisLabel(this.props.lang)
                                            }
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                    </View>
                </Modal>


                <MapView
                    ref={(el) => { this.map = el }}
                    provider='google'
                    // style={this.props.isMapReady ? styles.mapStyle : {}}
                    style={styles.mapStyle}
                    mapType={this.props.mapType}
                    zoomTapEnabled={true}
                    zoomEnabled={true}
                    loadingEnabled={true}
                    initialCamera={{
                        center: {
                            latitude: 10.4159096,
                            longitude: -71.4390527
                        },
                        pitch: 0,
                        heading: 0,
                        altitude: 0,
                        zoom: 13
                    }}
                    onMapReady={this.onMapReady}
                    onUserLocationChange={this.handleUserLocationChange}
                    showsUserLocation={this.props.showUserLocation}
                >
                    {
                        this.props.showMarkerTail && this.props.devices.map(device => {
                            if (this.props.devicesShown.includes(device.id)) {
                                let coords = [];

                                for (let i = 0; i < device.traces.length; i++) {
                                    let coord = {
                                        latitude: device.traces[i].latitude,
                                        longitude: device.traces[i].longitude
                                    }

                                    coords.push(coord);
                                }

                                return (
                                    <Polyline
                                        key={device.id}
                                        coordinates={coords}
                                        strokeColor={device.tail_color}
                                        strokeWidth={2}

                                    />
                                )
                            }
                        })
                    }

                    {
                        this.props.devices.map(device => {
                            if (this.props.devicesShown.indexOf(device.id) > -1) {
                                return (
                                    <Marker
                                        nativeID={'456'}
                                        key={device.id}
                                        coordinate={{
                                            latitude: device.traces[0].latitude,
                                            longitude: device.traces[0].longitude
                                        }}
                                        title={device.imei}
                                        rotation={device.traces[0].heading}
                                        image={
                                            device.marker_icon_type === 'sedan1' ? device.traces[0].speed > 0 ?
                                                require('./../../assets/sedan1move.png') : require('./../../assets/sedan1stop.png') :
                                                device.marker_icon_type === 'sedan2' ? device.traces[0].speed > 0 ?
                                                    require('./../../assets/sedan2move.png') : require('./../../assets/sedan2stop.png') :
                                                    device.marker_icon_type === 'sedan3' ? device.traces[0].speed > 0 ?
                                                        require('./../../assets/sedan3move.png') : require('./../../assets/sedan3stop.png') :
                                                        device.marker_icon_type === 'wagon1' ? device.traces[0].speed > 0 ?
                                                            require('./../../assets/wagon1move.png') : require('./../../assets/wagon1stop.png') :
                                                            device.marker_icon_type === 'wagon2' ? device.traces[0].speed > 0 ?
                                                                require('./../../assets/wagon2move.png') : require('./../../assets/wagon2stop.png') :
                                                                device.marker_icon_type === 'wagon3' ? device.traces[0].speed > 0 ?
                                                                    require('./../../assets/wagon3move.png') : require('./../../assets/wagon3stop.png') :
                                                                    device.marker_icon_type === 'truck1' ? device.traces[0].speed > 0 ?
                                                                        require('./../../assets/truck1move.png') : require('./../../assets/truck1stop.png') :
                                                                        device.marker_icon_type === 'truck2' ? device.traces[0].speed > 0 ?
                                                                            require('./../../assets/truck2move.png') : require('./../../assets/truck2stop.png') :
                                                                            device.marker_icon_type === 'truck3' ? device.traces[0].speed > 0 ?
                                                                                require('./../../assets/truck3move.png') : require('./../../assets/truck3stop.png') :
                                                                                device.marker_icon_type === 'pickup1' ? device.traces[0].speed > 0 ?
                                                                                    require('./../../assets/pickup1move.png') : require('./../../assets/pickup1stop.png') :
                                                                                    device.marker_icon_type === 'van1' ? device.traces[0].speed > 0 ?
                                                                                        require('./../../assets/van1move.png') : require('./../../assets/van1stop.png') :
                                                                                        device.marker_icon_type === 'moto1' ? device.traces[0].speed > 0 ?
                                                                                            require('./../../assets/moto1move.png') : require('./../../assets/moto1stop.png') :
                                                                                            device.marker_icon_type === 'bus1' ? device.traces[0].speed > 0 ?
                                                                                                require('./../../assets/bus1move.png') : require('./../../assets/bus1stop.png') :
                                                                                                device.marker_icon_type === 'boat1' ? device.traces[0].speed > 0 ?
                                                                                                    require('./../../assets/boat1move.png') : require('./../../assets/boat1stop.png') :
                                                                                                    device.traces[0].speed > 0 ?
                                                                                                        require('./../../assets/defaultmove.png') : require('./../../assets/defaultstop.png')
                                        }
                                        onPress={(e) => this.onMarkerPress(e,device.imei)}

                                    />
                                )
                            }
                        })
                    }


                </MapView>

                <View style={styles.logoView}>
                    <View style={{ flexDirection: 'row', height: 50 }}>
                        <Image source={require('./../../assets/logo2.png')} style={styles.logo} />
                    </View>
                </View>

                <TouchableHighlight
                    onPress={() => this.props.navigation.toggleDrawer()}
                    underlayColor="#151E4499"
                    style={[
                        styles.btnOnMap,
                        {
                            right: 20,
                            top: 40
                        }
                    ]}>
                    <MaterialCommunityIcons name="menu" size={20} color="#fff"></MaterialCommunityIcons>
                </TouchableHighlight>

                {
                    this.props.devicesShown.length > 0 &&
                    <TouchableHighlight
                        onPress={() => { }}
                        underlayColor="#151E4499"
                        style={[
                            styles.btnOnMap,
                            {
                                right: 20,
                                bottom: 250
                            }
                        ]}>
                        <MaterialCommunityIcons name="eye-settings" size={20} color="#fff"></MaterialCommunityIcons>
                    </TouchableHighlight>
                }

                <TouchableHighlight
                    onPress={this.handleZoomIn}
                    underlayColor="#151E4499"
                    style={[
                        styles.btnOnMap,
                        {
                            right: 20,
                            bottom: 170
                        }
                    ]}>
                    <Feather name="zoom-in" size={20} color="#fff"></Feather>
                </TouchableHighlight>

                <TouchableHighlight
                    onPress={this.handleZoomOut}
                    underlayColor="#151E4499"
                    style={[
                        styles.btnOnMap,
                        {
                            right: 20,
                            bottom: 120
                        }
                    ]}>
                    <Feather name="zoom-out" size={20} color="#fff"></Feather>
                </TouchableHighlight>

                <TouchableHighlight
                    onPress={() => this.props.setShowingMapTypes(true)}
                    underlayColor="#151E4499"
                    style={[
                        styles.btnOnMap,
                        {
                            right: 20,
                            bottom: 70
                        }
                    ]}>
                    <MaterialCommunityIcons name="map" size={20} color="#fff"></MaterialCommunityIcons>
                </TouchableHighlight>

                <TouchableHighlight
                    onPress={this.handleShowingUserLocation}
                    underlayColor="#151E4499"
                    style={[
                        styles.btnOnMap,
                        {
                            right: 20,
                            bottom: 20
                        }
                    ]}>
                    <MaterialIcons name="my-location" size={20} color={this.props.showUserLocation ? 'yellow' : 'white'}></MaterialIcons>
                </TouchableHighlight>

            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'blue',
        position: 'relative'
    },
    body: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: 'blue',
    },
    mapStyle: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
    },
    btnOnMap: {
        position: 'absolute',
        zIndex: 5,
        backgroundColor: '#151E44',
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        shadowOffset: { width: 10, height: 10 },
        shadowColor: 'black',
        shadowOpacity: 1,
        elevation: 3
    },
    logoView: {
        position: 'absolute',
        zIndex: 5,
        top: 33,
        left: 25,
        width: '100%',
        justifyContent: 'flex-start'
    },
    logo: {
        width: 140,
        height: '100%',
        resizeMode: 'contain'

    },
    modalMaptypesContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
        flexDirection: 'column'
    },
    modalMaptypesContent: {
        backgroundColor: '#FFF',
        minHeight: 250,
        position: 'relative'
    },
    modalMapTypesOptionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10
    },
    modalMaptypeButton: {
        width: 110,
        height: 110,
        padding: 10,
        flexDirection: 'column',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#D8D8D8'
    },
    modalMapTypeTitle: {
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 5,
        paddingBottom: 5,
        backgroundColor: '#D8D8D8'
    },
    modalMaptypeClose: {
        alignItems: 'center',
        width: '100%',
        paddingTop: 10,
        paddingBottom: 10
    }
})

const mapStateToProps = (state) => {
    return {
        lang: state.appReducer.lang,
        serverUrl: state.appReducer.serverUrl,
        isLoading: state.appReducer.isLoading,
        isMapReady: state.mapReducer.isMapReady,
        devices: state.devicesReducer.devices,
        devicesShown: state.devicesReducer.devicesShown,
        user: state.userReducer.user,
        mapType: state.mapReducer.mapType,
        autoCenterDevice: state.mapReducer.autoCenterDevice,
        showMaptypes: state.mapReducer.showMaptypes,
        showMarkerTail: state.mapReducer.showMarkerTail,
        showGeofences: state.mapReducer.showGeofences,
        showPois: state.mapReducer.showPois,
        showUserLocation: state.mapReducer.showUserLocation
    }
}

export default connect(mapStateToProps, {
    handleMapReady,
    setDevices,
    setDevicesModels,
    setMapType,
    setAutoCenterDevice,
    setShowingMapTypes,
    setShowingMarkerTail,
    setShowingGeofences,
    setShowingPois,
    setShowingUserLocation,
    setGroups
})(Main)