import React from 'react';
import styled from 'styled-components';

const NextButton = styled.button`
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
`;

const Caught = React.createClass({

  render() {
    return (
      <div>
        🎉 You caught the monster! 🎉
        <NextButton onClick={this.goNext}>
          Done
        </NextButton>
      </div>
    );
  },
});

export default Caught;
