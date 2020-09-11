import React, { Component } from 'react';
import { connect } from "react-redux";
import Locale from './../locale';
import {
    setIsLoading,
    setDevices,
    setDevicesModels,
    setGroups
} from "./../actions";
import { HeaderButtons, HeaderButton, Item } from 'react-navigation-header-buttons';
import axios from 'axios';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { View, Text, StyleSheet, TextInput, ActivityIndicator, Modal, ScrollView, Switch, Alert } from 'react-native';

const loc = new Locale();

const MaterialHeaderButton = (props) => (
    <HeaderButton IconComponent={MaterialIcon} iconSize={23} color="black" {...props} />
);

const MaterialHeaderButtons = (props) => {
    return <HeaderButtons HeaderButtonComponent={MaterialHeaderButton} {...props} />;
};

class GroupMaintainer extends Component {
    constructor(props) {
        super(props)

        this.state = {
            groupId: this.props.route.params.groupId,
            name: '',
            isActive: true
        };

        this.props.navigation.setOptions({
            headerRight: () => (
                <MaterialHeaderButtons>
                    <Item title="save" iconName="content-save-edit" onPress={() => this.saveGroup()} />
                    <Item title="menu" iconName="menu" onPress={() => this.props.navigation.toggleDrawer()} />
                </MaterialHeaderButtons>
            )
        })
    }

    componentDidUpdate() {
        this.props.navigation.setOptions({
            headerTitle: this.props.route.params.type === 'add' ? loc.addNewGroupTitle(this.props.lang) : loc.editGroupTitle(this.props.lang)
        })
    }

    componentDidMount() {
        this.props.navigation.setOptions({
            headerTitle: this.props.route.params.type === 'add' ? loc.addNewGroupTitle(this.props.lang) : loc.editGroupTitle(this.props.lang)
        })

        console.log(this.props.route.params);

        if (this.props.route.params.groupId > 0) {

            this.props.groups.map(group => {
                if (group.id === this.props.route.params.groupId) {
                    this.setState({
                        groupId: group.id,
                        name: group.name,
                        isActive: group.status === 1
                    })
                }
                return group;
            })
        } else {
            this.setState({
                groupId: this.props.route.params.groupId,
                name: '',
                isActive: true
            })
        }
    }

    saveGroup = () => {
        let {
            groupId,
            name,
            isActive
        } = this.state;

        if (name.trim() === '') {
            Alert.alert(
                'VillaTracking',
                loc.groupNameEmptyMessage(this.props.lang)
            );
            return;
        }

        this.props.setIsLoading(true);

        axios.post(this.props.serverUrl + '/saveGroup', {
            groupId: groupId,
            name: name,
            isActive: isActive,
            userId: this.props.user.id
        },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            })
            .then(res => {
                console.log(res.data.result);
                switch (res.data.result) {
                    case 'SAVED':
                        this.props.setIsLoading(false);
                        this.props.setDevices(res.data.devices);
                        this.props.setDevicesModels(res.data.deviceModels);
                        this.props.setGroups(res.data.groups);

                        Alert.alert('VillaTracking', loc.groupSavedSuccessfullyMsg(this.props.lang));
                        this.props.navigation.goBack();
                        break;
                    case 'UPDATED':
                        this.props.setIsLoading(false);
                        this.props.setDevices(res.data.devices);
                        this.props.setDevicesModels(res.data.deviceModels);
                        this.props.setGroups(res.data.groups);

                        Alert.alert('VillaTracking', loc.groupUpdatedSuccessfullyMsg(this.props.lang));
                        this.props.navigation.goBack();
                        break;
                    case 'DUPLICATE':
                        this.props.setIsLoading(false);
                        Alert.alert('VillaTracking', loc.groupDuplicatedMessage(this.props.lang));
                        break;
                    default:
                        this.props.setIsLoading(false);
                        Alert.alert('VillaTracking', loc.erroOccurred(this.props.lang));
                        console.log(res.data)
                        break;
                }
            })
            .catch(e => {
                this.props.setIsLoading(false);
                Alert.alert('VillaTracking', loc.erroOccurred(this.props.lang));
                console.log(e)
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
                        <Text style={styles.fieldLabel}>{loc.nameField(this.props.lang)} *</Text>
                        <TextInput style={styles.fieldInput} maxLength={15}
                            onChangeText={(name) => this.setState({ name })}
                            value={this.state.name} />
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
                                thumbColor={this.state.isActive ? "green" : "#f4f3f4"}
                                ios_backgroundColor="#3e3e3e"
                                onValueChange={() => this.setState({ isActive: !this.state.isActive })}
                                value={this.state.isActive}
                            />
                        </View>
                    </View>
                </ScrollView>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10
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
    }
})

const mapStateToProps = (state) => {
    return {
        lang: state.appReducer.lang,
        isLoading: state.appReducer.isLoading,
        serverUrl: state.appReducer.serverUrl,
        user: state.userReducer.user,
        groups: state.groupReducer.groups
    }
}

export default connect(mapStateToProps, {
    setIsLoading,
    setDevices,
    setDevicesModels,
    setGroups
})(GroupMaintainer)