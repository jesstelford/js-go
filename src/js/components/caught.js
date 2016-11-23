import React from 'react';
import styled, {ThemeProvider} from 'styled-components';
import {StaggeredMotion, spring} from 'react-motion';
import InfoOverlay from './info-overlay';
import Button from './button';
import {tada} from '../animations';

const MonsterName = styled.strong`
  position: relative;
  border: 2px solid ${props => props.theme.type.colour};
  border-radius: 0.5em;
  padding: 0.2em 1.4em 0.2em 0.4em;
  font-size: 0.9em;
  color: ${props => props.theme.type.colour};
  font-weight: bold;
  font-style: normal;

  &::after {
    position: absolute;
    border-radius: 0.5em;
    display: inline-block;
    content: '';
    width: 1em;
    height: 1em;
    background-color: ${props => props.theme.type.colour};
    top: 50%;
    right: 0.2em;
    transform: translateY(-50%);
  }
`;

MonsterName.defaultProps = {
  theme: {
    type: {
      colour: 'black',
    },
  },
};

const TopRow = styled.div`
  flex-grow: 1; /* Fill available space */
`;

const NextButton = styled(Button)`
  padding: 0.5em;
  border: 1px solid black;
  border-radius: 100%;
  opacity: ${props => props.opacity}
`;

NextButton.defaultProps = {
  opacity: 1,
};

const Stats = styled.div`
  display: flex;
  flex-direction: row;
  margin: 0 20px;
  border: 1px solid silver;
  border-radius: 5px;
`;

const Stat = styled.p`
  display: flex;
  flex: 1 1 0;
  justify-content: center;
  opacity: ${props => props.opacity};

  & + & {
    border-left: 1px solid silver;
  }
`;

Stat.defaultProps = {
  opacity: 1,
};

const InfoLine = styled.p`
  opacity: ${props => props.opacity}
`;

InfoLine.defaultProps = {
  opacity: 1,
};

const LogoAnimation = styled.div`
  animation: ${tada};
  animation-duration: 1s;
  animation-fill-mode: both;
`;


const springStiffness = 100;
const springDamping = 50;

const Caught = React.createClass({

  propTypes: {
    name: React.PropTypes.string.isRequired,
    stats: React.PropTypes.shape({
      hp: React.PropTypes.number.isRequired,
      defence: React.PropTypes.number.isRequired,
      attack: React.PropTypes.number.isRequired,
    }).isRequired,
    onDone: React.PropTypes.func.isRequired,
    type: React.PropTypes.shape({
      name: React.PropTypes.string.isRequired,
      colour: React.PropTypes.string,
    }).isRequired,
    transitionOut: React.PropTypes.func,
    transitionIn: React.PropTypes.func,
  },

  render() {
    return (
      <ThemeProvider theme={{type: this.props.type}}>
        <StaggeredMotion
          defaultStyles={[
            // Starting opaciity
            {opacity: 0},
            {opacity: 0},
            {opacity: 0},
            {opacity: 0},
            {opacity: 0},
          ]}
          styles={prevInterpolatedStyles => prevInterpolatedStyles.map((_, i) => {

            if (i === 0) {
              // Opacity of the leading item
              return {
                opacity: spring(
                  1,
                  {
                    stiffness: springStiffness,
                    damping: springDamping,
                  }
                ),
              };
            }

            // Following items base opacity on previous items
            return {
              opacity: spring(
                // Only start fading in once the previous one is at least half
                // visible
                prevInterpolatedStyles[i - 1].opacity < 0.3 ? 0 : 1,
                {
                  stiffness: springStiffness,
                  damping: springDamping,
                }
              ),
            };

          })}
        >
          {nextStyles => {
            return (

            <InfoOverlay
              logo={<LogoAnimation>🎉</LogoAnimation>}
              transitionIn={this.props.transitionIn}
              transitionOut={this.props.transitionOut}
            >
              <TopRow>
                <InfoLine opacity={nextStyles[0].opacity}>
                  You caught <MonsterName>{this.props.name}</MonsterName>
                </InfoLine>
                <InfoLine opacity={nextStyles[1].opacity}>
                  Type: <em>{this.props.type.name}</em>
                </InfoLine>
                <Stats>
                  <Stat opacity={nextStyles[2].opacity}>HP<br />{this.props.stats.hp}</Stat>
                  <Stat opacity={nextStyles[3].opacity}>Attack<br />{this.props.stats.attack}</Stat>
                  <Stat opacity={nextStyles[4].opacity}>Defence<br />{this.props.stats.defence}</Stat>
                </Stats>
              </TopRow>
              <div>
                <NextButton opacity={nextStyles[0].opacity} onClick={this.props.onDone}>
                  ✔️
                </NextButton>
              </div>
            </InfoOverlay>

          )}}
        </StaggeredMotion>

      </ThemeProvider>
    );
  },
});

export default Caught;
