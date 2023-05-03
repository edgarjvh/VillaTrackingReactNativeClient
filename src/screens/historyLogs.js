import React, { useEffect, useState } from 'react';
import { connect } from "react-redux";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { FontAwesome, MaterialCommunityIcons, FontAwesome5 } from 'react-native-vector-icons';
import Locale from './../locale';
import moment from 'moment';

const loc = new Locale();

const HistoryLogs = (props) => {
    const [type, setType] = useState('locations');
    const [higherSpeed, setHigherSpeed] = useState(0);
    const [distance, setDistance] = useState(0);
    const [timeMove, setTimeMove] = useState(0);
    const [timeStop, setTimeStop] = useState(0);
    const [fuelConsumption, setFuelConsumption] = useState(0);
    const [traces, setTraces] = useState([]);

    useEffect(() => {
        setType(props.route.params.type || 'locations');
        setHigherSpeed(props.route.params.higherSpeed || 0);
        setDistance(props.route.params.distance || 0);
        setTimeMove(props.route.params.timeMove || 0);
        setTimeStop(props.route.params.timeStop || 0);
        setFuelConsumption(props.route.params.fuelConsumption || 0);
        setTraces(props.route.params.traces || []);
    }, []);

    const renderItem = ({ item, index }) => {
        return type === 'locations' ?
            <View style={styles.historyItemContainer}>
                <View style={[styles.historyItemCounter]}>
                    <Text style={{ textAlign: 'center' }}>
                        {(index + 1).toString()}
                    </Text>
                </View>

                <View style={[styles.historyItemInfo, {
                    backgroundColor: item.speed > 0 ? item.speed === higherSpeed ? 'lightblue' : 'lightgreen' : 'lightcoral'
                }]}>
                    <View style={styles.historyItemDateTime}>
                        <Text>
                            {
                                item.date_time === item.last_date_time ?
                                    item.date_time :
                                    item.date_time
                            }
                            <Text style={{ color: 'blue', fontWeight: 'bold' }}>
                                {
                                    item.date_time === item.last_date_time ?
                                        '' : ' >> '
                                }
                            </Text>
                            {
                                item.date_time === item.last_date_time ?
                                    '' :
                                    item.last_date_time
                            }
                        </Text>
                    </View>
                    <View style={styles.historyItemSpeed}>
                        <Text>
                            {item.speed} Km/H
                        </Text>

                    </View>
                </View>
            </View>
            :
            <View style={styles.historyItemContainer}>
                <View style={styles.historyItemCounter}>
                    <Text style={{ textAlign: 'center' }}>
                        {(index + 1).toString()}
                    </Text>
                </View>

                <View style={[styles.historyItemInfo, {
                    backgroundColor: index % 2 === 0 ? '#f1f1f1' : 'lightgray'
                }]}>
                    {
                        item.date_time !== item.last_date_time &&
                        <View style={{
                            justifyContent: 'flex-end'
                        }}>
                            <MaterialCommunityIcons name='subdirectory-arrow-right' size={20} />
                        </View>
                    }

                    <View style={{ flex: 1 }}>
                        {
                            item.date_time === item.last_date_time ?
                                <Text>
                                    {item.date_time}
                                </Text>
                                :
                                <View style={{ flex: 1 }}>
                                    <Text>
                                        {item.date_time}
                                    </Text>
                                    <Text>
                                        {item.last_date_time}
                                    </Text>
                                </View>
                        }
                    </View>
                    <View style={{
                        alignSelf: 'center'
                    }}>
                        {
                            type === 'locations' ?
                                <Text>
                                    {item.speed} Km/H
                                </Text>
                                :
                                <Text>
                                    {item.alert === 'ac alarm' ? loc.acAlarmLabel(props.lang) :
                                        item.alert === 'low battery' ? loc.lowBatteryLabel(props.lang) :
                                            item.alert === 'no gps' ? loc.noGpsLabel(props.lang) :
                                                item.alert === 'sensor alarm' ? loc.sensorAlarmLabel(props.lang) :
                                                    item.alert === 'acc on' ? loc.accOnLabel(props.lang) :
                                                        item.alert === 'acc off' ? loc.accOffLabel(props.lang) :
                                                            item.alert === 'speed' ? loc.overSpeedLabel(props.lang) : ''}
                                </Text>
                        }
                    </View>
                </View>
            </View>
    }

    const formatTime = (sec) => {
        let hours = sec / 3600;
        let fullHours = Math.trunc(hours);
        let minutes = (hours - Math.floor(hours)) * 60;
        let fullMinutes = Math.trunc(minutes);
        let seconds = (minutes - Math.floor(minutes)) * 60;
        let formatted = `${fullHours}:${fullMinutes}:${seconds.toFixed(0)}`;

        return formatted;
    }

    return (
        <View style={styles.mainContainer}>
            {
                type === 'locations' &&
                <View style={styles.historyInfoContainer}>
                    <View style={styles.historyInfoRow}>
                        <Text style={{ fontWeight: 'bold' }}>
                            {loc.distanceLabel(props.lang)}
                        </Text>
                        <Text>
                            {
                                distance > 1000 ?
                                    (distance / 1000).toFixed(2) + ' Km' :
                                    distance + ' m'
                            }
                        </Text>
                    </View>
                    <View style={styles.historyInfoRow}>
                        <Text>
                            {loc.maxSpeedLabel(props.lang)}
                        </Text>
                        <Text>
                            {
                                higherSpeed + ' Km/H'
                            }
                        </Text>
                    </View>
                    <View style={styles.historyInfoRow}>
                        <Text>
                            {loc.movingTimeLabel(props.lang)} (h:m:s)
                        </Text>
                        <Text>
                            {
                                formatTime(timeMove)
                            }
                        </Text>
                    </View>
                    <View style={styles.historyInfoRow}>
                        <Text>
                            {loc.stoppedTimeLabel(props.lang)} (h:m:s)
                        </Text>
                        <Text>
                            {
                                formatTime(timeStop)
                            }
                        </Text>
                    </View>
                    <View style={styles.historyInfoRow}>
                        <Text>
                            {loc.fuelConsumptionLabel(props.lang)}
                        </Text>
                        <Text>
                            {
                                fuelConsumption.toFixed(2) + ' ' + loc.litersLabel(props.lang)
                            }
                        </Text>
                    </View>
                </View>
            }

            <FlatList
                data={traces}
                renderItem={renderItem}
                ListEmptyComponent={() =>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Text>{loc.noDeviceHistoryMessage(props.lang)}</Text>
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

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#f1f1f1',
        padding: 10,
        position: 'relative'
    },
    historyItemContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center'
    },
    historyItemInfo: {
        flexDirection: 'row',
        // alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 8,
        overflow: 'hidden',
        elevation: 1,
        borderColor: 'rgba(0,0,0,0.2)',
        borderWidth: 1,
        justifyContent: 'space-between',
        paddingTop: 5,
        paddingBottom: 5,
        paddingLeft: 10,
        paddingRight: 10,
        flex: 1
    },
    historyItemCounter: {
        padding: 5,
        width: 40,
        elevation: 0.1,
        borderColor: 'rgba(0,0,0,0.2)',
        borderWidth: 1,
        borderRadius: 8,
        backgroundColor: '#f1f1f1',
        marginRight: 5
    },
    historyInfoContainer: {
        marginBottom: 5
    },
    historyInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 5,
        paddingBottom: 5,
        paddingLeft: 10,
        paddingRight: 10,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
        borderRadius: 8,
        backgroundColor: '#e1e1e1',
        elevation: 1,
        marginBottom: 2
    }
})

const mapStateToProps = (state) => {
    return {
        lang: state.appReducer.lang
    }
}

export default connect(mapStateToProps, null)(HistoryLogs)