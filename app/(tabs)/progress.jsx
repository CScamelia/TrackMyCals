import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Dimensions, ActivityIndicator, Text } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../firebase'; // Ensure you have configured firebase properly

export default function App() {
  const [calorieData, setCalorieData] = useState([]);
  const [dateLabels, setDateLabels] = useState([]);
  const [displayDateLabels, setDisplayDateLabels] = useState([]);
  const [maxCaloriesPerDay, setMaxCaloriesPerDay] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, "users", user.uid);
      const unsubscribe = onSnapshot(userRef, (userDoc) => {
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.calories) {
            const today = new Date();
            const dates = [];
            const displayDates = [];
            const calories = [];

            // Initialize arrays for the last 6 days
            for (let i = 5; i >= 0; i--) {
              const date = new Date();
              date.setDate(today.getDate() - i);
              const dateString = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
              const displayDateString = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
              dates.push(dateString);
              displayDates.push(displayDateString);
              calories.push(0);
            }

            // Fill calorie data for the last 6 days
            userData.calories.forEach(entry => {
              const entryDate = entry.date;
              const index = dates.indexOf(entryDate);
              if (index !== -1) {
                calories[index] += entry.caloryIntake;
              }
            });

            setDateLabels(dates);
            setDisplayDateLabels(displayDates);
            setCalorieData(calories);
          }
          if (userData.max_calories_per_day) {
            setMaxCaloriesPerDay(userData.max_calories_per_day); // Fetch the max calories per day
          }
          setLoading(false);
        }
      });

      // Cleanup subscription on unmount
      return () => unsubscribe();
    }
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const progress = (Math.min(Math.max(...calorieData), maxCaloriesPerDay) / maxCaloriesPerDay) * 100;

  // Calculate the position of the red line
  const chartHeight = 300; // Height of the chart
  const yAxisMax = 2000; // Maximum value on the y-axis
  const linePosition = chartHeight - (chartHeight * (maxCaloriesPerDay / yAxisMax));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Calorie Intake Chart</Text>
      <LineChart
        data={{
          labels: displayDateLabels,
          datasets: [
            {
              data: calorieData
            }
          ]
        }}
        width={Dimensions.get("window").width - 16}
        height={chartHeight}
        yAxisLabel=""
        yAxisSuffix=" kcal"
        yAxisInterval={1}
        fromZero={true}
        yAxisMax={yAxisMax}
        chartConfig={{
          backgroundColor: "#1E2923",
          backgroundGradientFrom: "#08130D",
          backgroundGradientTo: "#1E2923",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16
          },
          propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: "#ffa726"
          }
        }}
        style={{
          marginVertical: 8,
          borderRadius: 16
        }}
        decorator={() => {
          return (
            <View>
              {maxCaloriesPerDay !== null && (
                <View
                  style={{
                    position: 'absolute',
                    height: 1,
                    width: '100%',
                    backgroundColor: 'red',
                    top: linePosition,
                    borderStyle: 'dotted'
                  }}
                />
              )}
            </View>
          );
        }}
      />
      <View style={styles.goalContainer}>
        <Text style={styles.goalText}>Daily Calorie Goal: {maxCaloriesPerDay} kcal</Text>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBar,
              { width: `${progress}%` }
            ]}
          />
        </View>
        <Text style={styles.progressText}>{Math.round(progress)}% of goal reached</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  goalContainer: {
    marginTop: 16,
    width: '100%',
    alignItems: 'center',
  },
  goalText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBarBackground: {
    height: 10,
    width: '90%',
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
    marginVertical: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#76c7c0',
  },
  progressText: {
    fontSize: 16,
    color: '#333',
  },
});
