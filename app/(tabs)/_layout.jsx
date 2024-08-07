import {  Text, View,Image } from 'react-native'
import { Tabs, Redirect } from 'expo-router'
import {icons} from '../../constants';
import { auth } from '../../firebase';




const TabIcon = ({ icon, color, name, focused }) => {
  return (
    <View className="flex items-center justify-center gap-2">
      <Image
        source={icon}
        resizeMode="contain"
        tintColor={color}
        className="w-6 h-6"
      />
      <Text
        className={`${focused ? "font-psemibold" : "font-pregular"} text-xs`}
        style={{ color: color }}
      >
        {name}
      </Text>
    </View>
  );
};

const TabLayout = () => {
  // const { loading, isLogged } = useGlobalContext();
  const loading = false;
  const isLogged = false;
  const userDetails = auth.currentUser;

  if (!loading && !userDetails) return <Redirect href="/sign-in" />;

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#A1D6E2",
          tabBarInactiveTintColor: "#F1F1F2",
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: "#1995AD",
            borderTopWidth: 1,
            borderTopColor: "#A1D6E2",
            height: 84,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.home}
                color={color}
                name="Home"
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="meal"
          options={{
            title: "meal",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.meal}
                color={color}
                name="Log Meals"
                focused={focused}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="progress"
          options={{
            title: "Progress",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.chart}
                color={color}
                name="Chart"
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="workout"
          options={{
            title: "workout",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.barbell}
                color={color}
                name="Workout"
                focused={focused}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.profile}
                color={color}
                name="Profile"
                focused={focused}
              />
            ),
          }}
        />
      </Tabs>

      {/* <Loader isLoading={loading} /> */}
      {/* <StatusBar backgroundColor="#161622" style="light" /> */}
    </>
  );
};

export default TabLayout;

