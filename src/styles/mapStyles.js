import { StyleSheet, Dimensions } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'yellow',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
    },
    body: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: 'blue',
    },
    mapStyle: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
})