import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TextInput, Modal, Alert, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { connect } from 'react-redux';
import Locale from './../locale.ts';
import { HeaderButtons, HeaderButton, Item } from 'react-navigation-header-buttons';
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

const History = (props) => {
    const [selectedGroup, setSelectedGroup] = useState({});
    const [selectedDevice, setSelectedDevice] = useState({});
    const [selectedType, setSelectedType] = useState('locations');
    const [dateFrom, setDateFrom] = useState(Number(moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).format('x')));
    const [dateTo, setDateTo] = useState(Number(moment().set({ hour: 23, minute: 59, second: 0, millisecond: 0 }).format('x')));
    const [showDate, setShowDate] = useState('');
    const [mode, setMode] = useState('date');
    const [groups, setGroups] = useState([]);
    const [devices, setDevices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        props.navigation.setOptions({
            headerRight: () => (
                <MaterialHeaderButtons>
                    <Item title="search" disabled={(selectedDevice?.id || 0) === 0} iconName="database-search" onPress={submitSearch}
                        color={(selectedDevice?.id || 0) === 0 ? 'rgba(0,0,0,0.3)' : 'black'} />
                    <Item title="menu" iconName="menu" onPress={() => props.navigation.toggleDrawer()} />
                </MaterialHeaderButtons>
            )
        })

        props.navigation.setOptions({
            headerTitle: loc.historyLabelText(props.lang)
        })
    })

    useEffect(() => {
        axios.post(props.serverUrl + '/getGroupsByUser', {user_id: props.user.id}).then(res => {
            if (res.data.result === 'OK'){
                setGroups(res.data.groups);
            }
        }).catch(e => {
            console.log(e);
        }).finally(() => {
            setIsLoading(false);
        });
    }, [])

    useEffect(() => {
        if ((selectedGroup?.id || 0) === 0){
            setDevices(props.devices.map(device => device));
        }else{            
            setDevices(props.devices.filter(device => (device.groups || []).find(x => x.id === selectedGroup.id) ));
        }
    }, [selectedGroup])

    const dateTimeFromChange = (e, d) => {
        if (d === undefined) {
            setShowDate('');
            setMode('date');
            return;
        }

        if (mode === 'date') {
            setDateFrom(Number(moment(d).format('x')));
            setMode('time');
        } else {
            setShowDate('');
            setDateFrom(Number(moment(d).format('x')));
            setMode('date');
        }
    }

    const dateTimeToChange = (e, d) => {
        if (d === undefined) {
            setShowDate('');
            setMode('date');
            return;
        }

        if (mode === 'date') {
            setDateTo(Number(moment(d).format('x')));
            setMode('time');
        } else {
            setShowDate('');
            setDateTo(Number(moment(d).format('x')));
            setMode('date');
        }
    }

    const submitSearch = () => {
        if (dateFrom >= dateTo) {
            Alert.alert(
                loc.invalidDatesTitle(props.lang),
                loc.dateFromGreaterDateToMessage(props.lang)
            )
            return;
        }

        let data = {
            historyType: selectedType,
            deviceId: selectedDevice.id,
            dateFrom: moment(dateFrom).format('YYYY-MM-DD HH:mm:ss'),
            dateTo: moment(dateTo).format('YYYY-MM-DD HH:mm:ss')
        }

        setIsLoading(true);

        axios.post(props.serverUrl + '/getDeviceHistory',
            data,
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        ).then(res => {
            let historyData = {
                ...selectedDevice,
                ...res.data,
                selectedType
            };
            if (res.data.result === 'OK') {
                setIsLoading(false);

                if (res.data.newCount > 0) {
                    props.navigation.navigate('HistoryDetails', historyData);
                } else {
                    Alert.alert(
                        loc.noDeviceHistoryTitle(props.lang),
                        loc.noDeviceHistoryMessage(props.lang)
                    )
                }
            } else {
                setIsLoading(false);
                Alert.alert('Error', loc.deviceHistoryErrorMessage(props.lang))
            }
        }).catch(e => {
            console.log(e);
        });
    }

    const onGroupValueChange = (value, index) => {
        setSelectedGroup(groups.find(x => x.id.toString() === value) || {});
        setSelectedDevice({});
    }

    const onDeviceValueChange = (value, index) => {        
        setSelectedDevice(props.devices.find(x => x.id.toString() === value) || {});
    }

    return (
        <View style={styles.container}>
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
            <View style={styles.stackHeader}>
                <ScrollView style={styles.mainScrollView}>

                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>{loc.groupLabelText(props.lang)} *</Text>
                        <Picker
                            style={styles.fieldInput}
                            selectedValue={(selectedGroup?.id || '0').toString()}
                            onValueChange={onGroupValueChange}
                        >
                            <Picker.Item label={loc.allPluralText(props.lang)} value='0' />

                            {
                                groups.map(group => {
                                    return (
                                        <Picker.Item
                                            label={group.name}
                                            value={group.id.toString()}
                                            key={group.id} />
                                    )
                                })
                            }
                        </Picker>
                    </View>

                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>{loc.deviceLabel(props.lang)} *</Text>
                        <Picker
                            style={styles.fieldInput}
                            selectedValue={(selectedDevice?.id || '0').toString()}
                            onValueChange={onDeviceValueChange}
                        >
                            <Picker.Item label={loc.selectPickerItemLabel(props.lang)} value='0' />

                            {
                                devices.map(device => (
                                    <Picker.Item
                                        label={
                                            device.imei + ' (' + device.license_plate + ') ' + device.vehicle
                                        }
                                        value={device.id.toString()}
                                        key={device.id} />
                                ))                             
                            }
                        </Picker>
                    </View>

                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>{loc.searchTypeLabel(props.lang)} *</Text>
                        <Picker
                            style={styles.fieldInput}
                            selectedValue={selectedType}
                            onValueChange={(value, index) => setSelectedType(value)}
                        >
                            <Picker.Item label={loc.locationsPickerItemText(props.lang)} value='locations' />
                            <Picker.Item label={loc.eventsPickerItemText(props.lang)} value='alerts' />
                        </Picker>
                    </View>

                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>{loc.dateAndTimeLabel(props.lang)} *</Text>

                        <View style={[styles.fieldInput, {
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }]}>
                            <Text>{loc.fromLabel(props.lang)}:</Text>

                            <View style={styles.dateTimeContainer}>
                                <TouchableOpacity activeOpacity={0.5} style={styles.dateTimeTouchable} onPress={() => setShowDate('from')}>
                                    <Text>{moment(dateFrom).format('YYYY-MM-DD') + ' ' + moment(dateFrom).format('HH:mm')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={[styles.fieldInput, {
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }]}>
                            <Text>{loc.toLabel(props.lang)}:</Text>

                            <View style={styles.dateTimeContainer}>
                                <TouchableOpacity activeOpacity={0.5} style={styles.dateTimeTouchable} onPress={() => setShowDate('to')}>
                                    <Text>{moment(dateTo).format('YYYY-MM-DD') + ' ' + moment(dateTo).format('HH:mm')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {
                            (showDate === 'from') &&
                            <DateTimePicker
                                testID='datePickerFrom'
                                mode={mode}
                                display='default'
                                value={new Date(dateFrom)}
                                onChange={dateTimeFromChange}
                                onTouchCancel={false}
                            />
                        }

                        {
                            (showDate === 'to') &&
                            <DateTimePicker
                                testID='datePickerFrom'
                                mode={mode}
                                display='default'
                                value={new Date(dateTo)}
                                onChange={dateTimeToChange}
                                onTouchCancel={false}
                            />
                        }

                    </View>

                </ScrollView>
            </View>
        </View>
    )
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
        user: state.userReducer.user,
        serverUrl: state.appReducer.serverUrl,
        devices: state.devicesReducer.devices
    }
}

export default connect(mapStateToProps, null)(History)