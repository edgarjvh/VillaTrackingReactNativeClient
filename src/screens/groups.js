import React, { Component } from 'react';
import { View, Text, StyleSheet, Modal, ActivityIndicator, FlatList, TextInput, TouchableOpacity, Alert } from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { FontAwesome, MaterialCommunityIcons, FontAwesome5 } from 'react-native-vector-icons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { connect } from 'react-redux';
import Locale from './../locale.ts';
import { HeaderButtons, HeaderButton, Item } from 'react-navigation-header-buttons';
import {
    setIsLoading,
    setGroups,
    setDevices,
    setDevicesModels
} from "./../actions";
import axios from 'axios';

const MaterialHeaderButton = (props) => (
    <HeaderButton IconComponent={MaterialIcon} iconSize={23} color="black" {...props} />
);

const MaterialHeaderButtons = (props) => {
    return <HeaderButtons HeaderButtonComponent={MaterialHeaderButton} {...props} />;
};

const loc = new Locale();

class Groups extends Component {

    constructor(props) {
        super(props);

        this.state = {
            searchText: '',
            selectedGroup: null,
            modalVisible: false,
            refreshingList: false
        }

        this.props.navigation.setOptions({

            headerRight: () => (
                <MaterialHeaderButtons>
                    <Item title="add" iconName="plus" onPress={() => this.props.navigation.navigate('GroupMaintainer', { type: 'add', groupId: 0 })} />
                    <Item title="menu" iconName="menu" onPress={() => this.props.navigation.toggleDrawer()} />
                </MaterialHeaderButtons>
            )
        })
    }

    componentDidUpdate() {
        this.props.navigation.setOptions({
            headerTitle: loc.groupsLabelText(this.props.lang) + ' (' + this.props.groups.length + ')'
        })
    }

    componentDidMount() {
        this.props.navigation.setOptions({
            headerTitle: loc.groupsLabelText(this.props.lang) + ' (' + this.props.groups.length + ')'
        })
    }

    searchTextCleared = () => {
        this.setState({
            searchText: ''
        })

        this.searchTextChanged('');
    }

    refreshGroupList = async () => {
        await this.setState({ refreshingList: true });

        axios.post(this.props.serverUrl + '/getDevicesPayload', {
            id: this.props.user.id
        },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        )
            .then(async res => {
                const deviceModels = res.data.deviceModels;
                const devices = res.data.devices;
                const groups = res.data.groups;

                await this.props.setDevices(devices);
                await this.props.setDevicesModels(deviceModels);
                await this.props.setGroups(groups);
                this.setState({ refreshingList: false });
            })
            .catch(e => {
                console.log(e);
                this.setState({ refreshingList: false });
            });
    }

    renderItem = ({ item }) => {
        return <View style={[styles.groupItemContainer, { backgroundColor: item.status === 0 ? '#F6CECE' : '#FFF' }]}>
            <View>
                <Text>{item.name} (<Text style={{color: 'blue'}}>{item.devices.length}</Text>)</Text>
            </View>
            <TouchableOpacity activeOpacity={0.5} onPress={() => this.setState({ modalVisible: true, selectedGroup: item })}>
                <MaterialCommunityIcons name="dots-vertical" size={30} color="#151E44" />
            </TouchableOpacity>
        </View>
    }

    goToEdition = () => {
        this.setState({
            modalVisible: false
        });

        this.props.navigation.navigate('GroupMaintainer', { type: 'edit', groupId: this.state.selectedGroup.id });
    }

    deleteGroup = () => {
        Alert.alert(
            loc.groupDeletePromptTitle(this.props.lang),
            loc.groupDeletePromptQuestion(this.props.lang) + ' ' + this.state.selectedGroup.name + '?',
            [
                {
                    text: loc.cancelButtonLabel(this.props.lang),
                    onPress: () => console.log('Cancel Pressed!')
                },
                {
                    text: loc.acceptButtonLabel(this.props.lang),
                    onPress: this.clearGroup
                }
            ],
            {
                cancelable: false
            }
        )
    }

    clearGroup = () => {
        this.props.setIsLoading(true);

        axios.post(this.props.serverUrl + '/deleteGroup', {
            groupId: this.state.selectedGroup.id,
            userId: this.props.user.id
        },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            })
            .then(res => {
                switch (res.data.result) {
                    case 'OK':
                        this.props.setIsLoading(false);
                        this.props.setDevices(res.data.devices);
                        this.props.setDevicesModels(res.data.deviceModels);
                        this.props.setGroups(res.data.groups);

                        this.setState({
                            searchText: '',
                            selectedGroup: null,
                            modalVisible: false,
                            refreshingList: false
                        });
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
                    onRequestClose={() => this.setIsLoading(false)}
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

                <Modal
                    transparent={true}
                    visible={this.state.modalVisible}
                    animationType={'slide'}
                    onRequestClose={() => this.setState({ modalVisible: false, selectedGroup: null })}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent} >
                            <TouchableOpacity style={styles.modalButtonContainer} onPress={this.goToEdition} >
                                <View style={styles.modalButtonContent}>
                                    <MaterialCommunityIcons name="file-document-edit" size={25} />
                                    <Text style={styles.modalButtonText}>{loc.editButtonLabel(this.props.lang)}</Text>
                                    <MaterialCommunityIcons name="chevron-right" size={30} />
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.modalButtonContainer, { backgroundColor: 'rgba(255,0,0,0.3)' }]} onPress={this.deleteGroup}>
                                <View style={styles.modalButtonContent}>
                                    <MaterialCommunityIcons name="delete" size={25} />
                                    <Text style={styles.modalButtonText}>{loc.deleteButtonLabel(this.props.lang)}</Text>
                                    <MaterialCommunityIcons name="chevron-right" size={30} />
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.modalButtonContainer, { backgroundColor: 'transparent' }]}
                                onPress={() => this.setState({ modalVisible: false })}>
                                <View style={styles.modalButtonContent}>
                                    <Text style={[styles.modalButtonText, { textAlign: 'center', marginLeft: 0 }]}>{loc.cancelButtonLabel(this.props.lang)}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

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
                        this.props.groups.filter(group => {
                            let text = this.state.searchText.toLowerCase();

                            if (text.trim() === '') {
                                return group
                            } else {
                                if (group.name.toLowerCase().includes(text.trim())) {
                                    return group
                                }
                            }
                        })
                    }
                    renderItem={this.renderItem}
                    ListEmptyComponent={() =>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Text>{loc.noGroupsToShowMessage(this.props.lang)}</Text>
                        </View>
                    }
                    ItemSeparatorComponent={() =>
                        <View style={{
                            height: 5
                        }}></View>
                    }
                    onRefresh={this.refreshGroupList}
                    refreshing={this.state.refreshingList}
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
    stackHeader: {
        flexDirection: 'row',
        justifyContent: 'center'
    },
    groupItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 8,
        overflow: 'hidden',
        elevation: 1,
        borderColor: 'rgba(0,0,0,0.2)',
        borderWidth: 1,
        justifyContent: 'space-between',
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 5,
        paddingBottom: 5
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
    modalContainer: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1
    },
    modalContent: {
        backgroundColor: 'white',
        width: '90%',
        maxWidth: 380,
        padding: 10,
        borderRadius: 10
    },
    modalButtonContainer: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 5,
        width: '100%',
        marginBottom: 10
    },
    modalButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10
    },
    modalButtonText: {
        fontSize: 18,
        marginLeft: 15,
        flex: 1,
        fontWeight: 'bold'
    }
})

const mapStateToProps = (state) => {
    return {
        lang: state.appReducer.lang,
        serverUrl: state.appReducer.serverUrl,
        isLoading: state.appReducer.isLoading,
        groups: state.groupReducer.groups,
        user: state.userReducer.user
    }
}

export default connect(mapStateToProps, {
    setIsLoading,
    setGroups,
    setDevices,
    setDevicesModels
})(Groups)

