// import { Text, View } from 'react-native'
// import React from 'react'
// import { CustomButton } from '../../components'

// const Home = () => {
//   return (
//     <View>
//       <Text>HELLO</Text>
//       <CustomButton title="hi"></CustomButton>
//     </View>
//   )
// }

// export default Home

// HomeScreen.js
// Home.js

import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, Dimensions, ActivityIndicator, Alert, TouchableOpacity, FlatList } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase'; // Adjust the path as necessary
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect

const screenWidth = Dimensions.get('window').width;

const getFormattedDate = (date) => {
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
};

const getPreviousDates = (numDays) => {
  const dates = [];
  for (let i = 1; i <= numDays; i++) { // Start from 1 to exclude today
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(getFormattedDate(date));
  }
  return dates;
};

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [meals, setMeals] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getFormattedDate(new Date(new Date().setDate(new Date().getDate() - 1)))); // Set to yesterday by default
  const [previousDates, setPreviousDates] = useState(getPreviousDates(3));
  const router = useRouter();

  useEffect(() => {
    const updateDateAtMidnight = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0); // Set the time to midnight
      const timeUntilMidnight = midnight.getTime() - now.getTime();
      setTimeout(() => {
        setPreviousDates(getPreviousDates(3));
        updateDateAtMidnight(); // Schedule the next update
      }, timeUntilMidnight);
    };

    updateDateAtMidnight();
  }, []);

  const fetchData = async (date) => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          // console.log(data);

          // Check if calories data exists and is an array
          if (Array.isArray(data.calories)) {
            // Filter meals for the specified date
            const caloriesData = data.calories.filter(meal => meal.date === date);

            console.log('Calories data fetched:', caloriesData); // Log fetched meals
            if (caloriesData.length > 0) {
              // Extract meals from the fetched data
              const fetchedMeals = caloriesData.flatMap(item => item.meals);
              setMeals(fetchedMeals);
            } else {
              console.log('No calories data found for the specified date.');
              setMeals([]); // Clear meals array if no data found
            }
          } else {
            console.log('No meals data available.');
            setMeals([]); // Clear meals array if no data available
          }
        } else {
          console.log('No such document!');
        }
      } else {
        console.log('No user is signed in.');
      }
    } catch (error) {
      console.error('Error fetching document:', error);
      Alert.alert('Error', 'Failed to fetch user data.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData(selectedDate);
    }, [selectedDate])
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load user data.</Text>
      </View>
    );
  }

  const { max_calories_per_day, carbsPercentage = 0.50, fatPercentage = 0.30, proteinPercentage = 0.20 } = userData;

  // Calculate calorie values based on percentages
  const carbsCalories = max_calories_per_day * carbsPercentage;
  const fatCalories = max_calories_per_day * fatPercentage;
  const proteinCalories = max_calories_per_day * proteinPercentage;

  // Convert calorie values to grams and round to whole numbers
  const carbsGrams = Math.round(carbsCalories / 4); // 4 calories per gram of carbs
  const fatGrams = Math.round(fatCalories / 9);     // 9 calories per gram of fat
  const proteinGrams = Math.round(proteinCalories / 4); // 4 calories per gram of protein

  // Calculate remaining calories and grams
  const remainingCalories = max_calories_per_day - (carbsCalories + fatCalories + proteinCalories);
  const remainingGrams = Math.round(remainingCalories / 4); // Assuming remaining calories are for carbs

  // Pie chart data in grams
  const data = [
    {
      name: `g \n Carbs `,
      population: carbsGrams,
      color: '#F73369',
      legendFontColor: '#7F7F7F',
      legendFontSize: 15,
    },
    {
      name: ` g \n Fat`,
      population: fatGrams,
      color: '#F4B400',
      legendFontColor: '#7F7F7F',
      legendFontSize: 15,
    },
    {
      name: `g \n Protein `,
      population: proteinGrams,
      color: '#F98866',
      legendFontColor: '#7F7F7F',
      legendFontSize: 15,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.dateText}>{selectedDate}</Text>
      </View>
      <View style={styles.micronutrientsContainer}>
        <Text style={styles.micronutrientsText}>Nutritional Intake & Previous Meals Overview</Text>
      </View>
      <View style={styles.chartContainer}>
        <PieChart
          data={data}
          width={screenWidth}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
        <View style={styles.caloriesTextContainer}>
          <Text style={styles.caloriesText}>{max_calories_per_day} KCal</Text>
          <Text style={styles.totalCaloriesText}>Daily Intake Estimation to reach goals</Text>
        </View>
      </View>
      <View style={styles.mealSummary}>
        <Text style={styles.mealSummaryTitle}>Previous Meals</Text>
        <FlatList
          data={previousDates}
          horizontal
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => setSelectedDate(item)}>
              <Text style={[styles.dateSelectionText, selectedDate === item && styles.selectedDate]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
          style={styles.dateSelectionContainer}
          contentContainerStyle={{ alignItems: 'center' }}
          showsHorizontalScrollIndicator={false}
        />
        {meals.length > 0 ? (
          meals.map((meal, index) => (
            <View key={index} style={styles.mealItem}>
              <Text style={styles.mealTimeText}>{meal.mealType}</Text>
              <Text style={styles.mealNameText}>{meal.name}</Text>
              <Text style={styles.mealCaloriesText}>{meal.calories} KCal</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noMealsText}>No meals recorded for selected date.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#A1D6E2',
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    marginTop: 40, // Added marginTop for space above the header
  },
  dateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  micronutrientsContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  micronutrientsText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  caloriesTextContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  caloriesText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  totalCaloriesText: {
    fontSize: 16,
    
    color: '#666',
  },
  mealSummary: {
    marginVertical: 20,
  },
  mealSummaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#FFFFFF',
  },
  dateSelectionContainer: {
    marginBottom: 10,
  },
  dateSelectionText: {
    fontSize: 16,
    color: '#FFFFFF',
    padding: 10,
    backgroundColor: '#333',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  selectedDate: {
    backgroundColor: '#90AFC5', // Changed to a distinct color
    color: '#000', // Text color for better readability on selected date background
  },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
  },
  mealTimeText: {
    fontSize: 16,
    color: '#000000',
  },
  mealNameText: {
    fontSize: 16,
    color: '#000000',
  },
  mealCaloriesText: {
    fontSize: 16,
    color: '#000000',
  },
  noMealsText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
});














