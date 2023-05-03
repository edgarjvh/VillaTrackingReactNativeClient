import React, { useEffect, useState, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { connect } from "react-redux";
import { View, Text, StyleSheet, TouchableHighlight, Modal, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import MapView, { Marker, Polyline, Callout, Circle } from 'react-native-maps';
import { MaterialCommunityIcons, Feather, MaterialIcons } from 'react-native-vector-icons';
import Locale from './../locale';

const loc = new Locale();

const HistoryMap = (props) => {
    const [mapType, setMapType] = useState('standard');
    const [showMaptypes, setShowMaptypes] = useState(false);
    const [showPolyline, setShowPolyline] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [coords, setCoords] = useState(props.route.params.coords || []);
    const [traces, setTraces] = useState(props.route.params.traces || []);

    const map = useRef();
    
    useEffect(() => {
        setIsLoading(true);
    }, []);
    
    const onMapLayout = () => {
        setIsLoading(false);

        if (map.current) {
            map.current.fitToCoordinates(coords);
        } else {
            console.log('no map')
        }
    }

    const fitCoords = () => {
        if (map.current) {
            map.current.fitToCoordinates(coords);
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

    return (
        <View style={styles.container}>

            <Modal
                transparent={true}
                visible={isLoading}
                animationType={'slide'}
                onRequestClose={() => setIsLoading(false)}
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

            <StatusBar style="dark" />
            {
                isLoading &&
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
                visible={showMaptypes}
                transparent={true}
                animationType={'slide'}
            >
                <View style={styles.modalMaptypesContainer}>
                    <View style={styles.modalMaptypeClose}>
                        <TouchableOpacity
                            activeOpacity={0.5}
                            onPress={() => setShowMaptypes(false)}
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

                        <View style={[styles.modalMapTypeTitle, {
                            marginTop: 10
                        }]}>
                            <Text>
                                {loc.mapUtilitiesLabel(props.lang)}
                            </Text>
                        </View>

                        <View style={[styles.modalMapTypesOptionsRow, {
                            paddingBottom: 20
                        }]}>
                            <View style={[styles.modalMaptypeButton, {
                                backgroundColor: showPolyline ? '#81BEF7' : '#F2F2F2'
                            }]}>
                                <TouchableHighlight
                                    underlayColor="#58ACFA"
                                    onPress={() => setShowPolyline(prev => !prev)}>
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
                                            loc.lineLabel(props.lang)
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
                onLayout={onMapLayout}
            >
                {
                    traces.map((trace, index) => {
                        return (
                            <Marker
                                key={trace.id}
                                coordinate={{
                                    latitude: trace.latitude,
                                    longitude: trace.longitude
                                }}
                                title={
                                    trace.date_time === trace.last_date_time ?
                                        trace.date_time :
                                        trace.date_time + ' >> ' + trace.last_date_time
                                }
                                anchor={{
                                    x: 0.5,
                                    y: 0.5
                                }}
                                calloutAnchor={{
                                    x: 0.5,
                                    y: 0.5
                                }}
                                flat={true}
                                rotation={trace.heading}
                                image={trace.speed > 0 ?
                                    require('./../../assets/defaultmove.png') :
                                    require('./../../assets/defaultstop.png')}
                            >
                                <Callout tooltip={true}>
                                    <View style={styles.calloutContainer}>
                                        <View style={styles.calloutContent}>
                                            <View style={styles.calloutTitleContainer}>
                                                <Text style={{ color: '#fff' }}>
                                                    {loc.recordLabel(props.lang)} N°: {(index + 1).toString()}
                                                </Text>
                                            </View>

                                            <View style={styles.calloutSubtitleContainer}>
                                                <Text style={{ textAlign: 'center' }}>
                                                    {loc.dateTimeLabel(props.lang)}
                                                </Text>
                                            </View>

                                            <View style={styles.calloutInfo}>
                                                <Text style={{ textAlign: 'center' }}>
                                                    {
                                                        trace.date_time === trace.last_date_time ?
                                                            trace.date_time :
                                                            trace.date_time + ' > ' + trace.last_date_time
                                                    }
                                                </Text>
                                            </View>

                                            <View style={styles.calloutSubtitleContainer}>
                                                <Text style={{ textAlign: 'center' }}>
                                                    {loc.speedLabel(props.lang)}
                                                </Text>
                                            </View>

                                            <View style={styles.calloutInfo}>
                                                <Text style={{ textAlign: 'center' }}>
                                                    {trace.speed} Km/H
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={styles.calloutNubContainer}>
                                            <View style={styles.calloutNub}></View>
                                        </View>
                                    </View>
                                </Callout>
                            </Marker>
                        )
                    })
                }

                {
                    showPolyline &&
                    <Polyline
                        coordinates={coords}
                        strokeColor={'#000'}
                        strokeWidth={2}
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
                onPress={() => setShowMaptypes(true)}
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
    },
    calloutContainer: {
        position: 'relative',
        paddingBottom: 20
    },
    calloutNubContainer: {
        position: 'absolute',
        alignItems: 'center',
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%'
    },
    calloutNub: {
        backgroundColor: '#fff',
        width: 20,
        height: 20,
        transform: [{ rotate: '45deg' }],
        alignSelf: 'center',
        marginBottom: 10,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: 'rgba(0,0,0,0.3)'
    },
    calloutContent: {
        backgroundColor: '#fff',
        paddingBottom: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.3)',
        overflow: 'hidden',
        flexDirection: 'column'
    },
    calloutTitleContainer: {
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,1)',
        paddingTop: 2,
        paddingBottom: 2,
        paddingLeft: 10,
        paddingRight: 10
    },
    calloutSubtitleContainer: {
        backgroundColor: 'rgba(0,0,0,0.1)',
        paddingTop: 2,
        paddingBottom: 2,
        paddingLeft: 10,
        paddingRight: 10
    },
    calloutInfo: {
        paddingTop: 2,
        paddingBottom: 2,
        paddingLeft: 10,
        paddingRight: 10
    }
})

const mapStateToProps = (state) => {
    return {
        lang: state.appReducer.lang,
        historyData: state.devicesReducer.historyData,
        coordsData: state.devicesReducer.coordsData,
        isLoading: state.appReducer.isLoading
    }
}

export default connect(mapStateToProps, null)(HistoryMap)