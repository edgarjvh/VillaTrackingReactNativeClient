import React, { Component } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TextInput, Picker, Modal, Alert, TouchableOpacity } from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { connect } from 'react-redux';
import Locale from './../locale.ts';
import { HeaderButtons, HeaderButton, Item } from 'react-navigation-header-buttons';
import {
    setIsLoading,
    setDeviceHistoryType,
    setDeviceHistory,
    setDeviceHistoryCoords,
    setDeviceHistoryHigherSpeed,
    setDeviceHistoryDistance,
    setDeviceHistoryFuelConsumption,
    setDeviceHistoryTimeMove,
    setDeviceHistoryTimeStop,
    setDeviceHistoryAlertsTime
} from "./../actions";
import axios from "axios";
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment-timezone';
import * as geolib from 'geolib';

const MaterialHeaderButton = (props) => (
    <HeaderButton IconComponent={MaterialIcon} iconSize={23} {...props} />
);

const MaterialHeaderButtons = (props) => {
    return <HeaderButtons HeaderButtonComponent={MaterialHeaderButton} {...props} />;
};

const loc = new Locale();

const dayMilliseconds = 86340000;

class History extends Component {

    constructor(props) {
        super(props);

        let timestampsFrom = Number(moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).format('x'));
        let timestampsTo = Number(moment().set({ hour: 23, minute: 59, second: 0, millisecond: 0 }).format('x'));

        this.state = {
            selectedDevice: '0',
            selectedType: 'locations',
            dateFrom: timestampsFrom,
            dateTo: timestampsTo,
            showDate: '',
            mode: 'date'
        }

        this.props.navigation.setOptions({
            headerRight: () => (
                <MaterialHeaderButtons>
                    <Item title="search" disabled={this.state.selectedDevice === '0'} iconName="database-search" onPress={this.submitSearch}
                        color={this.state.selectedDevice === '0' ? 'rgba(0,0,0,0.3)' : 'black'} />
                    <Item title="menu" iconName="menu" onPress={() => this.props.navigation.toggleDrawer()} />
                </MaterialHeaderButtons>
            )
        })
    }

    componentDidUpdate() {
        this.props.navigation.setOptions({
            headerTitle: loc.historyLabelText(this.props.lang)
        })
    }

    componentDidMount() {
        this.props.navigation.setOptions({
            headerTitle: loc.historyLabelText(this.props.lang)
        })
    }

    dateTimeFromChange = async (e, d) => {
        if (d === undefined) {
            await this.setState({
                showDate: '',
                mode: 'date'
            });
            return;
        }

        if (this.state.mode === 'date') {
            await this.setState({
                dateFrom: Number(moment(d).format('x')),
                mode: 'time'
            })
        } else {
            await this.setState({
                showDate: '',
                dateFrom: Number(moment(d).format('x')),
                mode: 'date'
            })
        }
    }

    dateTimeToChange = async (e, d) => {
        if (d === undefined) {
            await this.setState({
                showDate: '',
                mode: 'date'
            });
            return;
        }

        if (this.state.mode === 'date') {
            await this.setState({
                dateTo: Number(moment(d).format('x')),
                mode: 'time'
            })
        } else {
            await this.setState({
                showDate: '',
                dateTo: Number(moment(d).format('x')),
                mode: 'date'
            })
        }
    }

    submitSearch = () => {

        if (this.state.dateFrom >= this.state.dateTo) {
            Alert.alert(
                loc.invalidDatesTitle(this.props.lang),
                loc.dateFromGreaterDateToMessage(this.props.lang)
            )
            return;
        }

        let data = {
            historyType: this.state.selectedType,
            deviceId: this.state.selectedDevice,
            dateFrom: moment(this.state.dateFrom).format('YYYY-MM-DD HH:mm:ss'),
            dateTo: moment(this.state.dateTo).format('YYYY-MM-DD HH:mm:ss')
        }

        this.props.setIsLoading(true);

        axios.post(this.props.serverUrl + '/getDeviceHistory',
            data,
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        ).then(async res => {
            let {
                result,
                newCount,
                distance,
                fuelConsumption,
                traces,
                coords,
                timeMove,
                timeStop,
                higherSpeed,
                alertsTime
            } = res.data;

            if (result === 'OK') {
                await this.props.setIsLoading(false);                

                if (newCount > 0) {
                    await this.props.setDeviceHistoryType(this.state.selectedType);
                    await this.props.setDeviceHistory(traces);
                    await this.props.setDeviceHistoryCoords(coords);
                    await this.props.setDeviceHistoryHigherSpeed(higherSpeed);
                    await this.props.setDeviceHistoryDistance(distance);
                    await this.props.setDeviceHistoryFuelConsumption(fuelConsumption);
                    await this.props.setDeviceHistoryTimeMove(timeMove);
                    await this.props.setDeviceHistoryTimeStop(timeStop);
                    await this.props.setDeviceHistoryAlertsTime(alertsTime);
                    this.props.navigation.navigate('HistoryDetails', data);
                } else {
                    Alert.alert(
                        loc.noDeviceHistoryTitle(this.props.lang),
                        loc.noDeviceHistoryMessage(this.props.lang)
                    )
                }
            } else {
                await this.props.setIsLoading(false);
                Alert.alert(
                    'Error',
                    loc.deviceHistoryErrorMessage(this.props.lang)
                )
            }
        }).catch(e => {
            console.log(e);
        });
    }

    render() {
        return (
            <View style={styles.container}>
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
                <View style={styles.stackHeader}>
                    <ScrollView style={styles.mainScrollView}>
                        <View style={styles.fieldContainer}>
                            <Text style={styles.fieldLabel}>{loc.deviceLabel(this.props.lang)} *</Text>
                            <Picker
                                style={styles.fieldInput}
                                selectedValue={this.state.selectedDevice}
                                onValueChange={(value, index) => this.setState({ selectedDevice: value })}
                            >
                                <Picker.Item label={loc.selectPickerItemLabel(this.props.lang)} value='0' />

                                {
                                    this.props.devices.map(device => {
                                        return (
                                            <Picker.Item label={
                                                device.imei + ' (' + device.license_plate + ') ' + device.vehicle
                                            } value={device.id.toString()} key={device.id} />
                                        )
                                    })
                                }
                            </Picker>
                        </View>
 
                        <View style={styles.fieldContainer}>
                            <Text style={styles.fieldLabel}>{loc.searchTypeLabel(this.props.lang)} *</Text>
                            <Picker
                                style={styles.fieldInput}
                                selectedValue={this.state.selectedType}
                                onValueChange={(value, index) => this.setState({ selectedType: value })}
                            >
                                <Picker.Item label={loc.locationsPickerItemText(this.props.lang)} value='locations' />
                                <Picker.Item label={loc.eventsPickerItemText(this.props.lang)} value='alerts' />
                            </Picker>
                        </View>

                        <View style={styles.fieldContainer}>
                            <Text style={styles.fieldLabel}>{loc.dateAndTimeLabel(this.props.lang)} *</Text>

                            <View style={[styles.fieldInput, {
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }]}>
                                <Text>{loc.fromLabel(this.props.lang)}:</Text>

                                <View style={styles.dateTimeContainer}>
                                    <TouchableOpacity activeOpacity={0.5} style={styles.dateTimeTouchable} onPress={() => this.setState({ showDate: 'from' })}>
                                        <Text>{moment(this.state.dateFrom).format('YYYY-MM-DD') + ' ' + moment(this.state.dateFrom).format('HH:mm')}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={[styles.fieldInput, {
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }]}>
                                <Text>{loc.toLabel(this.props.lang)}:</Text>

                                <View style={styles.dateTimeContainer}>
                                    <TouchableOpacity activeOpacity={0.5} style={styles.dateTimeTouchable} onPress={() => this.setState({ showDate: 'to' })}>
                                        <Text>{moment(this.state.dateTo).format('YYYY-MM-DD') + ' ' + moment(this.state.dateTo).format('HH:mm')}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {
                                (this.state.showDate === 'from') &&
                                <DateTimePicker
                                    testID='datePickerFrom'
                                    mode={this.state.mode}
                                    display='default'
                                    value={this.state.dateFrom}
                                    onChange={this.dateTimeFromChange}
                                    onTouchCancel={false}
                                />
                            }

                            {
                                (this.state.showDate === 'to') &&
                                <DateTimePicker
                                    testID='datePickerFrom'
                                    mode={this.state.mode}
                                    display='default'
                                    value={this.state.dateTo}
                                    onChange={this.dateTimeToChange}
                                    onTouchCancel={false}
                                />
                            }

                        </View>

                    </ScrollView>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,

    },
    stackHeader: {
        flexDirection: 'column',
        flex: 1
    },
    mainScrollView: {
        flex: 1
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
        marginBottom: 5,
        marginTop: 5,
    },
    fieldLabel: {
        padding: 5,
        backgroundColor: 'rgba(0,0,0,0.1)',
        fontWeight: 'bold',
        fontStyle: 'italic'
    },
    fieldInput: {
        height: 40,
        paddingLeft: 8,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    dateTimeContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    dateTimeTouchable: {
        marginLeft: 15,
        marginRight: 15,
    }
})

const mapStateToProps = (state) => {
    return {
        lang: state.appReducer.lang,
        serverUrl: state.appReducer.serverUrl,
        devices: state.devicesReducer.devices,
        isLoading: state.appReducer.isLoading
    }
}

export default connect(mapStateToProps, {
    setIsLoading,
    setDeviceHistoryType,
    setDeviceHistory,
    setDeviceHistoryCoords,
    setDeviceHistoryHigherSpeed,
    setDeviceHistoryDistance,
    setDeviceHistoryFuelConsumption,
    setDeviceHistoryTimeMove,
    setDeviceHistoryTimeStop,
    setDeviceHistoryAlertsTime
})(History)