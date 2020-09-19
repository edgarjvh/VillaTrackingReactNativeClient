import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Dimensions, Text, StyleSheet, ActivityIndicator, Modal, Alert, TouchableOpacity, Switch, TextInput, ScrollView } from 'react-native';
import { MaterialCommunityIcons, FontAwesome } from 'react-native-vector-icons';
import Locale from './../locale';
import { HeaderButtons, HeaderButton, Item } from 'react-navigation-header-buttons';
import axios from 'axios';
import {
    setIsLoading,
    setDevices,
    setDevicesModels,
    setGeofences,
    setGeofenceId,
    setGeofenceName,
    setGeofenceDescription,
    setGeofenceType,
    setGeofenceColor,
    setGeofenceEnabled,
    setGeofencePoints,
    setGeofenceCenter,
    setGeofenceRadius
} from './../actions';
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

const {
    width,
} = Dimensions.get('window');

const loc = new Locale();

class GeofenceMaintainer extends Component {
    constructor(props) {
        super(props)

        this.state = {
            geofenceId: this.props.route.params.geofenceId,
            geofenceName: '',
            geofenceDescription: '',
            geofenceType: 'polygon',
            oldColor: "#FF7700"
        }

        this.props.navigation.setOptions({
            headerRight: () => (
                <MaterialHeaderButtons>
                    <Item title="save" iconName="content-save-edit" onPress={this.saveGeofence} />
                    <Item title="menu" iconName="menu" onPress={() => this.props.navigation.toggleDrawer()} />
                </MaterialHeaderButtons>
            )
        })
    }

    componentDidUpdate() {
        this.props.navigation.setOptions({
            headerTitle: this.props.route.params.type === 'add' ? loc.addNewGeofenceTitle(this.props.lang) : loc.editGeofenceTitle(this.props.lang)
        })
    }

    componentDidMount() {
        this.props.navigation.setOptions({
            headerTitle: this.props.route.params.type === 'add' ? loc.addNewGeofenceTitle(this.props.lang) : loc.editGeofenceTitle(this.props.lang)
        });

        this.props.setGeofenceId(this.props.route.params.geofenceId);
        if (this.props.route.params.geofenceId > 0){
            this.props.geofences.map(async geofence => {
                if (geofence.id === this.props.route.params.geofenceId){
                    await this.props.setGeofenceName(geofence.name);
                    await this.props.setGeofenceDescription(geofence.description);
                    await this.props.setGeofenceType(geofence.type || 'polygon');
                    await this.props.setGeofenceColor(geofence.color || '#FF7700');
                    await this.props.setGeofenceEnabled(geofence.status === 1);
                    await this.props.setGeofencePoints(geofence.points ? JSON.parse(geofence.points) : []);
                    await this.props.setGeofenceCenter(geofence.center ? JSON.parse(geofence.center) : null);
                    await this.props.setGeofenceRadius(geofence.radius);
                }
                return geofence;
            })
        }else{
            this.props.setGeofenceName('');
            this.props.setGeofenceDescription('');
            this.props.setGeofenceType('polygon');
            this.props.setGeofenceColor('#FF7700');
            this.props.setGeofenceEnabled(true);
            this.props.setGeofencePoints([]);
            this.props.setGeofenceCenter(null);
            this.props.setGeofenceRadius(0);
        }        
    }

    changeColor = (colorHsvOrRgb, resType) => {
        if (resType === 'end') {
            this.props.setGeofenceColor(tinycolor(colorHsvOrRgb).toHexString());
        }
    }

    saveGeofence = () => {
        if (this.props.geofenceName.trim() === '') {
            Alert.alert(
                'VillaTracking',
                loc.emptyGeofenceNameMessage(this.props.lang)
            )
            return;
        }

        if (this.props.geofenceDescription.trim() === '') {
            Alert.alert(
                'VillaTracking',
                loc.emptyGeofenceDescriptionMessage(this.props.lang)
            )
            return;
        }

        if (this.props.geofenceType === 'polygon' && this.props.geofencePoints.length < 3) {
            Alert.alert(
                'VillaTracking',
                loc.notEnoughGeofencePointsMessage(this.props.lang)
            )
            return;
        }

        if (this.props.geofenceType === 'circle' && this.props.geofenceRadius === 0) {
            Alert.alert(
                'VillaTracking',
                loc.incompleteGeofenceCircularMessage(this.props.lang)
            )
            return;
        }

        this.props.setIsLoading(true);

        axios.post(this.props.serverUrl + '/saveGeofence', {
            userId: this.props.user.id,
            geofenceId: this.props.geofenceId,
            geofenceName: this.props.geofenceName,
            geofenceDescription: this.props.geofenceDescription,
            geofenceType: this.props.geofenceType,
            geofenceColor: this.props.geofenceColor,
            geofencePoints: this.props.geofenceType === 'polygon' ? JSON.stringify(this.props.geofencePoints) : null,
            geofenceCenter: this.props.geofenceType === 'circle' ? JSON.stringify(this.props.geofenceCenter) : null,
            geofenceRadius: this.props.geofenceRadius,
            geofenceEnabled: this.props.geofenceEnabled ? 1 : 0
        },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            })
            .then(async res => {
                let { data } = res;

                console.log(data)

                switch (data.result) {
                    case 'SAVED':
                        this.props.setIsLoading(false);
                        this.props.setDevices(res.data.devices);
                        this.props.setDevicesModels(res.data.deviceModels);
                        this.props.setGeofences(res.data.geofences);

                        Alert.alert('VillaTracking', loc.geofenceSavedSuccessfullyMsg(this.props.lang));
                        this.props.navigation.goBack();
                        break;
                    case 'UPDATED':
                        this.props.setIsLoading(false);
                        this.props.setDevices(res.data.devices);
                        this.props.setDevicesModels(res.data.deviceModels);
                        this.props.setGeofences(res.data.geofences);

                        Alert.alert('VillaTracking', loc.geofenceUpdatedSuccessfullyMsg(this.props.lang));
                        this.props.navigation.goBack();
                        break;
                    case 'DUPLICATE':
                        this.props.setIsLoading(false);
                        Alert.alert(
                            'VillaTracking',
                            loc.duplicateGeofenceNameMessage(this.props.lang)
                        )
                        break;
                    default:
                        this.props.setIsLoading(false);
                        Alert.alert(
                            'VillaTracking',
                            loc.erroOccurred(this.props.lang)
                        )
                        break;
                }
            })
            .catch(e => {
                console.log(e);
                this.props.setIsLoading(false);
                Alert.alert(
                    'VillaTracking',
                    loc.erroOccurred(this.props.lang)
                )
            })

    }

    render() {
        return (
            <View style={styles.container}>
                <Modal
                    transparent={true}
                    visible={this.props.isLoading}
                    animationType={'slide'}
                    onRequestClose={() => this.props.setIsLoading(false)}
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
                        <Text style={styles.fieldLabel}>{loc.geofenceNameLabel(this.props.lang)} *</Text>
                        <TextInput style={styles.fieldInput} maxLength={15}
                            onChangeText={(geofenceName) => this.props.setGeofenceName(geofenceName)}
                            value={this.props.geofenceName} />
                    </View>
                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>{loc.geofenceDescriptionLabel(this.props.lang)} *</Text>
                        <TextInput style={styles.fieldInput}
                            onChangeText={(geofenceDescription) => this.props.setGeofenceDescription(geofenceDescription)}
                            value={this.props.geofenceDescription} />
                    </View>
                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>{loc.geofenceTypeLabel(this.props.lang)} *</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                            <CheckBox
                                title={loc.geofencePolygonalLabel(this.props.lang)}
                                checkedIcon='dot-circle-o'
                                uncheckedIcon='circle-o'
                                checked={this.props.geofenceType === 'polygon'}
                                onPress={() => {
                                    this.props.setGeofenceType('polygon');
                                    this.props.setGeofenceCenter(null);
                                    this.props.setGeofenceRadius(0)
                                }}
                                containerStyle={{
                                    backgroundColor: 'transparent',
                                    borderWidth: 0
                                }}
                            />
                            <CheckBox
                                title={loc.geofenceCircularLabel(this.props.lang)}
                                checkedIcon='dot-circle-o'
                                uncheckedIcon='circle-o'
                                checked={this.props.geofenceType === 'circle'}
                                onPress={() => {
                                    this.props.setGeofenceType('circle');
                                    this.props.setGeofencePoints([])
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
                        <Text style={styles.fieldLabel}>{loc.geofenceColorLabel(this.props.lang)} *</Text>

                        <View style={{
                            height: 20,
                            backgroundColor: this.props.geofenceColor,
                            marginHorizontal: 24,
                            marginTop: 10,
                            borderRadius: 10
                        }}>

                        </View>

                        <View style={{ marginHorizontal: 24, marginTop: 20, height: 12, width: width - 70 }}>
                            <SliderHuePicker
                                ref={view => { this.sliderHuePicker = view; }}
                                oldColor={this.props.geofenceColor}
                                trackStyle={[{ height: 12, width: width - 70 }]}
                                thumbStyle={styles.thumb}
                                useNativeDriver={true}
                                onColorChange={this.changeColor}
                            />
                        </View>
                        <View style={{ marginHorizontal: 24, marginTop: 20, height: 12, width: width - 70 }}>
                            <SliderSaturationPicker
                                ref={view => { this.sliderSaturationPicker = view; }}
                                oldColor={this.props.geofenceColor}
                                trackStyle={[{ height: 12, width: width - 70 }]}
                                thumbStyle={styles.thumb}
                                useNativeDriver={true}
                                onColorChange={this.changeColor}
                                style={{ height: 12, borderRadius: 6, backgroundColor: tinycolor({ h: tinycolor(this.state.oldColor).toHsv().h, s: 1, v: 1 }).toHexString() }}
                            />
                        </View>
                        <View style={{ marginHorizontal: 24, marginVertical: 20, height: 12, width: width - 70 }}>
                            <SliderValuePicker
                                ref={view => { this.sliderValuePicker = view; }}
                                oldColor={this.props.geofenceColor}
                                minimumValue={0.02}
                                step={0.05}
                                trackStyle={[{ height: 12, width: width - 70 }]}
                                trackImage={require('react-native-slider-color-picker/brightness_mask.png')}
                                thumbStyle={styles.thumb}
                                onColorChange={this.changeColor}
                                style={{ height: 12, borderRadius: 6, backgroundColor: 'black' }}
                            />
                        </View>
                    </View>

                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>{loc.statusField(this.props.lang)} *</Text>
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: 8
                        }}>
                            <Text>{loc.enabledLabel(this.props.lang)}</Text>
                            <Switch
                                trackColor={{ false: "#767577", true: "#81b0ff" }}
                                thumbColor={this.props.geofenceEnabled ? "green" : "#f4f3f4"}
                                ios_backgroundColor="#3e3e3e"
                                onValueChange={() => this.props.setGeofenceEnabled(!this.props.geofenceEnabled)}
                                value={this.props.geofenceEnabled}
                            />
                        </View>
                    </View>

                    <TouchableOpacity activeOpacity={0.5} style={styles.drawGeofenceBtn} onPress={() => this.props.navigation.navigate('GeofenceDrawing')}>
                        <MaterialCommunityIcons name='gesture-double-tap' size={24} />
                        <Text style={{ fontSize: 18, marginLeft: 10, textTransform: 'uppercase' }}>{loc.drawGeofenceLabel(this.props.lang)}</Text>
                    </TouchableOpacity>

                    {
                        this.props.geofenceType === 'polygon' ?
                            <View style={{ marginTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.1)', paddingTop: 10 }}>
                                <Text>{loc.pointsLabel(this.props.lang)}: {this.props.geofencePoints.length}</Text>
                            </View>
                            :
                            <View style={{ marginTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.1)', paddingTop: 10 }}>
                                <Text>{loc.radiusLabel(this.props.lang)}: {this.props.geofenceRadius} m</Text>
                            </View>
                    }


                </ScrollView>
            </View>
        )
    }
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
        user: state.userReducer.user,
        geofences: state.geofenceReducer.geofences,
        geofenceId: state.geofenceReducer.geofenceId,
        geofenceName: state.geofenceReducer.geofenceName,
        geofenceDescription: state.geofenceReducer.geofenceDescription,
        geofenceType: state.geofenceReducer.geofenceType,
        geofenceColor: state.geofenceReducer.geofenceColor,
        geofenceEnabled: state.geofenceReducer.geofenceEnabled,
        geofencePoints: state.geofenceReducer.geofencePoints,
        geofenceCenter: state.geofenceReducer.geofenceCenter,
        geofenceRadius: state.geofenceReducer.geofenceRadius
    }
}

export default connect(mapStateToProps, {
    setIsLoading,
    setDevices,
    setDevicesModels,
    setGeofences,
    setGeofenceId,
    setGeofenceName,
    setGeofenceDescription,
    setGeofenceType,
    setGeofenceColor,
    setGeofenceEnabled,
    setGeofencePoints,
    setGeofenceCenter,
    setGeofenceRadius
})(GeofenceMaintainer)