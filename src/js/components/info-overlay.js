import React from 'react';
import styled from 'styled-components';

const shadowRadius = 10;
const boxShadow = `0px 0px ${shadowRadius}px 0px rgba(0,0,0,0.5)`;

const logoRadius = 45;
const logoDiameter = logoRadius * 2;

const Container = styled.div`
  min-height: 100%;
  display: flex;
  flex-direction: column;
  text-align: center;
  font-size: 1.5em;
  background-color: papayawhip;
`;

const InnerContainer = styled.section`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  position: relative;
  margin: ${logoRadius + 10}px 10px 10px 10px;
  border-radius: 5px;
  box-shadow: ${boxShadow};
  padding: ${logoRadius + 10}px 10px 10px 10px;
  background-color: white;
`;

const Logo = styled.div`
  position: absolute;
  left: 50%;
  bottom: 100%;
  transform: translateX(-50%);
  border-radius: ${logoDiameter}px ${logoDiameter}px 0 0;
  width: ${logoDiameter}px;
  height: ${logoRadius}px;
  background-color: inherit;
  box-shadow: ${boxShadow};
  text-align: center;
  line-height: ${logoDiameter}px;
  font-size: ${logoRadius}px;

  &::before {
    z-index: -1;
    content: '';
    position: absolute;
    background-color: inherit;
    width: 90px;
    height: ${shadowRadius}px;
    bottom: -${shadowRadius}px;
    left: 0;
  }
`;

const InfoOverlay = React.createClass({

  propTypes: {
    children: React.PropTypes.node.isRequired,
    logo: React.PropTypes.node,
  },

  getDefaultProps() {
    return {
      logo: 'ℹ️',
    };
  },

  render() {
    return (
      <Container>
        <InnerContainer>
          <Logo>{this.props.logo}</Logo>
          {this.props.children}
        </InnerContainer>
      </Container>
    );
  },
});

export default InfoOverlay;
