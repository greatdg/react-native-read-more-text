import React from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default class ReadMore extends React.Component {
  state = {
    measured: false,
    shouldShowReadMore: false,
    showAllText: false,
  }

  async componentDidMount() {
    await nextFrameAsync();

    // Get the height of the text with no restriction on number of lines
    const fullHeight = await measureHeightAsync(this._text);
    this.setState({measured: true});
    await nextFrameAsync();

    // Get the height of the text now that number of lines has been set
    const limitedHeight = await measureHeightAsync(this._text);

    if (fullHeight > limitedHeight) {
      this.setState({shouldShowReadMore: true}, () => {
        this.props.onReady && this.props.onReady();
      });
    }
  }

  render() {
    let {
      measured,
      showAllText,
      shouldShowReadMore,
    } = this.state;

    let {
      numberOfLines,
    } = this.props;

    return (
      <View
        style={{
          opacity: !measured && !shouldShowReadMore ? 0 : 1,
        }}
      >
        <Text
          numberOfLines={measured && !showAllText ? numberOfLines : 0}
          ref={text => { this._text = text; }}
          onPress={this._handlePressReadToggle}
        >
          {this.props.children}
        </Text>

        {this._maybeRenderReadMore()}
      </View>
    );
  }

	_handlePressReadToggle = () => {
		let {
      showAllText,
    } = this.state;

    this.setState({showAllText: !showAllText});
  }


  _handlePressReadMore = () => {
    this.setState({showAllText: true});
  }

  _handlePressReadLess = () => {
    this.setState({showAllText: false});
  }

  _maybeRenderReadMore() {
    let {
      shouldShowReadMore,
      showAllText,
    } = this.state;

		let {
			truncatedStyle,
			revealedStyle,
		} = this.props;

    if (shouldShowReadMore && !showAllText) {
      if (this.props.renderTruncatedFooter) {
        return this.props.renderTruncatedFooter(this._handlePressReadMore);
      }

      return (
        <Text style={[styles.button, truncatedStyle]} onPress={this._handlePressReadMore}>
          Read more
        </Text>
      )
    } else if (shouldShowReadMore && showAllText) {
      if (this.props.renderRevealedFooter) {
        return this.props.renderRevealedFooter(this._handlePressReadLess);
      }

      return (
        <Text style={[styles.button, revealedStyle]} onPress={this._handlePressReadLess}>
          Hide
        </Text>
      );
    }
  }
}

function measureHeightAsync(component) {
  return new Promise(resolve => {
    component.measure((x, y, w, h) => {
      resolve(h);
    });
  });
}

function nextFrameAsync() {
  return new Promise(resolve => requestAnimationFrame(() => resolve()));
}

const styles = StyleSheet.create({
  button: {
    color: '#888',
    marginTop: 7,
  },
});

ReadMore.defaultProps = {
  truncatedStyle: {},
  revealedStyle: {},
};
