// components/ImageSlider.jsx
import React from 'react';
import { View, Image, StyleSheet, ScrollView } from 'react-native';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';

const images = [


    require('../assets/images/slide1.png'),
    require('../assets/images/slide2.png'),
    require('../assets/images/slide3.png'),
    // require('../assets/images/slide4.png'),
    // require('../assets/images/slide5.png'),
];

export default function ImageSlider() {
  return (
    <ScrollView horizontal pagingEnabled>
      {images.map((image, index) => (
        <Image key={index} source={image} style={styles.image} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({

    itemContainer: {
            width: wp(100) - wp(30),
            height: hp(25),
          },
          imageContainer: {
            borderRadius: 30,
            flex: 1,
          },


  image: {
    width: wp(90),
    height: hp(30),
    resizeMode: 'contain',
    marginHorizontal: wp(5),
  },
  slide: {
        display: 'flex',
        alignItems: 'center',
      },

});
