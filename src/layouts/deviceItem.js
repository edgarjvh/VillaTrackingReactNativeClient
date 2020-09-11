import React, { Component } from 'react';
import Locale from './../locale.ts';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

const loc = new Locale();

export default class DeviceItem extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        

        return (
            <View style={styles.deviceItemContainer}>
                <View style={[
                    styles.deviceReportStatusIndicator,
                    {
                        backgroundColor: this.props.item.speed > 0 ? 'darkgreen' : 'darkred'
                    }
                ]}></View>
                <View style={styles.deviceInfoContainer}>
                    <View>
                        <Text style={styles.deviceInfoTextImei}>
                            <Text>{this.props.item.imei} </Text>
                            <Text style={styles.deviceInfoTextStatusExpiration}>
                                (Expira el
                                <Text> {this.props.item.expires}</Text>
                                        )
                                    </Text>
                        </Text>
                    </View>
                    <View>
                                <Text style={styles.deviceInfoTextVehicle}>{this.props.item.vehicle}</Text>
                    </View>
                    <View style={styles.deviceInfoTextStatus}>
                        <Text style={styles.deviceInfoTextStatusLastReport}>
                            Ultimo Reporte:
                                <Text style={{ fontWeight: 'normal' }}> {this.props.item.lastReport}</Text>
                        </Text>
                    </View>
                </View>
                <TouchableOpacity activeOpacity={0.5}>
                    <MaterialIcon name="dots-vertical" size={30} color="#151E44" />
                </TouchableOpacity>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#151E4499',
        padding: 10
    },
    searchContainer: {
        flexDirection: 'row',
        borderWidth: 1,
        padding: 10,
        borderRadius: 5,
        backgroundColor: 'white',
        borderColor: 'rgba(0,0,0,0.1)',
        elevation: 5,
        alignItems: 'center'
    },
    deviceItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 8,
        overflow: 'hidden',
        elevation: 3
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
        justifyContent: 'space-between'
    },
    deviceInfoTextStatusExpiration: {
        fontWeight: 'normal',
        color: 'black',
        fontSize: 14
    },
    deviceInfoTextStatusLastReport: {
        fontWeight: 'bold',
        fontStyle: 'italic'
    }
})