import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'react-redux';
import { View, Dimensions, Text, StyleSheet, ActivityIndicator, Modal, Alert, TouchableOpacity, Switch, TextInput, ScrollView } from 'react-native';
import { MaterialCommunityIcons, FontAwesome } from 'react-native-vector-icons';
import Locale from './../locale';
import { HeaderButtons, HeaderButton, Item } from 'react-navigation-header-buttons';
import axios from 'axios';
import { CheckBox } from "react-native-elements";
import {
    SliderHuePicker,
    SliderSaturationPicker,
    SliderValuePicker,
} from 'react-native-slider-color-picker';
import tinycolor from 'tinycolor2';

const MaterialHeaderButton = (props) => (
    <HeaderButton IconComponent={MaterialCommunityIcons} iconSize={23} {...props} />
);

const MaterialHeaderButtons = (props) => {
    return <HeaderButtons HeaderButtonComponent={MaterialHeaderButton} {...props} />;
};

const { width } = Dimensions.get('window');

const loc = new Locale();

const GeofenceMaintainer = (props) => {
    const [selectedGeofence, setSelectedGeofence] = useState({});
    const [oldColor, setOldColor] = useState('#FF7700');
    const [isLoading, setIsLoading] = useState(true);

    const refSliderHuePicker = useRef();
    const refSliderSaturationPicker = useRef();
    const refSliderValuePicker = useRef();

    useEffect(() => {
        props.navigation.setOptions({
            headerRight: () => (
                <MaterialHeaderButtons>
                    <Item title="save" iconName="content-save-edit" onPress={saveGeofence} />
                    <Item title="menu" iconName="menu" onPress={() => props.navigation.toggleDrawer()} />
                </MaterialHeaderButtons>
            )
        })

        props.navigation.setOptions({
            headerTitle: props.route.params.type === 'add' ? loc.addNewGeofenceTitle(props.lang) : loc.editGeofenceTitle(props.lang)
        })
    })

    useEffect(() => {
        setSelectedGeofence(props.route.params.selectedGeofence);

        setIsLoading(false);
    }, []);

    const changeColor = (colorHsvOrRgb, resType) => {
        if (resType === 'end') {
            setSelectedGeofence(prev => {
                return {
                    ...prev,
                    color: tinycolor(colorHsvOrRgb).toHexString()
                }
            })
        }
    }

    const saveGeofence = () => {
        if ((selectedGeofence?.name || '').trim() === '') {
            Alert.alert('VillaTracking', loc.emptyGeofenceNameMessage(props.lang));
            return;
        }

        if ((selectedGeofence?.description || '').trim() === '') {
            Alert.alert('VillaTracking', loc.emptyGeofenceDescriptionMessage(props.lang));
            return;
        }

        if ((selectedGeofence?.type || '') === 'polygon' && (selectedGeofence?.points || []).length < 3) {
            Alert.alert('VillaTracking', loc.notEnoughGeofencePointsMessage(props.lang));
            return;
        }

        if ((selectedGeofence?.type || '') === 'circle' && (selectedGeofence?.radius || 0) === 0) {
            Alert.alert('VillaTracking', loc.incompleteGeofenceCircularMessage(props.lang));
            return;
        }

        setIsLoading(true);

        let points = (selectedGeofence?.type || '') === 'polygon' ? JSON.stringify((selectedGeofence?.points || [])) : '';
        let center = (selectedGeofence?.type || '') === 'circle' ? JSON.stringify((selectedGeofence?.center || {})) : '';

        axios.post(props.serverUrl + '/saveGeofence', {
            ...selectedGeofence,
            points: points,
            center: center,
            user_id: props.user.id
        },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(res => {
                switch (res.data.result) {
                    case 'SAVED':
                        setIsLoading(false);
                        props.route.params.updateGeofences(res.data.geofences);
                        Alert.alert('VillaTracking', loc.geofenceSavedSuccessfullyMsg(props.lang));
                        props.navigation.goBack();
                        break;
                    case 'UPDATED':
                        setIsLoading(false);
                        props.route.params.updateGeofences(res.data.geofences);
                        Alert.alert('VillaTracking', loc.geofenceUpdatedSuccessfullyMsg(props.lang));
                        props.navigation.goBack();
                        break;
                    case 'DUPLICATE':
                        setIsLoading(false);
                        Alert.alert('VillaTracking', loc.duplicateGeofenceNameMessage(props.lang));
                        break;
                    default:
                        setIsLoading(false);
                        Alert.alert('VillaTracking', loc.erroOccurred(props.lang));
                        break;
                }
            }).catch(e => {
                console.log(e);
                setIsLoading(false);
                Alert.alert('VillaTracking', loc.erroOccurred(props.lang));
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

            <ScrollView>
                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>{loc.geofenceNameLabel(props.lang)} *</Text>
                    <TextInput style={styles.fieldInput} maxLength={15}
                        onChangeText={(value) => {
                            setSelectedGeofence(prev => {
                                return {
                                    ...prev,
                                    name: value
                                }
                            })
                        }}
                        value={selectedGeofence?.name || ''} />
                </View>
                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>{loc.geofenceDescriptionLabel(props.lang)} *</Text>
                    <TextInput style={styles.fieldInput}
                        onChangeText={(value) => {
                            setSelectedGeofence(prev => {
                                return {
                                    ...prev,
                                    description: value
                                }
                            })
                        }}
                        value={selectedGeofence?.description || ''} />
                </View>
                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>{loc.geofenceTypeLabel(props.lang)} *</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                        <CheckBox
                            title={loc.geofencePolygonalLabel(props.lang)}
                            checkedIcon='dot-circle-o'
                            uncheckedIcon='circle-o'
                            checked={(selectedGeofence?.type || 'polygon') === 'polygon'}
                            onPress={() => {
                                setSelectedGeofence(prev => {
                                    return {
                                        ...prev,
                                        type: 'polygon',
                                        center: {},
                                        radius: 0
                                    }
                                });
                            }}
                            containerStyle={{
                                backgroundColor: 'transparent',
                                borderWidth: 0
                            }}
                        />
                        <CheckBox
                            title={loc.geofenceCircularLabel(props.lang)}
                            checkedIcon='dot-circle-o'
                            uncheckedIcon='circle-o'
                            checked={(selectedGeofence?.type || 'polygon') === 'circle'}
                            onPress={() => {
                                setSelectedGeofence(prev => {
                                    return {
                                        ...prev,
                                        type: 'circle',
                                        points: []
                                    }
                                });
                            }}
                            containerStyle={{
                                backgroundColor: 'transparent',
                                borderWidth: 0
                            }}
                        />

                    </View>
                </View>
                <View style={[styles.fieldContainer, {
                    flex: 1
                }]}>
                    <Text style={styles.fieldLabel}>{loc.geofenceColorLabel(props.lang)} *</Text>

                    <View style={{
                        height: 20,
                        backgroundColor: (selectedGeofence?.color || ''),
                        marginHorizontal: 24,
                        marginTop: 10,
                        borderRadius: 10
                    }}>

                    </View>

                    <View style={{ marginHorizontal: 24, marginTop: 20, height: 12, width: width - 70 }}>
                        <SliderHuePicker
                            ref={refSliderHuePicker}
                            oldColor={(selectedGeofence?.color || '')}
                            trackStyle={[{ height: 12, width: width - 70 }]}
                            thumbStyle={styles.thumb}
                            useNativeDriver={true}
                            onColorChange={changeColor}
                        />
                    </View>
                    <View style={{ marginHorizontal: 24, marginTop: 20, height: 12, width: width - 70 }}>
                        <SliderSaturationPicker
                            ref={refSliderSaturationPicker}
                            oldColor={(selectedGeofence?.color || '')}
                            trackStyle={[{ height: 12, width: width - 70 }]}
                            thumbStyle={styles.thumb}
                            useNativeDriver={true}
                            onColorChange={changeColor}
                            style={{ height: 12, borderRadius: 6, backgroundColor: tinycolor({ h: tinycolor(selectedGeofence?.color).toHsv().h, s: 1, v: 1 }).toHexString() }}
                        />
                    </View>
                    <View style={{ marginHorizontal: 24, marginVertical: 20, height: 12, width: width - 70 }}>
                        <SliderValuePicker
                            ref={refSliderValuePicker}
                            oldColor={(selectedGeofence?.color || '')}
                            minimumValue={0.02}
                            step={0.05}
                            trackStyle={[{ height: 12, width: width - 70 }]}
                            trackImage={require('react-native-slider-color-picker/brightness_mask.png')}
                            thumbStyle={styles.thumb}
                            onColorChange={changeColor}
                            style={{ height: 12, borderRadius: 6, backgroundColor: 'black' }}
                        />
                    </View>
                </View>

                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>{loc.statusField(props.lang)} *</Text>
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 8
                    }}>
                        <Text>{loc.enabledLabel(props.lang)}</Text>
                        <Switch
                            trackColor={{ false: "#767577", true: "#81b0ff" }}
                            thumbColor={props.geofenceEnabled ? "green" : "#f4f3f4"}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={() => {
                                setSelectedGeofence(prev => {
                                    return {
                                        ...prev,
                                        status: prev.status === 0 ? 1 : 0
                                    }
                                });
                            }}
                            value={(selectedGeofence?.status || 0) === 1}
                        />
                    </View>
                </View>

                <TouchableOpacity activeOpacity={0.5} style={styles.drawGeofenceBtn} onPress={() => props.navigation.navigate('GeofenceDrawing', { selectedGeofence: selectedGeofence, setSelectedGeofence: setSelectedGeofence })}>
                    <MaterialCommunityIcons name='gesture-double-tap' size={24} />
                    <Text style={{ fontSize: 18, marginLeft: 10, textTransform: 'uppercase' }}>{loc.drawGeofenceLabel(props.lang)}</Text>
                </TouchableOpacity>

                {
                    (selectedGeofence?.type || 'polygon') === 'polygon'
                        ?
                        <View style={{ marginTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.1)', paddingTop: 10 }}>
                            <Text>{loc.pointsLabel(props.lang)}: {(selectedGeofence?.points || []).length}</Text>
                        </View>
                        :
                        <View style={{ marginTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.1)', paddingTop: 10 }}>
                            <Text>{loc.radiusLabel(props.lang)}: {(selectedGeofence?.radius || 0)} m</Text>
                        </View>
                }
            </ScrollView>
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
    thumb: {
        width: 20,
        height: 20,
        borderColor: 'white',
        borderWidth: 1,
        borderRadius: 10,
        shadowColor: 'black',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowRadius: 2,
        shadowOpacity: 0.35,
    },
    drawGeofenceBtn: {
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10
    }
});

const mapStateToProps = state => {
    return {
        lang: state.appReducer.lang,
        serverUrl: state.appReducer.serverUrl,
        user: state.userReducer.user
    }
}

export default connect(mapStateToProps, null)(GeofenceMaintainer)