import Grid from '@mui/material/Grid';
import MuiInput from '@mui/material/Input';
import Typography from '@mui/material/Typography';

type PropData = {
  id: string;
  value: number;
  min: number;
  max: number;
  onInputChange: (id: string, value: unknown) => void;
  handleBlur: (id: string, value: unknown, min: number, max: number) => void;
};

export const PropInput = ({
  id,
  value,
  min,
  max,
  onInputChange,
  handleBlur,
}: PropData) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={4}>
        <Typography variant="body1" color="white" align="center">
          {id}
        </Typography>
      </Grid>
      <Grid item xs={8}>
        <MuiInput
          value={value}
          sx={{ color: 'white' }}
          size="small"
          onChange={(e) => onInputChange(id, e.target.value)}
          onBlur={() => handleBlur(id, value, min, max)}
          inputProps={{
            step: 0.05,
            min: min,
            max: max,
            type: 'number',
            'aria-labelledby': 'input-slider',
          }}
        />
      </Grid>
    </Grid>
  );
};
