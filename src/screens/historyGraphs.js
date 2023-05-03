import React, { useEffect, useState } from 'react';
import { connect } from "react-redux";
import { View, StyleSheet } from "react-native";
import PureChart from 'react-native-pure-chart';
import { VictoryChart, VictoryBar, VictoryAxis } from "victory-native";
import Locale from './../locale'

const loc = new Locale();

const HistoryGraphs = (props) => {
    const [type, setType] = useState('locations');
    const [higherSpeed, setHigherSpeed] = useState(0);
    const [distance, setDistance] = useState(0);
    const [timeMove, setTimeMove] = useState(0);
    const [timeStop, setTimeStop] = useState(0);
    const [fuelConsumption, setFuelConsumption] = useState(0);
    const [traces, setTraces] = useState([]);
    const [alertsTime, setAlertsTime] = useState([]);

    useEffect(() => {
        setType(props.route.params.type || 'locations');
        setHigherSpeed(props.route.params.higherSpeed || 0);
        setDistance(props.route.params.distance || 0);
        setTimeMove(props.route.params.timeMove || 0);
        setTimeStop(props.route.params.timeStop || 0);
        setFuelConsumption(props.route.params.fuelConsumption || 0);
        setTraces(props.route.params.traces || []);
    }, []);

    const getRandomColor = () => {
        let letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    return (
        <View style={styles.mainContainer}>
            <View style={styles.content}>
                {
                    type === 'locations' ?
                        <PureChart
                            data={traces.map((trace, index) => {
                                return {
                                    x: trace.date_time,
                                    y: trace.speed
                                }
                            })}
                            type='line'
                            height={250}
                        />
                        :

                        <VictoryChart
                            domainPadding={10}
                            style={{
                                background: {
                                    fill: 'transparent',
                                    width: '100%'
                                }
                            }}

                        >
                            <VictoryBar
                                style={{
                                    data: {
                                        fill: 'tomato'
                                    },
                                    parent: {
                                        backgroundColor: 'white'
                                    }
                                }}
                                data={
                                    alertsTime.map(alert => {
                                        return {
                                            x: alert.name === 'ac alarm' ? loc.acAlarmLabel(props.lang) :
                                                alert.name === 'low battery' ? loc.lowBatteryLabel(props.lang) :
                                                    alert.name === 'no gps' ? loc.noGpsLabel(props.lang) :
                                                        alert.name === 'sensor alarm' ? loc.sensorAlarmLabel(props.lang) : '',
                                            y: alert.seconds
                                        }
                                    })
                                }
                                labels={({ datum }) => datum.y}
                            />

                            <VictoryAxis label={loc.alertTypeLabel(props.lang)} />
                            <VictoryAxis style={{
                                axis: { stroke: "transparent" },
                                ticks: { stroke: "transparent" },
                                tickLabels: { fill: "transparent" }
                            }} dependentAxis label={loc.timeLabel(props.lang) + ' (' + loc.secondsLabel(props.lang) + ')'} offsetX={48} />
                        </VictoryChart>
                }

            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    content: {
        width: '100%'
    }
})

const mapStateToProps = (state) => {
    return {
        lang: state.appReducer.lang        
    }
}

export default connect(mapStateToProps, null)(HistoryGraphs)