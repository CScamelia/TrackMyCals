import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';

const workoutData = [
  { id: '1', title: 'Push-ups', description: '3 sets of 15 reps', calories: '240 calories in 30 minutes' },
  { id: '2', title: 'Squats', description: '3 sets of 20 reps', calories: '280 calories in 30 minutes' },
  { id: '3', title: 'Bench Press', description: '3 sets of 12 reps', calories: '220 calories in 30 minutes' },
  { id: '4', title: 'Deadlift', description: '3 sets of 10 reps', calories: '300 calories in 30 minutes' },
  { id: '5', title: 'Pull-ups', description: '3 sets of 10 reps', calories: '200 calories in 30 minutes' },
  { id: '6', title: 'Bicep Curls', description: '3 sets of 15 reps', calories: '180 calories in 30 minutes' },
  { id: '7', title: 'Tricep Dips', description: '3 sets of 12 reps', calories: '190 calories in 30 minutes' },
  { id: '8', title: 'Leg Press', description: '3 sets of 15 reps', calories: '250 calories in 30 minutes' },
  { id: '9', title: 'Shoulder Press', description: '3 sets of 12 reps', calories: '220 calories in 30 minutes' },
  { id: '10', title: 'Bent Over Rows', description: '3 sets of 12 reps', calories: '260 calories in 30 minutes' },
];

export default function MenWorkout() {
  return (
    <View style={styles.container}>
      <FlatList
        data={workoutData}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
            <Text style={styles.calories}>{item.calories}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  item: {
    padding: 20,
    marginVertical: 8,
    backgroundColor: '#A1D6E2',
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
  },
  calories: {
    fontSize: 14,
    color: '#888',
  },
});
