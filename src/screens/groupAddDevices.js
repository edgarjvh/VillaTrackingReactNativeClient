import React, { Component } from "react";
import { connect } from "react-redux";
import Locale from '../locale';
import { View, StyleSheet, TouchableOpacity, FlatList, Modal, ActivityIndicator, TextInput, Text, Alert } from "react-native";
import {
    setIsLoading,
    setDevices,
    setDevicesModels,
    setGroups
} from "../actions";
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

class GroupAddDevices extends Component {
    constructor(props) {
        super(props)

        this.state = {
            searchText: '',
            groupName: ''
        }

        this.props.navigation.setOptions({
            headerRight: () => (
                <MaterialHeaderButtons>
                    <Item
                        title='save'
                        iconName='check'
                        disabled={
                            this.props.devices.reduce((n, device) => n + (!device.groups.includes(this.props.route.params.groupId) && device.isSelectedInGroups), 0) === 0
                        }
                        color={
                            this.props.devices.reduce((n, device) => n + (!device.groups.includes(this.props.route.params.groupId) && device.isSelectedInGroups), 0) === 0 ?
                                'rgba(0,0,0,0.3)' : 'black'
                        }
                        onPress={this.addGroupDevicesPrompt}
                    />
                    <Item title="menu" iconName="menu" onPress={() => this.props.navigation.toggleDrawer()} />
                </MaterialHeaderButtons>
            )
        })
    }

    componentDidMount() {
        this.props.navigation.setOptions({
            headerTitle: loc.associateToGroupTitle(this.props.lang)
        })

        this.props.groups.map(group => {
            if (group.id === this.props.route.params.groupId){
                this.setState({groupName: group.name})
            }
        })

        this.props.setDevices(this.props.devices.map(device => {
            device.isSelectedInGroups = false;
            return device;
        }));
    }

    componentDidUpdate() {
        this.props.navigation.setOptions({
            headerTitle: loc.associateToGroupTitle(this.props.lang)
        })        
    }

    searchTextCleared = () => {
        this.setState({
            searchText: ''
        })
    }

    handleCheckbox = (deviceId) => {
        this.props.setDevices(this.props.devices.map(device => {
            if (device.id === deviceId) {
                device.isSelectedInGroups = !device.isSelectedInGroups;
            }

            return device;
        }));
    }

    addGroupDevicesPrompt = () => {
        Alert.alert(
            loc.groupAddDevicesPromptTitle(this.props.lang),
            loc.groupAddDevicesPromptQuestion(this.props.lang) + ' ' + this.state.groupName + '?',
            [
                {
                    text: loc.cancelButtonLabel(this.props.lang),
                    onPress: () => console.log('Cancel Pressed!')
                },
                {
                    text: loc.acceptButtonLabel(this.props.lang),
                    onPress: this.addGroupDevices
                }
            ],
            {
                cancelable: false
            }
        )
    }

    addGroupDevices = () => {
        this.props.setIsLoading(true);

        let ids = this.props.devices.map(device => {
            if (!device.groups.includes(this.props.route.params.groupId)) {
                if (device.isSelectedInGroups) {
                    return device['id']
                }
            }
            return 0;
        })

        axios.post(this.props.serverUrl + '/saveGroupDevices', {
            ids: ids,
            groupId: this.props.route.params.groupId,
            userId: this.props.user.id
        },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(async res => {
                let { data } = res;

                const devices = data.devices;
                const devicesModels = data.deviceModels;
                const groups = data.groups;

                await this.props.setDevices(devices);
                await this.props.setDevicesModels(devicesModels);
                await this.props.setGroups(groups);

                this.props.setIsLoading(false);
                this.props.navigation.goBack();
            })
            .catch(e => {
                this.props.setIsLoading(false);
                console.log(e)
            })
    }

    renderItem = ({ item }) => {

        return <View style={styles.deviceItemContainer}>
            <View style={[
                styles.deviceReportStatusIndicator,
                {
                    backgroundColor: item.traces.length > 0 ?
                        item.traces[0].speed > 0 ? 'darkgreen' : 'darkred' :
                        'gray'
                }
            ]}></View>
            <View style={[styles.deviceInfoContainer, {
                backgroundColor: this.props.devicesShown.includes(item.id) ? '#F2F2F2' : '#FFF'
            }]}>
                <View>
                    <Text style={styles.deviceInfoTextImei}>
                        <Text>{item.imei} </Text>
                        <Text style={styles.deviceInfoTextStatusExpiration}>
                            ({loc.expiresOnLabel(this.props.lang)}
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
                        {loc.lastReportLabel(this.props.lang)}:
                        <Text style={{ fontWeight: 'normal' }}> {item.traces.length > 0 ? moment(item.traces[0].date_time).format('YYYY/MM/DD HH:mm:ss') : 'No report'}</Text>
                    </Text>
                </View>
            </View>

            <CheckBox
                checked={item.isSelectedInGroups}
                checkedIcon={<MaterialCommunityIcons name='checkbox-marked-outline' size={20} />}
                uncheckedIcon={<MaterialCommunityIcons name='checkbox-blank-outline' size={20} />}
                onPress={() => this.handleCheckbox(item.id)}
            />
        </View>
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

                <View style={{alignItems:'center', backgroundColor: 'rgba(0,0,0,0.1)',padding: 3, marginBottom: 5, borderRadius: 10}}>
                    <Text style={{fontSize: 16}}>
                        {this.state.groupName}
                    </Text>
                </View>

                <View style={styles.searchContainer}>
                    <FontAwesome name="search" size={20} color="#151E44" />
                    <TextInput
                        style={{ flex: 1, fontSize: 16, marginLeft: 10, color: '#151E44' }}
                        keyboardType="web-search"
                        placeholder={loc.searchField(this.props.lang)}
                        onChangeText={(text) => this.setState({ searchText: text })}
                        value={this.state.searchText}
                    />
                    {
                        this.state.searchText.trim() !== '' &&
                        <FontAwesome style={{ marginLeft: 10 }} name="times" size={20} color="#151E4499" onPress={this.searchTextCleared} />
                    }
                </View>

                <FlatList
                    extraData={true}
                    data={
                        this.props.devices.filter(device => {
                            let text = this.state.searchText.toLowerCase();

                            if (!device.groups.includes(this.props.route.params.groupId)) {
                                if (text.trim() === '') {
                                    return device
                                } else {
                                    if (device.imei.toLowerCase().includes(text.trim()) ||
                                        device.license_plate.toLowerCase().includes(text.trim()) ||
                                        device.vehicle.toLowerCase().includes(text.trim())) {
                                        return device
                                    }
                                }
                            }
                        })
                    }
                    renderItem={this.renderItem}
                    ListEmptyComponent={() =>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Text>{loc.noDevicesToShowMessage(this.props.lang)}</Text>
                        </View>
                    }
                    ItemSeparatorComponent={() =>
                        <View style={{
                            height: 5
                        }}></View>
                    }
                    keyExtractor={(item => item.id.toString())}
                ></FlatList>
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
        isLoading: state.appReducer.isLoading,
        serverUrl: state.appReducer.serverUrl,
        devices: state.devicesReducer.devices,
        groups: state.groupReducer.groups,
        devicesShown: state.devicesReducer.devicesShown,
        user: state.userReducer.user
    }
}

export default connect(mapStateToProps, {
    setIsLoading,
    setDevices,
    setDevicesModels,
    setGroups
})(GroupAddDevices)