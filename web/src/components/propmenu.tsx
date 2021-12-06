import { useState, useEffect } from 'react';
import { PropInput } from './propinput';
import { fetchNui } from '../utils/fetchNui';

import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

type PropData = {
  prop: string;
  bone: number;
  xpos: number;
  ypos: number;
  zpos: number;
  xrot: number;
  yrot: number;
  zrot: number;
};

type InputItem = {
  name: keyof PropData;
  min: number;
  max: number;
};

export const PropMenu: React.FC = () => {
  const [data, setData] = useState<PropData>({
    prop: '',
    bone: 0,
    xpos: 0,
    ypos: 0,
    zpos: 0,
    xrot: 0,
    yrot: 0,
    zrot: 0,
  });
  const posrotArr: InputItem[] = [
    { name: 'xpos', min: -25.0, max: 25.0 },
    { name: 'ypos', min: -25.0, max: 25.0 },
    { name: 'zpos', min: -25.0, max: 25.0 },
    { name: 'xrot', min: -360.0, max: 360.0 },
    { name: 'yrot', min: -360.0, max: 360.0 },
    { name: 'zrot', min: -360.0, max: 360.0 },
  ];

  useEffect(() => {
    fetchNui<PropData>('getCurrentProp')
      .then((data) => {
        setData(data);
      })
      .catch((e) => console.error('Error getting data'));
  }, []);

  const toggleNui = () => {
    fetchNui('toggleNui');
  };

  const updateData = () => {
    fetchNui('setPropData', data);
  };

  const spawnProp = () => {
    fetchNui('spawnProp', data);
  };

  const deleteProp = () => {
    fetchNui('deleteProp');
  };

  const onChange = (id: string, value: unknown) => {
    setData({ ...data, [id]: value });
  };

  const handleBlur = (id: string, value: unknown, min: number, max: number) => {
    if (Number(value) < min) {
      setData({ ...data, [id]: min });
    } else if (Number(value) > max) {
      setData({ ...data, [id]: max });
    }
    fetchNui('setPropData', data);
  };

  return (
    <Box
      sx={{
        width: '15vw',
        backgroundColor: 'darkGray',
        padding: '20px',
        borderRadius: '20px',
        position: 'fixed',
        bottom: '0.5rem',
        right: '0.5rem',
      }}
    >
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12}>
          <Typography variant="h4" color="white">
            Prop Menu
          </Typography>
          <Divider />
        </Grid>
        <Grid item xs={6}>
          <TextField
            id="prop-name"
            label="Prop Name"
            size="small"
            value={data.prop}
            onChange={(e) => onChange('prop', e.currentTarget.value)}
          />
        </Grid>
        <Grid item xs={3}>
          <Button onClick={spawnProp}>Spawn</Button>
        </Grid>
        <Grid item xs={3}>
          <Button color="secondary" onClick={deleteProp}>
            Delete
          </Button>
        </Grid>
        <Grid item xs={9}>
          <TextField
            id="bone-index"
            label="Bone Index"
            size="small"
            value={data.bone}
            onChange={(e) => onChange('bone', e.currentTarget.value)}
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
          />
        </Grid>
        <Grid item xs={3}>
          <Button onClick={updateData}>Set</Button>
        </Grid>
        {posrotArr.map((input, index) => {
          return (
            <Grid item xs={12} key={index}>
              <PropInput
                id={input.name}
                value={Number(data[input.name])}
                min={input.min}
                max={input.max}
                onInputChange={onChange}
                handleBlur={handleBlur}
              />
            </Grid>
          );
        })}
        <Grid item xs={6}>
          <Button onClick={toggleNui}>Toggle NUI</Button>
        </Grid>
      </Grid>
    </Box>
  );
};
