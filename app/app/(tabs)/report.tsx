import { StyleSheet, Text, View } from "react-native";

export default function ReportScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Report</Text>
      <Text style={styles.text}>Create and track community service reports.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
    color: "#1b2a1d",
  },
  text: {
    fontSize: 15,
    color: "#566258",
    textAlign: "center",
  },
});