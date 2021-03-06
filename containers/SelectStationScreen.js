import React, { useState, useEffect, useCallback } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { AppLoading } from 'expo';
import { useFonts } from '@use-expo/font';

import { selectedStation } from '../actions/index';
import { receiveNearStation } from '../api/seoulAPI';
import { getAddress } from '../api/geocodingAPI';

import SelectStation from '../components/SelectStationDetail';
import AlertError from '../components/AlertError';

export default function SelectStationScreen ({ navigation }) {
  const dispatch = useDispatch();

  const longitude = useSelector(state => state.location.longitude);
  const latitude = useSelector(state => state.location.latitude);

  const [ currentLocation, setCurrentLocation ] = useState('');
  const [ stationList, setStationList ] = useState(null);
  const [ station, setStation ] = useState(null);
  const [ error, setError ] = useState(false);

  useEffect(() => {
    return navigation.addListener('focus', async () => {
      try {
        const stations = await receiveNearStation(longitude, latitude);
        const address = await getAddress(longitude, latitude);

        setCurrentLocation(address);
        setStationList(stations);
      } catch (error) {
        setError(true);
      }
    })
  }, [navigation])

  const onbuttonPress = useCallback(() => {
    dispatch(selectedStation(station));
    navigation.navigate('SelectTrain');
  }, [station])

  const [ fontsLoaded ] = useFonts({
    'silkscreen': require('../assets/fonts/silkscreen.ttf'),
    'dunggeunmo': require('../assets/fonts/DungGeunMo.ttf')
  });

  if (fontsLoaded) {
    return (
      <View style={styles.container}>
        {
          !stationList
          ? error
           ? <AlertError navigation={navigation} />
           : <Image
              style={styles.loading}
              source={require('../assets/images/loading.gif')}
            />
          : <SelectStation
            currentLocation={currentLocation}
            stationList={stationList}
            setStation={setStation}
            onbuttonPress={onbuttonPress}
          />
        }
      </View>
    );
  } else {
    return <AppLoading />
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    backgroundColor: 'white'
  },
  loading: {
    marginTop: '10%',
    width: '50%',
    height: '30%',
  }
});
