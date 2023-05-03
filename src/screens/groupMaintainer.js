import React, { useState, useEffect, useRef } from 'react';
import { connect } from "react-redux";
import Locale from './../locale';
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

const GroupMaintainer = (props) => {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(props.route.params.group);
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        props.navigation.setOptions({
            headerRight: () => (
                <MaterialHeaderButtons>
                    <Item title="save" iconName="content-save-edit" onPress={() => { saveGroup() }} />
                    <Item title="menu" iconName="menu" onPress={() => props.navigation.toggleDrawer()} />
                </MaterialHeaderButtons>
            )
        })

        props.navigation.setOptions({
            headerTitle: props.route.params.type === 'add' ? loc.addNewGroupTitle(props.lang) : loc.editGroupTitle(props.lang)
        })
    });    

    const saveGroup = () => {

        if ((selectedGroup?.name || '').trim() === '') {
            Alert.alert(
                'VillaTracking',
                loc.groupNameEmptyMessage(props.lang)
            );
            return;
        }

        setIsLoading(true);

        axios.post(props.serverUrl + '/saveGroup', {
            id: selectedGroup.id,
            name: selectedGroup.name,
            status: selectedGroup.status,
            user_id: props.user.id
        },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(res => {
                switch (res.data.result) {
                    case 'SAVED':
                        Alert.alert('VillaTracking', loc.groupSavedSuccessfullyMsg(props.lang));
                        props.route.params.onGoBack(res.data.groups);
                        props.navigation.goBack();
                        break;
                    case 'UPDATED':
                        Alert.alert('VillaTracking', loc.groupUpdatedSuccessfullyMsg(props.lang));
                        props.route.params.onGoBack(res.data.groups);
                        props.navigation.goBack();
                        break;
                    case 'DUPLICATE':
                        Alert.alert('VillaTracking', loc.groupDuplicatedMessage(props.lang));
                        break;
                    default:
                        Alert.alert('VillaTracking', loc.erroOccurred(props.lang));
                        console.log(res.data)
                        break;
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

            <ScrollView>
                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>{loc.nameField(props.lang)} *</Text>
                    <TextInput style={styles.fieldInput} maxLength={15}
                        onChangeText={(name) => {
                            setSelectedGroup(selectedGroup => {
                                return {
                                    ...selectedGroup,
                                    name
                                }
                            })
                        }}
                        value={selectedGroup?.name || ''} />
                </View>

                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>{loc.statusField(props.lang)} *</Text>
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 8
                    }}>
                        <Text>{loc.enabledLabel(props.lang)}</Text>
                        <Switch
                            trackColor={{ false: "#767577", true: "#81b0ff" }}
                            thumbColor={(selectedGroup?.status || 0) === 1 ? "green" : "#f4f3f4"}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={() => {
                                setSelectedGroup(() => {
                                    return {
                                        ...selectedGroup,
                                        status: (selectedGroup?.status || 0) === 0 ? 1 : 0
                                    }
                                })
                            }}
                            value={(selectedGroup?.status || 0) === 1}
                        />
                    </View>
                </View>
            </ScrollView>
        </View>
    )
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
        serverUrl: state.appReducer.serverUrl,
        user: state.userReducer.user,
    }
}

export default connect(mapStateToProps, null)(GroupMaintainer)