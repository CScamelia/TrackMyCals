import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, SafeAreaView, Image } from "react-native";
import { Picker } from '@react-native-picker/picker';
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { signOut } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const Profile = () => {
  const today = new Date();
  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  const formattedTodayDate = formatDate(today);

  const [form, setForm] = useState({
    age: "",
    gender: "",
    height: "",
    weight: "",
    activity: "",
    targetWeightLoss: "",
    targetWeeks: "",
  });

  const [isFirstTimeUser, setIsFirstTimeUser] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            setForm({
              ...userData,
            });

            const requiredFields = ["age", "gender", "height", "weight", "activity", "targetWeightLoss", "targetWeeks"];
            const isFirstTime = requiredFields.some(field => !userData[field]);
            setIsFirstTimeUser(isFirstTime);

            if (!isFirstTime) {
              router.replace('/meal');
            }
          } else {
            console.log("No such document!");
          }
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
        Alert.alert("Error", "Failed to fetch user data.");
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const calculateBMI = () => {
    const { height, weight } = form;
    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);
    if (heightNum && weightNum) {
      const heightInMeters = heightNum / 100;
      const bmi = weightNum / (heightInMeters * heightInMeters);
      return bmi.toFixed(2);
    }
    return "";
  };

  const calculateBMR = () => {
    const { age, gender, height, weight } = form;
    const ageNum = parseInt(age, 10);
    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);
    if (ageNum && gender && heightNum && weightNum) {
      if (gender.toLowerCase() === "male") {
        return 10 * weightNum + 6.25 * heightNum - 5 * ageNum + 5;
      } else if (gender.toLowerCase() === "female") {
        return 10 * weightNum + 6.25 * heightNum - 5 * ageNum - 161;
      }
    }
    return "";
  };

  const calculateCalories = () => {
    const bmr = calculateBMR();
    if (bmr) {
      const { activity } = form;
      let activityFactor = 1.2;

      switch (activity.toLowerCase()) {
        case "light":
          activityFactor = 1.375;
          break;
        case "moderate":
          activityFactor = 1.55;
          break;
        case "active":
          activityFactor = 1.725;
          break;
        case "very active":
          activityFactor = 1.9;
          break;
      }

      return (bmr * activityFactor).toFixed(2);
    }
    return "";
  };

  const calculateDailyCalorieIntake = () => {
    const { targetWeightLoss, targetWeeks } = form;
    const weightToLose = parseFloat(targetWeightLoss);
    const weeksToAchieve = parseInt(targetWeeks, 10);

    if (weightToLose > 0 && weeksToAchieve > 0) {
      const caloriesPerKg = 7700;
      const totalCaloricDeficit = weightToLose * caloriesPerKg;
      const dailyCaloricDeficit = totalCaloricDeficit / (weeksToAchieve * 7);
      const dailyCalorieIntake = calculateCalories() - dailyCaloricDeficit;
      return dailyCalorieIntake > 0 ? dailyCalorieIntake.toFixed(2) : 0;
    }
    return "";
  };

  const handleSubmit = async () => {
    const bmi = calculateBMI();
    const dailyCalories = calculateDailyCalorieIntake();
    if (bmi && dailyCalories) {
      try {
        const user = auth.currentUser;
        if (user) {
          const userRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userRef);
          let regDate = userDoc.exists() && userDoc.data().regDate ? userDoc.data().regDate : formatDate(today);
          await setDoc(userRef, {
            ...form,
            max_calories_per_day: dailyCalories,
            regDate
          });
          Alert.alert("Success", `Profile updated successfully.\nBMI: ${bmi}\nDaily Calorie Intake (Cal): ${dailyCalories}`);
          setIsEditing(false);
          setIsFirstTimeUser(false);
        } else {
          Alert.alert("Error", "No user is signed in.");
        }
      } catch (error) {
        Alert.alert("Error", error.message);
      }
    } else {
      Alert.alert("Error", "Please fill in all fields correctly.");
    }
  };

  const handleUpdate = () => {
    setIsEditing(true);
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log('User signed out');
        router.replace('/sign-in');
      })
      .catch((error) => {
        console.log('Error signing out:', error.message);
        Alert.alert('Error', 'Failed to sign out. Please try again.');
      });
  };

  const handleHistory = () => {
    router.push('/UserHistory');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Profile</Text>
          <View style={styles.iconContainer}>
            <TouchableOpacity onPress={handleHistory} style={styles.iconButton}>
              <Ionicons name="time-outline" size={32} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.iconButton}>
              <Ionicons name="log-out-outline" size={32} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollView}>
          {isFirstTimeUser || isEditing ? (
            <>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={styles.input}
                placeholder="Age"
                placeholderTextColor="white"
                keyboardType="numeric"
                value={form.age}
                onChangeText={(value) => handleInputChange("age", value)}
              />

              <Text style={styles.label}>Gender</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={form.gender}
                  onValueChange={(value) => handleInputChange("gender", value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Gender" value="" />
                  <Picker.Item label="Male" value="male" />
                  <Picker.Item label="Female" value="female" />
                </Picker>
              </View>

              <Text style={styles.label}>Height (cm)</Text>
              <TextInput
                style={styles.input}
                placeholder="Height (cm)"
                placeholderTextColor="white"
                keyboardType="numeric"
                value={form.height}
                onChangeText={(value) => handleInputChange("height", value)}
              />

              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="Weight (kg)"
                placeholderTextColor="white"
                keyboardType="numeric"
                value={form.weight}
                onChangeText={(value) => handleInputChange("weight", value)}
              />

              <Text style={styles.label}>Activity Level</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={form.activity}
                  onValueChange={(value) => handleInputChange("activity", value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Activity Level" value="" />
                  <Picker.Item label="Sedentary : little or no exercise" value="sedentary" />
                  <Picker.Item label="Light: exercise 1-3 times/week " value="light" />
                  <Picker.Item label="Moderate: exercise 4-5 times/week" value="moderate" />
                  <Picker.Item label="Active: daily exercise or intense exercise 3-4 times/ week" value="active" />
                  <Picker.Item label="Very Active: intense exercise 6-7 times/week" value="very active" />
                </Picker>
              </View>

              <Text style={styles.label}>Target Weight Loss (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="Target Weight Loss (kg)"
                placeholderTextColor="white"
                keyboardType="numeric"
                value={form.targetWeightLoss}
                onChangeText={(value) => handleInputChange("targetWeightLoss", value)}
              />

              <Text style={styles.label}>Target Weeks</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={form.targetWeeks}
                  onValueChange={(value) => handleInputChange("targetWeeks", value)}
                  style={styles.picker}
                >
                  {[...Array(24)].map((_, i) => (
                    <Picker.Item key={i + 1} label={`${i + 1} weeks`} value={`${i + 1}`} />
                  ))}
                </Picker>
              </View>

              <TouchableOpacity onPress={handleSubmit} style={styles.button}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Image
                source={
                  form.gender.toLowerCase() === "female"
                    ? require("../../assets/icons/femalepic.png")
                    : require("../../assets/icons/malepic.png")
                }
                style={styles.iconImage}
              />
              <Text style={styles.profileText}>Age: {form.age}</Text>
              <Text style={styles.profileText}>Gender: {form.gender}</Text>
              <Text style={styles.profileText}>Height: {form.height} cm</Text>
              <Text style={styles.profileText}>Weight: {form.weight} kg</Text>
              <Text style={styles.profileText}>Activity Level: {form.activity}</Text>
              <Text style={styles.profileText}>Target Weight Loss: {form.targetWeightLoss} kg</Text>
              <Text style={styles.profileText}>Target Period: {form.targetWeeks} weeks</Text>
              <Text style={styles.profileText}>BMI: {calculateBMI()}</Text>
              <Text style={styles.profileText}>Daily Calorie Intake Estimation: {calculateDailyCalorieIntake()}</Text>
              <TouchableOpacity onPress={handleUpdate} style={styles.button}>
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#A1D6E2",
  },
  container: {
    flex: 1,
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 80,
    marginTop: 20,
  },
  iconContainer: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  scrollView: {
    flexGrow: 1,
  },
  label: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    marginTop: 15,
  },
  input: {
    backgroundColor: "#1995AD",
    padding: 12,
    borderRadius: 8,
    color: "white",
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#F1F1F2",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "black",
    fontWeight: "bold",
  },
  profileText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  pickerContainer: {
    backgroundColor: "#1995AD",
    borderRadius: 8,
    marginBottom: 12,
  },
  picker: {
    color: "white",
  },
  iconImage: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 10,
    
  },
});

export default Profile;
