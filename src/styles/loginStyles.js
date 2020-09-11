import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    bg: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start'
    },
    logoView: {
        alignItems: 'center',
        width: '100%',
        height: '100%',
        flex: 0.3,
        flexDirection: 'row',
        justifyContent: 'center'
    },
    logo: {
        width: 300,
        resizeMode: 'contain'
    },
    body: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center'
    },
    formContainer: {
        width: '90%',
        maxWidth: 480,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 10,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 5, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 10,
        alignItems: 'center'
    },
    formTitle: {
        width: '100%',
        alignItems: 'center',
        padding: 5,
        marginBottom: 20,
        backgroundColor: '#000'
    },
    formInputContainer: {
        width: '100%',
        alignItems: 'center',
        padding: 15
    },
    formInput: {
        borderWidth: 1,
        padding: 10,
        borderRadius: 5,
        width: '100%',
        marginBottom: 20,
        color: '#fff',
        backgroundColor: 'rgba(0,0,0,0.4)'
    },
    lowercase:{
      textTransform: 'lowercase'  
    },
    submitButton:{
        padding: 10,
        backgroundColor: '#000',
        alignItems: 'center',
        width: 200,
        borderRadius: 10,
        marginBottom: 20
    },
    formFooter: {
        flexDirection: 'row',
        alignItems:'center',
        marginBottom: 20
    }
});