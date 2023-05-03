import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Image, TouchableHighlight, TouchableOpacity, ActivityIndicator, Alert, Modal, Text } from 'react-native';
import MapView, { Marker, Polyline, Callout } from 'react-native-maps';
import Locale from './../locale';
import axios from 'axios';
import { MaterialCommunityIcons, Feather, MaterialIcons } from 'react-native-vector-icons';
import { io } from 'socket.io-client';
import {
    handleMapReady,
    setDevices,
    setDevicesShown,
    setDevicesLocations,
    setSocket
} from './../actions';
import moment from 'moment';
import Geocoder from 'react-native-geocoding';

const loc = new Locale();
import * as Location from 'expo-location';
import { connect } from 'react-redux';

const socket = io('http://villatrackingsocket.ddns.net:3000');

const Main = (props) => {
    const map = useRef();    
    const [mapType, setMapType] = useState('standard');
    const [autoCenterDevice, setAutoCenterDevice] = useState(null);
    const [showingMapTypes, setShowingMapTypes] = useState(false);
    const [showingMarkerTail, setShowingMarkerTail] = useState(true);
    const [showingGeofences, setShowingGeofences] = useState(false);
    const [showingPois, setShowingPois] = useState(false);
    const [showingUserLocation, setShowingUserLocation] = useState(false);
    const [currentAddress, setCurrentAddress] = useState('');
        
    useEffect(() => {
        if (props.route.params?.action) {
            switch (props.route.params?.action) {
                case 'ANIMATE_CAMERA':
                    props.devices.map(device => {
                        if (props.route.params.selectedDevice.id === device.id) {
                            map.current.animateCamera({
                                center: {
                                    latitude: device.location.latitude,
                                    longitude: device.location.longitude
                                },
                                altitude: 0,
                                heading: 0,
                                pitch: 0,
                                zoom: map.current.getCamera().zoom
                            });
                            setAutoCenterDevice(device);
                        }
                        return device;
                    });

                    clearActionParam();
                    break;
                default:
                    console.log('default');
                    break;
            }
        }
    })

    useEffect(() => {
        socket.on('connect', () => {   
            console.log('connected!')
            socket.emit('store_socket_id', {socketId: socket.id, userId: props.user.id});
        });

        socket.on('new_gps_data', (data) => {                 
            if (props.devicesLocations.length === 0){
                props.setDevicesLocations([data]);
            }

            props.setDevicesLocations((props.devicesLocations || []).map(location => {
                if (location.imei === data.imei){
                    location = data;
                }
                return location;
            }))

            if ((autoCenterDevice && map.current) && (autoCenterDevice.imei === data.imei)) {
                map.current.animateCamera({
                    center: {
                        latitude: data.latitude,
                        longitude: data.longitude
                    },
                    altitude: 0,
                    heading: 0,
                    pitch: 0,
                    zoom: map.current.getCamera().zoom
                });
            }
        });

        _getLocationPermissionAsync();
        Geocoder.init("AIzaSyDJrTt5rprVW9n16JNgc8NOjKzSt6WEqqg", { language: props.lang });

        props.setSocket(socket);

        axios.post(props.serverUrl + '/getDevicesByUser', {user_id: props.user.id}).then(res => {
            if (res.data.result === 'OK'){
                props.setDevices(res.data.devices);
            }
        }).catch(e => {
            console.log(e)
        })

        return () => {
            socket.off('connection');
            socket.off('new_gps_data');
            socket.disconnect();
        }
    }, []);

    const clearActionParam = () => {
        props.navigation.setParams({
            action: ''
        })
    }

    const _getLocationPermissionAsync = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
            // display an error
        }

        Location.setGoogleApiKey('AIzaSyDJrTt5rprVW9n16JNgc8NOjKzSt6WEqqg');
    }

    const handleUserLocationChange = (e) => {

        if (map.current && !autoCenterDevice && showingUserLocation) {
            map.current.animateCamera({
                center: {
                    latitude: e.nativeEvent.coordinate.latitude,
                    longitude: e.nativeEvent.coordinate.longitude
                },
                altitude: 0,
                heading: 0,
                pitch: 0,
                zoom: map.current.getCamera().zoom
            });
        }
    }

    const handleZoomIn = async () => {
        let curZoom = (await map.current.getCamera()).zoom

        map.current.animateCamera({
            zoom: curZoom + 1
        })
    }

    const handleZoomOut = async () => {
        let curZoom = (await map.current.getCamera()).zoom

        map.current.animateCamera({
            zoom: curZoom - 1
        })
    }

    const onMapReady = () => {
        props.handleMapReady();

        if (autoCenterDevice && map.current) {
            map.current.animateCamera({
                center: {
                    latitude: autoCenterDevice.traces[0].latitude,
                    longitude: autoCenterDevice.traces[0].longitude
                },
                altitude: 0,
                heading: 0,
                pitch: 0,
                zoom: map.current.getCamera().zoom
            });
        }
    }

    const handleShowingUserLocation = () => {
        if (showingUserLocation) {
            setShowingUserLocation(false);
        } else {
            setShowingUserLocation(true);
            setAutoCenterDevice(null);
        }
    }

    const onMarkerPress = (a, imei) => {
        props.devices.map(device => {
            if (device.imei === imei) {
                setAutoCenterDevice(device);

                // getAddressFromLatLng(device.location.latitude, device.location.longitude)
            }
            return true;
        });
    }

    const getAddressFromLatLng = (lat, lng) => {
        Geocoder.from(lat, lng).then(json => {
            let addressComponent = json.results[0].formatted_address;
            setCurrentAddress(addressComponent);
        }).catch(error => console.warn(error));

        let newAddress = Location.reverseGeocodeAsync();

        console.log(newAddress);
    }

    useEffect(() => {
        if ((props.devices || []).length > 0) {
            props.setDevices(props.devices.map(device => {
                

                device.location = props.devicesLocations.find(l => l.imei === device.imei) || device?.location
                return device;
            }))
        }
    }, [props.devicesLocations])

    return (

        <View style={styles.container}>
            <StatusBar style="dark" />
            {
                props.isLoading &&
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

            <Modal visible={showingMapTypes} transparent={true} animationType={'slide'}>
                <View style={styles.modalMaptypesContainer}>
                    <View style={styles.modalMaptypeClose}>
                        <TouchableOpacity activeOpacity={0.5} onPress={() => { setShowingMapTypes(false) }}>
                            <Text style={{ color: 'white', fontSize: 20 }}>
                                {
                                    loc.closeLabel(props.lang)
                                }
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.modalMaptypesContent}>
                        <View style={styles.modalMapTypeTitle}>
                            <Text>
                                {loc.mapTypeLabel(props.lang)}
                            </Text>
                        </View>
                        <View style={styles.modalMapTypesOptionsRow}>
                            <View style={[styles.modalMaptypeButton, { backgroundColor: mapType === 'standard' ? '#81BEF7' : '#F2F2F2' }]}>
                                <TouchableHighlight underlayColor="#58ACFA" onPress={() => { setMapType('standard') }}>
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
                                            loc.mapTypeStandardLabel(props.lang)
                                        }
                                    </Text>
                                </View>
                            </View>

                            <View style={[styles.modalMaptypeButton, { backgroundColor: mapType === 'satellite' ? '#81BEF7' : '#F2F2F2' }]}>
                                <TouchableHighlight underlayColor="#58ACFA" onPress={() => { setMapType('satellite') }}>
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
                                            loc.mapTypeSatelliteLabel(props.lang)
                                        }
                                    </Text>
                                </View>
                            </View>

                            <View style={[styles.modalMaptypeButton, { backgroundColor: mapType === 'hybrid' ? '#81BEF7' : '#F2F2F2' }]}>
                                <TouchableHighlight underlayColor="#58ACFA" onPress={() => { setMapType('hybrid') }}>
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
                                            loc.mapTypeHybridLabel(props.lang)
                                        }
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={[styles.modalMapTypeTitle, { marginTop: 10 }]}>
                            <Text>
                                {loc.mapUtilitiesLabel(props.lang)}
                            </Text>
                        </View>

                        <View style={[styles.modalMapTypesOptionsRow, {
                            paddingBottom: 20
                        }]}>
                            <View style={[styles.modalMaptypeButton, { backgroundColor: showingMarkerTail ? '#81BEF7' : '#F2F2F2' }]}>
                                <TouchableHighlight underlayColor="#58ACFA" onPress={() => { setShowingMarkerTail(!showingMarkerTail) }}>
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
                                            loc.markerTailLabel(props.lang)
                                        }
                                    </Text>
                                </View>
                            </View>

                            <View style={[styles.modalMaptypeButton, { backgroundColor: showingGeofences ? '#81BEF7' : '#F2F2F2' }]}>
                                <TouchableHighlight underlayColor="#58ACFA" onPress={() => { setShowingGeofences(!showingGeofences) }}>
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
                                            loc.geofencesLabel(props.lang)
                                        }
                                    </Text>
                                </View>
                            </View>

                            <View style={[styles.modalMaptypeButton, { backgroundColor: showingPois ? '#81BEF7' : '#F2F2F2' }]}>
                                <TouchableHighlight underlayColor="#58ACFA" onPress={() => { setShowingPois(!showingPois) }}>
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
                                            loc.poisLabel(props.lang)
                                        }
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                </View>
            </Modal>


            <MapView
                ref={map}
                provider='google'
                // style={props.isMapReady ? styles.mapStyle : {}}
                style={styles.mapStyle}
                mapType={mapType}
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
                onMapReady={onMapReady}
                onUserLocationChange={handleUserLocationChange}
                showsUserLocation={showingUserLocation}
            >
                {
                    showingMarkerTail && props.devices.map(device => {
                        if ((props.devicesShown || []).includes(device.id)) {
                            let coords = [];

                            for (let i = 0; i < (device?.traces || []).length; i++) {
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
                    props.devices.map(device => {
                        if (props.devicesShown.indexOf(device.id) > -1) {
                            return (
                                <Marker
                                    nativeID={'456'}
                                    key={device.id}
                                    coordinate={{
                                        latitude: device.location.latitude,
                                        longitude: device.location.longitude
                                    }}
                                    title={device.imei}
                                    rotation={device.location.heading}
                                    image={
                                        device.marker_icon_type === 'sedan1' ? device.location.speed > 0 ?
                                            require('./../../assets/sedan1move.png') : require('./../../assets/sedan1stop.png') :
                                            device.marker_icon_type === 'sedan2' ? device.location.speed > 0 ?
                                                require('./../../assets/sedan2move.png') : require('./../../assets/sedan2stop.png') :
                                                device.marker_icon_type === 'sedan3' ? device.location.speed > 0 ?
                                                    require('./../../assets/sedan3move.png') : require('./../../assets/sedan3stop.png') :
                                                    device.marker_icon_type === 'wagon1' ? device.location.speed > 0 ?
                                                        require('./../../assets/wagon1move.png') : require('./../../assets/wagon1stop.png') :
                                                        device.marker_icon_type === 'wagon2' ? device.location.speed > 0 ?
                                                            require('./../../assets/wagon2move.png') : require('./../../assets/wagon2stop.png') :
                                                            device.marker_icon_type === 'wagon3' ? device.location.speed > 0 ?
                                                                require('./../../assets/wagon3move.png') : require('./../../assets/wagon3stop.png') :
                                                                device.marker_icon_type === 'truck1' ? device.location.speed > 0 ?
                                                                    require('./../../assets/truck1move.png') : require('./../../assets/truck1stop.png') :
                                                                    device.marker_icon_type === 'truck2' ? device.location.speed > 0 ?
                                                                        require('./../../assets/truck2move.png') : require('./../../assets/truck2stop.png') :
                                                                        device.marker_icon_type === 'truck3' ? device.location.speed > 0 ?
                                                                            require('./../../assets/truck3move.png') : require('./../../assets/truck3stop.png') :
                                                                            device.marker_icon_type === 'pickup1' ? device.location.speed > 0 ?
                                                                                require('./../../assets/pickup1move.png') : require('./../../assets/pickup1stop.png') :
                                                                                device.marker_icon_type === 'van1' ? device.location.speed > 0 ?
                                                                                    require('./../../assets/van1move.png') : require('./../../assets/van1stop.png') :
                                                                                    device.marker_icon_type === 'moto1' ? device.location.speed > 0 ?
                                                                                        require('./../../assets/moto1move.png') : require('./../../assets/moto1stop.png') :
                                                                                        device.marker_icon_type === 'bus1' ? device.location.speed > 0 ?
                                                                                            require('./../../assets/bus1move.png') : require('./../../assets/bus1stop.png') :
                                                                                            device.marker_icon_type === 'boat1' ? device.location.speed > 0 ?
                                                                                                require('./../../assets/boat1move.png') : require('./../../assets/boat1stop.png') :
                                                                                                device.location.speed > 0 ?
                                                                                                    require('./../../assets/defaultmove.png') : require('./../../assets/defaultstop.png')
                                    }
                                    onPress={(e) => { onMarkerPress(e, device.imei) }}
                                >
                                    <Callout tooltip={false} 
                                        style={{
                                            backgroundColor: 'transparent',
                                            borderRadius: 10,
                                            overflow: 'hidden'
                                        }}>
                                        <View style={styles.calloutContainer}>

                                            <View style={styles.calloutTitle}>
                                                <Text style={{ color: 'lightgray', marginRight: 5 }}>Imei/ID:</Text>
                                                <Text style={{ color: 'white' }}>{device.imei}</Text>
                                            </View>

                                            <View style={styles.calloutVehicle}>
                                                <Text style={{ color: 'black' }}>{device.vehicle}</Text>
                                                <Text style={{ color: '#0059b3' }}>{device.license_plate}</Text>
                                            </View>

                                            <View style={styles.calloutData}>
                                                <View style={{
                                                    flexDirection: 'column',
                                                    backgroundColor: 'rgba(0,0,0,0.1)',
                                                    borderRadius: 10,
                                                    overflow: 'hidden',
                                                    padding: 10
                                                }}>
                                                    <View style={styles.calloutDataRow}>
                                                        <View style={styles.calloutDataCell}>
                                                            <Text style={styles.headingText}>{loc.latitudeText(props.lang)}</Text>
                                                            <Text style={{ color: 'black', fontWeight: 'bold' }}>{device.location.latitude.toFixed(5)}</Text>
                                                        </View>

                                                        <View style={styles.calloutDataCell}>
                                                            <Text style={styles.headingText}>{loc.longitudeText(props.lang)}</Text>
                                                            <Text style={{ color: 'black', fontWeight: 'bold' }}>{device.location.longitude.toFixed(5)}</Text>
                                                        </View>

                                                        <View style={styles.calloutDataCell}>
                                                            <Text style={styles.headingText}>{loc.speedLabel(props.lang)}</Text>
                                                            <Text style={{ color: 'black', fontWeight: 'bold' }}>{device.location.speed + ' Km/h'}</Text>
                                                        </View>
                                                    </View>

                                                    <View style={styles.calloutDataRow}>
                                                        <View style={styles.calloutDataCell}>
                                                            <Text style={styles.headingText}>{loc.dateText(props.lang)}</Text>
                                                            <Text style={{ color: 'black', fontWeight: 'bold' }}>{moment(device.location.date_time, 'YYYY-MM-DD HH:mm:ss').format('DD-MM-YYYY')}</Text>
                                                        </View>

                                                        <View style={styles.calloutDataCell}>
                                                            <Text style={styles.headingText}>{loc.timeText(props.lang)}</Text>
                                                            <Text style={{ color: 'black', fontWeight: 'bold' }}>{moment(device.location.date_time, 'YYYY-MM-DD HH:mm:ss').format('hh:mm:ss a')}</Text>
                                                        </View>

                                                        <View style={styles.calloutDataCell}>
                                                            <Text style={styles.headingText}>{loc.ignitionText(props.lang)}</Text>
                                                            <Text style={{ color: 'black', fontWeight: 'bold' }}>{device.location.ignition === 0 ? 'Off' : 'On'}</Text>
                                                        </View>
                                                    </View>

                                                    <View style={styles.calloutDataRow}>
                                                        <View style={{
                                                            flexDirection: 'column',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            width: '100%',
                                                            flexWrap: 'wrap'
                                                        }}>
                                                            <Text style={styles.headingText}>{loc.addressText(props.lang)}</Text>
                                                            <View style={{
                                                                flexDirection: 'row',
                                                                flexShrink: 1
                                                            }}>
                                                                <Text style={{
                                                                    color: 'black',
                                                                    fontWeight: 'bold',
                                                                    width: '100%',
                                                                    flexShrink: 1
                                                                }}>
                                                                    {currentAddress}
                                                                </Text>
                                                            </View>

                                                        </View>
                                                    </View>

                                                </View>

                                            </View>

                                            <View></View>

                                        </View>
                                    </Callout>
                                </Marker>
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
                onPress={() => { props.navigation.toggleDrawer() }}
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
                props.devicesShown.length > 0 &&
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
                onPress={handleZoomIn}
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
                onPress={handleZoomOut}
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
                onPress={() => { setShowingMapTypes(true) }}
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
                onPress={handleShowingUserLocation}
                underlayColor="#151E4499"
                style={[
                    styles.btnOnMap,
                    {
                        right: 20,
                        bottom: 20
                    }
                ]}>
                <MaterialIcons name="my-location" size={20} color={showingUserLocation ? 'yellow' : 'white'}></MaterialIcons>
            </TouchableHighlight>

        </View>
    )
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
    },
    calloutContainer: {
        flexDirection: 'column'
    },
    calloutTitle: {
        backgroundColor: 'black',
        color: 'white',
        flexDirection: 'row',
        padding: 5,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        justifyContent: 'center'
    },
    calloutVehicle: {
        backgroundColor: 'white',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 5
    },
    calloutData: {
        backgroundColor: 'white',
        padding: 5,
        flexDirection: 'column',
        flexWrap: 'wrap'
    },
    headingText: {
        color: 'gray',
        textTransform: 'uppercase',
        fontSize: 10,
        fontWeight: 'bold'
    },
    calloutDataRow: {
        flexDirection: 'row',
        marginBottom: 5
    },
    calloutDataCell: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: 70
    }
})

const mapStateToProps = (state) => {
    return {
        lang: state.appReducer.lang,
        serverUrl: state.appReducer.serverUrl,
        socketUrl: state.appReducer.socketUrl,
        isLoading: state.appReducer.isLoading,
        isMapReady: state.mapReducer.isMapReady,
        devices: state.devicesReducer.devices,
        devicesLocations: state.devicesReducer.devicesLocations,
        devicesShown: state.devicesReducer.devicesShown,
        user: state.userReducer.user
    }
}

export default connect(mapStateToProps, {
    handleMapReady,
    setDevices,
    setDevicesShown,
    setDevicesLocations,
    setSocket
})(Main)