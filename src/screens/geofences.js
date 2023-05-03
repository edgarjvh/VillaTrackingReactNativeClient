import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { View, Text, StyleSheet, ActivityIndicator, Modal, Alert, TouchableOpacity, FlatList, TextInput } from "react-native";
import { MaterialCommunityIcons, FontAwesome } from "react-native-vector-icons";
import Locale from './../locale';
import { HeaderButtons, HeaderButton, Item } from 'react-navigation-header-buttons';
import axios from "axios";
import { Badge } from "react-native-elements";

const MaterialHeaderButton = (props) => (
    <HeaderButton IconComponent={MaterialCommunityIcons} iconSize={23} {...props} />
);

const MaterialHeaderButtons = (props) => {
    return <HeaderButtons HeaderButtonComponent={MaterialHeaderButton} {...props} />;
};

const loc = new Locale();

const Geofences = (props) => {
    const [searchText, setSearchText] = useState('');
    const [geofences, setGeofences] = useState([]);
    const [selectedGeofence, setSelectedGeofence] = useState({});
    const [modalVisible, setModalVisible] = useState(false);
    const [refreshingList, setRefreshingList] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        props.navigation.setOptions({
            headerRight: () => (
                <MaterialHeaderButtons>
                    <Item title="add" iconName="file-plus" onPress={() => props.navigation.navigate('GeofenceMaintainer', { type: 'add', selectedGeofence: {}, updateGeofences: updateGeofences })} />
                    <Item title="menu" iconName="menu" onPress={() => props.navigation.toggleDrawer()} />
                </MaterialHeaderButtons>
            )
        })

        props.navigation.setOptions({
            headerTitle: loc.geofencesLabel(props.lang) + ' (' + geofences.length + ')'
        })
    })

    useEffect(() => {
        setRefreshingList(true);

        axios.post(props.serverUrl + '/getGeofencesByUser', {
            user_id: props.user.id
        },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        ).then(res => {
            if (res.data.result === 'OK') {
                setGeofences(res.data.geofences)
            }
            setRefreshingList(false);
        }).catch(e => {
            console.log(e);
            setRefreshingList(false);
        });
    }, []);

    const updateGeofences = (_geofences) => {
        setGeofences(_geofences);
    }

    const refreshGeofenceList = () => {
        setRefreshingList(true);

        axios.post(props.serverUrl + '/getGeofencesByUser', {
            user_id: props.user.id
        },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        ).then(res => {
            if (res.data.result === 'OK') {
                setGeofences(res.data.geofences)
            }
            setRefreshingList(false);
        }).catch(e => {
            console.log(e);
            setRefreshingList(false);
        });
    }

    const goToEdition = () => {
        setModalVisible(false);
        props.navigation.navigate('GeofenceMaintainer', { type: 'edit', selectedGeofence: selectedGeofence, updateGeofences: updateGeofences });
    }

    const showGeofenceDevices = () => {
        setModalVisible(false);

        props.navigation.navigate('GeofenceDevices', { selectedGeofence: selectedGeofence, updateGeofences: updateGeofences });
    }

    const deleteGeofence = () => {
        setIsLoading(true);

        axios.post(props.serverUrl + '/deleteGeofence', {
            user_id: props.user.id,
            id: selectedGeofence.id
        },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            })
            .then(res => {
                switch (res.data.result) {
                    case 'OK':
                        setIsLoading(false);
                        setGeofences(res.data.geofences);
                        setSearchText('');
                        setSelectedGeofence({});
                        setModalVisible(false);
                        setRefreshingList(false);
                        break;
                    default:
                        setIsLoading(false);
                        Alert.alert('VillaTracking', loc.erroOccurred(props.lang));
                        console.log(res.data)
                        break;
                }
            })
            .catch(e => {
                setIsLoading(false);
                Alert.alert('VillaTracking', loc.erroOccurred(props.lang));
                console.log(e)
            })
    }

    const renderItem = ({ item }) => {
        return <View style={[styles.geofenceItemContainer, { backgroundColor: item.status === 0 ? '#F6CECE' : '#FFF' }]}>
            <View style={{ flexDirection: 'column', flex: 1 }}>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={{ marginRight: 10, fontSize: 18 }}>{item.name}</Text>
                    <Badge value={item.device_count || 0} status='primary' />
                </View>
                <View>
                    <Text>
                        {item.description}
                    </Text>
                </View>
            </View>
            <TouchableOpacity activeOpacity={0.5} onPress={() => {
                setSelectedGeofence(item);
                setModalVisible(true);
            }}>
                <MaterialCommunityIcons name="dots-vertical" size={30} color="#151E44" />
            </TouchableOpacity>
        </View>
    }

    return (
        <View style={styles.container}>
            <Modal
                transparent={true}
                visible={modalVisible}
                animationType={'slide'}
                onRequestClose={() => {
                    setSelectedGeofence({});
                    setModalVisible(false);
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

                        <TouchableOpacity style={styles.modalButtonContainer} onPress={showGeofenceDevices} >
                            <View style={styles.modalButtonContent}>
                                <MaterialCommunityIcons name="eight-track" size={25} />
                                <Text style={styles.modalButtonText}>{loc.associatedDevicesLabel(props.lang)}</Text>
                                <MaterialCommunityIcons name="chevron-right" size={30} />
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.modalButtonContainer, { backgroundColor: 'rgba(255,0,0,0.3)' }]} onPress={() => {
                            Alert.alert(
                                loc.geofenceDeletePromptTitle(props.lang),
                                loc.geofenceDeletePromptQuestion(props.lang) + ' ' + (selectedGeofence?.name || '') + '?',
                                [
                                    {
                                        text: loc.cancelButtonLabel(props.lang),
                                        onPress: () => console.log('Cancel Pressed!')
                                    },
                                    {
                                        text: loc.acceptButtonLabel(props.lang),
                                        onPress: deleteGeofence
                                    }
                                ],
                                {
                                    cancelable: false
                                }
                            )
                        }}>
                            <View style={styles.modalButtonContent}>
                                <MaterialCommunityIcons name="delete" size={25} />
                                <Text style={styles.modalButtonText}>{loc.deleteButtonLabel(props.lang)}</Text>
                                <MaterialCommunityIcons name="chevron-right" size={30} />
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.modalButtonContainer, { backgroundColor: 'transparent' }]}
                            onPress={() => setModalVisible(false)}>
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
                    onChangeText={(text) => setSearchText(text)}
                    value={searchText}
                />
                {
                    searchText.trim() !== '' &&
                    <FontAwesome style={{ marginLeft: 10 }} name="times" size={20} color="#151E4499" onPress={() => setSearchText('')} />
                }
            </View>

            <FlatList
                extraData={true}
                data={
                    geofences.filter(geofence => {
                        let text = searchText.toLowerCase();

                        if (text.trim() === '') {
                            return geofence
                        } else {
                            if (geofence.name.toLowerCase().includes(text.trim()) ||
                                geofence.description.toLowerCase().includes(text.trim())) {
                                return geofence
                            }
                        }
                    })
                }
                renderItem={renderItem}
                ListEmptyComponent={() =>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Text>{loc.noGeofencesToShowMessage(props.lang)}</Text>
                    </View>
                }
                ItemSeparatorComponent={() =>
                    <View style={{
                        height: 5
                    }}></View>
                }
                onRefresh={refreshGeofenceList}
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
    geofenceItemContainer: {
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
});

const mapStateToProps = state => {
    return {
        lang: state.appReducer.lang,
        serverUrl: state.appReducer.serverUrl,
        user: state.userReducer.user
    }
}

export default connect(mapStateToProps, null)(Geofences)