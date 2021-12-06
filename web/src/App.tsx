import { useState } from 'react';
import { useNuiEvent } from './hooks/useNuiEvent';
import { useExitListener } from './hooks/useExitListener';
// import { debugData } from './utils/debugData';
import './App.css';

import { PropMenu } from './components/propmenu';

import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

const InfoText = styled('div')(({ theme }) => ({
  position: 'fixed',
  right: '50%',
  bottom: '5rem',
}));

type AnimPropData = {
  animindex: string;
  anim: string;
  prop: string;
  bone: number;
};

const App: React.FC = () => {
  const [display, setDisplay] = useState<boolean>(false);
  const [infoDisplay, setInfoDisplay] = useState<boolean>(false);
  const [data, setData] = useState<AnimPropData>({
    animindex: '',
    anim: '',
    prop: '',
    bone: 0,
  });

  useExitListener(setDisplay);
  useExitListener(setInfoDisplay);

  useNuiEvent('setAnimPropData', (data) => {
    setData(data);
  });

  useNuiEvent('displayFrame', (data) => {
    setDisplay(data);
  });

  useNuiEvent('copyClipboard', (data) => {
    const clip = document.createElement('textarea');
    clip.value = data.text;
    document.body.appendChild(clip);
    clip.select();
    document.execCommand('copy');
    document.body.removeChild(clip);
  });

  useNuiEvent('displayInfo', (data) => {
    setInfoDisplay(data);
  });

  return (
    <>
      {infoDisplay && (
        <InfoText>
          <Stack spacing={0}>
            <Typography
              align="center"
              variant="h6"
              sx={{
                color: 'white',
                textShadow:
                  '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
              }}
            >
              {data.animindex}
            </Typography>
            <Typography
              align="center"
              variant="h6"
              sx={{
                color: 'white',
                textShadow:
                  '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
              }}
            >
              {data.anim}
            </Typography>
            <Typography
              align="center"
              variant="h6"
              sx={{
                color: 'white',
                textShadow:
                  '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
              }}
            >
              {data.prop}
            </Typography>
            <Typography
              align="center"
              variant="h6"
              sx={{
                color: 'white',
                textShadow:
                  '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
              }}
            >
              {data.bone}
            </Typography>
          </Stack>
        </InfoText>
      )}
      {display && <PropMenu />}
    </>
  );
};

export default App;
