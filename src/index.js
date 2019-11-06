import React, { Component } from 'react';
import {
  Modal,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  PanResponder,
  View,
} from 'react-native';
import PropTypes from 'prop-types';
import styles from './styles';

const { height } = Dimensions.get('window');

export default class BottomUpPanel extends Component {

  bounceValue = new Animated.Value(height);

  constructor(props) {
    super(props);
    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gesture) => {
        this.bounceValue.setValue(gesture.moveY);
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.moveY >= height / 1.7) {
          this.closeView();
        } else {
          this.showContent();
        }
      },
    });

    this.state = {
      panResponder,
    };

    this.showContent = this.showContent.bind(this);
  }

  showContent(toValue): void {
    Animated.spring(
      this.bounceValue,
      {
        toValue: toValue || this.props.shadowHeight || 100,
        velocity: 8,
        tension: 12,
        friction: 8,
      },
    ).start();
  }

  closeView(): void {
    Animated.timing(
      this.bounceValue,
      {
        toValue: height,
        duration: 200,
      },
    ).start(() => {
      this.props.closeModal();
    });
  }

  render() {
    const color = this.bounceValue.interpolate({
      inputRange: [this.props.shadowHeight, height],
      outputRange: [`rgba(0, 0, 0, ${this.props.maxOpacity})`, `rgba(0, 0, 0, ${this.props.minOpacity})`],
    });

    return (
      <Modal
        animationType="fade"
        transparent
        onShow={() => this.showContent(this.props.shadowHeight)}
        visible={this.props.isVisible}
        onRequestClose={() => {
          this.closeView();
        }}
      >
        <TouchableWithoutFeedback onPress={() => this.closeView()}>
          <Animated.View
            style={{
              flex: 1,
              backgroundColor: color,
            }}
          >
            <Animated.View
              onStartShouldSetResponder={() => true}
              style={[
                { height : height - this.props.shadowHeight},
                { transform: [{ translateY: this.bounceValue }] },
              ]}
            >
              {this.props.closingGesture &&
              <View
                style={{
                  height: 50,
                  paddingTop: 5,
                  backgroundColor: 'transparent',
                  marginBottom: -25,
                  zIndex: 999,
                }}
                {...this.state.panResponder.panHandlers}
              >
                <View style={styles.barStyle} />
              </View>}
              {this.props.children}
            </Animated.View>
          </Animated.View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  }
}

BottomUpPanel.propTypes = {
  shadowHeight: PropTypes.number.isRequired,
  minOpacity: PropTypes.number,
  maxOpacity: PropTypes.number,
  isVisible: PropTypes.bool.isRequired,
  children: PropTypes.arrayOf(React.Component).isRequired,
  getRef: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  closingGesture: PropTypes.bool,
};
BottomUpPanel.defaultProps = {
  shadowHeight: 100,
  minOpacity: 0.1,
  maxOpacity: 0.82,
  closingGesture: false,
};
