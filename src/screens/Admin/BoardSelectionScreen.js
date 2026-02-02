import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function BoardSelectionScreen({ navigation, route }) {
    const { nextScreen, title } = route.params;

    const handleSelectBoard = (board) => {
        navigation.navigate(nextScreen, { board });
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <View style={styles.content}>
                <Text style={styles.title}>{title || 'Select Board'}</Text>

                <TouchableOpacity
                    style={styles.card}
                    onPress={() => handleSelectBoard('CBSE')}
                >
                    <View style={styles.iconContainer}>
                        <Ionicons name="school" size={32} color="#ac1d1dff" />
                    </View>
                    <Text style={styles.cardText}>CBSE</Text>
                    <Ionicons name="chevron-forward" size={24} color="#ccc" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.card}
                    onPress={() => handleSelectBoard('STATE')}
                >
                    <View style={styles.iconContainer}>
                        <Ionicons name="business" size={32} color="#ac1d1dff" />
                    </View>
                    <Text style={styles.cardText}>STATE</Text>
                    <Ionicons name="chevron-forward" size={24} color="#ccc" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f7fa',
    },
    content: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ac1d1dff',
        marginBottom: 30,
        textAlign: 'center',
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fecaca',
        padding: 20,
        borderRadius: 12,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#e0f2fe',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardText: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
});
