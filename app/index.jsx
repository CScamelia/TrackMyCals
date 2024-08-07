import { StatusBar } from "expo-status-bar";
import { Redirect, router } from "expo-router";
import { View, Text, Image, ScrollView, SafeAreaView } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";

import { images } from "../constants";
import { CustomButton, Loader } from "../components";
// import { useGlobalContext } from "../context/GlobalProvider";

const Welcome = () => {
  // const { loading, isLogged } = useGlobalContext();
  const loading = false;
  const isLogged = false;

  if (!loading && isLogged) return <Redirect href="/home" />;

  return (
    <SafeAreaView className="bg-[#A1D6E2] h-full">
      <Loader isLoading={loading} />

      <ScrollView
        contentContainerStyle={{
          height: "100%",
        }}
      >
        <View className="w-full flex justify-center items-center h-full px-4">
          <Image
            source={images.logo}
            className="w-[200px] h-[120px]"
            resizeMode="contain"
          />

          <Image
            source={images.cards}
            className="max-w-[380px] w-full h-[298px]"
            resizeMode="contain"
          />

          <View className="relative mt-5">
            <Text className="text-3xl text-white font-bold text-center">
              Track your daily {"\n"}
              Calorie intake with{" "}
              <Text className="text-secondary-200">TrackMyCals</Text>
            </Text>

            <Image
              source={images.path}
              className="w-[136px] h-[15px] absolute -bottom-2 -right-8"
              resizeMode="contain"
            />
          </View>

          {/* <Text className="text-sm font-pregular text-white-100 mt-7 text-center">
            Simple, accurate calorie tracking at your fingertips with TrackMyCals
          </Text> */}

          <CustomButton
            title="Continue with Email"
            handlePress={() => router.push("sign-in")}
            containerStyles="w-full  bg-[#1995AD]  mt-7"
            textStyles={{ color: 'white' }} 
          />
        </View>
      </ScrollView>

      <StatusBar backgroundColor="#A1D6E2" style="light" />
    </SafeAreaView>
  );
};

export default Welcome;
