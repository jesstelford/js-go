import {keyframes} from 'styled-components';

// From https://github.com/daneden/animate.css
// eslint-disable-next-line import/prefer-default-export
export const tada = keyframes`
  from {
    transform: scale3d(1, 1, 1);
  }

  10%, 20% {
    transform: scale3d(.9, .9, .9) rotate3d(0, 0, 1, -3deg);
  }

  30%, 50%, 70%, 90% {
    transform: scale3d(1.3, 1.3, 1.3) rotate3d(0, 0, 1, 3deg);
  }

  40%, 60%, 80% {
    transform: scale3d(1.3, 1.3, 1.3) rotate3d(0, 0, 1, -3deg);
  }

  to {
    transform: scale3d(1, 1, 1);
  }
`;
