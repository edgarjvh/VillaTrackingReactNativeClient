import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, ActivityIndicator, FlatList, TextInput, TouchableOpacity, Alert } from 'react-native';
import { FontAwesome, MaterialCommunityIcons, FontAwesome5 } from 'react-native-vector-icons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { connect } from 'react-redux';
import Locale from './../locale.ts';
import { HeaderButtons, HeaderButton, Item } from 'react-navigation-header-buttons';
import axios from 'axios';
import { Badge } from "react-native-elements";

const MaterialHeaderButton = (props) => (
    <HeaderButton IconComponent={MaterialIcon} iconSize={23} color="black" {...props} />
);

const MaterialHeaderButtons = (props) => {
    return <HeaderButtons HeaderButtonComponent={MaterialHeaderButton} {...props} />;
};

const loc = new Locale();

const Groups = (props) => {
    const [searchText, setSearchText] = useState('');
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState({});
    const [modalVisible, setModalVisible] = useState(false);
    const [refreshingList, setRefreshingList] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        props.navigation.setOptions({
            headerRight: () => (
                <MaterialHeaderButtons>
                    <Item title="add" iconName="file-plus" onPress={() => props.navigation.navigate('GroupMaintainer', { type: 'add', group: {}, onGoBack: onGoBack })} />
                    <Item title="menu" iconName="menu" onPress={() => props.navigation.toggleDrawer()} />
                </MaterialHeaderButtons>
            )
        })

        props.navigation.setOptions({
            headerTitle: loc.groupsLabelText(props.lang) + ' (' + groups.length + ')'
        })
    })

    useEffect(() => {
        setRefreshingList(true);

        axios.post(props.serverUrl + '/getGroupsByUser', {
            user_id: props.user.id
        },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        ).then(res => {
            if (res.data.result === 'OK') {
                setGroups(res.data.groups)
            }
            setRefreshingList(false);
        }).catch(e => {
            console.log(e);
            setRefreshingList(false);
        });
    }, []);

    const onGoBack = (_groups) => {
        setGroups(_groups);
    }

    const refreshGroupList = () => {
        setRefreshingList(true)

        axios.post(props.serverUrl + '/getGroupsByUser', {
            user_id: props.user.id
        },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        ).then(res => {
            if (res.data.result === 'OK') {
                setGroups(res.data.groups)
            }
            setRefreshingList(false)
        }).catch(e => {
            console.log(e);
            setRefreshingList(false)
        });
    }

    const renderItem = ({ item }) => {
        return <View style={[styles.groupItemContainer, { backgroundColor: item.status === 0 ? '#F6CECE' : '#FFF' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ marginRight: 10 }}>{item.name}</Text>
                <Badge value={item.devices_count} status='primary' />
            </View>
            <TouchableOpacity activeOpacity={0.5} onPress={() => {
                setModalVisible(true);
                setSelectedGroup(item);
            }}>
                <MaterialCommunityIcons name="dots-vertical" size={30} color="#151E44" />
            </TouchableOpacity>
        </View>
    }

    const goToEdition = () => {
        setModalVisible(false);
        props.navigation.navigate('GroupMaintainer', { type: 'edit', group: selectedGroup, onGoBack: onGoBack});
    }

    const showGroupDevices = () => {
        setModalVisible(false);
        props.navigation.navigate('GroupDevices', { group: selectedGroup, updateGroups: updateGroups });
    }

    const updateGroups = (_groups) => {
        setGroups(_groups);
    }

    const deleteGroup = () => {
        Alert.alert(
            loc.groupDeletePromptTitle(props.lang),
            loc.groupDeletePromptQuestion(props.lang) + ' ' + selectedGroup.name + '?',
            [
                {
                    text: loc.cancelButtonLabel(props.lang),
                    onPress: () => console.log('Cancel Pressed!')
                },
                {
                    text: loc.acceptButtonLabel(props.lang),
                    onPress: clearGroup
                }
            ],
            {
                cancelable: false
            }
        )
    }

    const clearGroup = () => {
        setIsLoading(true);

        axios.post(props.serverUrl + '/deleteGroup',
            {
                id: selectedGroup.id,
                user_id: props.user.id
            },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(res => {                
                if (res.data.result === 'OK'){
                    setGroups(res.data.groups);                    
                    setModalVisible(false);
                }      
                setIsLoading(false);                          
            }).catch(e => {
                setIsLoading(false); 
                Alert.alert('VillaTracking', loc.erroOccurred(props.lang));
                console.log(e)
            })
    }

    return (
        <View style={styles.container}>
            <Modal
                transparent={true}
                visible={isLoading}
                animationType={'slide'}
                onRequestClose={() => {setIsLoading(false)}}
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
                visible={modalVisible}
                animationType={'slide'}
                onRequestClose={() => {
                    setModalVisible(false);
                    setSelectedGroup({});
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent} >
                        <TouchableOpacity style={styles.modalButtonContainer} onPress={goToEdition} >
                            <View style={styles.modalButtonContent}>
                                <MaterialCommunityIcons name="file-document-edit" size={25} />
                                <Text style={styles.modalButtonText}>{loc.editButtonLabel(props.lang)}</Text>
                                <MaterialCommunityIcons name="chevron-right" size={30} />
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalButtonContainer} onPress={showGroupDevices} >
                            <View style={styles.modalButtonContent}>
                                <MaterialCommunityIcons name="eight-track" size={25} />
                                <Text style={styles.modalButtonText}>{loc.associatedDevicesLabel(props.lang)}</Text>
                                <MaterialCommunityIcons name="chevron-right" size={30} />
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.modalButtonContainer, { backgroundColor: 'rgba(255,0,0,0.3)' }]} onPress={deleteGroup}>
                            <View style={styles.modalButtonContent}>
                                <MaterialCommunityIcons name="delete" size={25} />
                                <Text style={styles.modalButtonText}>{loc.deleteButtonLabel(props.lang)}</Text>
                                <MaterialCommunityIcons name="chevron-right" size={30} />
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.modalButtonContainer, { backgroundColor: 'transparent' }]}
                            onPress={() => {setModalVisible(false)}}>
                            <View style={styles.modalButtonContent}>
                                <Text style={[styles.modalButtonText, { textAlign: 'center', marginLeft: 0 }]}>{loc.cancelButtonLabel(props.lang)}</Text>
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
                    placeholder={loc.searchField(props.lang)}
                    onChangeText={(text) => {setSearchText(text)}}
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
                    groups.filter(group => {
                        let text = searchText.toLowerCase();

                        if (text.trim() === '') {
                            return group
                        } else {
                            if (group.name.toLowerCase().includes(text.trim())) {
                                return group
                            }
                        }
                    })
                }
                renderItem={renderItem}
                ListEmptyComponent={() =>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Text>{loc.noGroupsToShowMessage(props.lang)}</Text>
                    </View>
                }
                ItemSeparatorComponent={() =>
                    <View style={{
                        height: 5
                    }}></View>
                }
                onRefresh={refreshGroupList}
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
        user: state.userReducer.user
    }
}

export default connect(mapStateToProps, null)(Groups)

