



// import React from 'react';
// import { StyleSheet, Platform, Text, View, SafeAreaView, TouchableOpacity, Image } from 'react-native';
// import { StatusBar } from 'expo-status-bar';
// import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
// import ImageSlider from '../../components/ImageSlider';
// import { useRouter } from 'expo-router';

// // Import local images
// import menImage from '../../assets/images/cardio.png';
// import womenImage from '../../assets/images/women.png';

// export default function Guided() {
//   const router = useRouter();

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <StatusBar style="dark" />
//       <View style={styles.headerContainer}>
//         <View style={{ marginVertical: hp(2) }}>
//           <Text style={{ fontSize: hp(4.5), color: 'white' }}>READY TO</Text>
//           <Text style={{ fontSize: hp(4.5), fontWeight: 'bold', letterSpacing: 1, color: 'red' }}>WORKOUT</Text>
//         </View>
//       </View>
//       <View>
//         <ImageSlider />
//       </View>
//       <View style={styles.container}>
//         <View style={styles.workoutSection}>
//           <Text style={styles.text}>Men's Workout</Text>
//           <TouchableOpacity
//             style={styles.box}
//             onPress={() => router.push('/MenWorkout')} // Use router.push for navigation
//           >
//             <Image style={styles.image} source={menImage} />
//           </TouchableOpacity>
//         </View>
//         <View style={styles.workoutSection}>
//           <Text style={styles.text}>Women's Workout</Text>
//           <TouchableOpacity
//             style={styles.box}
//             onPress={() => router.push('/WomenWorkout')} // Use router.push for navigation
//           >
//             <Image style={styles.image} source={womenImage} />
//           </TouchableOpacity>
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: "#161622",
//     paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
//   },
//   headerContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginHorizontal: wp(5),
//   },
//   container: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginHorizontal: wp(5),
//     marginTop: hp(3),
//   },
//   workoutSection: {
//     alignItems: 'center',
//     marginBottom: hp(3), // Added spacing between sections
//   },
//   box: {
//     width: wp(80),
//     height: hp(20),
//     backgroundColor: 'white',
//     borderRadius: 10,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   image: {
//     width: '100%',
//     height: '100%',
//     borderRadius: 10,
//   },
//   text: {
//     fontSize: hp(2.5),
//     color: 'white',
//     fontWeight: 'bold',
//     marginBottom: hp(1),
//   },
// });

import React from 'react';
import { StyleSheet, Platform, Text, View, SafeAreaView, TouchableOpacity, Image, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router'; // Import useRouter for navigation
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import ImageSlider from '../../components/ImageSlider';

// Import local images
import menImage from '../../assets/images/cardio.png';
import womenImage from '../../assets/images/women.png';

const WorkoutImage = ({ source, style }) => (
  <Image style={style} source={source} />
);

export default function Guided() {
  const router = useRouter(); // Initialize the router

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.headerContainer}>
        <View style={{ marginVertical: hp(2) }}>
          <Text style={{ fontSize: hp(4.5), color: 'white' }}>READY TO</Text>
          <Text style={{ fontSize: hp(4.5), fontWeight: 'bold', letterSpacing: 1, color: 'gray' }}>WORKOUT</Text>
        </View>
      </View>
      <View>
        <ImageSlider />
      </View>
      <ScrollView>
      <View style={styles.container}>
        <View style={styles.workoutSection}>
          <WorkoutImage source={menImage} style={styles.image} />
          <TouchableOpacity
            style={styles.transparentBox}
            onPress={() => router.push('/MenWorkout')}
          >
            <Text style={styles.text}>Men's Workout</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.workoutSection}>
          <WorkoutImage source={womenImage} style={styles.image} />
          <TouchableOpacity
            style={styles.transparentBox}
            onPress={() => router.push('/WomenWorkout')}
          >
            <Text style={styles.text}>Women's Workout</Text>
          </TouchableOpacity>
        </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#A1D6E2",
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: wp(5),
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: wp(5),
    marginTop: hp(3),
  },
  workoutSection: {
    alignItems: 'center',
    marginBottom: hp(3), // Added spacing between sections
  },
  box: {
    width: wp(80),
    height: hp(20),
    backgroundColor: 'black',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transparentBox: {
    backgroundColor: 'transparent',
    padding: 10,
  },
  image: {
    width: wp(80),
    height: hp(20),
    borderRadius: 10,
    marginBottom: hp(1),
  },
  text: {
    fontSize: hp(2.5),
    color: 'black',
    fontWeight: 'bold',
  },
});
