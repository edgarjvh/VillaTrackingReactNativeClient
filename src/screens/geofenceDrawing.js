import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'react-redux';
import { View, Text, StyleSheet, ActivityIndicator, Modal, Image, TouchableOpacity, TouchableHighlight } from 'react-native';
import { MaterialCommunityIcons, FontAwesome, Feather } from 'react-native-vector-icons';
import Locale from './../locale';
import { HeaderButtons, HeaderButton, Item } from 'react-navigation-header-buttons';
import axios from 'axios';
import MapView, { Polygon, Circle, Marker } from "react-native-maps";
import { getDistance } from 'geolib'

const MaterialHeaderButton = (props) => (
    <HeaderButton IconComponent={MaterialCommunityIcons} iconSize={23} {...props} />
);

const MaterialHeaderButtons = (props) => {
    return <HeaderButtons HeaderButtonComponent={MaterialHeaderButton} {...props} />;
};

const loc = new Locale();

const GeofenceDrawing = (props) => {
    const [showMapTypes, setShowMapTypes] = useState(false);
    const [mapType, setMapType] = useState('standard');
    const [isLoading, setisLoading] = useState();
    const [selectedGeofence, setSelectedGeofence] = useState({});

    const map = useRef();
    const circle = useRef();

    useEffect(() => {
        props.navigation.setOptions({
            headerRight: () => (
                <MaterialHeaderButtons>
                    {
                        (selectedGeofence?.type || 'polygon') === 'polygon' &&
                        <Item
                            title="delete"
                            iconName="backspace"
                            onPress={removeLast}
                            disabled={(selectedGeofence?.points || []).length === 0}
                            color={(selectedGeofence?.points || []).length === 0 ? 'rgba(0,0,0,0.3)' : 'black'} />
                    }
                    <Item title="clear" iconName="broom" onPress={clearMap} />
                    <Item title="menu" iconName="menu" onPress={() => props.navigation.toggleDrawer()} />
                </MaterialHeaderButtons>
            )
        })
    })

    useEffect(() => {
        setSelectedGeofence(props.route.params.selectedGeofence);
    }, [])

    const clearMap = () => {
        let geofence = { ...selectedGeofence };
        geofence.points = [];
        geofence.center = {};
        geofence.radius = 0;

        setSelectedGeofence(geofence);
        props.route.params.setSelectedGeofence(geofence);
    }

    const onMapPress = (e) => {
        let { coordinate } = e.nativeEvent;
        let geofence = { ...selectedGeofence };

        

        if ((selectedGeofence?.type || 'polygon') === 'polygon') {
            let points = (selectedGeofence?.points || []).map(point => point);

            points.push(coordinate);
            
            geofence.points = [...points];

            setSelectedGeofence(geofence);
            props.route.params.setSelectedGeofence(geofence);
        } else {
            if (selectedGeofence?.center?.latitude) {
                geofence.radius = getDistance((selectedGeofence?.center || {}), coordinate);

                setSelectedGeofence(geofence);
                props.route.params.setSelectedGeofence(geofence);
            } else {
                geofence.center = coordinate;

                setSelectedGeofence(geofence);
                props.route.params.setSelectedGeofence(geofence);
            }
        }
    }

    const removeLast = () => {
        let geofence = { ...selectedGeofence };
        let points = (selectedGeofence?.points || []).map(point => point);
        points.pop();
        geofence.points = points;

        setSelectedGeofence(geofence);
        props.route.params.setSelectedGeofence(geofence);
    }

    const onMapLayout = () => {
        fitCoords();
    }

    const fitCoords = () => {
        if (map.current) {
            if ((selectedGeofence?.type || 'polygon') === 'polygon') {
                if ((selectedGeofence?.points || []).length > 0) {
                    map.current.fitToCoordinates(selectedGeofence.points);
                }
            } else {
                if ((selectedGeofence?.radius || 0) > 0) {
                    map.current.fitToCoordinates(get4PointsAroundCircunference());
                }
            }
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

    const get4PointsAroundCircunference = () => {
        let latitude = selectedGeofence.center.latitude;
        let longitude = selectedGeofence.center.longitude;
        let radius = selectedGeofence.radius / 1000;

        const earthRadius = 6378.1;
        const lat0 = latitude + (-radius / earthRadius) * (180 / Math.PI);
        const lat1 = latitude + (radius / earthRadius) * (180 / Math.PI);
        const lng0 = longitude + (-radius / earthRadius) * (180 / Math.PI) / Math.cos(latitude * Math.PI / 180);
        const lng1 = longitude + (radius / earthRadius) * (180 / Math.PI) / Math.cos(latitude * Math.PI / 180);

        return [
            {
                latitude: lat0,
                longitude: longitude
            },
            {
                latitude: latitude,
                longitude: lng0
            },
            {
                latitude: lat1,
                longitude: longitude
            },
            {
                latitude: latitude,
                longitude: lng1
            }
        ]
    }

    return (
        <View style={styles.container}>
            <Modal
                visible={showMapTypes}
                transparent={true}
                animationType={'slide'}
            >
                <View style={styles.modalMaptypesContainer}>
                    <View style={styles.modalMaptypeClose}>
                        <TouchableOpacity
                            activeOpacity={0.5}
                            onPress={() => setShowMapTypes(false)}
                        >
                            <Text
                                style={{
                                    color: 'white',
                                    fontSize: 20
                                }}>
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
                            <View style={[styles.modalMaptypeButton, {
                                backgroundColor: mapType === 'standard' ? '#81BEF7' : '#F2F2F2'
                            }]}>
                                <TouchableHighlight
                                    underlayColor="#58ACFA"
                                    onPress={() => setMapType('standard')}>
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

                            <View style={[styles.modalMaptypeButton, {
                                backgroundColor: mapType === 'satellite' ? '#81BEF7' : '#F2F2F2'
                            }]}>
                                <TouchableHighlight
                                    underlayColor="#58ACFA"
                                    onPress={() => setMapType('satellite')}>
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

                            <View style={[styles.modalMaptypeButton, {
                                backgroundColor: mapType === 'hybrid' ? '#81BEF7' : '#F2F2F2'
                            }]}>
                                <TouchableHighlight
                                    underlayColor="#58ACFA"
                                    onPress={() => setMapType('hybrid')}>
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
                    </View>
                </View>
            </Modal>
            <MapView
                style={styles.mapStyle}
                onPress={onMapPress}
                ref={map}
                provider='google'
                zoomTapEnabled={true}
                zoomEnabled={true}
                loadingEnabled={true}
                mapType={mapType}
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
                onLayout={onMapLayout}
            >
                {
                    ((selectedGeofence?.type || 'polygon') === 'polygon' && (selectedGeofence?.points || []).length > 0) &&
                    <Polygon
                        coordinates={selectedGeofence.points}
                        fillColor={selectedGeofence.color + '70'}
                        strokeColor={selectedGeofence.color}

                    />
                }

                {
                    ((selectedGeofence?.type || 'polygon') === 'circle' &&
                        (selectedGeofence?.center?.latitude) &&
                        (selectedGeofence?.radius || 0) > 0) &&
                    <Circle
                        ref={circle}
                        center={selectedGeofence?.center}
                        radius={selectedGeofence?.radius || 0}
                        fillColor={(selectedGeofence?.color || '') + '70'}
                        strokeColor={selectedGeofence?.color}
                    />
                }

                {
                    (selectedGeofence?.type || 'polygon') === 'polygon'
                        ?
                        (selectedGeofence?.points || []).map((point, index) => {
                            return (
                                <Marker
                                    nativeID={'456'}
                                    key={index}
                                    coordinate={{
                                        latitude: point.latitude,
                                        longitude: point.longitude
                                    }}
                                    image={require('./../../assets/trans.png')}
                                    anchor={{ x: 0.5, y: 0.5 }}
                                />
                            )
                        })
                        :
                        selectedGeofence?.center?.latitude &&
                        <Marker
                            nativeID={'456'}
                            coordinate={{
                                latitude: selectedGeofence.center.latitude,
                                longitude: selectedGeofence.center.longitude
                            }}
                            image={require('./../../assets/trans.png')}
                            anchor={{ x: 0.5, y: 0.5 }}
                        />
                }
            </MapView>

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
                onPress={() => setShowMapTypes(true)}
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
                onPress={fitCoords}
                underlayColor="#151E4499"
                style={[
                    styles.btnOnMap,
                    {
                        right: 20,
                        bottom: 20
                    }
                ]}>
                <MaterialCommunityIcons name="fit-to-page-outline" size={20} color="#fff"></MaterialCommunityIcons>
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
    mainContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    content: {

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
});

const mapStateToProps = state => {
    return {
        lang: state.appReducer.lang,
        serverUrl: state.appReducer.serverUrl,
        user: state.userReducer.user
    }
}

export default connect(mapStateToProps, null)(GeofenceDrawing)