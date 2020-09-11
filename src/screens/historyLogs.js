import React, { Component } from 'react';
import { connect } from "react-redux";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { FontAwesome, MaterialCommunityIcons, FontAwesome5 } from 'react-native-vector-icons';
import Locale from './../locale';

const loc = new Locale();

class HistoryLogs extends Component {
    constructor(props) {
        super(props)
    }

    renderItem = ({ item, index }) => {
        return this.props.historyType === 'locations' ?
            <View style={styles.historyItemContainer}>
                <View style={[styles.historyItemCounter]}>
                    <Text style={{ textAlign: 'center' }}>
                        {(index + 1).toString()}
                    </Text>
                </View>

                <View style={[styles.historyItemInfo, {
                    backgroundColor: item.speed > 0 ? item.speed === this.props.historyHigherSpeed ? 'lightblue' : 'lightgreen' : 'lightcoral'
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
                            this.props.historyType === 'locations' ?
                                <Text>
                                    {item.speed} Km/H
                                </Text>
                                :
                                <Text>
                                    {item.alert === 'ac alarm' ? loc.acAlarmLabel(this.props.lang) :
                                        item.alert === 'low battery' ? loc.lowBatteryLabel(this.props.lang) :
                                            item.alert === 'no gps' ? loc.noGpsLabel(this.props.lang) :
                                                item.alert === 'sensor alarm' ? loc.sensorAlarmLabel(this.props.lang) :
                                                    item.alert === 'acc on' ? loc.accOnLabel(this.props.lang) :
                                                        item.alert === 'acc off' ? loc.accOffLabel(this.props.lang) : ''}
                                </Text>
                        }
                    </View>
                </View>
            </View>
    }

    render() {
        return (
            <View style={styles.mainContainer}>
                {
                    this.props.historyType === 'locations' &&
                    <View style={styles.historyInfoContainer}>
                        <View style={styles.historyInfoRow}>
                            <Text style={{ fontWeight: 'bold' }}>
                                {loc.distanceLabel(this.props.lang)}
                            </Text>
                            <Text>
                                {
                                    this.props.historyDistance > 1000 ?
                                        (this.props.historyDistance / 1000).toFixed(2) + ' Km' :
                                        this.props.historyDistance + ' m'
                                }
                            </Text>
                        </View>
                        <View style={styles.historyInfoRow}>
                            <Text>
                                {loc.maxSpeedLabel(this.props.lang)}
                            </Text>
                            <Text>
                                {
                                    this.props.historyHigherSpeed + ' Km/H'
                                }
                            </Text>
                        </View>
                        <View style={styles.historyInfoRow}>
                            <Text>
                                {loc.movingTimeLabel(this.props.lang)} (h:m:s)
                        </Text>
                            <Text>
                                {
                                    this.props.historyTimeMove.formatted
                                }
                            </Text>
                        </View>
                        <View style={styles.historyInfoRow}>
                            <Text>
                                {loc.stoppedTimeLabel(this.props.lang)} (h:m:s)
                        </Text>
                            <Text>
                                {
                                    this.props.historyTimeStop.formatted
                                }
                            </Text>
                        </View>
                        <View style={styles.historyInfoRow}>
                            <Text>
                                {loc.fuelConsumptionLabel(this.props.lang)}
                            </Text>
                            <Text>
                                {
                                    this.props.historyFuelConsumption.toFixed(2) + ' ' + loc.litersLabel(this.props.lang)
                                }
                            </Text>
                        </View>
                    </View>
                }

                <FlatList
                    data={this.props.historyData}
                    renderItem={this.renderItem}
                    ListEmptyComponent={() =>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Text>{loc.noDeviceHistoryMessage(this.props.lang)}</Text>
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
        lang: state.appReducer.lang,
        historyData: state.devicesReducer.historyData,
        historyType: state.devicesReducer.historyType,
        historyHigherSpeed: state.devicesReducer.historyHigherSpeed,
        historyDistance: state.devicesReducer.historyDistance,
        historyTimeMove: state.devicesReducer.historyTimeMove,
        historyTimeStop: state.devicesReducer.historyTimeStop,
        historyFuelConsumption: state.devicesReducer.historyFuelConsumption
    }
}

export default connect(mapStateToProps, null)(HistoryLogs)