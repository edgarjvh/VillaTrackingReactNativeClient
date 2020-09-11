import React, { Component } from 'react';
import { connect } from "react-redux";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { LineChart, BarChart } from "react-native-chart-kit";
import PureChart from 'react-native-pure-chart';
import { VictoryLine, VictoryChart, VictoryTheme, VictoryBar, VictoryAxis, VictoryLabel } from "victory-native";
import Locale from './../locale'

const loc = new Locale();

class HistoryGraphs extends Component {
    constructor(props) {
        super(props)

    }

    getRandomColor = () => {
        let letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    componentDidMount() {
        console.log(this.getRandomColor());
    }

    render() {
        return (
            <View style={styles.mainContainer}>
                <View style={styles.content}>
                    {
                        this.props.historyType === 'locations' ?
                            <PureChart
                                data={this.props.historyData.map((trace, index) => {
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
                                        this.props.historyAlertsTime.map(alert => {
                                            return {
                                                x: alert.name === 'ac alarm' ? loc.acAlarmLabel(this.props.lang) :
                                                    alert.name === 'low battery' ? loc.lowBatteryLabel(this.props.lang) :
                                                        alert.name === 'no gps' ? loc.noGpsLabel(this.props.lang) :
                                                            alert.name === 'sensor alarm' ? loc.sensorAlarmLabel(this.props.lang) : '',
                                                y: alert.seconds
                                            }
                                        })
                                    }
                                    labels={({datum}) => datum.y} 
                                />

                                <VictoryAxis label={loc.alertTypeLabel(this.props.lang)} />
                                <VictoryAxis style={{
                                    axis: { stroke: "transparent" },
                                    ticks: { stroke: "transparent" },
                                    tickLabels: { fill: "transparent" }
                                }} dependentAxis label={loc.timeLabel(this.props.lang) + ' (' + loc.secondsLabel(this.props.lang) + ')'} offsetX={48} />
                            </VictoryChart>
                    }

                </View>
            </View>
        )
    }
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
        lang: state.appReducer.lang,
        historyData: state.devicesReducer.historyData,
        historyType: state.devicesReducer.historyType,
        historyAlertsTime: state.devicesReducer.historyAlertsTime
    }
}

export default connect(mapStateToProps, null)(HistoryGraphs)