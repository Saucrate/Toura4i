import React from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';

const CustomSlider = ({ value, maximumValue, onSlidingComplete }) => {
  const position = new Animated.Value(value);
  const width = maximumValue > 0 ? (value / maximumValue) * 100 : 0;

  const handleGesture = (event) => {
    const { translationX } = event.nativeEvent;
    const newValue = Math.max(0, Math.min(translationX, maximumValue));
    position.setValue(newValue);
  };

  const handleGestureEnd = () => {
    const currentValue = position._value;
    onSlidingComplete(currentValue);
  };

  return (
    <View style={styles.container}>
      <PanGestureHandler
        onGestureEvent={handleGesture}
        onEnded={handleGestureEnd}
      >
        <Animated.View style={styles.track}>
          <Animated.View
            style={[styles.fill, { width: `${width}%` }]}
          />
          <Animated.View
            style={[
              styles.thumb,
              {
                transform: [
                  {
                    translateX: position,
                  },
                ],
              },
            ]}
          />
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 40,
    justifyContent: 'center',
  },
  track: {
    height: 4,
    backgroundColor: 'rgba(242, 242, 211, 0.3)',
    borderRadius: 2,
  },
  fill: {
    height: '100%',
    backgroundColor: '#f2f2d3',
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    width: 16,
    height: 16,
    backgroundColor: '#f2f2d3',
    borderRadius: 8,
    top: -6,
  },
});

export default CustomSlider; 