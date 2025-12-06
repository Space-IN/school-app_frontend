import { Text, View, ScrollView, Image, StyleSheet } from "react-native"


export default function EventsSlider({ events = [] }) {

    return(
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContainer}
            >
                {events.map((event) => (
                    <View key={event._id} style={styles.card}>
                        <Image
                            source={require("../../../assets/image-placeholder.jpg")}
                            style={styles.image}
                        />
                        <View style={styles.textContainer}>
                            <Text style={styles.title}>{event.title}</Text>
                            <Text style={styles.date}>
                                {new Date(event.date).toLocaleDateString()}
                            </Text>
                            <Text
                                numberOfLines={2}
                                ellipsizeMode="tail"
                                style={styles.description}
                            >
                                {event.description}
                            </Text>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#2b1b17",
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 20,
        elevation: 3,
        height: 220,
    },
    heading: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    scrollContainer: {
        // paddingBottom: 10,
        // display: "flex",
        // justifyContent: "center",
        // alignItems: "center"
    },
    card: {
        backgroundColor: "#F9FAFB",
        borderRadius: 20,
        marginRight: 15,
        width: 300,
        overflow: "hidden",
        elevation: 4,
    },
    image: {
        width: "100%",
        height: 100,
    },
    textContainer: {
        paddingLeft: 12,
        paddingBottom: 13,
        paddingTop: 3
    },
    title: {
        fontSize: 17,
        fontWeight: "900",
    },
    date: {
        fontSize: 12,
        color: "#6B7280",

    },
    description: {
        fontSize: 14,
        color: "#374151",
        marginVertical: 10,
    },
})