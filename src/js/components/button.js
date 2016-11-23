import styled from 'styled-components';

export default styled.button`
  background: none;
  border: 0;
  color: inherit;
  font: inherit;
  line-height: normal;
  overflow: visible;
  padding: 0;
  user-select: none;

  &::-moz-focus-inner {
    border: 0;
    padding: 0;
  }

  &:focus {
    outline: none;
  }

  &:hover {
    cursor: pointer;
  }
`;
