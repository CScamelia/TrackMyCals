import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, StatusBar, TouchableOpacity, SectionList, Alert, Modal, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getFirestore, setDoc, doc, getDocs, getDoc, collection } from "firebase/firestore";
import { auth, db } from "../../firebase";
import Dialog from "react-native-dialog";
import { useNavigation } from '@react-navigation/native';

const MealLogger = () => {
  const [meals, setMeals] = useState([]);
  const [selectedMeals, setSelectedMeals] = useState({});
  const [totalCalories, setTotalCalories] = useState(0);
  const [userMaxCal, setUserMaxCal] = useState("");
  const [selectedMealId, setSelectedMealId] = useState(null);
  const [mealTypes, setMealTypes] = useState({
    breakfast: false,
    lunch: false,
    snacking: false,
    dinner: false,
  });
  const [dialogVisible, setDialogVisible] = useState(false);
  const [submittedMeals, setSubmittedMeals] = useState([]);
  const [currentPage, setCurrentPage] = useState('logMeals'); // 'logMeals' or 'submittedMeals'
  const [daysSinceRegistration, setDaysSinceRegistration] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [weight, setWeight] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      await fetchMeals();
      await fetchUserData();
    };
    fetchData();
  }, []);

  const fetchUserData = async () => {
    const user = auth.currentUser;
    const userRef = doc(db, "users", user.uid);
    const userDetails = await getDoc(userRef);
    const userMaxCalories = userDetails.data().max_calories_per_day;
    const userCalories = userDetails.data().calories || [];
    const registrationDate = userDetails.data().regDate;

    const today = new Date();
    const todayDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    const existingDate = userCalories.find(data => data.date === todayDate);
    const currentCalories = existingDate ? existingDate.caloryIntake : 0;
    const currentMeals = existingDate ? existingDate.meals || [] : [];
    const currentWeight = existingDate ? existingDate.weight : null;

    setUserMaxCal(userMaxCalories);
    setTotalCalories(currentCalories);
    setSubmittedMeals(currentMeals);

    // Calculate days since registration
    const [regDay, regMonth, regYear] = registrationDate.split('/');
    const regDateObj = new Date(regYear, regMonth - 1, regDay); // month is 0-indexed in JS Date
    const timeDiff = today - regDateObj;
    const daysSince = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1; // Adding 1 to count the registration day as day 1
    setDaysSinceRegistration(daysSince);

    // Show modal if weight is not set for today
    if (!currentWeight) {
      setModalVisible(true);
    }
  };

  const fetchMeals = async () => {
    try {
      const list = [];
      const mealList = await getDocs(collection(db, "food"));
      if (mealList) {
        mealList.forEach(doc => {
          list.push({
            id: doc.id,
            ...doc.data()
          });
        });
      }
      setMeals(list);
    } catch (err) {
      console.log(err);
    }
  };

  // Other functions...

const handleMealSelection = (mealId, mealType) => {
    if (mealId) {
      const meal = meals.find(meal => meal.id === mealId);
      const uniqueMeal = { ...meal, uniqueId: Date.now().toString() };
      setSelectedMeals(prev => ({
        ...prev,
        [mealType]: [...(prev[mealType] || []), uniqueMeal]
      }));
      const totalCaloriesCount = totalCalories + parseInt(meal.calories);
      setTotalCalories(totalCaloriesCount);
      setSelectedMealId(null);
    }
  };

  const handleMealRemoval = (uniqueId, mealType) => {
    const mealToRemove = selectedMeals[mealType].find(meal => meal.uniqueId === uniqueId);
    setSelectedMeals(prev => ({
      ...prev,
      [mealType]: prev[mealType].filter(meal => meal.uniqueId !== uniqueId)
    }));
    const updatedTotalCalories = totalCalories - parseInt(mealToRemove.calories);
    setTotalCalories(updatedTotalCalories);
  };

  const handleSubmittedMealRemoval = async (meal, mealType) => {
    const today = new Date();
    const todayDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    const user = auth.currentUser;

    try {
      const userRef = doc(db, "users", user.uid);
      const userDetails = await getDoc(userRef);
      const userCalories = userDetails.data().calories || [];
      const existingDate = userCalories.find(data => data.date === todayDate);

      if (existingDate) {
        existingDate.caloryIntake -= parseInt(meal.calories);
        const mealIndex = existingDate.meals.findIndex(item => item.name === meal.name && item.calories === meal.calories && item.mealType === mealType);
        if (mealIndex !== -1) {
          existingDate.meals.splice(mealIndex, 1);
        }

        await setDoc(userRef, {
          ...userDetails.data(),
          calories: userCalories,
        });

        setSubmittedMeals(existingDate.meals);
        setTotalCalories(existingDate.caloryIntake); // Update total calories after deletion
      }
    } catch (err) {
      console.log(err);
    }
  };
const handleSubmit = async () => {
    if (Object.values(selectedMeals).every(mealList => mealList.length === 0)) {
      Alert.alert("No Meals Selected", "Please select the meal before submitting.");
      return;
    }

    const today = new Date();
    const todayDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    const user = auth.currentUser;

    try {
      const userRef = doc(db, "users", user.uid);
      const userDetails = await getDoc(userRef);
      const userCalories = userDetails.data().calories || [];
      const existingDate = userCalories.find(data => data.date === todayDate);

      if (existingDate) {
        const indexDetails = userCalories.findIndex(data => data.date === todayDate);
        userCalories[indexDetails].caloryIntake = totalCalories;

        // Append new meals under the specific date
        for (const mealType of Object.keys(selectedMeals)) {
          for (const meal of selectedMeals[mealType]) {
            userCalories[indexDetails].meals.push({
              name: meal.name,
              calories: meal.calories,
              mealType,
            });
          }
        }
      } else {
        const newEntry = {
          date: todayDate,
          caloryIntake: totalCalories,
          meals: []
        };
        for (const mealType of Object.keys(selectedMeals)) {
          for (const meal of selectedMeals[mealType]) {
            newEntry.meals.push({
              name: meal.name,
              calories: meal.calories,
              mealType,
            });
          }
        }
        userCalories.push(newEntry);
      }

      await setDoc(userRef, {
        ...userDetails.data(),
        calories: userCalories,
      });

      // Update state and show dialog
      setSubmittedMeals(prevMeals => [
        ...prevMeals,
        ...Object.keys(selectedMeals).flatMap(mealType =>
          selectedMeals[mealType].map(meal => ({
            name: meal.name,
            calories: meal.calories,
            mealType
          }))
        )
      ]);
      setDialogVisible(true);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDialogClose = () => {
    setDialogVisible(false);
    setSelectedMeals({});
    setTotalCalories(0);
    updateSubmittedMeals(); // Update total calories and submitted meals on close
    setCurrentPage('submittedMeals');
  };

  const updateSubmittedMeals = async () => {
    const user = auth.currentUser;
    const today = new Date();
    const todayDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

    try {
      const userRef = doc(db, "users", user.uid);
      const userDetails = await getDoc(userRef);
      const userCalories = userDetails.data().calories || [];
      const existingDate = userCalories.find(data => data.date === todayDate);

      if (existingDate) {
        setSubmittedMeals(existingDate.meals);
        setTotalCalories(existingDate.caloryIntake);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleWeightSubmit = async () => {
    const user = auth.currentUser;
    const today = new Date();
    const todayDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    
    try {
      const userRef = doc(db, "users", user.uid);
      const userDetails = await getDoc(userRef);
      const userCalories = userDetails.data().calories || [];
  
      // Check if there is an existing entry for today
      const existingDateIndex = userCalories.findIndex(data => data.date === todayDate);
  
      if (existingDateIndex !== -1) {
        // Update the existing weight entry if necessary
        userCalories[existingDateIndex].weight = parseFloat(weight);
      } else {
        // Add a new entry for today with weight
        const newEntry = {
          date: todayDate,
          caloryIntake: totalCalories,
          meals: [],
          weight: parseFloat(weight),
        };
  
        userCalories.push(newEntry);
      }
  
      // Update the user's calories data with the new weight entry
      await setDoc(userRef, {
        ...userDetails.data(),
        calories: userCalories,
      });
  
      setModalVisible(false);
      setWeight('');
    } catch (err) {
      console.log(err);
    }
  };

  // Other functions...


  const renderMealTypePicker = () => (
    <View style={styles.mealTypeContainer}>
      {Object.keys(mealTypes).map(mealType => (
        <View key={mealType} style={styles.mealTypeButton}>
          <TouchableOpacity onPress={() => setMealTypes({ ...mealTypes, [mealType]: !mealTypes[mealType] })}>
            <Text style={[styles.mealTypeText, mealTypes[mealType] && styles.selectedMealType]}>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  const renderMealPicker = () => (
    <View>
      {Object.keys(mealTypes).map(mealType => (
        mealTypes[mealType] && (
          <View key={mealType} style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedMealId}
              onValueChange={(itemValue) => handleMealSelection(itemValue, mealType)}
              style={styles.picker}
            >
              <Picker.Item label={`Select ${mealType.charAt(0).toUpperCase() + mealType.slice(1)}`} value={null} />
              {meals.map(meal => (
                <Picker.Item key={meal.id} label={`${meal.name} - ${meal.calories} Cal`} value={meal.id} />
              ))}
            </Picker>
            {selectedMeals[mealType] && selectedMeals[mealType].length > 0 && (
              <View style={styles.selectedMealsContainer}>
                {selectedMeals[mealType].map((meal, index) => (
                  <TouchableOpacity key={meal.uniqueId} onPress={() => handleMealRemoval(meal.uniqueId, mealType)}>
                    <Text style={styles.selectedMealText}>{meal.name} - {meal.calories} Cal (Tap to Remove)</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )
      ))}
    </View>
  );

  const renderSubmittedMeals = () => (
    <SectionList
      sections={submittedMeals.reduce((sections, meal) => {
        const existingSection = sections.find(section => section.title === meal.mealType);
        if (existingSection) {
          existingSection.data.push(meal);
        } else {
          sections.push({ title: meal.mealType, data: [meal] });
        }
        return sections;
      }, [])}
      keyExtractor={(item, index) => item.name + index}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => handleSubmittedMealRemoval(item, item.mealType)}>
          <View style={styles.submittedMealItem}>
            <Text style={styles.submittedMealText}>{item.name} - {item.calories} Cal (Remove)</Text>
          </View>
        </TouchableOpacity>
      )}
      renderSectionHeader={({ section: { title } }) => (
        <Text style={styles.submittedMealHeader}>{title.charAt(0).toUpperCase() + title.slice(1)}</Text>
      )}
      contentContainerStyle={styles.submittedMealsContainer}
    />
  );

  const renderContent = () => {
    if (currentPage === 'logMeals') {
      return (
        <>
          {renderMealTypePicker()}
          {renderMealPicker()}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.openModalButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.openModalButtonText}>Enter Weight</Text>
          </TouchableOpacity>
        </>
      );
    } else if (currentPage === 'submittedMeals') {
      return renderSubmittedMeals();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.pageTitle}>Daily Meal Logger</Text>
        <View style={styles.content}>
          {renderContent()}
        </View>
      </View>
      <View style={styles.footer}>
        <View style={styles.navigation}>
          <TouchableOpacity onPress={() => setCurrentPage('logMeals')} style={currentPage === 'logMeals' ? styles.activeTab : styles.inactiveTab}>
            <Text style={currentPage === 'logMeals' ? styles.activeTabText : styles.inactiveTabText}>Log Meals</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setCurrentPage('submittedMeals')} style={currentPage === 'submittedMeals' ? styles.activeTab : styles.inactiveTab}>
            <Text style={currentPage === 'submittedMeals' ? styles.activeTabText : styles.inactiveTabText}>Submitted Meals</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.totalCaloriesContainer}>
          <Text style={styles.totalCaloriesText}>Total Calories:</Text>
          <Text style={[styles.totalCaloriesValue, { color: totalCalories > userMaxCal ? 'red' : 'green' }]}>{totalCalories} / {userMaxCal}</Text>
          <Text style={styles.caloriesText}>Day: {daysSinceRegistration}</Text>
        </View>
      </View>
      <Dialog.Container visible={dialogVisible} onBackdropPress={handleDialogClose}>
        <Dialog.Title>Submission Complete</Dialog.Title>
        <Dialog.Description>
          Meals submitted successfully! You've logged {daysSinceRegistration} days of meals.
        </Dialog.Description>
        <Dialog.Button label="OK" onPress={handleDialogClose} />
      </Dialog.Container>

      {/* Weight Input Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Weight</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Weight in kg"
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleWeightSubmit}>
              <Text style={styles.modalButtonText}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  // Styles...
container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  content: {
    flex: 1,
  },
  footer: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f5f5f5',
    paddingVertical: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#1995AD',
    paddingHorizontal: 20,
  },
  inactiveTab: {
    paddingHorizontal: 20,
  },
  activeTabText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1995AD',
  },
  inactiveTabText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#888',
  },
  mealTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  mealTypeButton: {
    padding: 10,
  },
  mealTypeText: {
    fontSize: 16,
    color: '#1995AD',
  },
  selectedMealType: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  pickerContainer: {
    marginVertical: 10,
    marginHorizontal: 20,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  selectedMealsContainer: {
    marginVertical: 10,
  },
  selectedMealText: {
    fontSize: 14,
    color: '#000',
    paddingVertical: 5,
  },
  submitButton: {
    backgroundColor: '#1995AD',
    padding: 15,
    margin: 20,
    borderRadius: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  totalCaloriesContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  totalCaloriesText: {
    fontSize: 16,
    color: '#000',
  },
  totalCaloriesValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  caloriesText: {
    fontSize: 16,
    color: '#000',
    marginTop: 5,
  },
  submittedMealsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  submittedMealHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  submittedMealItem: {
    paddingVertical: 5,
  },
  submittedMealText: {
    fontSize: 14,
    color: '#000',
  },
  openModalButton: {
    backgroundColor: '#1995AD',
    padding: 15,
    margin: 20,
    borderRadius: 10,
  },
  openModalButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  modalButton: {
    backgroundColor: '#1995AD',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    width: '100%',
  },
  modalButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
});

export default MealLogger;
