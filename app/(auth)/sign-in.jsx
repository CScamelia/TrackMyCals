import React, { useState } from 'react';
import { Link, useRouter } from 'expo-router';
import { View, Text, ScrollView, Dimensions, Alert, Image, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { images } from '../../constants';
import { FormField } from '../../components';

import { signInWithEmailAndPassword } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { auth, db } from '../../firebase';

const SignIn = () => {
  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const router = useRouter();

  const handleSignIn = () => {
    const { email, password } = form;
    if (email === '' || password === '') {
      Alert.alert('Error', 'Invalid email or password');
      return;
    }
    setSubmitting(true);
    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredentials) => {
        const user = userCredentials.user;
        console.log('Logged in with:', user.email);
        console.log('Success: User signed in successfully');

        // Check if user data exists in the database
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const requiredFields = ['activity', 'age', 'gender', 'height', 'targetDate', 'targetWeightLoss','weight'];

          // Check if all required fields are present
          const hasAllData = requiredFields.every(field => userData.hasOwnProperty(field));
          if (hasAllData) {
            // User has all required data, navigate to meal page
            router.replace('/meal');
          } else {
            // Missing some data, navigate to profile page
            router.replace('/profile');
          }
        } else {
          // First-time user, navigate to profile page
          router.replace('/profile');
        }
      })
      .catch((error) => {
        console.log('Error:', error.message);
        Alert.alert('Error', error.message);
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <SafeAreaView style={{ backgroundColor: '#A1D6E2', flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          <Image
            source={images.logo}
            resizeMode='contain'
            style={styles.logo}
          />

          <Text style={styles.title}>Log in to TrackMyCals</Text>

          <View style={styles.formContainer}>
            <FormField
              title='Email'
              value={form.email}
              handleChangeText={(e) => setForm({ ...form, email: e })}
              otherStyles={{ marginTop: 28 }}
              keyboardType='email-address'
            />

            <FormField
              title='Password'
              value={form.password}
              handleChangeText={(e) => setForm({ ...form, password: e })}
              otherStyles={{ marginTop: 28 }}
              secureTextEntry
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={() => handleSignIn()}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'center', paddingTop: 20 }}>
            <Text style={{ fontSize: 18, color: 'gray', fontFamily: 'System' }}>
              Don't have an account?
            </Text>
            <Link
              href='/sign-up'
              style={{ fontSize: 18, fontWeight: '600', color: '#1995AD' }}
            >
              Sign Up
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 24,
    minHeight: Dimensions.get('window').height - 100,
  },
  logo: {
    width: 140,
    height: 90,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 40,
    fontFamily: 'System',
  },
  formContainer: {
    width: '100%',
    paddingHorizontal: 16,
  },
  buttonContainer: {
    marginTop: 28,
  },
  button: {
    backgroundColor: '#1995AD',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#F1F1F2',
    fontSize: 16,
  },
});

export default SignIn;
