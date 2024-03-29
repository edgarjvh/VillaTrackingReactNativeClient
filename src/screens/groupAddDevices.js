import React, { useState, useEffect, useRef } from "react";
import { connect } from "react-redux";
import Locale from '../locale';
import { View, StyleSheet, TouchableOpacity, FlatList, Modal, ActivityIndicator, TextInput, Text, Alert } from "react-native";
import { HeaderButtons, HeaderButton, Item } from 'react-navigation-header-buttons';
import { FontAwesome, MaterialCommunityIcons, FontAwesome5 } from 'react-native-vector-icons';
import axios from 'axios';
import moment from 'moment'
import { CheckBox } from "react-native-elements";

const MaterialHeaderButton = (props) => (
    <HeaderButton IconComponent={MaterialCommunityIcons} iconSize={23} color="black" {...props} />
);

const MaterialHeaderButtons = (props) => {
    return <HeaderButtons HeaderButtonComponent={MaterialHeaderButton} {...props} />;
};

const loc = new Locale();

const GroupAddDevices = (props) => {
    const [isLoading, setIsLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedGroup, setSelectedGroup] = useState(props.route.params.group);
    const [devices, setDevices] = useState([]);
    const [devicesId, setDevicesId] = useState((props.route.params.group?.devices || []).map(device => device.id));
    const [refreshingList, setRefreshingList] = useState(true);

    useEffect(() => {
        props.navigation.setOptions({
            headerRight: () => (
                <MaterialHeaderButtons>
                    <Item
                        title='save'
                        iconName='check'
                        disabled={devicesId.length === selectedGroup.devices.length}
                        color={devicesId.length === selectedGroup.devices.length ? 'rgba(0,0,0,0.3)' : 'black'}
                        onPress={addGroupDevicesPrompt}
                    />
                    <Item title="menu" iconName="menu" onPress={() => { props.navigation.toggleDrawer() }} />
                </MaterialHeaderButtons>
            )
        })

        props.navigation.setOptions({
            headerTitle: loc.associateToGroupTitle(props.lang)
        })
    })

    useEffect(() => {
        refreshDevicesList();
    }, []);

    const handleCheckbox = (deviceId) => {
        if (devicesId.includes(deviceId)) {
            setDevicesId(devicesId.filter(id => id !== deviceId));
        } else {
            setDevicesId(devicesId => {
                return [
                    ...devicesId,
                    deviceId
                ]
            })
        }
    }

    const addGroupDevicesPrompt = () => {
        Alert.alert(
            loc.groupAddDevicesPromptTitle(props.lang),
            loc.groupAddDevicesPromptQuestion(props.lang) + ' ' + selectedGroup?.name + '?',
            [
                {
                    text: loc.cancelButtonLabel(props.lang),
                    onPress: () => console.log('Cancel Pressed!')
                },
                {
                    text: loc.acceptButtonLabel(props.lang),
                    onPress: addGroupDevices
                }
            ],
            {
                cancelable: false
            }
        )
    }

    const addGroupDevices = () => {
        setIsLoading(true);

        axios.post(props.serverUrl + '/saveGroupDevices', {
            id: selectedGroup.id,
            user_id: props.user.id,
            devices_id: devicesId
        },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(res => {
                if (res.data.result === 'OK') {
                    props.route.params.updateGroup(res.data.groups, res.data.group);
                    setSelectedGroup(res.data.group);
                    setDevices(res.data.devices);
                }

                setDevicesId((res.data.group?.devices || []).map(d => d.id));
                setIsLoading(false);
            }).catch(e => {
                console.log(e);
                setIsLoading(false);
            });
    }

    const renderItem = ({ item }) => {
        return (
            <View style={styles.deviceItemContainer}>
                <View style={[
                    styles.deviceReportStatusIndicator,
                    {
                        backgroundColor: item.location
                            ? item.location.speed > 0
                                ? 'darkgreen'
                                : 'darkred'
                            : 'gray'
                    }
                ]}></View>

                <View style={[styles.deviceInfoContainer]}>
                    <View>
                        <Text style={styles.deviceInfoTextImei}>
                            <Text>{item.imei} </Text>
                            <Text style={styles.deviceInfoTextStatusExpiration}>
                                ({loc.expiresOnLabel(props.lang)}
                                <Text> {item.expiration_date ? moment(item.expiration_date).format('YYYY/MM/DD') : ''}</Text>
                                )
                            </Text>
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.deviceInfoTextVehicle}>{item.vehicle} ({item.license_plate})</Text>
                    </View>
                    <View style={styles.deviceInfoTextStatus}>
                        <Text style={styles.deviceInfoTextStatusLastReport}>
                            {loc.lastReportLabel(props.lang)}:
                            <Text style={{ fontWeight: 'normal' }}> {item.location ? moment(item.location.date_time).format('YYYY/MM/DD HH:mm:ss') : loc.noReports(props.lang)}</Text>
                        </Text>
                    </View>
                </View>
                <CheckBox
                    checkedIcon={<MaterialCommunityIcons name='checkbox-marked-outline' size={20} />}
                    uncheckedIcon={<MaterialCommunityIcons name='checkbox-blank-outline' size={20} />}
                    checked={devicesId.includes(item.id)}
                    onPress={() => { handleCheckbox(item.id) }}
                    containerStyle={{ padding: 0 }}
                />
            </View>
        )
    }

    const refreshDevicesList = () => {
        setRefreshingList(true);

        axios.post(props.serverUrl + '/getNoGroupDevices', {
            user_id: props.user.id,
            devices_id: (selectedGroup?.devices || []).map(device => device.id)
        },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        ).then(res => {
            if (res.data.result === 'OK') {
                setDevices(res.data.devices)
            }
            setRefreshingList(false);
        }).catch(e => {
            console.log(e);
            setRefreshingList(false);
        });
    }

    return (
        <View style={styles.container}>
            <Modal
                transparent={true}
                visible={isLoading}
                animationType={'slide'}
                onRequestClose={() => { setIsLoading(false) }}
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

            <View style={{ alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.1)', padding: 3, marginBottom: 5, borderRadius: 10 }}>
                <Text style={{ fontSize: 16 }}>
                    {selectedGroup?.name}
                </Text>
            </View>

            <View style={styles.searchContainer}>
                <FontAwesome name="search" size={20} color="#151E44" />
                <TextInput
                    style={{ flex: 1, fontSize: 16, marginLeft: 10, color: '#151E44' }}
                    keyboardType="web-search"
                    placeholder={loc.searchField(props.lang)}
                    onChangeText={(text) => { setSearchText(text) }}
                    value={searchText}
                />
                {
                    searchText.trim() !== '' &&
                    <FontAwesome style={{ marginLeft: 10 }} name="times" size={20} color="#151E4499" onPress={() => { setSearchText('') }} />
                }
            </View>

            <FlatList
                extraData={true}
                data={
                    devices.filter(device => {
                        let text = searchText.toLowerCase();

                        if (text.trim() === '') {
                            return device
                        } else {
                            if (device.imei.toLowerCase().includes(text.trim()) ||
                                device.license_plate.toLowerCase().includes(text.trim()) ||
                                device.vehicle.toLowerCase().includes(text.trim())) {
                                return device
                            }
                        }
                    })
                }
                renderItem={renderItem}
                ListEmptyComponent={() =>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Text>{loc.noDevicesToShowMessage(props.lang)}</Text>
                    </View>
                }
                ItemSeparatorComponent={() =>
                    <View style={{
                        height: 5
                    }}></View>
                }
                onRefresh={refreshDevicesList}
                refreshing={refreshingList}
                keyExtractor={(item => item.id.toString())}
            ></FlatList>
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
    searchContainer: {
        flexDirection: 'row',
        borderWidth: 1,
        padding: 10,
        borderRadius: 5,
        backgroundColor: 'white',
        borderColor: 'rgba(0,0,0,0.1)',
        elevation: 2,
        alignItems: 'center',
        marginBottom: 5
    },
    deviceItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 8,
        overflow: 'hidden',
        elevation: 1,
        borderColor: 'rgba(0,0,0,0.2)',
        borderWidth: 1,
        justifyContent: 'space-between'
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
        justifyContent: 'space-between',
        paddingRight: 10
    },
    deviceInfoTextStatusExpiration: {
        fontWeight: 'normal',
        color: 'black',
        fontSize: 14
    },
    deviceInfoTextStatusLastReport: {
        fontWeight: 'bold',
        fontStyle: 'normal',
        paddingRight: 10
    },
})

const mapStateToProps = state => {
    return {
        lang: state.appReducer.lang,
        serverUrl: state.appReducer.serverUrl,
        user: state.userReducer.user
    }
}

export default connect(mapStateToProps, null)(GroupAddDevices)