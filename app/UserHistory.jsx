import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { auth } from "../firebase"; // Assuming this is the correct import path

const PersonalUser = ({ onSelectDates = () => {} }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isStartDatePickerVisible, setStartDatePickerVisible] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [startWeight, setStartWeight] = useState(null);
  const [endWeight, setEndWeight] = useState(null);
  const [weightDifference, setWeightDifference] = useState(null);
  const [weightStatus, setWeightStatus] = useState(''); // 'gain' or 'loss'
  const [totalDays, setTotalDays] = useState(null); // State for total days

  const showStartDatePicker = () => setStartDatePickerVisible(true);
  const hideStartDatePicker = () => setStartDatePickerVisible(false);
  const handleStartDateConfirm = (date) => {
    setStartDate(date);
    hideStartDatePicker();
  };

  const showEndDatePicker = () => setEndDatePickerVisible(true);
  const hideEndDatePicker = () => setEndDatePickerVisible(false);
  const handleEndDateConfirm = (date) => {
    setEndDate(date);
    hideEndDatePicker();
  };

  const formatDate = (date) => {
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  };

  const calculateTotalDays = (start, end) => {
    const timeDiff = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  const fetchData = async (startDate, endDate) => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      const userRef = doc(getFirestore(), 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
        const fetchedData = userData.calories.filter((entry) => {
          const [entryDay, entryMonth, entryYear] = entry.date.split('/');
          const entryDate = new Date(entryYear, entryMonth - 1, entryDay);
          return entryDate >= start && entryDate <= end;
        });

        setData(fetchedData);

        const startWeightEntry = fetchedData.find((entry) => {
          const [entryDay, entryMonth, entryYear] = entry.date.split('/');
          const entryDate = new Date(entryYear, entryMonth - 1, entryDay);
          return entryDate.getTime() === start.getTime();
        });

        const endWeightEntry = fetchedData.find((entry) => {
          const [entryDay, entryMonth, entryYear] = entry.date.split('/');
          const entryDate = new Date(entryYear, entryMonth - 1, entryDay);
          return entryDate.getTime() === end.getTime();
        });

        if (startWeightEntry) {
          setStartWeight(startWeightEntry.weight);
        }
        if (endWeightEntry) {
          setEndWeight(endWeightEntry.weight);
        }

        if (startWeightEntry && endWeightEntry) {
          const weightDiff = endWeightEntry.weight - startWeightEntry.weight;
          const absWeightDiff = Math.abs(weightDiff).toFixed(1);
          setWeightDifference(absWeightDiff);
          setWeightStatus(weightDiff > 0 ? 'gain' : 'loss');
        }

        // Calculate total days between start and end date
        const days = calculateTotalDays(start, end);
        setTotalDays(days);
      }
    } catch (error) {
      console.error('Error fetching data: ', error);
    }
    setLoading(false);
  };

  const handleSelectDates = () => {
    if (onSelectDates) {
      onSelectDates({ startDate, endDate });
    }
    if (startDate && endDate) {
      fetchData(startDate, endDate);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.dateContainer}>
        <View style={styles.datePicker}>
          <Text style={styles.label}>Select Start Date:</Text>
          <View style={styles.buttonContainer}>
            <Button title={startDate ? formatDate(startDate) : '-'} onPress={showStartDatePicker} />
          </View>
          <DateTimePickerModal
            isVisible={isStartDatePickerVisible}
            mode="date"
            onConfirm={handleStartDateConfirm}
            onCancel={hideStartDatePicker}
          />
        </View>
        <View style={styles.datePicker}>
          <Text style={styles.label}>Select End Date:</Text>
          <View style={styles.buttonContainer}>
            <Button title={endDate ? formatDate(endDate) : '-'} onPress={showEndDatePicker} />
          </View>
          <DateTimePickerModal
            isVisible={isEndDatePickerVisible}
            mode="date"
            onConfirm={handleEndDateConfirm}
            onCancel={hideEndDatePicker}
          />
        </View>
      </View>

      <View style={styles.submitButtonContainer}>
        <View style={styles.longButtonContainer}>
          <Button title="Submit" onPress={handleSelectDates} />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1995AD" />
      ) : (
        <>
          {startWeight !== null && endWeight !== null && (
            <View style={styles.weightContainer}>
              <Text>Weight on {formatDate(startDate)}: {startWeight} kg</Text>
              <Text>Weight on {formatDate(endDate)}: {endWeight} kg</Text>
              <Text>Total Days: {totalDays}</Text>
              <Text style={[
                styles.weightChange,
                weightStatus === 'gain' ? styles.weightGain : styles.weightLoss
              ]}>
                {weightStatus === 'gain' ? `Weight Gain: ${weightDifference} kg` : `Weight Loss: ${weightDifference} kg`}
              </Text>
            </View>
          )}
          <FlatList
            data={data}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <Text>Date: {item.date}</Text>
                <Text>Calory Intake: {item.caloryIntake}</Text>
                <Text>Weight: {item.weight}</Text>
                {item.meals && item.meals.map((meal, index) => (
                  <View key={index} style={styles.mealItem}>
                    <Text>Meal: {meal.name}</Text>
                    <Text>Calories: {meal.calories}</Text>
                  </View>
                ))}
              </View>
            )}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  datePicker: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5, // Add margin to ensure equal spacing
  },
  label: {
    fontSize: 18,
    marginVertical: 10,
    color: '#1995AD',
  },
  buttonContainer: {
    width: 100, // Set a static width for the date buttons
  },
  submitButtonContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  longButtonContainer: {
    width: '80%', // Make the submit button take the full width of the parent container
  },
  weightContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  weightChange: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  weightGain: {
    color: 'red',
  },
  weightLoss: {
    color: '#4ac24e',
  },
  item: {
    padding: 10,
    marginVertical: 8,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
  },
  mealItem: {
    paddingLeft: 10,
    borderLeftColor: '#ddd',
    borderLeftWidth: 1,
    marginVertical: 5,
  },
});

export default PersonalUser;
