import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';

const workoutData = [
  { id: '1', title: 'Lunges', description: '3 sets of 15 reps', calories: '200 calories in 30 minutes' },
  { id: '2', title: 'Plank', description: '3 sets of 60 seconds', calories: '150 calories in 30 minutes' },
  { id: '3', title: 'Push-ups', description: '3 sets of 20 reps', calories: '250 calories in 30 minutes' },
  { id: '4', title: 'Squats', description: '3 sets of 15 reps', calories: '220 calories in 30 minutes' },
  { id: '5', title: 'Burpees', description: '3 sets of 10 reps', calories: '300 calories in 30 minutes' },
  { id: '6', title: 'Mountain Climbers', description: '3 sets of 40 reps', calories: '270 calories in 30 minutes' },
  { id: '7', title: 'Jumping Jacks', description: '3 sets of 50 reps', calories: '250 calories in 30 minutes' },
  { id: '8', title: 'High Knees', description: '3 sets of 30 reps', calories: '280 calories in 30 minutes' },
  { id: '9', title: 'Bicycle Crunches', description: '3 sets of 20 reps', calories: '220 calories in 30 minutes' },
  { id: '10', title: 'Russian Twists', description: '3 sets of 40 reps', calories: '200 calories in 30 minutes' },
];

export default function WomenWorkout() {
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
    backgroundColor: '#f9c2ff',
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
