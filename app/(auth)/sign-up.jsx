import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Alert, SafeAreaView, Dimensions } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { images } from '../../constants';
import { FormField } from '../../components';
import { auth, db } from '../../firebase';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const SignUp = () => {
  const router = useRouter();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const handleSignUp = () => {
    const { email, password } = form;
    if (email === '' || password === '') {
      Alert.alert('Error', 'Email and password cannot be empty');
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then(async userCredentials => {
        const user = userCredentials.user;
        await setDoc(doc(db, "users", userCredentials.user?.uid), {
          activity: '',
          age: '',
          gender: '',
          height: '',
          weight: '',
          calories: []
        });
        console.log('Sign Up with:', user.email);
        signOut(auth)
          .then(() => {
            Alert.alert("Success", "User signed up successfully");
            router.replace('/sign-in');
          })
          .catch(error => console.log(error));
      })
      .catch((error) => alert(error.message));
  };

  return (
    <SafeAreaView style={{ backgroundColor: '#A1D6E2', flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          <Image source={images.logo} resizeMode='contain' style={styles.logo} />

          <Text style={styles.title}>Sign Up to TrackMyCals</Text>

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
              <TouchableOpacity onPress={handleSignUp} style={styles.button}>
                <Text style={styles.buttonText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'center', paddingTop: 20 }}>
            <Text style={{ fontSize: 18, color: 'gray', fontFamily: 'System' }}>
              Have an account already?
            </Text>
            <Link href='/sign-in' style={{ fontSize: 18, fontWeight: '600', color: '#1995AD' }}>
              Sign In
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

export default SignUp;
