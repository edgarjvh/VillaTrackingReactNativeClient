import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text, StyleSheet, ActivityIndicator, Modal, Image, TouchableOpacity, TouchableHighlight } from 'react-native';
import { MaterialCommunityIcons, FontAwesome, Feather } from 'react-native-vector-icons';
import Locale from './../locale';
import { HeaderButtons, HeaderButton, Item } from 'react-navigation-header-buttons';
import axios from 'axios';
import MapView, { Polygon, Circle, Marker } from "react-native-maps";
import {
    setIsLoading,
    setGeofencePoints,
    setGeofenceCenter,
    setGeofenceRadius,
    handleMapReady
} from './../actions';
import { getDistance } from 'geolib'

const MaterialHeaderButton = (props) => (
    <HeaderButton IconComponent={MaterialCommunityIcons} iconSize={23} {...props} />
);

const MaterialHeaderButtons = (props) => {
    return <HeaderButtons HeaderButtonComponent={MaterialHeaderButton} {...props} />;
};

const loc = new Locale();

class GeofenceDrawing extends Component {
    constructor(props) {
        super(props)

        this.state = {
            showMaptypes: false
        }

        this.props.navigation.setOptions({
            headerRight: () => (
                <MaterialHeaderButtons>
                    {
                        this.props.geofenceType === 'polygon' &&
                        <Item
                            title="delete"
                            iconName="backspace"
                            onPress={this.removeLast}
                            disabled={this.props.geofencePoints.length === 0}
                            color={this.props.geofencePoints.length === 0 ? 'rgba(0,0,0,0.3)' : 'black'} />
                    }
                    <Item title="clear" iconName="broom" onPress={this.clearMap} />
                    <Item title="menu" iconName="menu" onPress={() => this.props.navigation.toggleDrawer()} />
                </MaterialHeaderButtons>
            )
        })
    }

    clearMap = () => {
        this.props.setGeofencePoints([]);
        this.props.setGeofenceCenter(null);
        this.props.setGeofenceRadius(0);
    }

    componentDidMount() {
        console.log(this.props.geofenceColor + '00')
    }

    onMapPress = (e) => {
        let { coordinate } = e.nativeEvent;

        if (this.props.geofenceType === 'polygon') {
            let points = this.props.geofencePoints.map(point => {
                return point;
            });

            points.push(coordinate);

            this.props.setGeofencePoints(points);
        } else {
            if (this.props.geofenceCenter) {
                this.props.setGeofenceRadius(getDistance(this.props.geofenceCenter, coordinate));
            } else {
                this.props.setGeofenceCenter(coordinate);
            }
        }
    }

    removeLast = () => {
        let points = this.props.geofencePoints.map(point => {
            return point;
        });

        points.pop();

        this.props.setGeofencePoints(points);
    }

    onMapLayout = () => {
        this.fitCoords();
    }

    fitCoords = () => {
        if (this.map) {
            if (this.props.geofenceType === 'polygon') {
                if (this.props.geofencePoints && this.props.geofencePoints.length > 0) {
                    this.map.fitToCoordinates(this.props.geofencePoints);
                }
            } else {
                if (this.props.geofenceRadius > 0) {
                    console.log(this.circle)
                    this.map.fitToCoordinates(this.get4PointsAroundCircunference(
                        this.props.geofenceCenter.latitude,
                        this.props.geofenceCenter.longitude,
                        this.props.geofenceRadius / 1000
                    ))
                }
            }
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

    get4PointsAroundCircunference = (latitude, longitude, radius) => {
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

    render() {
        return (
            <View style={styles.container}>
                <Modal
                    visible={this.state.showMaptypes}
                    transparent={true}
                    animationType={'slide'}
                >
                    <View style={styles.modalMaptypesContainer}>
                        <View style={styles.modalMaptypeClose}>
                            <TouchableOpacity
                                activeOpacity={0.5}
                                onPress={() => this.setState({ showMaptypes: false })}
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
                                    backgroundColor: this.state.mapType === 'standard' ? '#81BEF7' : '#F2F2F2'
                                }]}>
                                    <TouchableHighlight
                                        underlayColor="#58ACFA"
                                        onPress={() => this.setState({ mapType: 'standard' })}>
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
                                    backgroundColor: this.state.mapType === 'satellite' ? '#81BEF7' : '#F2F2F2'
                                }]}>
                                    <TouchableHighlight
                                        underlayColor="#58ACFA"
                                        onPress={() => this.setState({ mapType: 'satellite' })}>
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
                                    backgroundColor: this.state.mapType === 'hybrid' ? '#81BEF7' : '#F2F2F2'
                                }]}>
                                    <TouchableHighlight
                                        underlayColor="#58ACFA"
                                        onPress={() => this.setState({ mapType: 'hybrid' })}>
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
                        </View>
                    </View>
                </Modal>
                <MapView
                    style={styles.mapStyle}
                    onPress={this.onMapPress}
                    ref={(el) => { this.map = el }}
                    provider='google'
                    zoomTapEnabled={true}
                    zoomEnabled={true}
                    loadingEnabled={true}
                    mapType={this.state.mapType}
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
                    onLayout={() => this.onMapLayout()}
                >
                    {
                        (this.props.geofenceType === 'polygon' && this.props.geofencePoints.length > 0) &&
                        <Polygon
                            coordinates={this.props.geofencePoints}
                            fillColor={this.props.geofenceColor + '70'}
                            strokeColor={this.props.geofenceColor}

                        />
                    }

                    {
                        (this.props.geofenceType === 'circle' &&
                            this.props.geofenceCenter &&
                            this.props.geofenceRadius > 0) &&
                        <Circle
                            ref={(el) => { this.circle = el }}
                            center={this.props.geofenceCenter}
                            radius={this.props.geofenceRadius}
                            fillColor={this.props.geofenceColor + '70'}
                            strokeColor={this.props.geofenceColor}
                        />
                    }

                    {
                        this.props.geofenceType === 'polygon' ?
                            this.props.geofencePoints.map((point, index) => {
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
                            this.props.geofenceCenter &&
                            <Marker
                                nativeID={'456'}
                                coordinate={{
                                    latitude: this.props.geofenceCenter.latitude,
                                    longitude: this.props.geofenceCenter.longitude
                                }}
                                image={require('./../../assets/trans.png')}
                                anchor={{ x: 0.5, y: 0.5 }}
                            />
                    }
                </MapView>

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
                    onPress={() => this.setState({ showMaptypes: true })}
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
                    onPress={this.fitCoords}
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
        user: state.userReducer.user,
        geofenceType: state.geofenceReducer.geofenceType,
        geofenceColor: state.geofenceReducer.geofenceColor,
        geofencePoints: state.geofenceReducer.geofencePoints,
        geofenceCenter: state.geofenceReducer.geofenceCenter,
        geofenceRadius: state.geofenceReducer.geofenceRadius
    }
}

export default connect(mapStateToProps, {
    setIsLoading,
    setGeofencePoints,
    setGeofenceCenter,
    setGeofenceRadius,
    handleMapReady
})(GeofenceDrawing)